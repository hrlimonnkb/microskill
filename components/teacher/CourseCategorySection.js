"use client";

import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';

const categoriesData = [
  {
    id: 'digital-marketing',
    name: 'ডিজিটাল মার্কেটিং',
    content: {
      title: 'ডিজিটাল মার্কেটিং',
      description: 'ডিজিটাল মার্কেটিং ও SEO নিয়ে অথবা অন্য কোনো একটি টপিক নিয়ে এখনকার অনলাইন বাজারে প্রবেশ করুন এবং অন্যদের থেকে এগিয়ে থাকুন।',
      // এই ব্যাকগ্রাউন্ড ইমেজটি আপনার প্রজেক্টের public ফোল্ডারে রাখতে হবে
      backgroundImage: '/images/laptop-bg.png', // আপনার ছবির পাথ এখানে দিন
      // ছবির উপরে যে ট্যাগগুলো দেখাচ্ছিল
      imagePills: [
        'ডিজিটাল মার্কেটিং ও SEO',
        'ই-কমার্স ও ড্রপশিপিং',
        'অ্যাফিলিয়েট ও কনটেন্ট মার্কেটিং',
        'ডাটা অ্যানালিটিক্স',
        'বিজনেস স্ট্রাটেজি ও গ্রোথ',
      ],
    },
    sidebarTopics: [
      'LinkedIn Ads', 'Facebook Ads', 'Google Ads', 'SEO', 'Link Building', 'Local SEO',
      'Shopify SEO', 'Parasite SEO', 'Guest Posting', 'Digital PR', 'Content Strategy',
      'Email Marketing', 'Social Media Management', 'Influencer Marketing',
    ],
  },
  {
    id: 'ecommerce',
    name: 'ই-কমার্স ও ড্রপশিপিং',
    content: {
      title: 'ই-কমার্স ও ড্রপশিপিং',
      description: 'সফল ই-কমার্স ব্যবসা তৈরি করুন। ড্রপশিপিং, ইনভেন্টরি ম্যানেজমেন্ট এবং কাস্টমার রিটেনশন শিখুন।',
      backgroundImage: '/images/ecommerce-bg.png', // আপনার ছবির পাথ এখানে দিন
      imagePills: [
        'Shopify',
        'WooCommerce',
        'ড্রপশিপিং',
        'পেমেন্ট গেটওয়ে',
        'ইনভেন্টরি ম্যানেজমেন্ট',
      ],
    },
    sidebarTopics: [
      'Shopify', 'AliExpress', 'Product Sourcing', 'Facebook Ads for E-commerce', 'Email Marketing', 'Conversion Rate Optimization',
    ],
  },
  {
    id: 'content-writing',
    name: 'কনটেন্ট রাইটিং ও অ্যাফিলিয়েট',
    content: {
      title: 'কনটেন্ট রাইটিং ও অ্যাফিলিয়েট',
      description: 'মানসম্মত কনটেন্ট তৈরি এবং অ্যাফিলিয়েট মার্কেটিং এর মাধ্যমে প্যাসিভ ইনকামের পথ তৈরি করুন।',
      backgroundImage: '/images/content-bg.png', // আপনার ছবির পাথ এখানে দিন
      imagePills: [
        'SEO Writing',
        'Copywriting',
        'Amazon Affiliate',
        'ClickBank',
        'Blog Management',
      ],
    },
    sidebarTopics: [
      'Blog Post Writing', 'Copywriting', 'SEO', 'Keyword Research', 'Affiliate Networks', 'Landing Pages',
    ],
  },
  // এখানে নতুন ক্যাটাগরি যোগ করুন...
];

// --- React কম্পোনেন্ট ---

