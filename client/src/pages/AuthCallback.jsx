import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleCallback = () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');
            const userParam = params.get('user');

            if (token && userParam) {
                try {
                    const user = JSON.parse(decodeURIComponent(userParam));
                    
                    // Store token and user data
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    // Redirect to dashboard
                    navigate('/dashboard');
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    navigate('/login?error=callback_failed');
                }
            } else {
                navigate('/login?error=missing_data');
            }
        };

        handleCallback();
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-lg">Completing authentication...</p>
            </div>
        </div>
    );
};

export default AuthCallback;