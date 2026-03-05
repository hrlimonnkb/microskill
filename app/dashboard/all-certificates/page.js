"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { CrossIcon, FileWarning, SearchCheckIcon } from "lucide-react";

// ── SVG Waves (reused from student cert template) ─────────────
const TopLeftWave = () => (
  <svg viewBox="0 0 320 290" style={{ position:"absolute",top:0,left:0,width:320,height:290,pointerEvents:"none" }}>
    <defs>
      <linearGradient id="ag1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ea670c" stopOpacity="0.9"/>
        <stop offset="55%" stopColor="#f09060" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#f5b090" stopOpacity="0.2"/>
      </linearGradient>
      <linearGradient id="ag2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c45508" stopOpacity="0.7"/>
        <stop offset="100%" stopColor="#fde8d8" stopOpacity="0.1"/>
      </linearGradient>
    </defs>
    <path d="M0,0 Q70,50 38,140 Q12,210 90,255 Q130,275 110,290 L0,290 Z" fill="url(#ag1)"/>
    <path d="M0,0 Q45,65 20,150 Q0,215 60,258 Q85,270 75,290 L0,290 Z" fill="url(#ag2)"/>
    <path d="M0,0 Q22,55 8,135 Q-5,195 35,235 L0,240 Z" fill="#ea670c" opacity="0.3"/>
    <path d="M0,0 Q65,50 34,138 Q10,205 82,248 Q120,268 102,290" fill="none" stroke="#f07030" strokeWidth="2.5" opacity="0.65"/>
  </svg>
);
const BottomRightWave = () => (
  <svg viewBox="0 0 320 290" style={{ position:"absolute",bottom:0,right:0,width:320,height:290,transform:"rotate(180deg)",pointerEvents:"none" }}>
    <defs>
      <linearGradient id="ag3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ea670c" stopOpacity="0.9"/>
        <stop offset="55%" stopColor="#f09060" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#f5b090" stopOpacity="0.2"/>
      </linearGradient>
      <linearGradient id="ag4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c45508" stopOpacity="0.7"/>
        <stop offset="100%" stopColor="#fde8d8" stopOpacity="0.1"/>
      </linearGradient>
    </defs>
    <path d="M0,0 Q70,50 38,140 Q12,210 90,255 Q130,275 110,290 L0,290 Z" fill="url(#ag3)"/>
    <path d="M0,0 Q45,65 20,150 Q0,215 60,258 Q85,270 75,290 L0,290 Z" fill="url(#ag4)"/>
    <path d="M0,0 Q22,55 8,135 Q-5,195 35,235 L0,240 Z" fill="#ea670c" opacity="0.3"/>
    <path d="M0,0 Q65,50 34,138 Q10,205 82,248 Q120,268 102,290" fill="none" stroke="#f07030" strokeWidth="2.5" opacity="0.65"/>
  </svg>
);

// ── Medal SVG ─────────────────────────────────────────────────
const Medal = ({ size = 80 }) => (
  <svg width={size} height={size * 1.28} viewBox="0 0 88 113">
    <defs>
      <radialGradient id="amo" cx="38%" cy="32%"><stop offset="0%" stopColor="#ffe066"/><stop offset="50%" stopColor="#d4a017"/><stop offset="100%" stopColor="#7a5000"/></radialGradient>
      <radialGradient id="ami" cx="35%" cy="28%"><stop offset="0%" stopColor="#fff9e6"/><stop offset="35%" stopColor="#f9ca24"/><stop offset="80%" stopColor="#b8860b"/><stop offset="100%" stopColor="#7a5000"/></radialGradient>
    </defs>
    <polygon points="30,0 22,52 38,43 44,60 44,0" fill="#c0392b" opacity="0.92"/>
    <polygon points="58,0 66,52 50,43 44,60 44,0" fill="#e74c3c" opacity="0.92"/>
    <polygon points="30,0 58,0 55,7 33,7" fill="#fff" opacity="0.28"/>
    <circle cx="44" cy="76" r="34" fill="url(#amo)"/>
    <circle cx="44" cy="76" r="28" fill="none" stroke="#7a5000" strokeWidth="1.5" opacity="0.4"/>
    <circle cx="44" cy="76" r="22" fill="url(#ami)"/>
    <circle cx="36" cy="66" r="5" fill="white" opacity="0.38"/>
  </svg>
);

