import React from 'react';
import { Lightbulb, Briefcase, Award, PiggyBank } from 'lucide-react'; // আইকনগুলোর জন্য lucide-react ব্যবহার করা হয়েছে

const WhyJoinUsSection = () => {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* হেডার সেকশন */}
        <div className="text-center lg:text-left mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            কেন যুক্ত হবেন আমাদের সাথে?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            শুধু আবেদন নয়—আপনার জন্যও রয়েছে মূল্যবান বেনিফিট।
          </p>
        </div>

        {/* কার্ডের গ্রিড */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* কার্ড ১: ক্যারিয়ার তৈরিতে অবদান */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-200 text-green-700 mb-4">
              <Briefcase size={24} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">ক্যারিয়ার তৈরিতে অবদান</h3>
            <p className="text-gray-600 text-sm">
              আপনার নলেজ ও দক্ষতা মাঝেমধ্যে ভালো ভাবে ক্যারিয়ার তৈরিতে সাহায্য করবে
            </p>
          </div>

          {/* কার্ড ২: স্কিল গ্যাপ পূরণে অবদান */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-200 text-blue-700 mb-4">
              <Lightbulb size={24} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">স্কিল গ্যাপ পূরণে অবদান</h3>
            <p className="text-gray-600 text-sm">
              আপনারা এন্ট্রিতে আসা, জ্ঞান শেয়ার করা ও গাইডেন্স প্রদান- দেশে দক্ষ প্রকাশনাদের যে ঘাটতি রয়েছে, তা পূরণে বাস্তবিক ভূমিকা রাখবে।
            </p>
          </div>

          {/* কার্ড ৩: পার্সোনাল ব্রাঞ্চিং */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-200 text-yellow-700 mb-4">
              <Award size={24} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">পার্সোনাল ব্রান্ডিং</h3>
            <p className="text-gray-600 text-sm">
              এক্সপার্ট হিসাবে আপনার সুনাম ও খ্যাতি আরও অজিত হবে। পেশা-বিশেষক বাঘা বাঘা মেধাবী শিক্ষার্থীদের সাথে তৈরি হবে যোগাযোগ ও সম্পর্ক।
            </p>
          </div>

          {/* কার্ড ৪: আর্থিক রিওয়ার্ড */}
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-200 text-teal-700 mb-4">
              <PiggyBank size={24} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">আর্থিক রিওয়ার্ড</h3>
            <p className="text-gray-600 text-sm">
              জবের পাশাপাশি বাড়তি আয়ের একটি সুযোগ। কোর্স, সার্ভিস ক্রস, রেফারেন্স কিংবা শিক্ষার ফি- আপনার নলেজ ও জ্ঞানের জন্য পকেট ন্যায্য সম্মানী।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyJoinUsSection;