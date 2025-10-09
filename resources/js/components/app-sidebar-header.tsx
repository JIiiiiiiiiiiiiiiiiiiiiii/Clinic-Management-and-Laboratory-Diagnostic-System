import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import AdminNotificationBell from '@/components/AdminNotificationBell';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage<any>();
    const { auth } = page.props;
    const getInitials = useInitials();

    // Safety check for auth.user
    if (!auth?.user) {
        return (
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Not authenticated</span>
                </div>
            </header>
        );
    }

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <div className="flex items-center space-x-2">
                {/* Show notification bell for admin users */}
                {auth.user.role === 'admin' && (
                    <AdminNotificationBell />
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="size-10 rounded-full p-1">
                            <Avatar className="size-8 overflow-hidden rounded-full">
                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
