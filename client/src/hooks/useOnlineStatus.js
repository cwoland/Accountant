import { useState, useEffect } from 'react';

export default function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(navigator.online);

    useEffect(() => {
        const goOnline = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);
    
    return isOnline;
}