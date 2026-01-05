"use client";

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import Hls from 'hls.js';

export default function VideoModal({ isOpen, videoUrl, onClose }) {
    const videoRef = useRef(null);
    const hlsRef = useRef(null); // hls instance রাখার জন্য ref
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen || !videoRef.current) return;

        const video = videoRef.current;
        setError(null); // reset error

        const cleanup = () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            video.removeAttribute('src');
        };

        try {
            if (Hls.isSupported() && videoUrl?.includes('.m3u8')) {
                const hls = new Hls({
                    // অপশনাল: Gumlet-এর জন্য কিছু কাস্টমাইজেশন
                    maxLoadingDelay: 4,
                    lowLatencyMode: true,
                });

                hlsRef.current = hls;

                hls.loadSource(videoUrl);
                hls.attachMedia(video);

                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        console.error('HLS Fatal Error:', data);
                        setError("ভিডিও লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
                    }
                });

                video.play().catch(() => {});
            } else {
                // সাধারণ mp4 বা অন্য ফরম্যাট
                video.src = videoUrl;
                video.play().catch(() => {});
            }
        } catch (err) {
            console.error('Video setup error:', err);
            setError("ভিডিও সেটআপে সমস্যা হয়েছে।");
        }

        return cleanup;
    }, [isOpen, videoUrl]);

    // মডাল ক্লোজ করার সময় অটোপ্লে বন্ধ
    useEffect(() => {
        if (!isOpen && videoRef.current) {
            videoRef.current.pause();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-5xl bg-black rounded-xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ক্লোজ বাটন */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>

                {/* ভিডিও প্লেয়ার */}
                <div className="aspect-video bg-black relative">
                    <video
                        ref={videoRef}
                        className="w-full h-full"
                        controls
                        autoPlay
                        playsInline
                        muted={false}
                    />

                    {/* লোডিং / এরর স্টেট */}
                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-center p-6">
                            <div>
                                <p className="text-xl font-semibold mb-2">ওহো! সমস্যা হয়েছে</p>
                                <p>{error}</p>
                                <button
                                    onClick={onClose}
                                    className="mt-4 px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200"
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