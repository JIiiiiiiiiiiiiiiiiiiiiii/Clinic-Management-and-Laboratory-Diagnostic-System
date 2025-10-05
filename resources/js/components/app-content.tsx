import { SidebarInset } from '@/components/ui/sidebar';
import * as React from 'react';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({ variant = 'header', children, className, ...props }: AppContentProps) {
    if (variant === 'sidebar') {
        return (
            <SidebarInset className={className} {...(props as React.ComponentProps<typeof SidebarInset>)}>
                {children}
            </SidebarInset>
        );
    }

    return (
        <main className="mx-auto flex min-h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl overflow-y-auto" {...props}>
            {children}
        </main>
    );
}
