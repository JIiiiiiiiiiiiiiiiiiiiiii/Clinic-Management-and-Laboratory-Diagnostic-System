import * as React from "react"
import {
  LayoutDashboardIcon,
  StethoscopeIcon,
  UsersIcon,
  FileBarChartIcon,
} from "lucide-react"
import { Link, usePage } from "@inertiajs/react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"

const data = {
  user: {
    name: "Hospital Admin",
    email: "hospital@stjames.com",
    avatar: "/avatars/hospital.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/hospital/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Patients",
      url: "/hospital/patients",
      icon: UsersIcon,
      items: [
        {
          title: "View Patients",
          url: "/hospital/patients",
        },
        {
          title: "Add Patient",
          url: "/hospital/patients/create",
        },
        {
          title: "Refer Patient",
          url: "/hospital/patients/refer",
        },
      ],
    },
    {
      title: "View Reports",
      url: "/hospital/reports",
      icon: FileBarChartIcon,
      items: [
        {
          title: "All Patient Reports",
          url: "/hospital/reports/patients",
        },
        {
          title: "All Appointment Reports",
          url: "/hospital/reports/appointments",
        },
        {
          title: "All Transaction Reports",
          url: "/hospital/reports/transactions",
        },
        {
          title: "All Inventory Reports",
          url: "/hospital/reports/inventory",
        },
      ],
    },
  ],
  navSecondary: [],
  documents: [],
}

export function HospitalSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const page = usePage<any>();
  const { auth } = page.props;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/hospital/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <StethoscopeIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">St. James Clinic</span>
                  <span className="truncate text-xs">Management System</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={auth.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
