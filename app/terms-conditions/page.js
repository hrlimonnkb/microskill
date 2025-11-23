"use client";
import DynamicPageHeader from '@/components/DynamicPageHeader';

const TermsConditionsPage = () => {

  const pageTitle = "ব্যবহারকারীর শর্তাবলি";
  const breadcrumbsList = [
    { name: "হোম", href: "/" },
    { name: "শর্তাবলি", href: "/terms-conditions" }
  ];

  return (
    <main>
      
      <DynamicPageHeader 
        title={pageTitle} 
        breadcrumbs={breadcrumbsList} 
      />

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-sm">
                
                {/* Intro */}
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">ব্যবহারের শর্তাবলী মেনে নিন</h2>
                    <p className="text-gray-700 leading-relaxed">
                        আমাদের ওয়েবসাইট ব্যবহার, রেজিস্ট্রেশন বা যেকোনো সেবা নেওয়ার মানে হলো—আপনি এই শর্তগুলো পড়ে বুঝে সম্মতি দিচ্ছেন। শর্তের কোনো অংশে আপত্তি থাকলে সেবা ব্যবহার বন্ধ করুন।
                    </p>
                </div>

                {/* Section: আমাদের সেবা */}
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">আমাদের সেবা:</h2>
                    <p className="text-gray-700 leading-relaxed">
                        আমরা স্কিল ডেভেলপমেন্ট কোর্স, গাইডেন্স ও প্রফেশনাল ট্রেনিং দিই। সেবার মান ভালো রাখার চেষ্টা করি, কিন্তু প্রত্যেকের ফলাফল তার নিজের চেষ্টা ও পরিস্থিতির ওপর নির্ভর করে।
                    </p>
                </div>

                {/* Section: ব্যবহারকারীর দায়িত্ব */}
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">ব্যবহারকারীর দায়িত্ব:</h2>
                    <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li><strong>সঠিক তথ্য দিন:</strong> আমাদের প্রোফাইল ছবি, অ্যাকাউন্ট আইডি, ডিভাইসের আপডেট রাখুন।</li>
                        <li><strong>সক্রিয় থাকুন:</strong> ক্লাস, অ্যাসাইনমেন্ট বা পরামর্শে নিয়মিত অংশ নিন।</li>
                        <li><strong>সেবার সঠিক ব্যবহার:</strong> অবৈধ কাজ, অন্যদের ক্ষতি বা কপিরাইট লঙ্ঘন থেকে বিরত থাকুন।</li>
                    </ul>
                </div>

                {/* Section: গোপনীয়তা */}
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">গোপনীয়তা:</h2>
                    <p className="text-gray-700 leading-relaxed">
                        আপনার তথ্য গোপন রাখতে আমরা গোপনীয়তা নীতিমালা মেনে চলি। নিরাপত্তার জন্য আধুনিক প্রযুক্তি ব্যবহার করি, তবে ইন্টারনেটে ১০০% নিরাপত্তার গ্যারান্টি দেওয়া সম্ভব নয়। আইনি কারণ ছাড়া কাউকে আপনার তথ্য দেয়া হবে না।
                    </p>
                </div>

                {/* Section: রিফান্ড ও বাতিল */}
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">রিফান্ড ও বাতিল:</h2>
                    <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li><strong>কোর্স রিফান্ড:</strong> কোর্স কেনার ৭ দিনের মধ্যে রিফান্ড চাইতে পারবেন (শুধুমাত্র এককালীন ক্রয়ে)।</li>
                        <li><strong>সাবস্ক্রিপশন বাতিল:</strong> যেকোনো সময় সাবস্ক্রিপশন বাতিল করতে পারবেন, তবে টাকা ফেরত পাবেন না।</li>
                    </ul>
                </div>

                {/* Section: দায়বদ্ধতার সীমা */}
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">দায়বদ্ধতার সীমা:</h2>
                    <p className="text-gray-700 leading-relaxed">
                        আমাদের সেবা ব্যবহারে কোনো ক্ষতি হলে আমরা দায়িত্ব নেব না। সর্বোচ্চ দায়বদ্ধতা আপনার দেওয়া ফি এর পরিমাণের সমান।
                    </p>
                </div>

                {/* Section: কন্টেন্টের মালিকানা */}
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">কন্টেন্টের মালিকানা:</h2>
                    <p className="text-gray-700 leading-relaxed">
                        কোর্সের ভিডিও, নোট, ডিজাইন—সবই আমাদের মালিকানাধীন। অনুমতি ছাড়া কপি, শেয়ার বা বিক্রি করা যাবে না। এতে কপিরাইট আইনে ব্যবস্থা নেওয়া হতে পারে।
                    </p>
                </div>

                {/* Section: ওয়েবসাইট ব্যবহারের নিয়ম */}
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">ওয়েবসাইট ব্যবহারের নিয়ম:</h2>
                    <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>আইন মেনে চলুন।</li>
                        <li>ওয়েবসাইটের ক্ষতি বা নিরাপত্তা ভাঙার চেষ্টা করবেন না (যেমন: হ্যাকিং, ভাইরাস ছড়ানো)।</li>
                        <li>কোনো সমস্যা দেখলে আমাদের জানান।</li>
                    </ul>
                </div>

                {/* Section: অন্য সাইটের লিঙ্ক */}
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">অন্য সাইটের লিঙ্ক:</h2>
                    <p className="text-gray-700 leading-relaxed">
                        আমাদের সাইটে তৃতীয় পক্ষের লিঙ্ক থাকতে পারে। তাদের কনটেন্ট বা গোপনীয়তা নীতির জন্য আমরা দায়ী নই। তাদের সাইট ব্যবহার এর শর্ত পড়ে নিন।
                    </p>
                </div>

                {/* Section: শর্তাবলী পরিবর্তন */}
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">শর্তাবলী পরিবর্তন:</h2>
                    <p className="text-gray-700 leading-relaxed">
                        প্রয়োজনে আমরা শর্ত বদলাতে পারি। পরিবর্তনগুলো ওয়েবসাইটে আপডেট করা হবে। ব্যবহার চালিয়ে গেলে নতুন শর্ত মেনে নিচ্ছেন বলে ধরা হবে।
                    </p>
                </div>

                {/* Section: সেবা বন্ধ করা */}
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">সেবা বন্ধ করা:</h2>
                    <p className="text-gray-700 leading-relaxed">
                        নিয়ম ভাঙা, অপব্যবহার বা অন্য কোনো কারণেই আমরা আপনার অ্যাকাউন্ট বন্ধ করে দিতে পারি। আগে জানানো বাধ্যতামূলক নয়।
                    </p>
                </div>

            </div>
        </div>
      </section>
      
    </main>
  );
};

export default TermsConditionsPage;