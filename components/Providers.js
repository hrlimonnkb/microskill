// components/Providers.js
"use client"; // এটি অবশ্যই দিতে হবে

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';

export function Providers({ children }) {
  // আপনার Google Cloud Console থেকে পাওয়া Client ID এখানে দিন
  const clientId = "167499456622-88a53l5d2cdu5em23og3ttouetkbljdi.apps.googleusercontent.com";

  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={clientId}>
        {children}
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}