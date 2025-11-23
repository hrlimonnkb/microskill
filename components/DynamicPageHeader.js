// components/DynamicPageHeader.jsx
"use client";
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react'; 

const DynamicPageHeader = ({ title, breadcrumbs }) => {
  return (
    <section 
      className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-orange-400 to-orange-300" 
    >
      {/* Background Overlay with subtle pattern */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '20px 20px',
          opacity: 0.1 
        }}
      ></div>

      {/* ========== আপডেট এখানে ========== */}
      {/* Animated Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Shape 1: Large light blue circle */}
        <div 
          className="absolute top-1/4 left-1/4 w-48 h-48 lg:w-64 lg:h-64 bg-green-500 rounded-full mix-blend-screen filter blur-xl opacity-40 animate-blob"
          style={{ animationDelay: '2s' }}
        ></div>
        {/* Shape 2: Medium purple circle */}
        <div 
          className="absolute top-1/2 right-1/4 w-32 h-32 lg:w-48 lg:h-48 bg-purple-300 rounded-full mix-blend-screen filter blur-xl opacity-40 animate-blob"
          style={{ animationDelay: '4s' }}
        ></div>
        {/* Shape 3: Small pink circle */}
        <div 
          className="absolute bottom-1/4 left-1/2 w-24 h-24 lg:w-36 lg:h-36 bg-pink-300 rounded-full mix-blend-screen filter blur-xl opacity-40 animate-blob"
          style={{ animationDelay: '6s' }}
        ></div>
      </div>
      {/* ========== আপডেট শেষ ========== */}


      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* ব্রেডক্রাম্বস (Breadcrumbs) */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex justify-center mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-2 md:space-x-3">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="inline-flex items-center">
                  {index < breadcrumbs.length - 1 ? (
                    <>
                      <Link 
                        href={crumb.href} 
                        className="text-gray-200 hover:text-white text-base font-medium transition duration-300"
                      >
                        {crumb.name}
                      </Link>
                      <ChevronRight size={18} className="text-gray-300 mx-1.5" />
                    </>
                  ) : (
                    <span className="text-white text-base font-semibold" aria-current="page">
                      {crumb.name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        
        {/* পেজের শিরোনাম */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight drop-shadow-lg animate-fade-in-up">
          {title}
        </h1>
      </div>

      {/* CSS for Animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          animation-delay: 0.2s;
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
      `}</style>
    </section>
  );
};

export default DynamicPageHeader;