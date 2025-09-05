import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
    const [open, setOpen] = React.useState(false);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [hasShown, setHasShown] = React.useState(false);

    React.useEffect(() => {
        // Only show modal if we haven't shown it yet and there's a flash message
        if (!hasShown && (flash.success || flash.error)) {
            const timer = setTimeout(() => {
                if (flash.success) {
                    setMessage({ type: 'success', text: String(flash.success) });
                    setOpen(true);
                } else if (flash.error) {
                    setMessage({ type: 'error', text: String(flash.error) });
                    setOpen(true);
                }
                setHasShown(true);
            }, 100); // Small delay to ensure page is fully loaded

            return () => clearTimeout(timer);
        }
    }, [flash.success, flash.error, hasShown]);

    // Reset hasShown when flash messages change (new operations)
    React.useEffect(() => {
        if (!flash.success && !flash.error) {
            setHasShown(false);
        }
    }, [flash.success, flash.error]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{message?.type === 'error' ? 'Operation failed' : 'Success'}</AlertDialogTitle>
                    </AlertDialogHeader>
                    {message?.text && <AlertDialogDescription>{message.text}</AlertDialogDescription>}
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setOpen(false)}>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayoutTemplate>
    );
};
