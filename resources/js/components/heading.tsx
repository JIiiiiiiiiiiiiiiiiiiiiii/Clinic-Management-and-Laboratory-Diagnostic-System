import { type ComponentType } from 'react'

export default function Heading({
    title,
    description,
    icon: Icon,
}: {
    title: string
    description?: string
    icon?: ComponentType<{ className?: string }>
}) {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-4">
                {Icon && (
                    <div className="page-title-icon p-3 rounded-xl">
                        <Icon className="h-8 w-8 text-white" />
                    </div>
                )}
                <div className="space-y-0.5">
                    <h1 className="text-4xl font-bold text-[#283890] tracking-tight">{title}</h1>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
            </div>
        </div>
    )
}
