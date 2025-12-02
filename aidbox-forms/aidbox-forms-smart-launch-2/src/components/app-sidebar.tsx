'use server'
import * as React from "react";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AppMenu } from "@/components/app-menu-with-questionnaires";
import { PatientCard } from "./patient-card";

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
                  <Image
                    src="/Kustannus_Duodecim_logo_center_white_RGB.svg"
                    alt="Kustannus Duodecim Logo"
                    width={210}
                    height={210}
                    priority
                  />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AppMenu />
      </SidebarContent>
      <SidebarFooter>
        <PatientCard />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
