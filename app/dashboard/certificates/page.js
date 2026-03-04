"use client";

import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.microskill.com.bd";

// ─── SVG Wave Decorations ─────────────────────────────────────
const TopLeftWave = () => (
  <svg viewBox="0 0 320 290" style={{ position:"absolute",top:0,left:0,width:320,height:290,pointerEvents:"none" }}>
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ea670c" stopOpacity="0.9"/>
        <stop offset="55%" stopColor="#f09060" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#f5b090" stopOpacity="0.2"/>
      </linearGradient>
      <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c45508" stopOpacity="0.7"/>
        <stop offset="100%" stopColor="#fde8d8" stopOpacity="0.1"/>
      </linearGradient>
    </defs>
    <path d="M0,0 Q70,50 38,140 Q12,210 90,255 Q130,275 110,290 L0,290 Z" fill="url(#g1)"/>
    <path d="M0,0 Q45,65 20,150 Q0,215 60,258 Q85,270 75,290 L0,290 Z" fill="url(#g2)"/>
    <path d="M0,0 Q22,55 8,135 Q-5,195 35,235 L0,240 Z" fill="#ea670c" opacity="0.3"/>
    <path d="M0,0 Q65,50 34,138 Q10,205 82,248 Q120,268 102,290" fill="none" stroke="#f07030" strokeWidth="2.5" opacity="0.65"/>
    <path d="M0,0 Q40,35 22,100 Q8,155 58,195 Q80,212 72,235" fill="none" stroke="#f5b090" strokeWidth="1.5" opacity="0.45"/>
  </svg>
);

const BottomRightWave = () => (
  <svg viewBox="0 0 320 290" style={{ position:"absolute",bottom:0,right:0,width:320,height:290,transform:"rotate(180deg)",pointerEvents:"none" }}>
    <defs>
      <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ea670c" stopOpacity="0.9"/>
        <stop offset="55%" stopColor="#f09060" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#f5b090" stopOpacity="0.2"/>
      </linearGradient>
      <linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c45508" stopOpacity="0.7"/>
        <stop offset="100%" stopColor="#fde8d8" stopOpacity="0.1"/>
      </linearGradient>
    </defs>
    <path d="M0,0 Q70,50 38,140 Q12,210 90,255 Q130,275 110,290 L0,290 Z" fill="url(#g3)"/>
    <path d="M0,0 Q45,65 20,150 Q0,215 60,258 Q85,270 75,290 L0,290 Z" fill="url(#g4)"/>
    <path d="M0,0 Q22,55 8,135 Q-5,195 35,235 L0,240 Z" fill="#ea670c" opacity="0.3"/>
    <path d="M0,0 Q65,50 34,138 Q10,205 82,248 Q120,268 102,290" fill="none" stroke="#f07030" strokeWidth="2.5" opacity="0.65"/>
    <path d="M0,0 Q40,35 22,100 Q8,155 58,195 Q80,212 72,235" fill="none" stroke="#f5b090" strokeWidth="1.5" opacity="0.45"/>
  </svg>
);

// ─── Gold Medal ───────────────────────────────────────────────
const Medal = ({ size = 88 }) => (
  <svg width={size} height={size * 1.28} viewBox="0 0 88 113">
    <defs>
      <radialGradient id="mo" cx="38%" cy="32%"><stop offset="0%" stopColor="#ffe066"/><stop offset="50%" stopColor="#d4a017"/><stop offset="100%" stopColor="#7a5000"/></radialGradient>
      <radialGradient id="mi" cx="35%" cy="28%"><stop offset="0%" stopColor="#fff9e6"/><stop offset="35%" stopColor="#f9ca24"/><stop offset="80%" stopColor="#b8860b"/><stop offset="100%" stopColor="#7a5000"/></radialGradient>
    </defs>
    {/* Ribbon */}
    <polygon points="30,0 22,52 38,43 44,60 44,0" fill="#c0392b" opacity="0.92"/>
    <polygon points="58,0 66,52 50,43 44,60 44,0" fill="#e74c3c" opacity="0.92"/>
    <polygon points="30,0 58,0 55,7 33,7" fill="#fff" opacity="0.28"/>
    {/* Outer ring */}
    <circle cx="44" cy="76" r="34" fill="url(#mo)" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))"/>
    {/* Middle ring */}
    <circle cx="44" cy="76" r="28" fill="none" stroke="#7a5000" strokeWidth="1.5" opacity="0.4"/>
    {/* Inner */}
    <circle cx="44" cy="76" r="22" fill="url(#mi)"/>
    {/* Shine */}
    <circle cx="36" cy="66" r="5" fill="white" opacity="0.38"/>
    <circle cx="34" cy="64" r="2" fill="white" opacity="0.22"/>
  </svg>
);

