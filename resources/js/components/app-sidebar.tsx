import * as React from "react"
import {
  ActivityIcon,
  BarChartIcon,
  CalendarIcon,
  ChevronUpIcon,
  CreditCardIcon,
  DatabaseIcon,
  FileTextIcon,
  FlaskConicalIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  MoreHorizontalIcon,
  PackageIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  StethoscopeIcon,
  UserCheckIcon,
  UsersIcon,
} from "lucide-react"
import { Link } from "@inertiajs/react"

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
import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"

const data = {
  user: {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@clinic.com",
    avatar: "/avatars/doctor.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Patients",
      url: "/admin/patient",
      icon: UsersIcon,
      isActive: true,
      items: [
        {
          title: "All Patients",
          url: "/admin/patient",
        },
        {
          title: "Add Patient",
          url: "/admin/patient/create",
        },
      ],
    },
    {
      title: "Laboratory",
      url: "/admin/laboratory",
      icon: FlaskConicalIcon,
      isActive: true,
      items: [
        {
          title: "Lab Orders",
          url: "/admin/laboratory/orders",
        },
        {
          title: "Test Templates",
          url: "/admin/laboratory/tests",
        },
        {
          title: "Reports",
          url: "/admin/laboratory/reports",
        },
      ],
    },
    {
      title: "Inventory",
      url: "/admin/inventory",
      icon: PackageIcon,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/admin/inventory",
        },
        {
          title: "Products",
          url: "/admin/inventory/products",
        },
        {
          title: "Transactions",
          url: "/admin/inventory/transactions",
        },
        {
          title: "Reports",
          url: "/admin/inventory/reports",
        },
      ],
    },
    {
      title: "Analytics",
      url: "/admin/reports",
      icon: BarChartIcon,
    },
  ],
  navSecondary: [
    {
      title: "Appointments",
      url: "/admin/appointments",
      icon: CalendarIcon,
    },
    {
      title: "Doctors",
      url: "/admin/doctors",
      icon: UserCheckIcon,
    },
    {
      title: "Billing",
      url: "/admin/billing",
      icon: CreditCardIcon,
    },
  ],
  documents: [
    {
      name: "Patient Database",
      url: "/admin/patient",
      icon: DatabaseIcon,
    },
    {
      name: "Lab Reports",
      url: "/admin/laboratory/reports",
      icon: ActivityIcon,
    },
    {
      name: "System Reports",
      url: "/admin/reports",
      icon: FileTextIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard">
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
        <NavSecondary items={data.navSecondary} />
        <NavDocuments items={data.documents} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
