import { getCurrentAidbox } from "@/lib/server/smart";
import { Questionnaire, QuestionnaireResponse } from "fhir/r4";
import { getFirst } from "@/lib/utils";
import { QuestionnaireResponseEditor } from "@/components/focal-container";
import got from "got";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditQuestionnaireResponsePage({
  params,
}: PageProps) {
  const aidbox = await getCurrentAidbox();
  const { id } = await params;

  const questionnaireResponse = await aidbox
    .get(`fhir/QuestionnaireResponse/${id}`, {})
    .json<QuestionnaireResponse>();

  if (!questionnaireResponse) {
    throw new Error("Questionnaire response not found");
  }

  const [url, version] = questionnaireResponse.questionnaire?.split("|") || [];

  const questionnaire = await aidbox
    .get(`fhir/Questionnaire?url=${url}&${version ? `version=${version}` : ""}`)
    .json<Questionnaire>()
    .then(getFirst);

  if (!questionnaire) {
    throw new Error("Related questionnaire not found");
  }

      async function getPlatfromResponse(questionnaireResponse: QuestionnaireResponse): Promise<any> {
    "use server";
    
    const questionnaireCompletedBody = {
      hook: "questionnaire-completed",
      prefetch: {
        questionnaireResponse: {
          resource: {
            ...questionnaireResponse,
            status: "completed"
          }
        }
      }
    }
    const response = await got.post('https://questionnaires-services-333859734859.europe-north1.run.app/api/v1/cds-services/filled-questionnaire', {
      json: questionnaireCompletedBody,
      headers: {
        'Content-Type': 'application/json',
      },
    }).json().catch((error) => {
      console.error('Error sending to platform:', error);
      throw error;
    }) as any

    return response;
    }
  async function saveQuestionnaireResponse(
    questionnaireResponse: QuestionnaireResponse,
  ) {
    "use server";
    
    const aidbox = await getCurrentAidbox();
    await aidbox
      .put(`fhir/QuestionnaireResponse/${id}`, {
        json: questionnaireResponse,
      })
      .json<QuestionnaireResponse>()
    return await getPlatfromResponse(questionnaireResponse)
  }
  async function submitQuestionnaireResponse(
    questionnaireResponse: QuestionnaireResponse,
  ) {
    "use server";

    const aidbox = await getCurrentAidbox();
    const json = {
      resourceType: "Parameters",
      parameter: [{
        name: "response",
        resource: questionnaireResponse,
      }]
    }
    console.log('🚀 ~ submitQuestionnaireResponse ~ json:', JSON.stringify(json))

    return aidbox
      .put(`fhir/QuestionnaireResponse/$submit`, { json })
      .json<QuestionnaireResponse>();
  }

    return (
      <QuestionnaireResponseEditor 
        questionnaire={questionnaire}
        questionnaireResponse={questionnaireResponse}
        onSaveAction={saveQuestionnaireResponse}
        onSubmitAction={submitQuestionnaireResponse}
      />
  );
}
