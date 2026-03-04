"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShoppingBag, CheckCircle, Clock, XCircle, Ban,
    Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
    TrendingUp, DollarSign, Package, RefreshCw, Eye,
    FileText, Printer, X, MapPin, Phone, Mail, Globe,
    Hash, Calendar, CreditCard, Building2, User, Shield
} from 'lucide-react';

const API_BASE_URL = 'https://api.microskill.com.bd';

const STATUS_CONFIG = {
    completed:  { label: 'সম্পন্ন',    bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle,  printClass: 'completed' },
    initiated:  { label: 'অপেক্ষমাণ', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock,         printClass: 'initiated' },
    failed:     { label: 'ব্যর্থ',     bg: 'bg-red-100',    text: 'text-red-700',    icon: XCircle,       printClass: 'failed' },
    cancelled:  { label: 'বাতিল',     bg: 'bg-slate-100',  text: 'text-slate-600',  icon: Ban,           printClass: 'cancelled' },
};

const GATEWAY_CONFIG = {
    sslcommerz: { label: 'bKash / Nagad (SSLCommerz)', color: 'text-pink-600', bg: 'bg-pink-50' },
    stripe:     { label: 'Card / PayPal (Stripe)',     color: 'text-blue-600', bg: 'bg-blue-50' },
};

// Company Info — পরিবর্তন করো তোমার তথ্য দিয়ে
const COMPANY = {
    name:    'MicroSkill',
    tagline: 'অনলাইন লার্নিং প্ল্যাটফর্ম',
    address: 'House 12, Road 5, Banani, Dhaka-1213, Bangladesh',
    phone:   '+880 1700-000000',
    email:   'support@microskill.com',
    website: 'www.microskill.com',
    taxId:   'VAT-REG: BD-2024-001234',
};

