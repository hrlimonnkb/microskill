// ═══════════════════════════════════════════════════════════════
// hooks/useAuth.js
// সব dashboard page এ এই hook দিয়ে role check করা হবে
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth({ required = true } = {}) {
    const router = useRouter();
    const [user, setUser]       = useState(null);   // { id, name, email, role }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                if (required) router.replace('/login');
                setLoading(false);
                return;
            }
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser(payload);
        } catch {
            if (required) router.replace('/login');
        } finally {
            setLoading(false);
        }
    }, []);

    const isAdmin   = user?.role?.toUpperCase() === 'ADMIN';
    const isStudent = !isAdmin && !!user;

    return { user, loading, isAdmin, isStudent };
}

export function authHeaders() {
    const t = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return t
        ? { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };
}