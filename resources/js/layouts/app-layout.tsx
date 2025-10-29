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
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <FlashMessages flash={flash} />
        </AppLayoutTemplate>
    );
};

function FlashMessages({ flash }: { flash: any }) {
    const shownRef = React.useRef<string>('');
    
    React.useEffect(() => {
        const key = JSON.stringify({ s: flash.success || '', e: flash.error || '' });
        if (key !== shownRef.current) {
            shownRef.current = key;
            if (flash.success) {
                // Simple success notification
                const notification = document.createElement('div');
                notification.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
                notification.textContent = flash.success;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.remove();
                }, 5000);
            }
            if (flash.error) {
                // Simple error notification
                const notification = document.createElement('div');
                notification.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
                notification.textContent = flash.error;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.remove();
                }, 7000);
            }
        }
    }, [flash?.success, flash?.error]);
    
    return null;
}
