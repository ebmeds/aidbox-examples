"use server";

import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu
} from "@/components/ui/sidebar";
import { Questionnaire, QuestionnaireResponse, Parameters, Bundle } from "fhir/r4";
import { getCurrentAidbox, getCurrentPatient, getCurrentUser } from "@/lib/server/smart";
import { isDefined } from "@/lib/utils";
import { AppSidebarMenuButtonProps } from "./app-sidebar-menu-button";

export async function AppMenu() {

  async function createQuestionnaireResponse(questionnaire: Questionnaire) {
    "use server";

    const aidbox = await getCurrentAidbox();
    const subject = await getCurrentPatient().catch(() => null);
    // const encounter = await getCurrentEncounter().catch(() => null);
    // TODO: fix data sync with EHR
    // Encounters are created due to errors in references
    const author = await getCurrentUser().catch(() => null);

    const jsonBody = {
      resourceType: "Parameters",
      parameter: [
        {
          name: "questionnaire",
          resource: questionnaire,
        },
        {
          name: "subject",
          resource: subject,
        },
        {
          name: "context",
          part: [
            ...(author
              ? [
                {
                  name: "name",
                  valueString: "author",
                },
                {
                  name: "content",
                  resource: author,
                },
              ]
              : []),
          ],
        },
      ],
    }
    const result = await aidbox
      .post(`fhir/Questionnaire/$populate`, { json: jsonBody })
      .json<Parameters>();

    if (!result.parameter) {
      throw new Error("Failed to populate QuestionnaireResponse");
    }


    const populated = result.parameter?.find(({ name }) => name === "response")
      ?.resource as QuestionnaireResponse;

    populated.questionnaire = `${questionnaire.url}${questionnaire.version ? `|${questionnaire.version}` : ""
      }`;

    const saved = await aidbox
      .post("fhir/QuestionnaireResponse", {
        json: populated,
      })
      .json<QuestionnaireResponse>();

    // revalidatePath("/questionnaire-responses");

    return saved;
  }

  async function getQuestionnaireList() {
    "use server";

    const aidbox = await getCurrentAidbox();

    const response = await aidbox
      .get(
        `fhir/Questionnaire`,
      )
      .json<Bundle<Questionnaire>>();

    return response.entry?.map((entry) => entry.resource)?.filter(isDefined) || [];
  }
  const list = await getQuestionnaireList();
  const data: {
    label?: string;
    children: {
      title: string;
      questionnaire?: Questionnaire;
      children?: {
        href: string;
        title: string;
      }[];
    }[];
  }[] = [
      {
        children: list.map((questionnaire) => ({
          title: questionnaire.title || "Untitled Questionnaire",
          questionnaire: questionnaire,
        })),
      }]

  return (
    <>
      {data.map((group, index) => (
        <SidebarGroup key={`${group.label ?? 'unknown'}-${index}`}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu key={`${group.label ?? '' + index}`}>
              {group.children.map((item,index) => <AppSidebarMenuButtonProps key={`${item.questionnaire?.title}-${index}`} onCreateResponseAction={createQuestionnaireResponse} questionnaire={item.questionnaire!} />)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
