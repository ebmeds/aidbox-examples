import { aidbox as globalAidbox } from "@/lib/server/aidbox";
import { getCurrentAidbox } from "@/lib/server/smart";
import { PageHeader } from "@/components/page-header";
import { Questionnaire } from "fhir/r4";
import { QuestionnaireEditor } from "@/components/questionnaire-editor";
import { HTTPError } from "ky";
import { revalidatePath } from "next/cache";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditQuestionnairePage({ params }: PageProps) {
  const currentAidbox = await getCurrentAidbox();
  const { id } = await params;

  const questionnaire = await currentAidbox
    .get(`fhir/Questionnaire/${id}`, {})
    .json<Questionnaire>();

  async function saveQuestionnaire(questionnaire: Questionnaire) {
    "use server";

    try {
      const currentAidbox = await getCurrentAidbox();
      const result = await currentAidbox
        .put(`fhir/Questionnaire/${id}`, {
          json: questionnaire,
        })
        .json<Questionnaire>();

      revalidatePath("/questionnaires");

      return result;
    } catch (error) {
      if (error instanceof HTTPError) {
        console.dir(await error.response.json(), { depth: 1000 });
      }
      throw error;
    }
  }

  async function globalProxy(url: string, _: RequestInit) {
    "use server";
    console.log('🚀 ~ globalProxy ~ _:', _)

    try {
      return await globalAidbox(url.replace(/^\//, "")).json<any>();
    } catch (error) {
      if (error instanceof HTTPError) {
        console.dir(await error.response.json(), { depth: 1000 });
      }
      throw error;
    }
  }

  async function currentProxy(url: string, _: RequestInit) {
    "use server";
    console.log('🚀 ~ currentProxy ~ _:', _)

    try {
      const currentAidbox = await getCurrentAidbox();
      return await currentAidbox(url.replace(/^\//, "")).json<any>();
    } catch (error) {
      if (error instanceof HTTPError) {
        console.dir(await error.response.json(), { depth: 1000 });
      }
      throw error;
    }
  }

  return (
    <>
      <PageHeader
        items={[
          { href: "/", label: "Home" },
          { href: "/questionnaires", label: "Questionnaires" },
          { label: "Editor" },
        ]}
      />
      <QuestionnaireEditor
        questionnaire={questionnaire}
        onSaveAction={saveQuestionnaire}
        onGlobalProxyAction={globalProxy}
        onCurrentProxyAction={currentProxy}
      />
    </>
  );
}