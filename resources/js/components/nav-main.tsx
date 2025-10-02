import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const { isPatient } = useRoleAccess();

    // If no items, don't render anything
    if (items.length === 0) {
        return null;
    }

    // Determine the appropriate label based on visible items and user role
    const getGroupLabel = () => {
        if (isPatient) {
            if (items.length === 1) {
                return 'Patient Module';
            }
            return 'Patient Modules';
        }

        if (items.length === 1) {
            return 'Management Module';
        }
        return 'Management Modules';
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{getGroupLabel()}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                            asChild 
                            isActive={page.url.startsWith(item.href)} 
                            tooltip={{ children: item.title }}
                            className="holographic-sidebar-item"
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
