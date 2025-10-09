import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Only initialize Echo if Pusher credentials are available
const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;

if (pusherKey && pusherKey !== 'undefined') {
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: pusherKey,
        cluster: pusherCluster ?? 'mt1',
        wsHost: import.meta.env.VITE_PUSHER_HOST ? import.meta.env.VITE_PUSHER_HOST : `ws-${pusherCluster || 'mt1'}.pusher.com`,
        wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
        wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });
} else {
    // Create a mock Echo object for development
    window.Echo = {
        private: (channel) => ({
            listen: (event, callback) => {
                console.log(`Mock Echo: Listening to ${event} on ${channel}`);
                // For development, we'll use polling instead of real-time
                return { stop: () => {} };
            },
            leave: (channel) => {
                console.log(`Mock Echo: Left channel ${channel}`);
            }
        }),
        channel: (channel) => ({
            listen: (event, callback) => {
                console.log(`Mock Echo: Listening to ${event} on ${channel}`);
                return { stop: () => {} };
            },
            leave: (channel) => {
                console.log(`Mock Echo: Left channel ${channel}`);
            }
        })
    };
    
    console.log('Echo initialized in mock mode (no Pusher credentials found)');
}