// ─── Logo ──────────────────────────────────────────────────────
// ─── Logo ──────────────────────────────────────────────────────
const Logo = () => (
  <div>
    <img src="/microskill.png" alt="Logo" style={{ height: 150, objectFit: "contain" }} />
  </div>
);
// ─── Cursive signatures ───────────────────────────────────────
const Sig1 = () => (
  <svg width="130" height="46" viewBox="0 0 130 46">
    <path d="M8,32 C18,12 36,9 48,22 C56,30 60,16 72,12 C85,7 98,20 110,24 C118,27 122,21 126,17" fill="none" stroke="#555" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14,40 C32,36 54,34 76,36 C94,38 112,33 126,30" fill="none" stroke="#555" strokeWidth="1.1" strokeLinecap="round" opacity="0.45"/>
  </svg>
);
const Sig2 = () => (
  <svg width="130" height="46" viewBox="0 0 130 46">
    <path d="M6,30 C16,10 32,8 44,20 C53,30 62,14 76,10 C90,6 103,21 114,25 C122,28 127,22 128,17" fill="none" stroke="#555" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10,40 C28,36 52,33 74,35 C92,37 112,32 128,29" fill="none" stroke="#555" strokeWidth="1.1" strokeLinecap="round" opacity="0.45"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────
// THE CERTIFICATE TEMPLATE
// ─────────────────────────────────────────────────────────────
export const CertificateTemplate = ({
  id = "cert-tpl",
  scale = 1,
  studentName = "Alexander Aronowitz",
  courseTitle = "Professional Training Program",
  completedAt = "January 15, 2026",
  awardedAt = "February 2, 2026",
  director = "Muhammad Patel",
  directorTitle = "Training Director",
  instructor = "Richard Sanchez",
  instructorTitle = "Program Instructor",
  certificateId = "CERT-0000000000",
}) => {
  const W = 1060, H = 750;
  return (
    <div id={id} style={{
      width:W, height:H,
      transform:`scale(${scale})`,
      transformOrigin:"top left",
      position:"relative",
      background:"#ffffff",
      overflow:"hidden",
      fontFamily:"Georgia,'Times New Roman',serif",
      flexShrink:0,
    }}>
      <TopLeftWave/>
      <BottomRightWave/>

      {/* subtle inner border */}
      <div style={{ position:"absolute",top:28,left:28,right:28,bottom:28, border:"1.5px solid rgba(0,137,123,0.16)", pointerEvents:"none" }}/>

      {/* ── HEADER ── */}
      <div style={{ position:"absolute",top:60,left:95,right:95, display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <Medal size={88}/>

        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:60,fontWeight:900,color:"#ea670c",letterSpacing:5,lineHeight:1,textTransform:"uppercase" }}>
            CERTIFICATE
          </div>
          <div style={{ fontSize:17,letterSpacing:9,color:"#666",marginTop:5,textTransform:"uppercase",fontFamily:"Georgia,serif" }}>
            OF COMPLETION
          </div>
        </div>

        <Logo/>
      </div>

      {/* divider */}
      <div style={{ position:"absolute",top:206,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:14 }}>
        <div style={{ width:210,height:1.5,background:"linear-gradient(to right,transparent,#ea670c)" }}/>
        <div style={{ width:8,height:8,borderRadius:"50%",background:"#ea670c" }}/>
        <div style={{ width:210,height:1.5,background:"linear-gradient(to left,transparent,#ea670c)" }}/>
      </div>

      {/* "This is to certify that" */}
      <div style={{ position:"absolute",top:230,left:0,right:0,textAlign:"center",fontSize:16,color:"#888",fontStyle:"italic",letterSpacing:0.8 }}>
        This is to certify that
      </div>

      {/* ── STUDENT NAME ── */}
      <div style={{ position:"absolute",top:260,left:60,right:60,textAlign:"center",fontSize:60,fontStyle:"italic",fontWeight:"bold",color:"#ea670c",lineHeight:1.05 }}>
        {studentName}
      </div>

      {/* name underline */}
      <div style={{ position:"absolute",top:342,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:10 }}>
        <div style={{ width:240,height:1.5,background:"#ea670c",opacity:0.45 }}/>
        <div style={{ width:9,height:9,borderRadius:"50%",background:"#ea670c",opacity:0.7 }}/>
        <div style={{ width:240,height:1.5,background:"#ea670c",opacity:0.45 }}/>
      </div>

      {/* description */}
      <div style={{ position:"absolute",top:368,left:110,right:110,textAlign:"center",fontSize:15.5,color:"#555",lineHeight:1.8 }}>
        has successfully completed the course{" "}
        <span style={{ fontWeight:"bold", color:"#c45508" }}>"{courseTitle}"</span>
        {" "}conducted on {completedAt}.<br/>
        Their dedication and commitment to the learning process are truly commendable.
      </div>

      {/* awarded on */}
      <div style={{ position:"absolute",top:472,left:0,right:0,textAlign:"center",fontSize:16.5,fontWeight:"bold",color:"#333" }}>
        Awarded on {awardedAt}
      </div>

      {/* ── SIGNATURES ── */}
      <div style={{ position:"absolute",bottom:72,left:110,right:110,display:"flex",justifyContent:"space-between",alignItems:"flex-end" }}>
        {/* Left */}
        <div style={{ textAlign:"center" }}>
          <Sig1/>
          <div style={{ width:185,height:1.5,background:"#444",marginTop:2 }}/>
          <div style={{ fontSize:15,fontWeight:"bold",color:"#222",marginTop:7 }}>{director}</div>
          <div style={{ fontSize:12,color:"#888",marginTop:3,letterSpacing:0.4 }}>{directorTitle}</div>
        </div>

        {/* Centre seal */}
        <div style={{ textAlign:"center",marginBottom:18 }}>
          <div style={{ width:64,height:64,borderRadius:"50%",border:"2.5px solid #ea670c",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#fff0e6,#fff)",margin:"0 auto 6px" }}>
            <span style={{ fontSize:24,color:"#ea670c" }}>✓</span>
          </div>
          <div style={{ fontSize:8.5,color:"#aaa",letterSpacing:1.2,fontFamily:"monospace" }}>{certificateId}</div>
        </div>

        {/* Right */}
        <div style={{ textAlign:"center" }}>
          <Sig2/>
          <div style={{ width:185,height:1.5,background:"#444",marginTop:2 }}/>
          <div style={{ fontSize:15,fontWeight:"bold",color:"#222",marginTop:7 }}>{instructor}</div>
          <div style={{ fontSize:12,color:"#888",marginTop:3,letterSpacing:0.4 }}>{instructorTitle}</div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// CERTIFICATES PAGE
// ─────────────────────────────────────────────────────────────
// ─── Format date to English long format ──────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

// ─── Map API response → cert template props ───────────────────
function mapCert(raw) {
  return {
    id:             raw.certificateId,
    studentName:    raw.studentName    || "Student",
    courseTitle:    raw.courseTitle    || "Course",
    courseCategory: raw.courseCategory || "",
    completedAt:    fmtDate(raw.completedAt),
    awardedAt:      fmtDate(raw.completedAt),   // same date; tweak if you have a separate issued date
    director:       raw.instructorName || "Course Instructor",
    directorTitle:  "Course Director",
    instructor:     raw.instructorName || "Course Instructor",
    instructorTitle:"Program Instructor",
    certificateId:  raw.certificateId,
  };
}

// ─── Skeleton card ────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ background:"#fff",borderRadius:18,overflow:"hidden",border:"1.5px solid #fff0e6" }}>
    <div style={{ height:168,background:"linear-gradient(90deg,#fff0e6 25%,#fff8f4 50%,#fff0e6 75%)",backgroundSize:"400% 100%",animation:"shimmer 1.4s infinite" }}/>
    <div style={{ padding:"20px 22px 18px" }}>
      {[80,55,100,42].map((w,i) => (
        <div key={i} style={{ height:i===2?28:14,width:`${w}%`,background:"#f0f0f0",borderRadius:6,marginBottom:12,animation:"shimmer 1.4s infinite" }}/>
      ))}
    </div>
  </div>
);

export default function CertificatesPage() {
  const [certs,       setCerts]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [downloading, setDownloading] = useState(false);

  // ── Fetch on mount ──────────────────────────────────────────
  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("লগইন করুন");

        const res = await fetch(`${API_BASE_URL}/api/certificates/my`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Error ${res.status}`);
        }

        const data = await res.json();
        setCerts((data.certificates || []).map(mapCert));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCerts();
  }, []);

  const handleDownload = async () => {
    if (!selected) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { default: jsPDF } = await import("jspdf");

      const el = document.getElementById("cert-full");
      const canvas = await html2canvas(el, { scale:2.5, useCORS:true, backgroundColor:"#ffffff", logging:false });
      const img = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({ orientation:"landscape", unit:"mm", format:"a4" });
      pdf.addImage(img, "JPEG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
      pdf.save(`Certificate-${selected.id}.pdf`);
    } catch(e) {
      alert("ডাউনলোড সমস্যা হয়েছে।");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f5f7f6", fontFamily:"Georgia,serif" }}>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ background:"linear-gradient(135deg,#c45508,#ea670c 55%,#f08040)", padding:"42px 32px 34px", color:"white" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ fontSize:10,letterSpacing:4,opacity:0.7,textTransform:"uppercase",marginBottom:8 }}>আমার অর্জন</div>
          <h1 style={{ fontSize:34,fontWeight:"bold",margin:0,letterSpacing:1 }}>সার্টিফিকেট সমূহ</h1>
          <p style={{ opacity:0.78,marginTop:8,fontSize:14 }}>
            {loading ? "লোড হচ্ছে..." : error ? "লোড করতে সমস্যা হয়েছে" : `${certs.length}টি কোর্স সফলভাবে সম্পন্ন করেছেন`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"36px 24px" }}>

        {/* ── Error ── */}
        {error && (
          <div style={{ background:"#fff5f5",border:"1.5px solid #fed7d7",borderRadius:14,padding:"24px 28px",textAlign:"center",color:"#c53030",fontSize:15 }}>
            ⚠️ {error}
            <br/>
            <button
              onClick={()=>{ setError(null); setLoading(true); window.location.reload(); }}
              style={{ marginTop:14,padding:"9px 22px",background:"#ea670c",color:"#fff",border:"none",borderRadius:9,fontSize:13,cursor:"pointer",fontWeight:"bold" }}
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        )}

        {/* ── Loading skeletons ── */}
        {loading && (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(330px,1fr))",gap:24 }}>
            {[1,2,3].map(i=><SkeletonCard key={i}/>)}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && certs.length === 0 && (
          <div style={{ textAlign:"center",padding:"80px 20px" }}>
            <div style={{ width:90,height:90,borderRadius:"50%",background:"linear-gradient(135deg,#fff0e6,#fdd5b5)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:40 }}>
              🏆
            </div>
            <h2 style={{ fontSize:22,color:"#c45508",margin:"0 0 10px" }}>এখনও কোনো সার্টিফিকেট নেই</h2>
            <p style={{ color:"#888",fontSize:14,maxWidth:360,margin:"0 auto 28px" }}>
              যেকোনো কোর্স ১০০% সম্পন্ন করলে আপনার সার্টিফিকেট এখানে দেখাবে।
            </p>
            <a href="/dashboard/my-courses" style={{ display:"inline-block",padding:"12px 28px",background:"linear-gradient(135deg,#ea670c,#f08040)",color:"#fff",borderRadius:11,textDecoration:"none",fontWeight:"bold",fontSize:14 }}>
              📚 আমার কোর্স দেখুন
            </a>
          </div>
        )}

        {/* ── Certificate cards ── */}
        {!loading && !error && certs.length > 0 && (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(330px,1fr))",gap:24 }}>
            {certs.map(c => (
              <div key={c.id}
                style={{ background:"#fff",borderRadius:18,overflow:"hidden",boxShadow:"0 4px 22px rgba(0,137,123,0.1)",border:"1.5px solid #fff0e6",transition:"all 0.22s",cursor:"pointer" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.boxShadow="0 16px 40px rgba(0,137,123,0.2)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 22px rgba(0,137,123,0.1)";}}
              >
                {/* Thumbnail preview */}
                <div style={{ height:168,background:"linear-gradient(135deg,#fff0e6,#fff8f4)",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <div style={{ transform:"scale(0.135)",transformOrigin:"center center",pointerEvents:"none" }}>
                    <CertificateTemplate {...c} certificateId={c.id} scale={1} id={`thumb-${c.id}`}/>
                  </div>
                  <div style={{ position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 50%,rgba(224,242,241,0.4))" }}/>
                  <span style={{ position:"absolute",top:12,right:12,background:"#ea670c",color:"#fff",fontSize:10,fontWeight:800,padding:"3px 11px",borderRadius:20,letterSpacing:1 }}>
                    ✓ VERIFIED
                  </span>
                  {c.courseCategory && (
                    <span style={{ position:"absolute",bottom:12,left:12,background:"rgba(0,105,92,0.85)",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 9px",borderRadius:20,letterSpacing:1 }}>
                      {c.courseCategory}
                    </span>
                  )}
                </div>

                <div style={{ padding:"20px 22px 18px" }}>
                  <div style={{ fontSize:16,fontWeight:"bold",color:"#c45508",marginBottom:5,lineHeight:1.3 }}>{c.courseTitle}</div>
                  <div style={{ fontSize:12,color:"#999",marginBottom:14 }}>🎓 {c.instructor} &nbsp;·&nbsp; {c.awardedAt}</div>
                  <div style={{ fontSize:10,color:"#aaa",fontFamily:"monospace",background:"#f7f7f7",padding:"5px 10px",borderRadius:7,marginBottom:16,letterSpacing:0.5,wordBreak:"break-all" }}>
                    🔒 {c.id}
                  </div>
                  <button
                    onClick={()=>setSelected(c)}
                    style={{ width:"100%",padding:"11px",background:"linear-gradient(135deg,#ea670c,#f08040)",color:"#fff",border:"none",borderRadius:11,fontSize:14,fontWeight:"bold",cursor:"pointer",letterSpacing:0.5 }}
                  >
                    🏆 সার্টিফিকেট দেখুন ও ডাউনলোড করুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {selected && (
        <div
          style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.86)",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20 }}
          onClick={()=>setSelected(null)}
        >
          {/* Full-res hidden for download */}
          <div style={{ position:"fixed",left:-9999,top:-9999,pointerEvents:"none" }}>
            <CertificateTemplate {...selected} certificateId={selected.id} scale={1} id="cert-full"/>
          </div>

          <div onClick={e=>e.stopPropagation()} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:22 }}>
            {/* Visible cert scaled to screen */}
            <div style={{ width:1060*0.64,height:750*0.64,overflow:"hidden",borderRadius:10,boxShadow:"0 30px 80px rgba(0,0,0,0.7)",border:"1px solid rgba(0,137,123,0.35)" }}>
              <CertificateTemplate {...selected} certificateId={selected.id} scale={0.64} id="cert-modal"/>
            </div>

            <div style={{ display:"flex",gap:12 }}>
              <button
                onClick={handleDownload}
                disabled={downloading}
                style={{ padding:"13px 32px",background:"linear-gradient(135deg,#ea670c,#f08040)",color:"#fff",border:"none",borderRadius:11,fontSize:15,fontWeight:"bold",cursor:downloading?"not-allowed":"pointer",opacity:downloading?0.7:1,letterSpacing:0.5 }}
              >
                {downloading ? "⏳ ডাউনলোড হচ্ছে..." : "⬇ PDF ডাউনলোড করুন"}
              </button>
              <button
                onClick={()=>setSelected(null)}
                style={{ padding:"13px 24px",background:"transparent",color:"#fff",border:"1.5px solid rgba(255,255,255,0.35)",borderRadius:11,fontSize:15,cursor:"pointer" }}
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