import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AreaPoint {
    label: string;
    value: number;
}

interface AreaPatientsProps {
    title: string;
    subtitle?: string;
    data: AreaPoint[];
}

// Lightweight SVG area chart (no third-party deps). Inspired by shadcn/ui charts guidance
// Reference: https://ui.shadcn.com/charts/area
export default function AreaPatients({ title, subtitle, data }: AreaPatientsProps) {
    const height = 140;
    const width = 400;
    const paddingX = 8;
    const paddingY = 8;
    const innerH = height - paddingY * 2;
    const innerW = width - paddingX * 2;
    const max = Math.max(1, ...data.map((d) => d.value));
    const stepX = data.length > 1 ? innerW / (data.length - 1) : innerW;

    const points = data.map((d, i) => {
        const x = paddingX + i * stepX;
        const y = paddingY + innerH - (d.value / max) * innerH;
        return `${x},${y}`;
    });

    const areaPath = `M ${paddingX},${paddingY + innerH} L ${points.join(' ')} L ${paddingX + innerW},${paddingY + innerH} Z`;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {subtitle && <CardDescription>{subtitle}</CardDescription>}
            </CardHeader>
            <CardContent>
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <rect x="0" y="0" width={width} height={height} fill="transparent" />
                    {/* Baseline */}
                    <line
                        x1={paddingX}
                        y1={paddingY + innerH}
                        x2={paddingX + innerW}
                        y2={paddingY + innerH}
                        stroke="hsl(var(--muted-foreground))"
                        strokeOpacity="0.2"
                    />
                    {/* Area */}
                    <path d={areaPath} fill="url(#areaGradient)" />
                    {/* Line */}
                    <polyline
                        points={points.join(' ')}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                </svg>
            </CardContent>
        </Card>
    );
}
