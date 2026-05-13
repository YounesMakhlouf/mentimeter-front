import {useEffect} from 'react';
import {Outlet, useNavigate} from 'react-router';
import {ReconnectingBanner} from './ReconnectingBanner.tsx';

export default function RootLayout() {
    const navigate = useNavigate();

    useEffect(() => {
        const onUnauthorized = () => navigate('/authentication');
        window.addEventListener('app:unauthorized', onUnauthorized);
        return () => window.removeEventListener('app:unauthorized', onUnauthorized);
    }, [navigate]);

    return (
        <>
            <ReconnectingBanner/>
            <Outlet/>
        </>
    );
}
