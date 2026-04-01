"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// --- Configuration ---
const heroImageSrc = "/assets/student.png";
const groupImageSrc = "/assets/Group499.png";
const frame1 = "/assets/Magic Leap (logo — Black).png";
const frame2 = "/assets/Magic Leap (logo — Black).png";
const frame3 = "/assets/Magic Leap (logo — Black).png";
const frame4 = "/assets/Magic Leap (logo — Black).png";
// ---------------------

// Counter Animation Hook
const useCountUp = (end, duration = 2000, startDelay = 200) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasStarted(true);
    }, startDelay);
    return () => clearTimeout(timer);
  }, [startDelay]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, hasStarted]);

  return count;
};

const HeroSection = () => {
  return (
     <section className="relative w-full text-gray-900 py-8 sm:py-12 md:py-16 lg:py-20 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200">
      {/* Background Decorative Circle Elements */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-20 md:-top-40 -right-20 md:-right-40 w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full border-2 border-emerald-100 opacity-40" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full border-2 border-emerald-100 opacity-40" />
      </div>

      {/* Group Circle Image - উপরে বাম দিকে */}
      <div className='animate-pulse' style={{
    width: '400px', // or just 400
    position: 'absolute',
    left: '220px', // or just 220
    top: '-34px' // or just -34
}}>
  <Image
    src={groupImageSrc}
    alt="Decorative dots"
    width={56}
    height={56}
    className="w-full h-full opacity-90" // WARNING: This stretches your 56px image to 400px wide
    priority
  />
</div>

      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
          
          {/* Left Content Column */}
          <div className="w-full lg:w-1/2 text-center lg:text-left space-y-4 sm:space-y-6 lg:pt-8">
            <h1 className="text-3xl sm:text-4xl md:text-3xl lg:text-3xl xl:text-6xl font-bold leading-tight">
              তোমার <span className="text-[#f97316]">স্কিল</span> বাড়াও
              <br />
              যাতে <span className="text-[#f97316]">ক্যারিয়ার</span> হয়
              <br />
              আরও <span className="text-[#f97316]">অগ্রসর</span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
              উইকএন্ড UX এর সাথে UI-UX ডিজাইন শেখো। এটি একটি আধুনিক অনলাইন লার্নিং সিস্টেম যা তোমার জ্ঞান বাড়াতে সাহায্য করবে।
            </p>
            
            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2">
              <Link
                href="/start"
                className="px-6 sm:px-8 py-3 bg-[#f97316] text-white text-sm sm:text-base font-semibold rounded-lg shadow-md transition-all duration-300 hover:bg-[#c2570c] hover:shadow-lg"
              >
               শুরু করো
              </Link>
              <Link
                href="/trial"
                className="px-6 sm:px-8 py-3 bg-white text-[#f97316] text-sm sm:text-base font-semibold rounded-lg shadow-md border-2 border-[#f97316] transition-all duration-300 hover:bg-emerald-50"
              >
              ফ্রি ট্রায়াল নাও
              </Link>
            </div>
            
            {/* Icon List */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-4 sm:pt-6">
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="text-[#f97316] w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                </svg>
               <span className="text-xs sm:text-sm md:text-base">পাবলিক স্পিকিং</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="text-[#f97316] w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <span className="text-xs sm:text-sm md:text-base">ক্যারিয়ার ফোকাসড</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="text-[#f97316] w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.7.8 1.3 1.5 1.5 2.5"></path>
                  <path d="M9 18h6"></path>
                  <path d="M10 22h4"></path>
                </svg>
                 <span className="text-xs sm:text-sm md:text-base">সৃজনশীল চিন্তা</span>
              </div>
            </div>
          </div>

          {/* Right Image/Illustration Column */}
          <div className="w-full lg:w-1/2 flex justify-center items-center relative mt-8 lg:mt-0 min-h-[350px] sm:min-h-[450px] md:min-h-[550px] lg:min-h-[600px]">
            
            {/* Main Green Circle BG */}
            <div className="absolute bg-[#f97316] w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[450px] md:h-[450px] lg:w-[520px] lg:h-[520px] xl:w-[580px] xl:h-[580px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0" />
            
            {/* Hero Image Container */}
            <div className="relative w-[240px] sm:w-[300px] md:w-[380px] lg:w-[440px] xl:w-[500px] z-10">
              <Image
                src={heroImageSrc}
                alt="Learning Platform Hero"
                width={700}
                height={900}
                className="w-full h-auto object-contain"
                priority
              />
            </div>

            {/* Floating Stat Card - 2K+ Video Courses (Top Left) */}
            <div className="absolute top-4 sm:top-8 md:top-12 lg:top-16 left-0 sm:-left-4 md:-left-8 lg:-left-12 z-20">
              <StatCard
                icon={
                  <svg className="text-[#f97316] w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="10 8 16 12 10 16 10 8"></polygon>
                  </svg>
                }
                value="2K+"
                label="Video Courses"
                delay={300}
              />
            </div>
            
            {/* Floating Progress Card - 5K+ Online Courses (Top Right) */}
            <div className="absolute -top-2 sm:top-0 md:top-2 right-4 sm:right-8 md:right-12 lg:right-16 xl:right-20 z-20">
              <ProgressStatCard
                value="5K+"
                label="Online Courses"
                delay={600}
              />
            </div>
            
            {/* Floating Stat Card - 250+ Tutors (Bottom Right) */}
            <div className="absolute bottom-4 sm:bottom-8 md:bottom-12 lg:bottom-16 right-0 sm:-right-4 md:-right-8 lg:-right-12 z-20">
              <StatCard
                icon={
                  <svg className="text-[#f97316] w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                     <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                }
                value="250+"
                label="Tutors"
                delay={900}
              />
            </div>
          </div>
        </div>

        {/* Bottom Collaboration Logos */}
        <div className="mt-5 sm:mt-16 lg:mt-20 xl:mt-24 relative">
          
          {/* Group Circle Image - নিচে collaboration section এর কাছে */}
          {/* === আপডেটেড: Bottom Collaboration Logos === */}
       
          
          {/* Group Circle Image - collaboration section এর কাছে (ডট) */}
          <div className="absolute -top-2 sm:-top-3 left-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 z-20">
            <Image
              src={groupImageSrc}
              alt="Decorative dots"
              width={56}
              height={56}
              className="w-full h-full opacity-70"
            />
          </div>
          
          {/* আপনার নির্দেশনা অনুযায়ী নতুন ৫-আইটেম লেআউট */}
          <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-6 lg:gap-10">
            
            {/* আইটেম ১: Text */}
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 shrink-0 z-10">
           <span className='text-[#f97316] text-2xl font-bold leading-tight'>২৫০+ </span>
           <br/>
<span className='text-xl'>সহযোগি প্রতিষ্ঠানসমূহ</span>

            </h3>

            {/* আইটেম ২-৫: Logos */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-8 gap-y-6 lg:gap-x-10 grayscale opacity-60">
              <Image src={frame1} alt="Collaboration Logo 1" width={150} height={40} className="w-auto h-6 sm:h-8" />
              <Image src={frame2} alt="Collaboration Logo 2" width={150} height={40} className="w-auto h-6 sm:h-8" />
              <Image src={frame3} alt="Collaboration Logo 3" width={150} height={40} className="w-auto h-6 sm:h-8" />
              <Image src={frame4} alt="Collaboration Logo 4" width={150} height={40} className="w-auto h-6 sm:h-8" />
            </div>
          </div>

        </div>
        
      </div>
    </section>
  );
};

// Helper component for the simple stat cards - With Animation
const StatCard = ({ icon, value, label, delay = 0 }) => {
  const numValue = parseInt(value.replace(/\D/g, ''));
  const suffix = value.replace(/[0-9]/g, '');
  const animatedValue = useCountUp(numValue, 2000, delay);

  return (
    <div 
      className="bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow-xl flex items-center gap-2 sm:gap-3 min-w-[130px] sm:min-w-[150px] md:min-w-[170px] transform hover:scale-105 transition-transform duration-300"
    >
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
          {animatedValue}{suffix}
        </p>
        <p className="text-xs sm:text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
};

// Helper component for the 5K+ progress circle card - With Animation
const ProgressStatCard = ({ value, label, delay = 0 }) => {
  const numValue = parseInt(value.replace(/\D/g, ''));
  const suffix = value.replace(/[0-9]/g, '');
  const animatedValue = useCountUp(numValue, 2000, delay);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(80);
    }, delay + 100);
    return () => clearTimeout(timer);
  }, [delay]);

  const circumference = 282.74;
  const offset = circumference - (circumference * progress) / 100;

  return (
    <div 
      className="bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow-xl flex flex-col items-center gap-1 min-w-[90px] sm:min-w-[110px] md:min-w-[130px] transform hover:scale-105 transition-transform duration-300"
    >
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle 
            className="text-gray-200" 
            strokeWidth="8" 
            stroke="currentColor" 
            fill="transparent" 
            r="45" 
            cx="50" 
            cy="50" 
          />
          <circle
            className="text-[#f97316] transition-all duration-2000 ease-out"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            style={{ transition: 'stroke-dashoffset 2s ease-out' }}
          />
        </svg>
        <span className="absolute text-sm sm:text-base md:text-lg font-bold text-gray-800">
          {animatedValue}{suffix}
        </span>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
};

export default HeroSection;