// components/Providers.js
"use client"; // এটি অবশ্যই দিতে হবে

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';

export function Providers({ children }) {
  // আপনার Google Cloud Console থেকে পাওয়া Client ID এখানে দিন
  const clientId = "174460517400-gqmvcil131gg60oi5jo6vuvf829b6iqk.apps.googleusercontent.com";

  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={clientId}>
        {children}
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}