// pages/about-us.js অথবা app/about-us/page.js
"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// --- নতুন: ডাইনামিক হেডার কম্পোনেন্ট ইম্পোর্ট করুন ---
// পাথটি আপনার ফাইল স্ট্রাকচার অনুযায়ী অ্যাডজাস্ট করুন (যেমন: ../components/...)
import DynamicPageHeader from '../components/DynamicPageHeader'; 

// --- সেকশন ৩: Benefits সেকশনের ডেটা (বাংলায়) ---
const benefitsData = [
  {
    number: "01",
    title: "মানকরণ",
    description: "একটি বৈশ্বিক কর্মক্ষেত্রে কাজ করার সময়, শিক্ষার্থীদের প্রশিক্ষণের প্রয়োজনীয়তা পরিমাপ করা প্রায়শই কঠিন, যা..."
  },
  {
    number: "02",
    title: "খরচ হ্রাস",
    description: "Micro Skill-এর সাথে, মোবাইল লার্নিং এবং মাইক্রো লার্নিং-এর সুবাদে উপকরণ পুনরুত্পাদনের জন্য কোনও খরচ নেই..."
  },
  // ...বাকি ডেটা
  {
    number: "06",
    title: "মাল্টিমিডিয়া উপকরণ",
    description: "ই-লার্নিং কার্যকর হওয়ার অন্যতম প্রধান কারণ হলো এটি... এর জন্য নিখুঁত ডেলিভারি পদ্ধতি।"
  },
];

// --- Benefits কার্ডের জন্য একটি ছোট কম্পোনেন্ট (বাংলায়) ---
const BenefitCard = ({ number, title, description }) => {
  return (
    <div>
      <p className="text-7xl lg:text-8xl font-bold text-[#f97316]">
        {number}
      </p>
      <h3 className="text-2xl font-bold text-gray-900 mt-4">
        {title}
      </h3>
      <p className="text-base text-gray-600 mt-3">
        {description}
        <Link href="#" className="text-[#f97316] font-semibold hover:underline ml-1">
          আরও পড়ুন
        </Link>
      </p>
    </div>
  );
};


// --- মূল About Us পেজ কম্পোনেন্ট (বাংলায়) ---
const AboutUsPage = () => {

  // --- এই পেজের জন্য ডাইনামিক ডেটা ---
  const pageTitle = "আমাদের সম্পর্কে";
  const breadcrumbsList = [
    { name: "হোম", href: "/" },
    { name: "আমাদের সম্পর্কে", href: "/about-us" } // বর্তমান পেজের লিঙ্ক
  ];

  return (
    <main>
      
      {/* ========== নতুন ডাইনামিক হেডিং সেকশন ========== */}
      <DynamicPageHeader 
        title={pageTitle} 
        breadcrumbs={breadcrumbsList} 
      />
      
      {/* ========== সেকশন ১: About Us (বাংলায়) ========== */}
      <section className="py-16 lg:py-24 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* বাম কলাম: টেক্সট */}
          <div>
            <p className="text-4xl font-bold text-[#c2570c]">
              আমাদের সম্পর্কে
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-3 leading-tight">
              <span className="text-orange-500">Micro Skill</span> বিশ্বজুড়ে শিক্ষার্থীদের সেরা সুযোগ প্রদান করছে।
            </h1>
            <p className="text-lg text-gray-600 mt-6">
              Micro Skill বাংলাদেশের একটি অনলাইন প্রশিক্ষণ একাডেমি...
            </p>
            <Link 
              href="#" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f97316] text-white font-semibold mt-8 transition-all duration-300 hover:bg-[#c2570c]"
            >
              যোগ দিন
              <ArrowRight size={18} />
            </Link>
          </div>
          
          {/* ডান কলাম: ছবি */}
          <div className="bg-gray-100 rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
            <div className="ml-auto w-11/12">
              <Image
                src="/assets/Rectangle13.png" 
                alt="অফিসের ভেতরের ছবি"
                width={500}
                height={300}
                className="rounded-xl shadow-lg object-cover w-full h-auto"
              />
            </div>
            <div className="mr-auto w-11/12">
              <Image
                src="/assets/Rectangle14.png" 
                alt="ডেস্কের উপর ল্যাপটপ"
                width={500}
                height={300}
                className="rounded-xl shadow-lg object-cover w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== সেকশন ২: Features (বাংলায়) ========== */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* বাম কলাম: ছবি (md অর্ডারে প্রথমে) */}
          <div className="md:order-1">
            <Image
              src="/assets/SectionImg.png" 
              alt="রঙিন লাইটবাল্ব"
              width={500}
              height={700}
              className="rounded-xl shadow-lg object-cover w-full h-full"
            />
          </div>

          {/* ডান কলাম: টেক্সট (md অর্ডারে শেষে) */}
          <div className="md:order-2">
            <p className="text-cyan-600 font-semibold uppercase">
              বৈশিষ্ট্য
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-3 leading-tight">
              আমরা আপনাকে সব দিক থেকে সেরা বৈশিষ্ট্যগুলি সরবরাহ করতে সর্বদা কাজ করে যাচ্ছি।
            </h2>
            <div className="text-lg text-gray-600 mt-6 space-y-5">
              <p>
                Micro Skill-এ আমাদের প্রধান সংকল্প হলো...
              </p>
              <p>
                আপনি ইন্টারনেটে প্রতিটি ছোট জিনিস একটি ক্লিকের মাধ্যমে খুঁজে পাবেন...
              </p>
            </div>
            <Link 
              href="#" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f97316] text-white font-semibold mt-8 transition-all duration-300 hover:bg-[#c2570c]"
            >
              আরও জানুন
              <ArrowRight size={18} />
            </Link>
          </div>
          
        </div>
      </section>

      {/* ========== সেকশন ৩: Benefits (বাংলায়) ========== */}
      <section className="py-16 lg:py-24 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* উপরের টেক্সট (Centered) */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-cyan-600 font-semibold uppercase">
              আমাদের সুবিধাসমূহ
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-3 leading-tight">
              Micro Skill প্ল্যাটফর্মে যোগদানের মাধ্যমে, আপনি অনেক সুবিধা পেতে পারেন।
            </h2>
            <p className="text-lg text-gray-600 mt-6">
              আপনার ই-কমার্স সাইটে আমাদের শীর্ষ-রেটেড ড্রপশিপিং অ্যাপটি ইনস্টল করুন...
            </p>
          </div>
          
          {/* Benefits গ্রিড */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {benefitsData.map((benefit) => (
              <BenefitCard
                key={benefit.number}
                number={benefit.number}
                title={benefit.title}
                description={benefit.description}
              />
            ))}
          </div>
          
        </div>
      </section>

    </main>
  );
};

export default AboutUsPage;