"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import DynamicPageHeader from '@/components/DynamicPageHeader';

const faqData = [
  {
    id: 1,
    question: 'মাইক্রো স্কিল কী?',
    answer: '"মাইক্রো স্কিল" একটি অনলাইন শিক্ষামূলক প্ল্যাটফর্ম যা শিক্ষার্থীদের বাস্তব জীবনের প্রজেক্ট ভিত্তিক প্রশিক্ষণের মাধ্যমে বিভিন্ন ডিজিটাল দক্ষতা অর্জনে সহায়তা করে। আমাদের লক্ষ্য হলো আপনাকে ইন্ডাস্ট্রির জন্য প্রস্তুত করে তোলা।'
  },
  {
    id: 2,
    question: 'এই কোর্সগুলো কাদের জন্য?',
    answer: 'আমাদের কোর্সগুলো মূলত শিক্ষার্থী, নতুন গ্র্যাজুয়েট, চাকুরীজীবী এবং ফ্রিল্যান্সারদের জন্য ডিজাইন করা হয়েছে যারা তাদের দক্ষতা আপগ্রেড করতে বা নতুন কিছু শিখতে চান। আপনার যদি শেখার আগ্রহ থাকে, তবে এই কোর্স আপনার জন্যই।'
  },
  {
    id: 3,
    question: 'আমি কীভাবে কোর্সে ভর্তি হবো?',
    answer: 'খুব সহজ! আমাদের ওয়েবসাইটে আপনার পছন্দের কোর্সটি সিলেক্ট করুন, "ভর্তি হোন" বাটনে ক্লিক করুন এবং সহজ পেমেন্ট প্রক্রিয়ার মাধ্যমে আপনার ভর্তি সম্পন্ন করুন। পেমেন্টের সাথে সাথেই আপনি কোর্সের অ্যাক্সেস পেয়ে যাবেন।'
  },
  {
    id: 4,
    question: 'লাইভ ক্লাস মিস করলে কী হবে?',
    answer: 'কোনো সমস্যা নেই। "মাইক্রো স্কিল"-এর প্রতিটি লাইভ ক্লাসের পর সেই ক্লাসের রেকর্ডিং আপনার ড্যাশবোর্ডে প্রদান করা হয়। আপনি আপনার সুবিধামত সময়ে ক্লাসটি দেখে নিতে পারবেন।'
  },
  {
    id: 5,
    question: 'কোর্স শেষে কোনো সার্টিফিকেট দেওয়া হয়?',
    answer: 'হ্যাঁ, আমাদের প্রতিটি কোর্স সফলভাবে সম্পন্ন করার পর "মাইক্রো স্কিল" থেকে আপনাকে একটি ভেরিফায়েড ডিজিটাল সার্টিফিকেট প্রদান করা হবে, যা আপনি আপনার লিংকডইন প্রোফাইল বা সিভিতে যোগ করতে পারবেন।'
  },
  {
    id: 6,
    question: 'কোর্স চলাকালীন সাপোর্ট কীভাবে পাবো?',
    answer: 'শিক্ষার্থীদের জন্য আমাদের রয়েছে ডেডিকেটেড সাপোর্ট সিস্টেম। আপনি আমাদের প্রাইভেট ফেসবুক গ্রুপ, ডিসকর্ড সার্ভার অথবা সরাসরি ড্যাশবোর্ড থেকে সাপোর্টের জন্য মেসেজ করতে পারবেন। আমাদের ইন্সট্রাক্টর এবং সাপোর্ট টিম আপনাকে সহায়তা করার জন্য প্রস্তুত।'
  },
];


// --- ২: অ্যাকর্ডিয়ন আইটেম (Reusable Component) ---
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border m-5 px-5 rounded border-gray-200 last:border-b-0">
      {/* প্রশ্ন (বাটন) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className={`text-lg font-semibold ${isOpen ? 'text-[#f97316]' : 'text-gray-800'}`}>
          {question}
        </span>
        <ChevronDown 
          size={20} 
          className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#f97316]' : 'rotate-0 text-gray-500'}`} 
        />
      </button>

      {/* উত্তর (Collapse/Expand) */}
      <div 
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 pr-4 text-base text-gray-600 leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};


// --- ৩: মূল FAQ পেজ কম্পোনেন্ট ---
const FAQPage = () => {
  // --- এই পেজের জন্য ডাইনামিক হেডার ডেটা ---
  const pageTitle = "সচরাচর জিজ্ঞাসিত প্রশ্নাবলী";
  const breadcrumbsList = [
    { name: "হোম", href: "/" },
    { name: "FAQ", href: "/faq" }
  ];

  return (
    <main>
      {/* --- হেডার সেকশন --- */}
      <DynamicPageHeader 
        title={pageTitle} 
        breadcrumbs={breadcrumbsList} 
      />

      {/* --- FAQ লিস্ট সেকশন --- */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* সেকশনের শিরোনাম */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              আপনার যা জানা প্রয়োজন
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              মাইক্রো স্কিল সম্পর্কে আপনার সাধারণ প্রশ্নগুলোর উত্তর এখানে খুঁজুন।
            </p>
          </div>

          {/* FAQ আইটেমগুলো ম্যাপ করা হচ্ছে */}
          <div className="">
            <div className="divide-y divide-gray-200">
              {faqData.map((faq) => (
                <FAQItem 
                  key={faq.id} 
                  question={faq.question} 
                  answer={faq.answer} 
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA (Call to Action) সেকশন --- */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <HelpCircle size={48} className="mx-auto text-[#f97316]" />
          <h3 className="mt-6 text-3xl font-bold text-gray-900">
            আপনার আরও প্রশ্ন আছে?
          </h3>
          <p className="mt-4 text-lg text-gray-600">
            আপনি যদি আপনার কাঙ্ক্ষিত প্রশ্নটি এখানে খুঁজে না পান, তবে দ্বিধা না করে আমাদের সাথে সরাসরি যোগাযোগ করুন। আমরা আপনাকে সাহায্য করতে প্রস্তুত।
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f97316] text-white font-semibold mt-8 transition-all duration-300 hover:bg-[#c2570c] hover:shadow-lg"
          >
            যোগাযোগ করুন
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default FAQPage;