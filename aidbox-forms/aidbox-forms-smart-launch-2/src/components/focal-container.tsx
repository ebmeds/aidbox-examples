"use client";

import { ActivityDefinition, Questionnaire, QuestionnaireResponse } from "fhir/r4";
import { Suspense, useState, useTransition } from "react";
import { Spinner } from "@/components/spinner";
import { FormsRenderer } from "@/components/forms-renderer";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import { Button } from "./ui/button";

interface CardSuggestion {
    indicator: "info",
    source: any
    suggestions: ActivityDefinition[]
    summary: "Self care suggestions"
}

interface QuestionnaireResponseEditorProps {
    questionnaire: Questionnaire;
    questionnaireResponse: QuestionnaireResponse;
    onSaveAction: (
        questionnaireResponse: QuestionnaireResponse,
    ) => Promise<{ cards: CardSuggestion[] }>;
    onSubmitAction: (
        questionnaireResponse: QuestionnaireResponse,
    ) => Promise<QuestionnaireResponse>;
}

export function QuestionnaireResponseEditor({
    questionnaire,
    questionnaireResponse,
    onSaveAction,
    onSubmitAction,
}: QuestionnaireResponseEditorProps) {
    const router = useRouter();
    const [, startTransition] = useTransition();
    const [result, setResult] = useState([] as ActivityDefinition[]);

    return (
        <div className="block md:flex">

            <div className="text-sm transition-all duration-500 ease-in-out md:w-[50%] h-[100%]">

                <Suspense fallback={<Spinner expand="true" />}>
                    <FormsRenderer
                        questionnaire={questionnaire}
                        questionnaireResponse={questionnaireResponse}
                        onChange={(updatedQuestionnaireResponse) => {
                            startTransition(async () => {
                                try {
                                    const result = await onSaveAction(updatedQuestionnaireResponse);
                                    const activityDefinitions = result.cards.flatMap(card => card.suggestions);
                                    setResult(activityDefinitions);
                                } catch (error) {
                                    console.error("Failed to save questionnaire response:", error);
                                }
                            });
                        }}
                        onSubmit={(updatedQuestionnaireResponse) => {
                            startTransition(async () => {
                                try {
                                    await onSaveAction(updatedQuestionnaireResponse);
                                    router.push(`/questionnaire-responses`);
                                } catch (error) {
                                    console.error("Failed to submit questionnaire response:", error);
                                }
                            });
                        }}
                    />
                </Suspense>
            </div>

            <div className="flex-1 md:min-h-screen relative transition-all duration-500 ease-in-out lg:w-[100%] bg-[#EEF7FB]">
                {/* Right column: add info, actions, preview, or logs here */}
                <div className="sticky print:static top-0 flex items-center justify-between gap-1 w-full py-3 px-8 border-b relative z-10 @5xl/form:rounded-t-[16px] transition-all ease-out data-[stuck]:rounded-none data-[stuck]:@5xl/form:rounded-t-0 print:rounded-none print:break-after-avoid">
                    <h1 className="text-2xl text-gray-900 font-semibold tracking-wide">Tulokset</h1>
                </div>
                <div className="flex-1 px-8 pt-6 pb-[2px] print:pb-8 print:flex-auto last:pb-8 last:rounded-b-[16px] @5xl/form:first:rounded-t-[16px]">
                    <p className="text-sm text-muted-foreground">
                        {result.map((activityDefinition, index) => (
                            <div key={`${activityDefinition.title}`} className="mb-4">
                                <h4 className="font-semibold">{activityDefinition.title}</h4>
                                {activityDefinition.topic?.map(t => <Markdown>{t.text}</Markdown>)}

                            </div>
                        ))}
                    </p>
                    {/* button */}
                    <Button className="mt-4 b-4 px-4 rounded-full flex items-center gap-2 text-sm font-bold border transition">Tallenna tulokset</Button>
                </div>
            </div>
        </div>
    );
}
