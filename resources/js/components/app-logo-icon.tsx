import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img 
            {...props} 
            src="/st-james-logo.png" 
            alt="St. James Hospital Logo"
            style={{ 
                width: props.width || '100%', 
                height: props.height || '100%',
                objectFit: 'contain'
            }}
        />
    );
}
