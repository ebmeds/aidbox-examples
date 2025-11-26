import * as React from "react";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { AppMenu } from "@/components/app-menu";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
              {/* <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white">
                  <Image
                    src="/Kustannus_Duodecim_logo_center_white_RGB.svg"
                    alt="Kustannus Duodecim Logo"
                    width={48}
                    height={48}
                    priority
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Kustannus Duodecim</span>
                  <span className="">v{process.env.NEXT_PUBLIC_VERSION}</span>
                </div>
              </Link> */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AppMenu />
      </SidebarContent>
      <SidebarFooter>
        {/* <PatientCard /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