const CourseCategorySection = () => {
  // কোন ট্যাবটি সক্রিয় আছে তা ট্র্যাক করার জন্য 'useState'
  const [activeTab, setActiveTab] = useState('digital-marketing'); // ডিফল্টভাবে প্রথমটি সক্রিয়

  // সক্রিয় ট্যাবের উপর ভিত্তি করে সঠিক ডেটা খুঁজে বের করা
  const activeCategory = categoriesData.find(cat => cat.id === activeTab) || categoriesData[0];

  // আপনার ব্র্যান্ড কালার
  const brandColor = '#f97616';

  return (
    <section className="py-16 px-4 bg-white sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* সেকশনের শিরোনাম */}
        <div className="text-center lg:text-left mb-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            কোন স্কিল ক্যাটাগরিতে যুক্ত হওয়া যাবে?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            অনলাইন এন্টারপ্রেনারশিপ, ডিজিটাল মার্কেটিং ও ক্যারিয়ার-বিল্ড ডেভেলপমেন্ট নিয়ে কোর্স তৈরি করতে পারেন।
          </p>
        </div>

        {/* ট্যাব নেভিগেশন এবং সার্চ বার */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
          {/* ট্যাব বাটন (স্ক্রলযোগ্য) */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
            {categoriesData.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-[#f97616] text-white shadow-md' // আপনার ব্র্যান্ড কালার
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
          
          {/* সার্চ বার */}
          <div className="relative w-full lg:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="কোর্স টপিক খুঁজুন..."
              className="w-full lg:w-64 pl-12 pr-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f97616]"
            />
          </div>
        </div>

        {/* --- ডায়নামিক কনটেন্ট --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* বাম কলাম: প্রধান কনটেন্ট (ছবির উপর) */}
          <div className="lg:col-span-2 relative w-full h-[450px] rounded-lg overflow-hidden p-8 flex flex-col justify-end text-white bg-cover bg-center"
               style={{ 
                 // এখানে ডায়নামিকভাবে ব্যাকগ্রাউন্ড ইমেজ সেট করা হচ্ছে
                 backgroundImage: `url(${activeCategory.content.backgroundImage})` 
               }}
          >
            {/* ওভারলে (যাতে লেখা স্পষ্ট দেখা যায়) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
            <div className="relative z-10">
              {/* ছবির উপরের ট্যাগগুলো */}
              <div className="flex flex-wrap gap-2 mb-4">
                {activeCategory.content.imagePills.map((pill, index) => (
                  <span key={index} className="bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm px-4 py-1.5 rounded-full">
                    {pill}
                  </span>
                ))}
              </div>
              <h3 className="text-3xl font-bold mb-2">{activeCategory.content.title}</h3>
              <p className="text-base text-gray-200">{activeCategory.content.description}</p>
            </div>
          </div>

          {/* ডান কলাম: সাইডবার (জনপ্রিয় টপিক) */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">জনপ্রিয় টপিকসমূহ</h3>
           <div className="flex flex-wrap gap-2 mb-6">
  {activeCategory.sidebarTopics.map((topic, index) => (
    <span
      key={index}
      className="bg-gray-100 text-[#f97616] text-sm px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-300 hover:bg-[#f97616] hover:text-white"
    >
      {topic}
    </span>
  ))}
</div>
            <a
              href="#"
              style={{ color: brandColor }}
              className="font-semibold flex items-center group"
            >
              কোর্স আইডিয়া দেখুন
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>

        </div>
        
        {/* সেকশনের নিচের নোট */}
        <p className="text-sm text-gray-500 mt-8 bg-gray-50 p-4 rounded-md">
          * এই ক্যাটাগরিগুলো শুধুমাত্র উদাহরণস্বরূপ। আপনার লক্ষ্য ও অভিজ্ঞতার ভিত্তিতে আপনি চাইলে নতুন বিষয়েও কোর্স প্রস্তাব করতে পারেন। আমরা সবসময় ই-লার্নিং এর সাথে সামঞ্জস্য রেখে (এভারগ্রিন) স্কিল যুক্ত করতে আগ্রহী।
        </p>

      </div>
    </section>
  );
};

export default CourseCategorySection;