export default function OrdersPage() {
    const router = useRouter();
    const [user, setUser]           = useState(null);
    const [orders, setOrders]       = useState([]);
    const [overview, setOverview]   = useState(null);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [search, setSearch]       = useState('');
    const [statusFilter, setStatusFilter]   = useState('');
    const [gatewayFilter, setGatewayFilter] = useState('');
    const [page, setPage]           = useState(1);
    const [total, setTotal]         = useState(0);
    const LIMIT = 10;
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [invoiceOrder, setInvoiceOrder]   = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) { router.push('/login'); return; }
        try {
            const s = localStorage.getItem('user');
            if (s) setUser(JSON.parse(s));
        } catch(e) {}
    }, []);

    useEffect(() => { if (user) fetchOrders(); }, [user, page, statusFilter, gatewayFilter]);

    const fetchOrders = async (searchOverride) => {
        setLoading(true); setError('');
        try {
            const token = localStorage.getItem('authToken');
            const role  = user?.role?.toUpperCase();
            let url = (role === 'STUDENT' || !role)
                ? `${API_BASE_URL}/api/payment/my-orders?page=${page}&limit=${LIMIT}`
                : `${API_BASE_URL}/api/payment/orders?page=${page}&limit=${LIMIT}`;
            if (statusFilter)  url += `&status=${statusFilter}`;
            if (gatewayFilter) url += `&gateway=${gatewayFilter}`;
            const q = searchOverride ?? search;
            if (q) url += `&search=${encodeURIComponent(q)}`;

            const res  = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
            setOrders(data.orders || []);
            setTotal(data.total   || 0);
            setOverview(data.overview || null);
        } catch(err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const role       = user?.role?.toUpperCase();
    const isAdmin    = role === 'ADMIN';
    const isTeacher  = role === 'TEACHER';
    const isStudent  = role === 'STUDENT' || !role;
    const totalPages = Math.ceil(total / LIMIT);
    const pageTitle  = isAdmin ? 'সকল অর্ডার' : isTeacher ? 'আমার কোর্সের অর্ডার' : 'আমার অর্ডার';

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-6xl mx-auto space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <ShoppingBag className="text-[#f97316]" size={26}/> {pageTitle}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {isAdmin && 'সব কোর্সের সকল পেমেন্ট অর্ডার'}
                            {isTeacher && 'আপনার কোর্সে কারা ভর্তি হয়েছে'}
                            {isStudent && 'আপনি যে কোর্সগুলো কিনেছেন'}
                        </p>
                    </div>
                    <button onClick={() => fetchOrders()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#f97316] transition">
                        <RefreshCw size={16}/> রিফ্রেশ
                    </button>
                </div>

                {!isStudent && overview && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <OCard icon={<Package size={20} className="text-blue-500"/>}      label="মোট অর্ডার"  value={overview.totalOrders}                                  bg="bg-blue-50"/>
                        <OCard icon={<CheckCircle size={20} className="text-green-500"/>}  label="সম্পন্ন"    value={overview.completedOrders}                              bg="bg-green-50"/>
                        <OCard icon={<DollarSign size={20} className="text-[#f97316]"/>}   label="আয় (BDT)"  value={`৳${(overview.totalRevenueBDT||0).toLocaleString()}`}  bg="bg-orange-50"/>
                        <OCard icon={<TrendingUp size={20} className="text-purple-500"/>}  label="আয় (USD)"  value={`$${(overview.totalRevenueUSD||0).toFixed(2)}`}         bg="bg-purple-50"/>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <form onSubmit={e => { e.preventDefault(); setPage(1); fetchOrders(search); }} className="flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder={isStudent ? "Transaction ID খুঁজুন..." : "নাম, ইমেইল, কোর্স বা TXN ID..."}
                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#f97316]"/>
                            </div>
                            <button type="submit" className="px-4 py-2 bg-[#f97316] text-white rounded-lg text-sm font-medium hover:bg-[#c2570c] transition">খুঁজুন</button>
                        </form>
                        <div className="relative">
                            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                                className="pl-8 pr-8 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-[#f97316] appearance-none">
                                <option value="">সব স্ট্যাটাস</option>
                                <option value="completed">সম্পন্ন</option>
                                <option value="initiated">অপেক্ষমাণ</option>
                                <option value="failed">ব্যর্থ</option>
                                <option value="cancelled">বাতিল</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                        </div>
                        <div className="relative">
                            <select value={gatewayFilter} onChange={e => { setGatewayFilter(e.target.value); setPage(1); }}
                                className="pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-[#f97316] appearance-none">
                                <option value="">সব গেটওয়ে</option>
                                <option value="sslcommerz">bKash/Nagad</option>
                                <option value="stripe">Card/PayPal</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="py-20 text-center"><div className="animate-spin text-3xl mb-3">⏳</div><p className="text-slate-500 text-sm">লোড হচ্ছে...</p></div>
                    ) : error ? (
                        <div className="py-20 text-center"><p className="text-red-500 text-sm">{error}</p></div>
                    ) : orders.length === 0 ? (
                        <div className="py-20 text-center"><ShoppingBag size={48} className="text-slate-200 mx-auto mb-3"/><p className="text-slate-400 text-sm">কোনো অর্ডার পাওয়া যায়নি</p></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Transaction ID</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">কোর্স</th>
                                        {!isStudent && <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">শিক্ষার্থী</th>}
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">পরিমাণ</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">গেটওয়ে</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">স্ট্যাটাস</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">তারিখ</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">অ্যাকশন</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.map(order => {
                                        const st   = STATUS_CONFIG[order.status]  || STATUS_CONFIG.initiated;
                                        const gw   = GATEWAY_CONFIG[order.gateway] || { label: order.gateway, color: 'text-slate-600', bg: 'bg-slate-50' };
                                        const Icon = st.icon;
                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50 transition">
                                                <td className="px-4 py-3"><span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">{order.transaction_id}</span></td>
                                                <td className="px-4 py-3"><p className="font-medium text-slate-800 max-w-[160px] truncate">{order.course?.title || '—'}</p></td>
                                                {!isStudent && (
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-slate-700">{order.user?.name || '—'}</p>
                                                        <p className="text-xs text-slate-400">{order.user?.email || ''}</p>
                                                    </td>
                                                )}
                                                <td className="px-4 py-3 font-semibold text-slate-800">
                                                    {order.currency === 'BDT' ? `৳${order.amount}` : `$${order.amount}`}
                                                </td>
                                                <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full ${gw.bg} ${gw.color}`}>{gw.label.split(' ')[0]}</span></td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${st.bg} ${st.text}`}>
                                                        <Icon size={12}/>{st.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                                                    {new Date(order.createdAt).toLocaleDateString('bn-BD', { day:'2-digit', month:'short', year:'numeric' })}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => setSelectedOrder(order)} title="বিবরণ"
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#f97316] hover:bg-orange-50 transition"><Eye size={15}/></button>
                                                        <button onClick={() => setInvoiceOrder(order)} title="ইনভয়েস"
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"><FileText size={15}/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                            <p className="text-xs text-slate-500">মোট {total}টি অর্ডার — পেজ {page}/{totalPages}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-[#f97316] hover:text-[#f97316] disabled:opacity-40 disabled:cursor-not-allowed transition"><ChevronLeft size={16}/></button>
                                {Array.from({length: Math.min(5,totalPages)}, (_,i)=>i+1).map(p=>(
                                    <button key={p} onClick={()=>setPage(p)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page===p?'bg-[#f97316] text-white':'border border-slate-200 text-slate-600 hover:border-[#f97316] hover:text-[#f97316]'}`}>{p}</button>
                                ))}
                                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-[#f97316] hover:text-[#f97316] disabled:opacity-40 disabled:cursor-not-allowed transition"><ChevronRight size={16}/></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedOrder && (
                <OrderDetailModal order={selectedOrder} isStudent={isStudent} onClose={() => setSelectedOrder(null)}
                    onInvoice={() => { setInvoiceOrder(selectedOrder); setSelectedOrder(null); }}/>
            )}
            {invoiceOrder && (
                <InvoiceModal order={invoiceOrder} user={user} isStudent={isStudent} onClose={() => setInvoiceOrder(null)}/>
            )}
        </div>
    );
}

function OCard({icon,label,value,bg}) {
    return (
        <div className={`${bg} rounded-xl p-4 border border-white shadow-sm`}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
                <div><p className="text-xs text-slate-500 font-medium">{label}</p><p className="text-lg font-bold text-slate-800">{value}</p></div>
            </div>
        </div>
    );
}

function OrderDetailModal({order, isStudent, onClose, onInvoice}) {
    const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.initiated;
    const gw = GATEWAY_CONFIG[order.gateway] || {label:order.gateway,color:'text-slate-600',bg:'bg-slate-50'};
    const Icon = st.icon;
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e=>e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-slate-800 text-lg">অর্ডার বিবরণ</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                </div>
                <div className="space-y-1">
                    <DR label="Transaction ID"><span className="font-mono text-slate-800 text-xs bg-slate-100 px-2 py-1 rounded">{order.transaction_id}</span></DR>
                    <DR label="কোর্স"><span className="font-medium text-slate-800">{order.course?.title||'—'}</span></DR>
                    {!isStudent && <><DR label="শিক্ষার্থী"><span className="text-slate-700">{order.user?.name}</span></DR><DR label="ইমেইল"><span className="text-slate-500 text-xs">{order.user?.email}</span></DR></>}
                    <DR label="পরিমাণ"><span className="font-bold text-slate-800">{order.currency==='BDT'?`৳${order.amount}`:`$${order.amount}`}</span></DR>
                    <DR label="গেটওয়ে"><span className={`text-xs font-medium px-2 py-1 rounded-full ${gw.bg} ${gw.color}`}>{gw.label}</span></DR>
                    <DR label="স্ট্যাটাস"><span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${st.bg} ${st.text}`}><Icon size={12}/>{st.label}</span></DR>
                    <DR label="তারিখ"><span className="text-slate-600 text-sm">{new Date(order.createdAt).toLocaleString('bn-BD')}</span></DR>
                    {order.completedAt && <DR label="সম্পন্নের তারিখ"><span className="text-green-600 text-sm">{new Date(order.completedAt).toLocaleString('bn-BD')}</span></DR>}
                    {order.gateway_reference && <DR label="Gateway Ref"><span className="font-mono text-xs text-slate-500 truncate max-w-[180px] block">{order.gateway_reference}</span></DR>}
                </div>
                <div className="flex gap-3 mt-5">
                    <button onClick={onInvoice} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition text-sm"><FileText size={16}/> ইনভয়েস</button>
                    <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition text-sm">বন্ধ করুন</button>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════
//   PROFESSIONAL INVOICE MODAL
// ══════════════════════════════════════════════
function InvoiceModal({order, user, isStudent, onClose}) {
    const invoiceRef = useRef(null);
    const st   = STATUS_CONFIG[order.status]  || STATUS_CONFIG.initiated;
    const gw   = GATEWAY_CONFIG[order.gateway] || {label:order.gateway,color:'text-slate-600',bg:'bg-slate-50'};
    const Icon = st.icon;

    const buyerName  = isStudent ? (user?.name  || '—') : (order.user?.name  || '—');
    const buyerEmail = isStudent ? (user?.email || '—') : (order.user?.email || '—');

    // SSLCommerz এ address/phone থাকে, Stripe এ না
    const buyerPhone   = order.billing?.phone   || order.user?.mobileNumber || user?.mobileNumber || null;
    const buyerAddress = order.billing?.address || null;
    const buyerCity    = order.billing?.city    || null;

    const invoiceDate = new Date(order.createdAt);
    const dueDate     = new Date(order.createdAt);
    dueDate.setDate(dueDate.getDate() + 1);

    const subtotal = parseFloat(order.amount) || 0;
    const tax      = 0; // future use
    const discount = 0; // future use
    const total    = subtotal + tax - discount;
    const currency = order.currency === 'BDT' ? '৳' : '$';

    const handlePrint = () => {
        const content = invoiceRef.current.innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<!DOCTYPE html><html><head>
        <meta charset="UTF-8"/>
        <title>Invoice — ${order.transaction_id}</title>
        <style>
            *{margin:0;padding:0;box-sizing:border-box}
            body{font-family:'Segoe UI',Tahoma,sans-serif;color:#1e293b;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
            .page{max-width:780px;margin:0 auto;padding:48px}
            /* ── TOP BAR ── */
            .top-bar{background:#f97316;height:6px;border-radius:4px;margin-bottom:36px}
            /* ── HEADER ── */
            .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}
            .brand-name{font-size:28px;font-weight:900;color:#f97316;letter-spacing:-1px}
            .brand-tagline{font-size:11px;color:#94a3b8;margin-top:2px}
            .brand-contact{margin-top:10px}
            .brand-contact p{font-size:11px;color:#64748b;line-height:1.7;display:flex;align-items:center;gap:5px}
            .inv-block{text-align:right}
            .inv-block h1{font-size:36px;font-weight:900;color:#1e293b;letter-spacing:-1px}
            .inv-meta{margin-top:8px}
            .inv-meta p{font-size:12px;color:#64748b;line-height:1.8}
            .inv-meta span{font-weight:700;color:#1e293b}
            /* ── DIVIDER ── */
            .divider{height:1px;background:#e2e8f0;margin:24px 0}
            .divider-orange{height:2px;background:linear-gradient(90deg,#f97316,#fb923c,transparent);margin:0 0 28px}
            /* ── BILL TO ── */
            .info-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-bottom:28px}
            .info-box h4{font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0}
            .info-box p{font-size:12px;color:#374151;line-height:1.7}
            .info-box .bold{font-weight:700;font-size:13px;color:#1e293b}
            .info-box .small{font-size:11px;color:#64748b}
            /* ── STATUS PILL ── */
            .pill{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}
            .completed{background:#dcfce7;color:#15803d}
            .initiated{background:#fef9c3;color:#b45309}
            .failed{background:#fee2e2;color:#dc2626}
            .cancelled{background:#f1f5f9;color:#475569}
            /* ── TABLE ── */
            .tbl-wrap{background:#fafafa;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:20px}
            table{width:100%;border-collapse:collapse}
            thead{background:#1e293b}
            thead th{color:#fff;padding:12px 16px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;text-align:left}
            thead th:last-child{text-align:right}
            tbody tr{border-bottom:1px solid #e2e8f0}
            tbody tr:last-child{border-bottom:none}
            tbody td{padding:14px 16px;font-size:13px;color:#374151}
            tbody td:last-child{text-align:right;font-weight:600;color:#1e293b}
            .item-name{font-weight:700;font-size:13px;color:#1e293b}
            .item-sub{font-size:11px;color:#94a3b8;margin-top:2px}
            /* ── TOTALS ── */
            .totals{display:flex;justify-content:flex-end;margin-bottom:24px}
            .totals-box{width:260px}
            .total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9}
            .total-row:last-child{border-bottom:none;background:#f97316;margin:8px -12px -8px;padding:12px;border-radius:8px}
            .total-row:last-child span{color:#fff;font-size:15px;font-weight:900}
            .total-row span{font-weight:600;color:#1e293b}
            /* ── PAYMENT BOX ── */
            .pay-box{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
            .pay-card{background:#f8fafc;border-radius:10px;padding:14px 16px;border:1px solid #e2e8f0}
            .pay-card h4{font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px}
            .pay-card p{font-size:12px;color:#374151;line-height:1.7}
            .pay-card .mono{font-family:monospace;font-size:11px;color:#64748b;word-break:break-all}
            /* ── TERMS ── */
            .terms{background:#fffbf5;border:1px solid #fed7aa;border-radius:10px;padding:14px 16px;margin-bottom:24px}
            .terms h4{font-size:10px;font-weight:800;color:#c2570c;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
            .terms ul{list-style:none;padding:0}
            .terms ul li{font-size:11px;color:#78350f;line-height:1.8;padding-left:14px;position:relative}
            .terms ul li::before{content:"•";position:absolute;left:0;color:#f97316}
            /* ── FOOTER ── */
            .footer{display:flex;justify-content:space-between;align-items:center;padding-top:20px;border-top:1px solid #e2e8f0}
            .footer-left p{font-size:11px;color:#94a3b8;line-height:1.7}
            .footer-right{text-align:right}
            .footer-right p{font-size:10px;color:#cbd5e1}
            .watermark{font-size:11px;font-weight:700;color:#f97316;opacity:.15;font-style:italic}
            @page{size:A4;margin:0}
            @media print{.page{padding:32px;max-width:100%}}
        </style></head><body><div class="page">${content}</div></body></html>`);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 600);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-4" onClick={e => e.stopPropagation()}>

                {/* Modal Top Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <FileText size={20} className="text-blue-600"/> প্রফেশনাল ইনভয়েস
                    </h3>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#c2570c] text-white rounded-lg text-sm font-semibold transition shadow-sm">
                            <Printer size={15}/> প্রিন্ট / PDF
                        </button>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition">
                            <X size={18}/>
                        </button>
                    </div>
                </div>

                {/* Scrollable Invoice */}
                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    <div ref={invoiceRef} className="bg-white font-sans">

                        {/* Orange top bar */}
                        <div className="top-bar h-1.5 bg-gradient-to-r from-[#f97316] to-[#fb923c] rounded-full mb-8"></div>

                        {/* ── HEADER ── */}
                        <div className="header flex justify-between items-start mb-8">
                            <div>
                                <div className="brand-name text-3xl font-black text-[#f97316] tracking-tight">MicroSkill</div>
                                <div className="brand-tagline text-xs text-slate-400 mt-0.5">{COMPANY.tagline}</div>
                                <div className="brand-contact mt-3 space-y-0.5">
                                    <p className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={11}/>{COMPANY.address}</p>
                                    <p className="flex items-center gap-1.5 text-xs text-slate-500"><Phone size={11}/>{COMPANY.phone}</p>
                                    <p className="flex items-center gap-1.5 text-xs text-slate-500"><Mail size={11}/>{COMPANY.email}</p>
                                    <p className="flex items-center gap-1.5 text-xs text-slate-500"><Globe size={11}/>{COMPANY.website}</p>
                                    <p className="flex items-center gap-1.5 text-xs text-slate-400"><Shield size={11}/>{COMPANY.taxId}</p>
                                </div>
                            </div>
                            <div className="inv-block text-right">
                                <h1 className="text-4xl font-black text-slate-800 tracking-tighter">INVOICE</h1>
                                <div className="inv-meta mt-2 space-y-0.5">
                                    <p className="text-xs text-slate-500">ইনভয়েস নং: <span className="font-bold text-slate-800 font-mono">INV-{order.transaction_id}</span></p>
                                    <p className="text-xs text-slate-500">ইস্যু তারিখ: <span className="font-semibold text-slate-700">{invoiceDate.toLocaleDateString('en-GB', {day:'2-digit',month:'long',year:'numeric'})}</span></p>
                                    <p className="text-xs text-slate-500">পেমেন্ট তারিখ: <span className="font-semibold text-slate-700">{dueDate.toLocaleDateString('en-GB', {day:'2-digit',month:'long',year:'numeric'})}</span></p>
                                    <div className="mt-2">
                                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${st.bg} ${st.text}`}>
                                            <Icon size={11}/> {st.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Orange divider */}
                        <div className="divider-orange h-0.5 bg-gradient-to-r from-[#f97316] via-[#fb923c] to-transparent mb-7"></div>

                        {/* ── BILL TO / SHIP TO / PAYMENT ── */}
                        <div className="info-grid grid grid-cols-3 gap-5 mb-7">
                            {/* Bill To */}
                            <div className="info-box">
                                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2 pb-1.5 border-b border-slate-100">বিল টু</h4>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-slate-800 flex items-center gap-1.5"><User size={12} className="text-slate-400"/>{buyerName}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1.5"><Mail size={11} className="text-slate-400"/>{buyerEmail}</p>
                                    {buyerPhone && <p className="text-xs text-slate-500 flex items-center gap-1.5"><Phone size={11} className="text-slate-400"/>{buyerPhone}</p>}
                                    {buyerAddress && <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1"><MapPin size={11} className="text-slate-400 mt-0.5 shrink-0"/><span>{buyerAddress}{buyerCity ? `, ${buyerCity}` : ''}, Bangladesh</span></p>}
                                </div>
                            </div>

                            {/* Order Info */}
                            <div className="info-box">
                                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2 pb-1.5 border-b border-slate-100">অর্ডার তথ্য</h4>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500">অর্ডার নং: <span className="font-mono font-semibold text-slate-700">{order.transaction_id}</span></p>
                                    <p className="text-xs text-slate-500">তারিখ: <span className="font-semibold text-slate-700">{invoiceDate.toLocaleDateString('en-GB')}</span></p>
                                    <p className="text-xs text-slate-500">মুদ্রা: <span className="font-semibold text-slate-700">{order.currency}</span></p>
                                    <p className="text-xs text-slate-500 mt-1">স্ট্যাটাস:</p>
                                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                                        <Icon size={10}/>{st.label}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="info-box">
                                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2 pb-1.5 border-b border-slate-100">পেমেন্ট মাধ্যম</h4>
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-800 flex items-center gap-1.5"><CreditCard size={12} className="text-slate-400"/>{gw.label.split(' (')[0]}</p>
                                    <p className="text-xs text-slate-500">({gw.label.split('(')[1]?.replace(')','') || ''})</p>
                                    {order.completedAt && (
                                        <p className="text-xs text-green-600 font-semibold mt-1.5 flex items-center gap-1">
                                            <CheckCircle size={11}/>
                                            {new Date(order.completedAt).toLocaleDateString('en-GB')} এ পরিশোধিত
                                        </p>
                                    )}
                                    {order.gateway_reference && (
                                        <p className="text-xs text-slate-400 font-mono mt-1 break-all">{order.gateway_reference.substring(0,30)}...</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── ITEMS TABLE ── */}
                        <div className="tbl-wrap rounded-xl overflow-hidden border border-slate-200 mb-5">
                            <table className="w-full">
                                <thead className="bg-slate-800">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-white uppercase tracking-wider">#</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-white uppercase tracking-wider">পণ্য / সেবার বিবরণ</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-white uppercase tracking-wider">ধরন</th>
                                        <th className="text-center px-5 py-3 text-xs font-bold text-white uppercase tracking-wider">পরিমাণ</th>
                                        <th className="text-right px-5 py-3 text-xs font-bold text-white uppercase tracking-wider">একক মূল্য</th>
                                        <th className="text-right px-5 py-3 text-xs font-bold text-white uppercase tracking-wider">মোট</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                        <td className="px-5 py-4 text-sm text-slate-400 font-mono">01</td>
                                        <td className="px-5 py-4">
                                            <p className="font-bold text-slate-800">{order.course?.title || 'Online Course'}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">লাইফটাইম অ্যাক্সেস • ডিজিটাল ডেলিভারি</p>
                                            <p className="text-xs text-[#f97316] mt-0.5 font-medium">✦ সার্টিফিকেট অন্তর্ভুক্ত</p>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-500">অনলাইন কোর্স</td>
                                        <td className="px-5 py-4 text-sm text-center text-slate-600 font-semibold">১টি</td>
                                        <td className="px-5 py-4 text-right text-sm font-semibold text-slate-700">{currency}{subtotal.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right text-sm font-bold text-slate-800">{currency}{subtotal.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* ── TOTALS ── */}
                        <div className="totals flex justify-end mb-6">
                            <div className="totals-box w-64">
                                <div className="space-y-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>সাবটোটাল</span>
                                        <span className="font-semibold text-slate-700">{currency}{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>ছাড়</span>
                                        <span className="font-semibold text-green-600">-{currency}{discount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>ট্যাক্স (VAT)</span>
                                        <span className="font-semibold text-slate-700">{currency}{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="h-px bg-slate-200 my-1"></div>
                                    <div className="flex justify-between items-center bg-[#f97316] -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
                                        <span className="text-white font-bold text-sm">সর্বমোট</span>
                                        <span className="text-white font-black text-xl">{currency}{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── PAYMENT & TXN BOX ── */}
                        <div className="pay-box grid grid-cols-2 gap-4 mb-5">
                            <div className="pay-card bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Hash size={11}/> Transaction Details
                                </h4>
                                <p className="text-xs text-slate-500">Transaction ID:</p>
                                <p className="font-mono font-bold text-sm text-slate-800 mt-0.5">{order.transaction_id}</p>
                                {order.gateway_reference && (
                                    <>
                                        <p className="text-xs text-slate-500 mt-2">Gateway Reference:</p>
                                        <p className="font-mono text-xs text-slate-500 break-all mt-0.5">{order.gateway_reference}</p>
                                    </>
                                )}
                            </div>
                            <div className="pay-card bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Building2 size={11}/> পেমেন্ট সারাংশ
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-xs"><span className="text-slate-400">গেটওয়ে:</span> <span className="font-semibold text-slate-700">{gw.label}</span></p>
                                    <p className="text-xs"><span className="text-slate-400">মুদ্রা:</span> <span className="font-semibold text-slate-700">{order.currency}</span></p>
                                    <p className="text-xs"><span className="text-slate-400">ইস্যু:</span> <span className="font-semibold text-slate-700">{invoiceDate.toLocaleDateString('en-GB')}</span></p>
                                    {order.completedAt && <p className="text-xs"><span className="text-slate-400">পরিশোধ:</span> <span className="font-semibold text-green-600">{new Date(order.completedAt).toLocaleDateString('en-GB')}</span></p>}
                                </div>
                            </div>
                        </div>

                        {/* ── TERMS ── */}
                        <div className="terms bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5">
                            <h4 className="text-xs font-extrabold text-orange-700 uppercase tracking-widest mb-2">নিয়ম ও শর্তাবলী</h4>
                            <ul className="space-y-1">
                                {[
                                    'এই ইনভয়েসটি ডিজিটাল পেমেন্টের একটি অফিসিয়াল রেকর্ড।',
                                    'কোর্সে লাইফটাইম অ্যাক্সেস পাওয়া যাবে এবং কোনো রিফান্ড প্রযোজ্য নয়।',
                                    'কোর্সের কন্টেন্ট শুধুমাত্র ব্যক্তিগত ব্যবহারের জন্য — বাণিজ্যিক ব্যবহার নিষিদ্ধ।',
                                    'যেকোনো সমস্যার জন্য ৭ দিনের মধ্যে সাপোর্টে যোগাযোগ করুন।',
                                    'এই ইনভয়েসটি কম্পিউটার দ্বারা তৈরি — কোনো স্বাক্ষর প্রয়োজন নেই।',
                                ].map((t,i) => (
                                    <li key={i} className="text-xs text-orange-800 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-orange-500 leading-relaxed">{t}</li>
                                ))}
                            </ul>
                        </div>

                        {/* ── FOOTER ── */}
                        <div className="footer flex justify-between items-center pt-5 border-t border-slate-100">
                            <div>
                                <p className="text-xs font-bold text-[#f97316]">MicroSkill</p>
                                <p className="text-xs text-slate-400 mt-0.5">{COMPANY.email} • {COMPANY.phone}</p>
                                <p className="text-xs text-slate-400">{COMPANY.website}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-700">ধন্যবাদ আমাদের বেছে নেওয়ার জন্য! 🎓</p>
                                <p className="text-xs text-slate-400 mt-0.5">আপনার শেখার যাত্রা শুরু হোক আজ থেকেই।</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-300 italic">Powered by MicroSkill</p>
                                <p className="text-xs text-slate-300">© {new Date().getFullYear()} সর্বস্বত্ব সংরক্ষিত</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

function DR({label,children}) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <span className="text-xs text-slate-400 font-medium">{label}</span>
            <div>{children}</div>
        </div>
    );
}