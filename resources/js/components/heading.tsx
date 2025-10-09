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
                <div className="space-y-0.5">
                    <h1 className="text-4xl font-semibold text-black mb-4">{title}</h1>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
            </div>
        </div>
    )
}
