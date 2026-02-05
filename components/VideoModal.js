"use client";

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import Hls from 'hls.js';

export default function VideoModal({ isOpen, playbackUrl, onClose, userEmail }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !videoRef.current || !playbackUrl) return;

    console.log('🎬 HLS Player Initializing...');
    console.log('   Playback URL:', playbackUrl);

    setLoading(true);
    setError(null);

    const video = videoRef.current;

    const playVideo = () => {
      // ✅ hls.js supported browsers (Chrome, Firefox, Edge)
      if (Hls.isSupported()) {
        console.log('✅ hls.js is supported');
        
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 3,
          levelLoadingTimeOut: 10000,
          levelLoadingMaxRetry: 3,
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 6,
          // ✅ Token expire হলে auto retry
          xhrSetup: function(xhr, url) {
            xhr.withCredentials = false;
          }
        });

        hlsRef.current = hls;
        hls.loadSource(playbackUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log('✅ Manifest parsed successfully');
          console.log('   Available qualities:', data.levels.map(l => `${l.height}p`));
          setLoading(false);
          
          // Auto play with error handling
          video.play()
            .then(() => console.log('✅ Video playing'))
            .catch((e) => {
              console.warn('⚠️ Autoplay blocked:', e.message);
              // Autoplay block হলে user কে click করতে বলো (optional)
            });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('❌ HLS Error:', {
            type: data.type,
            details: data.details,
            fatal: data.fatal
          });

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('💥 Network error - attempting recovery');
                hls.startLoad();
                break;
                
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('💥 Media error - attempting recovery');
                hls.recoverMediaError();
                break;
                
              default:
                console.error('💥 Unrecoverable error');
                setError('ভিডিও লোড করতে সমস্যা হয়েছে। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।');
                setLoading(false);
                hls.destroy();
                break;
            }
          }
        });

        // Quality change detection
        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          console.log(`📺 Quality changed to: ${hls.levels[data.level].height}p`);
        });

      } 
      // ✅ Safari নেটিভ HLS support
      else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('✅ Using native HLS (Safari)');
        video.src = playbackUrl;
        
        video.addEventListener('loadedmetadata', () => {
          console.log('✅ Metadata loaded');
          setLoading(false);
          video.play()
            .then(() => console.log('✅ Video playing'))
            .catch((e) => console.warn('⚠️ Autoplay blocked:', e));
        });
        
        video.addEventListener('error', (e) => {
          console.error('❌ Video error:', e);
          setError('ভিডিও লোড হয়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।');
          setLoading(false);
        });
      } 
      // ❌ Browser doesn't support HLS
      else {
        console.error('❌ HLS not supported');
        setError('আপনার ব্রাউজারে HLS সাপোর্ট নেই। Chrome বা Safari ব্যবহার করুন।');
        setLoading(false);
      }
    };

    playVideo();

    // ✅ Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up HLS player');
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
    };
  }, [isOpen, playbackUrl]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-2 sm:p-4" 
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl bg-black rounded-xl overflow-hidden shadow-2xl" 
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
        >
          <X size={24} />
        </button>

        {/* Video Container */}
        <div className="aspect-video bg-black relative flex items-center justify-center">
       <video 
            ref={videoRef} 
            className="w-full h-full" 
            controls 
            playsInline
            preload="metadata"
          />

          {/* ✅ User Email Watermark Overlay */}
          {userEmail && (
            <div className="absolute top-4 right-4 z-10 pointer-events-none select-none">
              <div className="bg-black/40 text-white text-sm px-3 py-1.5 rounded-md backdrop-blur-sm font-mono shadow-lg border border-white/20">
                {userEmail}
              </div>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white text-sm">ভিডিও লোড হচ্ছে...</p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-white text-center p-6 z-10">
              <div>
                <p className="text-2xl mb-4">⚠️</p>
                <p className="text-xl font-medium mb-2">সমস্যা হয়েছে</p>
                <p className="text-base mb-6 max-w-md">{error}</p>
                <button 
                  onClick={onClose} 
                  className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg transition-colors font-medium"
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