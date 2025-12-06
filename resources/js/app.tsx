import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as ziggyRoute } from 'ziggy-js';
import type { RouteName } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Patient Management';

// Initialize theme on app load (dark mode is disabled - always light mode)
initializeTheme();

createInertiaApp({
    title: (title) => title || appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Set up Ziggy route helper from Inertia props
        // The @routes directive should make it available, but we'll also set it from props as fallback
        const globalObj = typeof window !== 'undefined' ? window : globalThis;
        
        if (props.initialPage?.props?.ziggy) {
            // @ts-expect-error - ziggy global type
            (globalObj as any).route = (name: RouteName, params?: any, absolute?: boolean) => 
                ziggyRoute(name, params, absolute, {
                    // @ts-expect-error
                    ...props.initialPage.props.ziggy,
                    // @ts-expect-error
                    location: new URL(props.initialPage.props.ziggy.location || window.location.href),
                });
        } else if (typeof window !== 'undefined' && (window as any).Ziggy) {
            // Fallback to Ziggy from @routes directive if available
            // @ts-expect-error
            (globalObj as any).route = (name: RouteName, params?: any, absolute?: boolean) => 
                ziggyRoute(name, params, absolute, (window as any).Ziggy);
        }

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
