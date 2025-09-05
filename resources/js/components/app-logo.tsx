import logo from '../../assets/St._James-removebg-preview.png';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2">
            <img
                src={logo}
                alt="St. James Hospital Logo"
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', background: '#fff' }}
            />
            <span className="ml-1 text-base font-bold" style={{ whiteSpace: 'nowrap', color: '#000' }}>
                St. James Hospital
            </span>
        </div>
    );
}