const Sig1 = () => (
  <svg width="120" height="42" viewBox="0 0 120 42">
    <path d="M8,30 C18,10 34,8 46,20 C54,28 58,14 70,10 C83,6 96,18 108,22 C116,25 119,20 120,16" fill="none" stroke="#555" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12,38 C30,34 52,32 72,34 C90,36 108,31 120,28" fill="none" stroke="#555" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
  </svg>
);
const Sig2 = () => (
  <svg width="120" height="42" viewBox="0 0 120 42">
    <path d="M6,28 C14,8 30,7 42,19 C50,28 59,13 72,9 C86,5 99,19 110,23 C118,26 120,21 120,17" fill="none" stroke="#555" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10,38 C26,34 50,31 70,33 C88,35 108,30 120,27" fill="none" stroke="#555" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
  </svg>
);

// ── Full Certificate Template ─────────────────────────────────
const CertificateTemplate = ({ id="cert-tpl", scale=1, studentName, courseTitle, completedAt, awardedAt, director, directorTitle, instructor, instructorTitle, certificateId }) => {
  const W = 1060, H = 750;
  return (
    <div id={id} style={{ width:W,height:H,transform:`scale(${scale})`,transformOrigin:"top left",position:"relative",background:"#fff",overflow:"hidden",fontFamily:"Georgia,'Times New Roman',serif",flexShrink:0 }}>
      <TopLeftWave/><BottomRightWave/>
      <div style={{ position:"absolute",top:28,left:28,right:28,bottom:28,border:"1.5px solid rgba(0,137,123,0.16)",pointerEvents:"none" }}/>
      <div style={{ position:"absolute",top:60,left:95,right:95,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <Medal size={80}/>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:58,fontWeight:900,color:"#ea670c",letterSpacing:5,lineHeight:1,textTransform:"uppercase" }}>CERTIFICATE</div>
          <div style={{ fontSize:16,letterSpacing:9,color:"#666",marginTop:5,textTransform:"uppercase" }}>OF COMPLETION</div>
        </div>
        <div style={{ width:76,height:76,borderRadius:"50%",border:"3px solid #ea670c",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#fff0e6,#fff8f4)",overflow:"hidden" }}>
          <img src="/microskill.png" alt="Logo" style={{ width:60,height:60,objectFit:"contain" }}/>
        </div>
      </div>
      <div style={{ position:"absolute",top:206,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:14 }}>
        <div style={{ width:210,height:1.5,background:"linear-gradient(to right,transparent,#ea670c)" }}/><div style={{ width:8,height:8,borderRadius:"50%",background:"#ea670c" }}/><div style={{ width:210,height:1.5,background:"linear-gradient(to left,transparent,#ea670c)" }}/>
      </div>
      <div style={{ position:"absolute",top:230,left:0,right:0,textAlign:"center",fontSize:16,color:"#888",fontStyle:"italic" }}>This is to certify that</div>
      <div style={{ position:"absolute",top:258,left:60,right:60,textAlign:"center",fontSize:58,fontStyle:"italic",fontWeight:"bold",color:"#ea670c",lineHeight:1.05 }}>{studentName}</div>
      <div style={{ position:"absolute",top:340,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:10 }}>
        <div style={{ width:240,height:1.5,background:"#ea670c",opacity:0.45 }}/><div style={{ width:9,height:9,borderRadius:"50%",background:"#ea670c",opacity:0.7 }}/><div style={{ width:240,height:1.5,background:"#ea670c",opacity:0.45 }}/>
      </div>
      <div style={{ position:"absolute",top:366,left:110,right:110,textAlign:"center",fontSize:15,color:"#555",lineHeight:1.8 }}>
        has successfully completed the course <span style={{ fontWeight:"bold",color:"#c45508" }}>{courseTitle}</span> conducted on {completedAt}.<br/>
        Their dedication and commitment to the learning process are truly commendable.
      </div>
      <div style={{ position:"absolute",top:470,left:0,right:0,textAlign:"center",fontSize:16,fontWeight:"bold",color:"#333" }}>Awarded on {awardedAt}</div>
      <div style={{ position:"absolute",bottom:72,left:110,right:110,display:"flex",justifyContent:"space-between",alignItems:"flex-end" }}>
        <div style={{ textAlign:"center" }}><Sig1/><div style={{ width:175,height:1.5,background:"#444",marginTop:2 }}/><div style={{ fontSize:14,fontWeight:"bold",color:"#222",marginTop:6 }}>{director}</div><div style={{ fontSize:11,color:"#888",marginTop:2 }}>{directorTitle}</div></div>
        <div style={{ textAlign:"center",marginBottom:16 }}>
          <div style={{ width:60,height:60,borderRadius:"50%",border:"2.5px solid #ea670c",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#fff0e6,#fff)",margin:"0 auto 6px" }}><span style={{ fontSize:22,color:"#ea670c" }}>✓</span></div>
          <div style={{ fontSize:8,color:"#aaa",letterSpacing:1.2,fontFamily:"monospace" }}>{certificateId}</div>
        </div>
        <div style={{ textAlign:"center" }}><Sig2/><div style={{ width:175,height:1.5,background:"#444",marginTop:2 }}/><div style={{ fontSize:14,fontWeight:"bold",color:"#222",marginTop:6 }}>{instructor}</div><div style={{ fontSize:11,color:"#888",marginTop:2 }}>{instructorTitle}</div></div>
      </div>
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.microskill.com.bd";
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" });
}
function fmtDateLong(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
}
function mapToTemplate(c) {
  return {
    studentName:    c.studentName,
    courseTitle:    c.courseTitle,
    completedAt:    fmtDateLong(c.completedAt),
    awardedAt:      fmtDateLong(c.completedAt),
    director:       c.instructorName,
    directorTitle:  "Course Director",
    instructor:     c.instructorName,
    instructorTitle:"Program Instructor",
    certificateId:  c.certificateId,
  };
}

// ── Skeleton row ───────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[40,140,160,140,130,110].map((w,i) => (
      <td key={i} style={{ padding:"14px 16px",borderBottom:"1px solid #f0f0f0" }}>
        <div style={{ height:13,width:w,background:"linear-gradient(90deg,#f0f0f0 25%,#fafafa 50%,#f0f0f0 75%)",backgroundSize:"400% 100%",borderRadius:6,animation:"shimmer 1.4s infinite" }}/>
      </td>
    ))}
  </tr>
);

// ══════════════════════════════════════════════════════════════
// MAIN ADMIN PAGE
// ══════════════════════════════════════════════════════════════
export default function AdminCertificatesPage() {
  const { user }   = useAuth();
  const router     = useRouter();

  const [certs,       setCerts]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [categories,  setCategories]  = useState([]);

  // Filters
  const [search,      setSearch]      = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category,    setCategory]    = useState("");

  // Pagination
  const [page,        setPage]        = useState(1);
  const [pagination,  setPagination]  = useState({ total:0, totalPages:1, limit:20 });

  // Modal / Download
  const [selected,    setSelected]    = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [viewAs,      setViewAs]      = useState('ADMIN');

  // Search debounce
  const debounceRef = useRef(null);

  // ── Guard: admin or teacher only ─────────────────────────────
  useEffect(() => {
    const role = user?.role?.toUpperCase();
    if (user && role !== 'ADMIN' && role !== 'TEACHER') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // ── Fetch ────────────────────────────────────────────────────
  const fetchCerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("লগইন করুন");

      const params = new URLSearchParams({ page, limit: pagination.limit });
      if (search)   params.set("search",   search);
      if (category) params.set("category", category);

      const res = await fetch(`${API_BASE_URL}/api/certificates/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) throw new Error("Access denied.");
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      setCerts(data.certificates || []);
      setPagination(data.pagination || { total:0, totalPages:1, limit:20 });
      if (data.categories?.length) setCategories(data.categories);
      if (data.viewAs) setViewAs(data.viewAs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, pagination.limit]);

  useEffect(() => { fetchCerts(); }, [fetchCerts]);

  // ── Search debounce ──────────────────────────────────────────
  const handleSearchChange = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(val); setPage(1); }, 400);
  };

  // ── Download ─────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!selected) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { default: jsPDF } = await import("jspdf");
      const el = document.getElementById("admin-cert-full");
      const canvas = await html2canvas(el, { scale:2.5, useCORS:true, backgroundColor:"#ffffff", logging:false });
      const img = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({ orientation:"landscape", unit:"mm", format:"a4" });
      pdf.addImage(img, "JPEG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
      pdf.save(`Certificate-${selected.certificateId}.pdf`);
    } catch (e) {
      alert("ডাউনলোড সমস্যা হয়েছে।");
    } finally {
      setDownloading(false);
    }
  };

  // ── Pagination helpers ───────────────────────────────────────
  const totalPages  = pagination.totalPages || 1;
  const pageNumbers = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  // ── Stats ────────────────────────────────────────────────────
  const totalCerts = pagination.total;

  const userRole = user?.role?.toUpperCase();
  if (user && userRole !== 'ADMIN' && userRole !== 'TEACHER') return null;
  const isAdmin = userRole === 'ADMIN';

  return (
    <div style={{ minHeight:"100vh", background:"#f4f6f8", fontFamily:"'Segoe UI',Arial,sans-serif" }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .adm-tr:hover td { background: #f0faf9 !important; }
        .adm-btn { transition: all 0.18s; }
        .adm-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .pg-btn { border: 1.5px solid #d1d5db; background: #fff; cursor: pointer; padding: 7px 13px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #374151; transition: all 0.15s; }
        .pg-btn:hover:not(:disabled) { background: #ea670c; color: #fff; border-color: #ea670c; }
        .pg-btn.active { background: #ea670c; color: #fff; border-color: #ea670c; }
        .pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background:"linear-gradient(135deg,#c45508 0%,#ea670c 55%,#f08040 100%)", padding:"36px 32px 28px", color:"#fff" }}>
        <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:4, opacity:0.7, textTransform:"uppercase", marginBottom:6 }}>
              {isAdmin ? "Admin Panel" : "Teacher Panel"}
            </div>
            <h1 style={{ fontSize:30, fontWeight:800, margin:0, letterSpacing:0.5 }}> সার্টিফিকেট</h1>
            <p style={{ opacity:0.75, marginTop:6, fontSize:13 }}>
              {isAdmin
                ? "সমস্ত শিক্ষার্থীর অর্জিত সার্টিফিকেট পরিচালনা করুন"
                : "আপনার কোর্সে সম্পন্নকারী শিক্ষার্থীদের সার্টিফিকেট"}
            </p>
          </div>
          {/* Stats chips */}
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {[
              { label:"মোট সার্টিফিকেট", value: loading ? "…" : totalCerts, },
              { label:"ক্যাটাগরি", value: loading ? "…" : categories.length, },
            ].map((s,i) => (
              <div key={i} style={{ background:"rgba(255,255,255,0.15)", borderRadius:14, padding:"12px 20px", backdropFilter:"blur(8px)", textAlign:"center", minWidth:110 }}>
                <div style={{ fontSize:22, fontWeight:800 }}>{s.icon} {s.value}</div>
                <div style={{ fontSize:11, opacity:0.8, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:"0 auto", padding:"28px 24px" }}>

        {/* ── Search & Filter Bar ── */}
        <div style={{ background:"#fff", borderRadius:16, padding:"18px 22px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1.5px solid #fef3eb", marginBottom:22, display:"flex", gap:14, flexWrap:"wrap", alignItems:"center" }}>

          {/* Search input */}
          <div style={{ position:"relative", flex:"1 1 280px", minWidth:220 }}>
            <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:16, color:"#6b7280" }}>🔍</span>
            <input
              type="text"
              placeholder="স্টুডেন্ট নাম, ইমেইল বা কোর্স নাম খুঁজুন..."
              value={searchInput}
              onChange={e => handleSearchChange(e.target.value)}
              style={{ width:"100%", padding:"11px 14px 11px 38px", border:"1.5px solid #d1d5db", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box", background:"#fff", fontFamily:"inherit", color:"#111827" }}
              onFocus={e => e.target.style.borderColor="#ea670c"}
              onBlur={e  => e.target.style.borderColor="#d1d5db"}
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
                style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#6b7280" }}>✕</button>
            )}
          </div>

          {/* Category filter */}
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1); }}
            style={{ padding:"11px 14px", border:"1.5px solid #d1d5db", borderRadius:10, fontSize:14, outline:"none", background:"#fff", cursor:"pointer", minWidth:170, fontFamily:"inherit", color:"#111827" }}
          >
            <option value=""> সব ক্যাটাগরি</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Per page */}
          <select
            value={pagination.limit}
            onChange={e => { setPagination(p => ({ ...p, limit: parseInt(e.target.value) })); setPage(1); }}
            style={{ padding:"11px 14px", border:"1.5px solid #d1d5db", borderRadius:10, fontSize:14, outline:"none", background:"#fff", cursor:"pointer", minWidth:130, fontFamily:"inherit", color:"#111827" }}
          >
            {[10,20,50,100].map(n => <option key={n} value={n}>প্রতি পাতা: {n}</option>)}
          </select>

          {/* Reset */}
          {(search || category) && (
            <button
              onClick={() => { setSearch(""); setSearchInput(""); setCategory(""); setPage(1); }}
              style={{ padding:"11px 18px", background:"#fff0f0", border:"1.5px solid #fca5a5", borderRadius:10, color:"#dc2626", fontSize:13, fontWeight:700, cursor:"pointer" }}
            >
               রিসেট
            </button>
          )}

          {/* Result count */}
          <div style={{ marginLeft:"auto", fontSize:14, color:"#111827", fontWeight:700, whiteSpace:"nowrap" }}>
            মোট: <span style={{ color:"#ea670c", fontWeight:800 }}>{loading ? "…" : totalCerts}</span> টি
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ background:"#fff5f5", border:"1.5px solid #fca5a5", borderRadius:14, padding:"20px 24px", marginBottom:20, textAlign:"center", color:"#dc2626" }}>
           {error}
            <button onClick={fetchCerts} style={{ marginLeft:16, padding:"7px 18px", background:"#ea670c", color:"#fff", border:"none", borderRadius:8, fontSize:13, cursor:"pointer", fontWeight:700 }}>
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        )}

        {/* ── Table ── */}
        <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 2px 16px rgba(0,0,0,0.06)", border:"1.5px solid #fef3eb", overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
              <thead>
                <tr style={{ background:"linear-gradient(135deg,#fff0e6,#fff7f2)" }}>
                  {["#","স্টুডেন্ট নাম","কোর্স টাইটেল","শিক্ষকের নাম","সার্টিফিকেট আইডি","সম্পন্নের তারিখ","একশন"].map((h,i) => (
                    <th key={i} style={{ padding:"14px 16px", textAlign:"left", color:"#c45508", fontWeight:800, fontSize:12, letterSpacing:0.5, textTransform:"uppercase", whiteSpace:"nowrap", borderBottom:"2px solid #fdd5b5" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(8).fill(0).map((_,i) => <SkeletonRow key={i}/>)
                ) : certs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding:"60px 20px", textAlign:"center", color:"#9ca3af" }}>
                      <div style={{ fontSize:40, marginBottom:12 }}><SearchCheckIcon /></div>
                      <div style={{ fontSize:16, fontWeight:600, color:"#6b7280" }}>কোনো সার্টিফিকেট পাওয়া যায়নি</div>
                      <div style={{ fontSize:13, marginTop:6 }}>ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</div>
                    </td>
                  </tr>
                ) : (
                  certs.map((c, idx) => (
                    <tr key={c.certificateId} className="adm-tr">
                      <td style={{ padding:"13px 16px", borderBottom:"1px solid #f3f4f6", color:"#9ca3af", fontWeight:600, fontSize:13 }}>
                        {(page - 1) * pagination.limit + idx + 1}
                      </td>
                      <td style={{ padding:"13px 16px", borderBottom:"1px solid #f3f4f6" }}>
                        <div style={{ fontWeight:700, color:"#111827" }}>{c.studentName}</div>
                        <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>{c.studentEmail}</div>
                      </td>
                      <td style={{ padding:"13px 16px", borderBottom:"1px solid #f3f4f6", maxWidth:220 }}>
                        <div style={{ fontWeight:600, color:"#1f2937", lineHeight:1.4 }}>{c.courseTitle}</div>
                        {c.courseCategory && (
                          <span style={{ display:"inline-block", marginTop:4, background:"#fff0e6", color:"#c45508", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, letterSpacing:0.5 }}>
                            {c.courseCategory}
                          </span>
                        )}
                      </td>
                      <td style={{ padding:"13px 16px", borderBottom:"1px solid #f3f4f6", color:"#374151", fontWeight:500 }}>
                        {c.instructorName}
                      </td>
                      <td style={{ padding:"13px 16px", borderBottom:"1px solid #f3f4f6" }}>
                        <span style={{ fontFamily:"monospace", fontSize:11, background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:6, padding:"3px 8px", color:"#374151", letterSpacing:0.5, whiteSpace:"nowrap" }}>
                          {c.certificateId}
                        </span>
                      </td>
                      <td style={{ padding:"13px 16px", borderBottom:"1px solid #f3f4f6", color:"#6b7280", fontSize:13, whiteSpace:"nowrap" }}>
                        {fmtDate(c.completedAt)}
                      </td>
                      <td style={{ padding:"13px 16px", borderBottom:"1px solid #f3f4f6" }}>
                        <div style={{ display:"flex", gap:8 }}>
                          {/* View */}
                          <button
                            className="adm-btn"
                            onClick={() => setSelected(c)}
                            style={{ padding:"7px 14px", background:"linear-gradient(135deg,#ea670c,#f08040)", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}
                          >
                            দেখুন
                          </button>
                          {/* Direct download */}
                          <button
                            className="adm-btn"
                            onClick={async () => {
                              setSelected(c);
                              // wait for hidden cert to render
                              setTimeout(async () => {
                                try {
                                  const html2canvas = (await import("html2canvas")).default;
                                  const { default: jsPDF } = await import("jspdf");
                                  const el = document.getElementById("admin-cert-full");
                                  if (!el) return;
                                  const canvas = await html2canvas(el, { scale:2.5, useCORS:true, backgroundColor:"#ffffff", logging:false });
                                  const img = canvas.toDataURL("image/jpeg", 0.98);
                                  const pdf = new jsPDF({ orientation:"landscape", unit:"mm", format:"a4" });
                                  pdf.addImage(img, "JPEG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
                                  pdf.save(`Certificate-${c.certificateId}.pdf`);
                                  setSelected(null);
                                } catch(e) { alert("ডাউনলোড সমস্যা।"); setSelected(null); }
                              }, 400);
                            }}
                            style={{ padding:"7px 14px", background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}
                          >
                            ⬇ ডাউনলোড
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 22px", borderTop:"1px solid #f0f0f0", flexWrap:"wrap", gap:12 }}>
              <div style={{ fontSize:13, color:"#6b7280" }}>
                পাতা <strong>{page}</strong> / <strong>{totalPages}</strong> &nbsp;·&nbsp; মোট <strong>{totalCerts}</strong> টি সার্টিফিকেট
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                <button className="pg-btn" onClick={() => setPage(1)}         disabled={page===1}>«</button>
                <button className="pg-btn" onClick={() => setPage(p=>p-1)}   disabled={page===1}>‹</button>
                {pageNumbers.map(n => (
                  <button key={n} className={`pg-btn${page===n?" active":""}`} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button className="pg-btn" onClick={() => setPage(p=>p+1)}   disabled={page===totalPages}>›</button>
                <button className="pg-btn" onClick={() => setPage(totalPages)} disabled={page===totalPages}>»</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── View Modal ── */}
      {selected && (
        <div
          style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20 }}
          onClick={() => setSelected(null)}
        >
          {/* Hidden full-res for download */}
          <div style={{ position:"fixed", left:-9999, top:-9999, pointerEvents:"none" }}>
            <CertificateTemplate {...mapToTemplate(selected)} id="admin-cert-full" scale={1}/>
          </div>

          <div onClick={e => e.stopPropagation()} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:20 }}>
            {/* Visible preview */}
            <div style={{ width:1060*0.62, height:750*0.62, overflow:"hidden", borderRadius:10, boxShadow:"0 30px 80px rgba(0,0,0,0.7)", border:"1px solid rgba(0,137,123,0.35)" }}>
              <CertificateTemplate {...mapToTemplate(selected)} id="admin-cert-modal" scale={0.62}/>
            </div>

            {/* Info row */}
            <div style={{ display:"flex", gap:16, alignItems:"center", flexWrap:"wrap", justifyContent:"center" }}>
              <span style={{ background:"rgba(255,255,255,0.15)",padding:"6px 14px",borderRadius:20,color:"#fff",fontSize:12,fontFamily:"monospace" }}>
                 {selected.certificateId}
              </span>
              <span style={{ background:"rgba(255,255,255,0.12)",padding:"6px 14px",borderRadius:20,color:"#fff",fontSize:12 }}>
                 {selected.studentName}
              </span>
            </div>

            <div style={{ display:"flex", gap:12 }}>
              <button
                onClick={handleDownload}
                disabled={downloading}
                style={{ padding:"12px 28px",background:"linear-gradient(135deg,#ea670c,#f08040)",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:downloading?"not-allowed":"pointer",opacity:downloading?0.7:1 }}
              >
                {downloading ? " ডাউনলোড হচ্ছে..." : "⬇ PDF ডাউনলোড"}
              </button>
              <button
                onClick={() => setSelected(null)}
                style={{ padding:"12px 22px",background:"transparent",color:"#fff",border:"1.5px solid rgba(255,255,255,0.35)",borderRadius:10,fontSize:14,cursor:"pointer" }}
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}