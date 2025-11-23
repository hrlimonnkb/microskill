"use client";
import DynamicPageHeader from '@/components/DynamicPageHeader';
import Link from 'next/link';

const PrivacyPolicyPage = () => {

  // ইমেজের সাথে মিল রেখে টাইটেল এবং ব্রেডক্রাম্ব আপডেট করা হয়েছে
  const pageTitle = "গোপনীয়তা নীতি";
  const breadcrumbsList = [
    { name: "হোম", href: "/" },
    { name: "গোপনীয়তা নীতি", href: "/privacy-policy" }
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
                
                {/* Introduction */}
                <div className="mb-8 text-gray-700 leading-relaxed space-y-4">
                    <p>
                        মাইক্রো স্কীল বাংলাদেশে ডিজিটাল মার্কেটিং শেখানোর ক্ষেত্রে অনন্য প্রতিষ্ঠান। এখানে আপনি অনলাইনে রেকর্ডেড বা লাইভ ক্লাস করতে পারবেন। আমরা আপনার গোপনীয়তা রক্ষা করবো বলে প্রতিশ্রুতি দিচ্ছি। আপনার ব্যক্তিগত তথ্য আমাদের কাছে নিরাপদে সংরক্ষিত থাকবে।
                    </p>
                    <p>
                        এই গোপনীয়তা নীতিমালায় আমরা কীভাবে আপনার তথ্য সংগ্রহ করি তা বলা হয়েছে। পাশাপাশি, আপনার তথ্য দেখা, সংশোধন করা বা সীমিত করার অধিকারগুলিও এখানে উল্লেখ করা আছে।
                    </p>
                    <p>
                        আমাদের প্ল্যাটফর্মে সেবা নেওয়ার মাধ্যমে বা সদস্য হয়ে আপনি এই নীতিমালার শর্তগুলো স্বীকার করে নিচ্ছেন।
                    </p>
                </div>

                {/* Section: ব্যক্তিগত তথ্য সংগ্রহ */}
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">ব্যক্তিগত তথ্য সংগ্রহ:</h2>
                    <div className="text-gray-700 leading-relaxed space-y-3">
                        <p>
                            আপনি আমাদেরকে যেসব ব্যক্তিগত তথ্য (যেমন: নাম, ইমেইল, জন্মতারিখ, ফোন নম্বর) দেন, সেগুলো সঠিক কিনা তা নিশ্চিত করা আপনার দায়িত্ব।
                        </p>
                        <p>
                            আমরা আপনার প্রোফাইল ছবি, অ্যাকাউন্ট আইডি, ডিভাইসের অবস্থান, লিঙ্গসহ অন্যান্য তথ্য সংগ্রহ করতে পারি। এছাড়া, আপনি যদি আমাদের সহায়তা টিমের সাথে যোগাযোগ করেন, তাহলে আপনার আইপি অ্যাড্রেস, কোর্স সম্পর্কিত আপডেট বা সমস্যার বিবরণও সংরক্ষণ করা হতে পারে।
                        </p>
                    </div>
                </div>

                {/* Section: তথ্যের নিরাপত্তা */}
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">তথ্যের নিরাপত্তা:</h2>
                    <div className="text-gray-700 leading-relaxed space-y-3">
                        <p>
                            আপনার তথ্য সুরক্ষিত রাখতে আমরা আধুনিক নিরাপত্তা প্রযুক্তি ব্যবহার করি। তবে মনে রাখবেন, ইন্টারনেটে কোনো তথ্য পাঠানো বা সংরক্ষণ করা ১০০% নিরাপদ নয়। আমরা সর্বোচ্চ চেষ্টা করলেও পুরোপুরি নিরাপত্তা নিশ্চিত করা সম্ভব নয়।
                        </p>
                        <p>
                            আপনার তথ্য সুরক্ষিত রাখতে আমরা সর্বোচ্চ চেষ্টা করি। তবে, পাসওয়ার্ড সুরক্ষিত রাখাও আপনার দায়িত্ব। এটি কারো সাথে শেয়ার করবেন না। পাসওয়ার্ড চুরি বা অ্যাকাউন্টে সমস্যা মনে হলে দ্রুত পরিবর্তন করুন এবং আমাদের জানান।
                        </p>
                    </div>
                </div>

                {/* Section: অনলাইন বিজ্ঞাপন */}
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">অনলাইন বিজ্ঞাপন:</h2>
                    <p className="text-gray-700 leading-relaxed">
                        আমরা ফেসবুক, গুগল বা অন্যান্য প্ল্যাটফর্মে আপনার আগ্রহ ও কার্যকলাপের ভিত্তিতে বিজ্ঞাপন দেখাতে পারি। মোবাইল বা কম্পিউটারে এই বিজ্ঞাপন কাস্টমাইজ করতে চাইলে ডিভাইসের সেটিংস থেকে নিয়ন্ত্রণ করতে পারেন (যেমন: iOS, Android, Windows-এ আলাদা অপশন থাকে)। আমরা সুরক্ষিত রাখতে আমরা অ্যাক্সেস প্রদান করি।
                    </p>
                </div>

                {/* Section: আপনার অধিকার */}
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">আপনার অধিকার:</h2>
                    <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>আপনার দেওয়া তথ্য দেখতে বা আপডেট করতে পারবেন।</li>
                        <li>অ্যাকাউন্ট সেটিংস থেকে যেকোনো সময় অ্যাকাউন্ট বন্ধ করতে পারবেন।</li>
                        <li>কোনো প্রশ্ন বা সমস্যা হলে আমাদের সাথে যোগাযোগ করুন।</li>
                    </ul>
                </div>

                {/* Section: নীতিমালা পরিবর্তন */}
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">নীতিমালা পরিবর্তন:</h2>
                    <p className="text-gray-700 leading-relaxed">
                        প্রয়োজন হলে আমরা এই গোপনীয়তা নীতিমালা পরিবর্তন করতে পারি। কোনো পরিবর্তন করলে তা এই পৃষ্ঠায় আপডেট করা হবে। সর্বশেষ সংশোধনের তারিখ দেখে আপনি বর্তমান নিয়মগুলো জানতে পারবেন।
                    </p>
                </div>

                {/* Footer Note */}
                <div className="mt-10 pt-6 border-t border-gray-100">
                    <p className="text-gray-700 font-medium">
                        আপনার যদি আমাদের গোপনীয়তা নীতিমালা সম্পর্কে কোনও প্রশ্ন থাকে, অনুগ্রহ করে আমাদের সাথে <Link href="/contact" className="text-blue-600 hover:underline">যোগাযোগ করুন</Link>।
                    </p>
                </div>

            </div>
        </div>
      </section>
    
    </main>
  );
};

export default PrivacyPolicyPage;