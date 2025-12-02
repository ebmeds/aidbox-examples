'use client'

import { Questionnaire, QuestionnaireResponse } from "fhir/r4";
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface AppSidebarMenuButtonProps {
    questionnaire: Questionnaire,
    onCreateResponseAction: (questionnaire: Questionnaire) => Promise<QuestionnaireResponse>;
}

export const AppSidebarMenuButtonProps = ({ questionnaire, onCreateResponseAction }: AppSidebarMenuButtonProps) => {
    const [running, setRunning] = useState(false);
    function withRunning<T>(promise: Promise<T>): Promise<T> {
        setRunning(true);
        promise.finally(() => setRunning(false));
        return promise;
    }
    const router = useRouter();
    return <div className="rounded-xl border bg-card text-card-foreground shadow">
        <SidebarMenuItem onClick={async () => {
            if (onCreateResponseAction && !running) {
                try {
                    const { id } = await withRunning(
                        onCreateResponseAction(questionnaire),
                    );
                    console.log('🚀 ~ AppSidebarMenuButtonProps ~ id:', id)

                    toast({
                        title: "New questionnaire response created and populated",
                        description: `You are being redirected to the form filling page...`,
                    });

                    router.push(`/focal/${id}`);
                } catch (e) {
                    console.log(e)
                    toast({
                        title: "Questionnaire response creation failed",
                        description: `Failed to create new questionnaire response`,
                        variant: "destructive",
                    });
                }
            }
        }}
            key={questionnaire.title}>
            <SidebarMenuButton className="cursor-pointer" asChild>
                <p>  {questionnaire.title}            </p>
            </SidebarMenuButton>
        </SidebarMenuItem>
    </div>
}