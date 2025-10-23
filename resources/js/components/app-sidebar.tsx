import * as React from "react"
import {
  BarChartIcon,
  CalendarIcon,
  CreditCardIcon,
  FlaskConicalIcon,
  LayoutDashboardIcon,
  PackageIcon,
  UserCheckIcon,
  UsersIcon,
  ArrowRightLeftIcon,
} from "lucide-react"
import { Link, usePage } from "@inertiajs/react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { useRoleAccess } from "@/hooks/useRoleAccess"

// Function to get permission-based navigation data
const getPermissionBasedNavigation = (permissions: any, userRole: string) => {
  // Define permission-based access
  const getModuleAccess = (module: string) => {
    switch (module) {
      case 'patients':
        return permissions.canAccessPatients;
      case 'laboratory':
        return permissions.canAccessLaboratory;
      case 'billing':
        return permissions.canAccessBilling;
      case 'appointments':
        return permissions.canAccessAppointments;
      case 'inventory':
        return permissions.canAccessInventory;
      case 'reports':
        return permissions.canAccessReports;
      case 'settings':
        return permissions.canAccessSettings;
      default:
        return false;
    }
  };

  const getSubItemAccess = (module: string, subItem: string) => {
    // Check if user has access to the module first
    if (!getModuleAccess(module)) {
      return false;
    }

    // Define sub-item access based on permissions
    switch (module) {
      case 'patients':
        if (subItem === 'All Patients' && permissions.canAccessPatients) return true;
        if (subItem === 'Add Patient' && permissions.canCreatePatients) return true;
        if (subItem === 'Patient Transfer' && permissions.canTransferPatients) return true;
        if (subItem === 'Visits' && permissions.canAccessPatients) return true;
        return false;
      case 'laboratory':
        if (permissions.canAccessLaboratory) return true;
        return false;
      case 'appointments':
        if (permissions.canAccessAppointments) return true;
        return false;
      case 'inventory':
        if (permissions.canAccessInventory) return true;
        return false;
      case 'billing':
        if (permissions.canAccessBilling) return true;
        return false;
      case 'reports':
        if (permissions.canAccessReports) return true;
        return false;
      case 'settings':
        if (permissions.canAccessSettings) return true;
        return false;
      default:
        return false;
    }
  };

  const navMain = [
    // Dashboard - All staff can access
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboardIcon,
      show: true, // Always show for staff
    },
    // Patient Management - Doctor, Nurse, Hospital Staff
    {
      title: "Patient Management",
      url: "/admin/patient",
      href: "/admin/patient",
      icon: UsersIcon,
      show: getModuleAccess('patients'),
      items: [
        {
          title: "All Patients",
          url: "/admin/patient",
          show: getSubItemAccess('patients', 'All Patients'),
        },
        {
          title: "Add Patient",
          url: "/admin/patient/create",
          show: getSubItemAccess('patients', 'Add Patient'),
        },
        {
          title: "Patient Transfer",
          url: "/admin/patient-transfers",
          show: getSubItemAccess('patients', 'Patient Transfer'),
        },
        {
          title: "Visits",
          url: "/admin/visits",
          show: getSubItemAccess('patients', 'Visits'),
        },
      ],
    },
    // Laboratory - Doctor, MedTech
    {
      title: "Laboratory",
      url: "/admin/laboratory",
      href: "/admin/laboratory",
      icon: FlaskConicalIcon,
      show: getModuleAccess('laboratory'),
      items: [
        {
          title: "Lab Orders",
          url: "/admin/laboratory/orders",
          show: getSubItemAccess('laboratory', 'Lab Orders'),
        },
        {
          title: "Test Templates",
          url: "/admin/laboratory/tests",
          show: getSubItemAccess('laboratory', 'Test Templates'),
        },
      ],
    },
    // Appointments - Doctor, Nurse
    {
      title: "Appointments",
      url: "/admin/appointments",
      href: "/admin/appointments",
      icon: CalendarIcon,
      show: getModuleAccess('appointments'),
      items: [
        {
          title: "All Appointments",
          url: "/admin/appointments",
          show: getSubItemAccess('appointments', 'All Appointments'),
        },
        {
          title: "Pending Requests",
          url: "/admin/pending-appointments",
          show: getSubItemAccess('appointments', 'Pending Requests'),
        },
        {
          title: "Doctor Availability",
          url: "/admin/appointments/availability",
          show: getSubItemAccess('appointments', 'Doctor Availability'),
        },
      ],
    },
    // Inventory - Nurse, MedTech
    {
      title: "Inventory",
      url: "/admin/inventory",
      href: "/admin/inventory",
      icon: PackageIcon,
      show: getModuleAccess('inventory'),
      items: [
        {
          title: "Overview",
          url: "/admin/inventory",
          show: getSubItemAccess('inventory', 'Overview'),
        },
        {
          title: "Create Product",
          url: "/admin/inventory/create",
          show: getSubItemAccess('inventory', 'Create Product'),
        },
        {
          title: "Doctor & Nurse Supplies",
          url: "/admin/inventory/doctor-nurse",
          show: getSubItemAccess('inventory', 'Doctor & Nurse Supplies'),
        },
        {
          title: "Med Tech Supplies",
          url: "/admin/inventory/medtech",
          show: getSubItemAccess('inventory', 'Med Tech Supplies'),
        },
      ],
    },
    // Reports - Doctor, MedTech, Nurse, Hospital Staff
    {
      title: "Reports",
      url: "/admin/reports",
      href: "/admin/reports",
      icon: BarChartIcon,
      show: getModuleAccess('reports'),
      items: [
        {
          title: "Overview",
          url: "/admin/reports",
          show: getSubItemAccess('reports', 'Overview'),
        },
        {
          title: "Financial",
          url: "/admin/reports/financial",
          show: getSubItemAccess('reports', 'Financial'),
        },
        {
          title: "Patients",
          url: "/admin/reports/patients",
          show: getSubItemAccess('reports', 'Patients'),
        },
        {
          title: "Laboratory",
          url: "/admin/reports/laboratory",
          show: getSubItemAccess('reports', 'Laboratory'),
        },
        {
          title: "Inventory",
          url: "/admin/reports/inventory",
          show: getSubItemAccess('reports', 'Inventory'),
        },
        {
          title: "Appointments",
          url: "/admin/reports/appointments",
          show: getSubItemAccess('reports', 'Appointments'),
        },
        {
          title: "Analytics",
          url: "/admin/reports/analytics",
          show: getSubItemAccess('reports', 'Analytics'),
        },
      ],
    },
  ];

  const navSecondary = [
    // Specialist Management - Admin only
    {
      title: "Specialist Management",
      url: "/admin/specialists",
      href: "/admin/specialists",
      icon: UserCheckIcon,
      show: userRole === 'admin',
      items: [
        {
          title: "Doctors",
          url: "/admin/specialists/doctors",
          show: true,
        },
        {
          title: "Nurses",
          url: "/admin/specialists/nurses",
          show: true,
        },
        {
          title: "Med Techs",
          url: "/admin/specialists/medtechs",
          show: true,
        },
      ],
    },
    // Billing - Cashier only
    {
      title: "Billing",
      url: "/admin/billing",
      href: "/admin/billing",
      icon: CreditCardIcon,
      show: getModuleAccess('billing'),
      items: [
        {
          title: "Transactions",
          url: "/admin/billing",
          show: getSubItemAccess('billing', 'Transactions'),
        },
        {
          title: "HMO Providers",
          url: "/admin/billing/hmo-providers",
          show: getSubItemAccess('billing', 'HMO Providers'),
        },
        {
          title: "Doctor Payments",
          url: "/admin/billing/doctor-payments",
          show: getSubItemAccess('billing', 'Doctor Payments'),
        },
        {
          title: "Reports",
          url: "/admin/billing/doctor-summary",
          show: getSubItemAccess('billing', 'Reports'),
        },
      ],
    },
  ];

  // Filter items based on access
  const filterItems = (items: any[]) => {
    return items
      .filter(item => item.show === true)
      .map(item => ({
        ...item,
        items: item.items ? item.items.filter((subItem: any) => subItem.show === true) : undefined
      }));
  };

  return {
    navMain: filterItems(navMain),
    navSecondary: filterItems(navSecondary),
  };
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const page = usePage<any>();
  const { auth } = page.props;
  
  // Get role-based permissions
  const { userRole, permissions, shouldRedirectToPatient } = useRoleAccess();
  
  // If user is a patient, don't show admin sidebar
  if (shouldRedirectToPatient()) {
    return null;
  }
  
  // Get permission-based navigation data
  const data = getPermissionBasedNavigation(permissions, userRole);

  return (
    <Sidebar 
      collapsible="icon" 
      variant="inset" 
      className="!bg-green-600 !border-green-500 [&_[data-sidebar=menu-button]]:!text-white [&_[data-sidebar=menu-button]]:hover:!bg-green-500/30 [&_[data-sidebar=menu-button]]:hover:!text-white [&_[data-sidebar=menu-button]]:data-[active=true]:!bg-green-500/40 [&_[data-sidebar=menu-button]]:data-[active=true]:!text-white [&_[data-sidebar=group-label]]:!text-white [&_[data-sidebar=group-label]]:!font-semibold [&_[data-sidebar=menu-sub-button]]:!text-white [&_[data-sidebar=menu-sub-button]]:hover:!bg-green-500/30 [&_[data-sidebar=menu-sub-button]]:hover:!text-white [&_[data-sidebar=menu-sub-button]]:data-[active=true]:!bg-green-500/40 [&_[data-sidebar=menu-sub-button]]:data-[active=true]:!text-white [&_[data-sidebar=menu-action]]:!text-white [&_[data-sidebar=menu-action]]:hover:!bg-green-500/30 [&_[data-sidebar=menu-action]]:hover:!text-white [&_*]:!text-white [&_span]:!text-white [&_svg]:!text-white" 
      style={{
        backgroundColor: '#16a34a !important',
        color: 'white !important',
        '--sidebar': '#16a34a',
        '--sidebar-foreground': 'white',
        '--sidebar-accent': 'rgba(34, 197, 94, 0.3)',
        '--sidebar-accent-foreground': 'white',
        '--sidebar-border': '#15803d'
      } as React.CSSProperties}
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white/90 p-1 shadow-lg">
                  <img 
                    src="/st-james-logo.png" 
                    alt="St. James Hospital Logo" 
                    className="size-6 object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white drop-shadow-sm">St. James Clinic</span>
                  <span className="truncate text-xs text-white/90 drop-shadow-sm">Management System</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} />
      </SidebarContent>
    </Sidebar>
  )
}
