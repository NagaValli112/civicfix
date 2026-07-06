import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxy handles the rest
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        // Wait, cookie might be httpOnly. If httpOnly, JS can't read it.
        // But my backend sets httpOnly: true.
        // So frontend cannot read 'token' from cookie.
        // The browser automatically sends cookies with requests to the same domain (or proxied).
        // So I don't need to manually add Authorization header if I use cookies.
        // BUT, the `protect` middleware expects `Bearer <token>` in Authorization header.
        // OR I should change middleware to look for cookie.
        // Let's stick to Header based auth for API flexibility, but I need to store token in localStorage then.
        // The plan said "JWT authentication", detailed plan "Login -> sendTokenResponse".
        // sendTokenResponse in auth.controller.js sets cookie AND returns json with token.
        // So I can save token in localStorage.

        // Changing approach: Use localStorage for token to simplify header injection.

        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            config.headers.Authorization = `Bearer ${savedToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
