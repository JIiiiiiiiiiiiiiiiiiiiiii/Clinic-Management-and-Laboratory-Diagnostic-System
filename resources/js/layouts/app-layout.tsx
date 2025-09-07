import { ToastProvider, useToast } from '@/components/ui/toast';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import * as React from 'react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const flash = (usePage().props as any).flash || {};
    return (
        <ToastProvider>
            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
                <FlashToaster flash={flash} />
            </AppLayoutTemplate>
        </ToastProvider>
    );
};

function FlashToaster({ flash }: { flash: any }) {
    const notify = useToast();
    const shownRef = React.useRef<string>('');
    React.useEffect(() => {
        const key = JSON.stringify({ s: flash.success || '', e: flash.error || '' });
        if (key !== shownRef.current) {
            shownRef.current = key;
            if (flash.success) notify('success', String(flash.success));
            if (flash.error) notify('error', String(flash.error));
        }
    }, [flash?.success, flash?.error]);
    return null;
}
