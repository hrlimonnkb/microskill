import React from 'react';
import { User, Book, Users, Clock, Lightbulb, Presentation } from 'lucide-react'; // আইকনগুলোর জন্য lucide-react ব্যবহার করা হয়েছে

const HowToJoinSection = () => {
  const brandColor = "#f97616"; // আপনার ব্র্যান্ড কালার

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* সেকশন ১: কীভাবে যুক্ত হবেন? */}
        <div className="text-center lg:text-left mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            কীভাবে যুক্ত হবেন?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            আপনার আগ্রহ জানানোর নিচে ধাপগুলো অনুসরণ করুন।
          </p>
        </div>

        {/* ধাপগুলোর গ্রিড */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* ধাপ ১: যোগাযোগ */}
          <div className="bg-orange-50 rounded-lg p-6 shadow-sm border border-orange-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-[#f97616] mb-4">
              <User size={24} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">যোগাযোগ</h3>
            <p className="text-gray-600 text-sm">
              নিচের বাটন খুঁজে দেখুন। আপনি আগ্রহী একজন বা থাকবেন না শুধুমাত্র তথ্য দিতে সম্মত সমর্থকরা আমাদের সাথে যোগাযোগ করবেন।
            </p>
          </div>

          {/* ধাপ ২: বিস্তারিত জানান */}
          <div className="bg-orange-50 rounded-lg p-6 shadow-sm border border-orange-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-[#f97616] mb-4">
              <Book size={24} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">বিস্তারিত জানান</h3>
            <p className="text-gray-600 text-sm">
              কোর্স, সার্ভিস কোর্স, ওয়ার্কশপ, ক্যারিয়ার ডেভেলপিং—সব অনুযায়ী নিজেই আলোচনা করুন এবং আমরা একটি একটি করে বিশ্লেষণ করে দেবো।
            </p>
          </div>

          {/* ধাপ ৩: কোলাবোরেশন */}
          <div className="bg-orange-50 rounded-lg p-6 shadow-sm border border-orange-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-[#f97616] mb-4">
              <Users size={24} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">কোলাবোরেশন</h3>
            <p className="text-gray-600 text-sm">
              আপনি যেভাবে আমাদের সাথে কাজ করতে চান, সেই অনুযায়ী যদি মানসম্মত লেভেল হয়, তাহলে একা একা কাজ করার জন্য প্রয়োজনীয় কমিউনিকেশনস এর সাথে কাজ করতে পারবেন। আমরা টিম টিমের আপনার সাথে কোলাবোরেশন করবো এবং এটা এগিয়ে নিয়ে আসবে।
            </p>
          </div>
        </div>

        {/* মাঝখানের বাটন */}
        <div className="text-center mb-16">
          <button
            style={{ backgroundColor: brandColor }}
            className="px-8 py-3 text-white font-semibold rounded-lg shadow-md transition-all duration-300 hover:opacity-90"
          >
            প্রস্তাব পাঠান
          </button>
        </div>

        {/* সেকশন ২: কেমন কোর্স চাই? */}
        <div className="text-center lg:text-left mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            কেমন কোর্স চাই?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            আমরা সংক্ষিপ্ত, ফোকাসড এবং এ্যাকশনযোগ্য মডিউল, টিপস ও শর্ট কোর্স তৈরি, যা শিক্ষার্থীদের নির্দিষ্ট দক্ষতা বা সমস্যার সমাধান শেখাবে।
          </p>
        </div>

        {/* কোর্সের প্রকারভেদের গ্রিড */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* কোর্স ১: কোর্স */}
          <div className="bg-orange-50 rounded-lg p-6 shadow-sm border border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-[#f97616]">
                <Clock size={20} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">কোর্স</h3>
                <p className="text-gray-500 text-sm">সময়সীমা: ১০ মিনিটের কম</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              আপনার লেখা গুলো অনুযায়ী আমাদের কোর্স, বাজার উন্নয়নের সাথে সামঞ্জস্যপূর্ণ। যেগুলোকে আমরা, যেগুলো আমরা তৈরি করে দেবো নিচের পর্যায়ে। সময় পাওয়ার জন্য, কারিকুলাম ও নির্দেশনামা সহ একেকটি ব্রাঞ্চ হবে।
            </p>
          </div>

          {/* কোর্স ২: লাইভ কোর্স */}
          <div className="bg-orange-50 rounded-lg p-6 shadow-sm border border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-[#f97616]">
                <Lightbulb size={20} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">লাইভ কোর্স</h3>
                <p className="text-gray-500 text-sm">সময়সীমা: ৩০-৬০ মিনিট</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              সরাসরি দর্শকদের সাথে ইন্টারঅ্যাক্ট করুন, প্রশ্ন উত্তর, ইনপুট নিয়ে। নির্দিষ্ট সময় কোর্সে পাচ্ছেন, অ্যাপ্লিকেশন ট্রিক আর দেখার শেখা—যা আপনাকে স্কিল বাড়াতে সাহায্য করবে এবং পারফরম্যান্স ও এপ্রুভ করতে।
            </p>
          </div>

          {/* কোর্স ৩: ওয়ার্কশপ */}
          <div className="bg-orange-50 rounded-lg p-6 shadow-sm border border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-[#f97616]">
                <Presentation size={20} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">ওয়ার্কশপ</h3>
                <p className="text-gray-500 text-sm">সময়সীমা: ১ ঘন্টার কাছাকাছি</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              নলেজের মাধ্যমে বাজার টিপসের জন্য হাতে-কলমে ওয়ার্কশপ, অভিজ্ঞ মেন্টরদের সাথে সরাসরি পরিচিত, নিজেরা টিপসের ওপর ওয়ার্কশপ করবে—সব ওয়ার্কশপে, এক জায়গায়, একটিই দেখা—আপনাকে সবার সম্পর্কে শেখাবে।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToJoinSection;