"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null); 
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('authToken'); 
            if (storedUser && storedToken) {
                // ইউজার এবং টোকেন দুটোই পেলে state-এ সেট করবে
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            }
        } catch (error) {
            console.error("Failed to parse user data from localStorage:", error);
            // কোনো সমস্যা হলে সবকিছু পরিষ্কার করে দেবে
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
        } finally {
            setLoading(false);
        }
    }, []);

    // লগইন ফাংশন (এখন API থেকে আসা সম্পূর্ণ ডেটা নেবে)
    const login = (loginData) => {
        // এখন আমরা আশা করছি loginData'র ভেতরে user এবং token দুটোই থাকবে
        // যেমন: { user: { id: 1, name: 'Asad', role: 'ADMIN' }, token: 'xyz...' }
        const { user, token } = loginData;

        if (!user || !token || !user.role) {
            console.error("Login failed: Data must include user, token, and role.");
            return;
        }

        // <-- ৩. ইউজার এবং টোকেন দুটোই state ও localStorage-এ সেট করা
        setUser(user);
        setToken(token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', token);

        router.push('/dashboard');
    };

    // লগআউট ফাংশন
    const logout = () => {
        // <-- ৪. লগআউটের সময় সবকিছু মুছে ফেলা
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        router.push('/signin');
    };

    const value = {
        user,
        token, // <-- ৫. টোকেনকে value-এর মাধ্যমে পাঠানো
        role: user ? user.role : null,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// কাস্টম হুক (এখানে কোনো পরিবর্তন নেই)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
