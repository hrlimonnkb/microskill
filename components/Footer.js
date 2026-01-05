"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Linkedin, Facebook, Github, Dribbble } from 'lucide-react';

const logoSrc = "/logo.png"; // উদাহরণ: "/weekend-logo.png"

const Footer = () => {
  return (
    <footer className="w-full py-12 bg-slate-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* উপরের অংশ: ৫-কলামের গ্রিড */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 mb-10">
          
          {/* কলাম ১: লোগো ও বিবরণ (২ কলাম স্প্যান করে) */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image 
                src={logoSrc} 
                width={120} 
                height={40} 
                alt="Weekend Logo" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm">
              শীর্ষস্থানীয় শেখার অভিজ্ঞতা যা বিশ্বে আরও প্রতিভা তৈরি করে।
            </p>
          </div>

          {/* কলাম ২: প্রোডাক্ট */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">প্রোডাক্ট</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white">ওভারভিউ</Link></li>
              <li><Link href="#" className="hover:text-white">বৈশিষ্ট্য</Link></li>
              <li><Link href="#" className="hover:text-white">সমাধানসমূহ</Link></li>
              <li><Link href="#" className="hover:text-white">টিউটোরিয়াল</Link></li>
              <li><Link href="#" className="hover:text-white">মূল্য</Link></li>
            </ul>
          </div>

          {/* কলাম ৩: কোম্পানি */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">কোম্পানি</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-white">আমাদের সম্পর্কে</Link></li>
              <li><Link href="#" className="hover:text-white">ক্যারিয়ার</Link></li>
              <li>
                <Link href="#" className="flex items-center gap-2 hover:text-white">
                  প্রেস
                  <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    নতুন
                  </span>
                </Link>
              </li>
              <li><Link href="#" className="hover:text-white">সংবাদ</Link></li>
            </ul>
          </div>

          {/* কলাম ৪: সামাজিক মাধ্যম */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">সোশ্যাল</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white">টুইটার</Link></li>
              <li><Link href="#" className="hover:text-white">লিংকডইন</Link></li>
              <li><Link href="#" className="hover:text-white">গিটহাব</Link></li>
              <li><Link href="#" className="hover:text-white">ড্রিবল</Link></li>
            </ul>
          </div>

          {/* কলাম ৫: আইনগত */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">আইনগত</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="terms-conditions" className="hover:text-white">শর্তাবলী</Link></li>
              <li><Link href="privacy-policy" className="hover:text-white">গোপনীয়তা</Link></li>
              <li><Link href="#" className="hover:text-white">কুকিজ</Link></li>
              <li><Link href="#" className="hover:text-white">যোগাযোগ</Link></li>
            </ul>
          </div>
        </div>

        {/* নিচের অংশ: কপিরাইট ও আইকন */}
        <div className="pt-8 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-center sm:text-left">
            © ২০২৫ মাইক্রো স্কীল। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link href="#" className="hover:text-white"><Twitter size={20} /></Link>
            <Link href="#" className="hover:text-white"><Linkedin size={20} /></Link>
            <Link href="#" className="hover:text-white"><Facebook size={20} /></Link>
            <Link href="#" className="hover:text-white"><Github size={20} /></Link>
            <Link href="#" className="hover:text-white"><Dribbble size={20} /></Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
