import { Badge } from '@/components/ui/badge';

interface PageHeaderProps {
    title: string;
    description?: string;
    trailing?: React.ReactNode;
    badgeText?: string;
}

export default function PageHeader({ title, description, trailing, badgeText }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            <div className="flex items-center gap-2">
                {badgeText && (
                    <Badge variant="outline" className="text-sm">
                        {badgeText}
                    </Badge>
                )}
                {trailing}
            </div>
        </div>
    );
}
