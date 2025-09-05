import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            {/* Outer green circle */}
            <circle cx="200" cy="200" r="190" fill="#fff" stroke="#21823b" strokeWidth="28" />
            {/* Gold ring */}
            <circle cx="200" cy="200" r="160" fill="#fff" stroke="#FFD700" strokeWidth="8" />
            {/* Blue/white logo mark, stylized for center */}
            <g>
                {/* Large blue person */}
                <circle cx="200" cy="140" r="28" fill="#0080C0" />
                <rect x="186" y="168" width="28" height="80" rx="14" fill="#0080C0" />
                {/* Horizontal cross */}
                <rect x="140" y="200" width="120" height="28" rx="14" fill="#0080C0" />
                {/* Small blue person */}
                <circle cx="140" cy="170" r="13" fill="#0080C0" />
                <rect x="132" y="183" width="16" height="40" rx="8" fill="#0080C0" />
            </g>
        </svg>
    );
}
