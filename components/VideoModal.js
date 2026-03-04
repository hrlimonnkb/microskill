"use client";

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import Hls from 'hls.js';

export default function VideoModal({ isOpen, playbackUrl, onClose, userEmail }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const gumletInsightsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gumlet Insights Property ID (আপনার ড্যাশবোর্ড থেকে এটি পরিবর্তন করুন)
  const GUMLET_PROPERTY_ID = 'G-8YENsg'; 

  useEffect(() => {
    if (!isOpen || !playbackUrl) return;

    // ১. Gumlet Insights SDK ডাইনামিকভাবে লোড করা
    const loadGumletSDK = () => {
      return new Promise((resolve) => {
        if (window.gumlet) {
          resolve(window.gumlet);
          return;
        }
        const script = document.createElement('script');
        script.src = "https://cdn.gumlytics.com/insights/1.0/gumlet-insights.min.js";
        script.async = true;
        script.onload = () => resolve(window.gumlet);
        document.head.appendChild(script);
      });
    };

    const initializePlayer = async () => {
      setLoading(true);
      setError(null);

      // SDK লোড হওয়া পর্যন্ত অপেক্ষা
      const gumlet = await loadGumletSDK();

      // ২. Gumlet Iframe Mode (যদি URL এ gumlet.io থাকে)
      if (playbackUrl.includes('play.gumlet.io') || playbackUrl.includes('gumlet.com')) {
        console.log('🎬 Gumlet Iframe Mode Active');
        return; 
      }

      // ৩. HLS.js Player Logic (ডাইরেক্ট .m3u8 ফাইলের জন্য)
      if (!videoRef.current) return;
      const video = videoRef.current;

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });

        hlsRef.current = hls;
        hls.loadSource(playbackUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          video.play().catch(e => console.warn("Autoplay blocked"));

          // --- Gumlet Insights Registration ---
          if (gumlet && gumlet.insights) {
            const gumletConfig = {
              property_id: GUMLET_PROPERTY_ID,
              userEMail: userEmail || 'anonymous@user.com', // ইউজার ইমেইল ট্র্যাকিং
              userId: userEmail || 'guest_id',
              customVideoTitle: 'Course Lesson',
              customPageType: 'Watch Page'
            };

            // ইনসাইটস ইনিশিয়ালাইজ এবং প্লেয়ার রেজিস্টার
            gumletInsightsRef.current = gumlet.insights(gumletConfig);
            gumletInsightsRef.current.register(hls); 
            console.log("✅ Gumlet Insights Registered for HLS.js");
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            setError('ভিডিও লোড হতে সমস্যা হয়েছে। অনুগ্রহ করে পেজ রিফ্রেশ করুন।');
            setLoading(false);
          }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari Native Support
        video.src = playbackUrl;
        video.addEventListener('loadedmetadata', () => {
          setLoading(false);
          video.play();
        });
      }
    };

    initializePlayer();

    // ক্লিনআপ ফাংশন
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, [isOpen, playbackUrl, userEmail]);

  if (!isOpen) return null;

  const isIframe = playbackUrl.includes('play.gumlet.io') || playbackUrl.includes('gumlet.com');

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4" 
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10" 
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 z-[110] bg-black/40 hover:bg-red-600 text-white p-2 rounded-full transition-all duration-300"
        >
          <X size={24} />
        </button>

        {/* Video Area */}
        <div className="relative w-full bg-black flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
          {isIframe ? (
            <iframe
              // Iframe এর ক্ষেত্রে URL এ ইমেইল পাঠালে Gumlet Insights অটো ট্র্যাক করে
              src={`${playbackUrl}${playbackUrl.includes('?') ? '&' : '?'}autoplay=1&email=${encodeURIComponent(userEmail || '')}`}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setLoading(false)}
            />
          ) : (
            <video 
              ref={videoRef} 
              className="w-full h-full" 
              controls 
              playsInline
              crossOrigin="anonymous"
            />
          )}

          {/* ওয়াটারমার্ক (ইউজার ইমেইল) */}
          {userEmail && (
            <div className="absolute top-6 left-6 z-[105] pointer-events-none select-none opacity-40">
              <div className="bg-white/10 text-white text-[10px] md:text-xs px-2 py-1 rounded border border-white/20 font-mono tracking-wider">
                {userEmail}
              </div>
            </div>
          )}

          {/* Loading Loader */}
          {loading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-[108]">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-white/70 text-sm font-light">ভিডিও লোড হচ্ছে...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-white text-center p-6 z-[109]">
              <div>
                <p className="text-lg mb-6">{error}</p>
                <button 
                  onClick={onClose} 
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2 rounded-full transition-all"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}