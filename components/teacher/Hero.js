"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// --- Configuration ---
const heroImageSrc = "/assets/becometeacher.avif";
const groupImageSrc = "/assets/Group499.png";
const frame1 = "/assets/Magic Leap (logo — Black).png";
const frame2 = "/assets/Magic Leap (logo — Black).png";
const frame3 = "/assets/Magic Leap (logo — Black).png";
const frame4 = "/assets/Magic Leap (logo — Black).png";
// ---------------------


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

              

              মাইক্রো <span className="text-[#f97316]">স্কিল</span> এর
              <br />
              সাথে <span className="text-[#f97316]">মেন্টর</span> হিসাবে
              <br />
              যুক্ত <span className="text-[#f97316]">হোন</span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
            আপনি যদি সিনিয়র ও অভিজ্ঞ  প্রফেশনাল হন, তবে আপনার স্কিল ও অভিজ্ঞতা দিয়ে অন্যদের ক্যারিয়ার গড়তে অবদান রাখুন। কোর্স তৈরি করুন, লাইভ ট্রেনিং করান এবং ওয়ার্কশপ ও সেমিনারে কী-নোট স্পিকার হিসেবে যুক্ত হোন।
            </p>
            
            {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2">
  {/* বাটন ১: কল বুক করুন (Primary) */}
  <Link
    href="#book-a-call"
    className="px-6 sm:px-8 py-3 bg-[#f97316] text-white text-sm sm:text-base font-semibold rounded-lg shadow-md transition-all duration-300 hover:bg-[#c2570c] hover:shadow-lg text-center"
  >
    বিস্তারিত জানতে কল বুক করুন
  </Link>
  
  {/* বাটন ২: সরাসরি কল করুন (Secondary) */}
  <a
    href="tel:016091011537"
    className="px-6 sm:px-8 py-3 bg-white text-[#f97316] border border-[#f97316] text-sm sm:text-base font-semibold rounded-lg shadow-md transition-all duration-300 hover:bg-orange-50 hover:shadow-lg text-center"
  >
    কল করুন: 016091011537
  </a>
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
          
            
            {/* Floating Progress Card - 5K+ Online Courses (Top Right) */}
           
            
            {/* Floating Stat Card - 250+ Tutors (Bottom Right) */}
          
          </div>
        </div>

        {/* Bottom Collaboration Logos */}
        <div className="mt-5 sm:mt-16 lg:mt-20 xl:mt-24 relative">
          
          {/* Group Circle Image - নিচে collaboration section এর কাছে */}
          {/* === আপডেটেড: Bottom Collaboration Logos === */}
       
          
          {/* Group Circle Image - collaboration section এর কাছে (ডট) */}
        
          
          {/* আপনার নির্দেশনা অনুযায়ী নতুন ৫-আইটেম লেআউট */}
      
        </div>
        
      </div>
    </section>
  );
};





export default HeroSection;