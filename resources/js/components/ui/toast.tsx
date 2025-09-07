import * as React from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
    id: number;
    type: ToastType;
    text: string;
}

const ToastContext = React.createContext<{
    notify: (type: ToastType, text: string) => void;
} | null>(null);

export function useToast() {
    const ctx = React.useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
    return ctx.notify;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<ToastMessage[]>([]);
    const idRef = React.useRef(1);

    const notify = React.useCallback((type: ToastType, text: string) => {
        const id = idRef.current++;
        setToasts((prev) => [...prev, { id, type, text }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ notify }}>
            {children}
            <div className="pointer-events-none fixed right-4 top-4 z-50 flex max-w-sm flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto rounded-md border p-3 text-sm shadow-md ${
                            t.type === 'success'
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                : t.type === 'error'
                                ? 'border-red-300 bg-red-50 text-red-800'
                                : t.type === 'warning'
                                ? 'border-yellow-300 bg-yellow-50 text-yellow-800'
                                : 'border-slate-300 bg-white text-slate-800'
                        }`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="font-medium capitalize">{t.type}</div>
                            <button className="opacity-60 hover:opacity-100" onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}>
                                ×
                            </button>
                        </div>
                        <div className="mt-1 whitespace-pre-wrap">{t.text}</div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}


