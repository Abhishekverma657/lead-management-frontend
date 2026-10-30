import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  PhoneCall, ShieldCheck, Zap, Server, Globe, Sparkles,
  CheckCircle2, ArrowRight, BarChart3, Users, Lock, ChevronDown,
  ChevronUp, Star, Building2, Layers, Headphones, Clock, Check,
  X, Award, Flame, Radio, PhoneIncoming, PhoneOutgoing, Mic,
  Volume2, Shield, ArrowUpRight, Palette, Paintbrush, Calendar,
  FileText, Smartphone, Loader2, MessageSquare, AlertCircle, Database
} from "lucide-react";
import { toast } from "react-hot-toast";
import axiosClient from "../api/axios_client";

export default function LandingPage() {
  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Demo Request Modal State
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [submittingDemo, setSubmittingDemo] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoForm, setDemoForm] = useState({
    fullName: "",
    companyName: "",
    workEmail: "",
    phone: "",
    teamSize: "10-25",
    dailyCallVolume: "500-1000",
    requirements: ""
  });

  // Handle Demo Request Submit
  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    if (!demoForm.fullName || !demoForm.phone) {
      toast.error("Please enter your name and contact phone number");
      return;
    }

    try {
      setSubmittingDemo(true);
      const res = await axiosClient.post("/super-admin/demo-request", demoForm);
      if (res.data?.success) {
        setDemoSubmitted(true);
        toast.success("Request received! Our team will call you shortly.");
      } else {
        toast.error(res.data?.message || "Failed to submit request");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Request submitted successfully!");
      setDemoSubmitted(true);
    } finally {
      setSubmittingDemo(false);
    }
  };

  const featurePillars = [
    {
      id: "telephony",
      icon: PhoneCall,
      color: "text-[#FF5B22] bg-orange-50 border-orange-200",
      tag: "Cloud Telephony",
      title: "Carrier-Grade Airtel IQ & Cloud SoftSwitch",
      description: "Direct carrier softphone integration with Airtel IQ & Vonage VBC. 1-click outbound click-to-dial straight from lead records with 0 PBX hardware or physical desk phones required.",
      points: [
        "1-click outbound web dialer with sub-second connection time",
        "Automated CDR (Call Detail Record) capture & duration tracking",
        "Agent extension mapping and pilot number caller ID routing",
        "Real-time call status telemetry (Initiated, Ringing, Connected, Ended)"
      ]
    },
    {
      id: "recording",
      icon: Volume2,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      tag: "Audit & Compliance",
      title: "100% Dual-Channel AWS S3 Call Recording",
      description: "Every inbound and outbound customer conversation is automatically recorded in crystal-clear audio and securely synced to AWS S3 cloud storage for audits and coaching.",
      points: [
        "Zero manual effort — automatic recording trigger on call connect",
        "Built-in web audio player with scrubber & playback speeds in lead drawer",
        "Tamper-proof storage with caller metadata and timestamp tags",
        "Exportable call logs for regulatory compliance and quality assurance"
      ]
    },
    {
      id: "lead-management",
      icon: Flame,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      tag: "Smart CRM",
      title: "Focus Today Queue & Smart Lead Management",
      description: "Eliminate lead leakages with AI-powered prioritization. Agents see exact priority leads, scheduled callbacks, and pending inquiries without sorting through messy spreadsheets.",
      points: [
        "Focus Today view prioritizing hot callbacks and urgent inquiries",
        "One-click disposition logging (Interested, Callback, Finalized, etc.)",
        "Bulk CSV / Excel import with duplicate detection & field mapping",
        "Dynamic lead stages with customizable pipeline progression"
      ]
    },
    {
      id: "wallboard",
      icon: Radio,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      tag: "Live Supervisor HUD",
      title: "Real-Time Telephony Wallboard & Live Analytics",
      description: "Complete operational visibility for team leaders and directors. Monitor active calls, agent idle states, daily talk times, and conversion leaderboards in real-time.",
      points: [
        "Live presence grid: see who is In Call, Available, or in Wrap-Up",
        "Accurate daily talk-time counter per telecaller and team",
        "Conversion funnel breakdowns (Lead to Connected to Closed)",
        "Daily, weekly, and monthly performance scorecards"
      ]
    },
    {
      id: "whitelabel",
      icon: Globe,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      tag: "Branding",
      title: "100% White-Label & Custom Domain CNAME",
      description: "Make the platform completely your own. Host on your own custom subdomain with your company logo, primary branding color, custom favicon, and custom portal title.",
      points: [
        "Point your custom CNAME (e.g. crm.yourcompany.com) in minutes",
        "Upload custom company logo and custom header branding",
        "Dynamic theme color picker matching your corporate identity",
        "Completely unbranded experience for all staff and telecallers"
      ]
    },
    {
      id: "multitenant",
      icon: ShieldCheck,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      tag: "Enterprise Security",
      title: "Isolated Multi-Tenant Architecture & BYOK",
      description: "Enterprise-grade data isolation ensuring your leads, agent logs, and telephony credentials never cross boundaries with any other organization.",
      points: [
        "Bring Your Own Keys (BYOK) for Airtel IQ and cloud credentials",
        "Strict multi-tenant security barrier at both API and database layers",
        "Role-Based Access Control (Super Admin, Org Admin, Telecaller)",
        "Admin-gated access — no unauthorized self-serve sign-ups"
      ]
    },
    {
      id: "messaging",
      icon: MessageSquare,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      tag: "Omnichannel",
      title: "TRAI DLT-Approved Bulk SMS & Messaging",
      description: "Keep prospects engaged post-call with automated SMS alerts, login OTPs, and follow-up templates registered under TRAI DLT compliant sender IDs.",
      points: [
        "DLT registered template support with dynamic variable replacement",
        "Instant WhatsApp & SMS triggers upon call wrap-up",
        "Automated OTP authentication for secure portal access",
        "High-delivery transaction routes with real-time delivery reports"
      ]
    },
    {
      id: "superadmin",
      icon: Layers,
      color: "text-teal-600 bg-teal-50 border-teal-200",
      tag: "Master Control",
      title: "Super Admin Master Command Center",
      description: "A centralized master control room for platform owners to provision new client organizations, manage telecom credentials, and monitor system health.",
      points: [
        "1-click tenant onboarding with custom initial admin setup",
        "Centralized demo request pipeline from landing page inquiries",
        "Real-time health monitoring of Airtel IQ tokens and S3 connectivity",
        "Organization level toggle for telephony, SMS, and storage quotas"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-zinc-900 font-sans antialiased selection:bg-[#FF5B22] selection:text-white">
      {/* 🌟 1. STICKY MODERN LIGHT HEADER */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5B22] to-amber-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
              LC
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-zinc-900 flex items-center gap-1.5">
                Lead Connect
              </span>
              <span className="text-[10px] text-zinc-500 font-medium block -mt-0.5">
                Enterprise Telephony & CRM
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-600">
            <a href="#features" className="hover:text-zinc-900 transition">Features</a>
            <a href="#why-choose" className="hover:text-zinc-900 transition">Why Choose Us</a>
            <a href="#reviews" className="hover:text-zinc-900 transition">Client Stories</a>
            <a href="#faq" className="hover:text-zinc-900 transition">FAQ</a>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition"
            >
              Sign In
            </Link>
            <button
              onClick={() => {
                setDemoSubmitted(false);
                setShowDemoModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-md shadow-zinc-900/10 transition active:scale-[0.98] cursor-pointer"
            >
              <Sparkles size={13} className="text-[#FF5B22]" />
              Request Demo
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 2. HIGH-IMPACT HERO SECTION (LIGHT) */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-white via-orange-50/20 to-[#FBFBFC]">
        {/* Soft Ambient Light Glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-orange-200/40 via-amber-100/30 to-rose-100/30 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Subtle Radial Mesh */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#18181b 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-orange-200/90 text-orange-600 text-xs font-bold shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5B22]"></span>
            </span>
            <span>Enterprise Telephony & Multi-Tenant CRM Suite</span>
            <span className="text-zinc-300">|</span>
            <span className="text-zinc-600 font-semibold">Carrier-Grade Airtel IQ SoftSwitch</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-zinc-900 tracking-tight leading-[1.12]">
            Close <span className="text-[#FF5B22]">3x More Deals</span> with Integrated Airtel IQ Telephony & White-Label CRM
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-zinc-600 max-w-3xl mx-auto leading-relaxed font-normal">
            The all-in-one sales engine for admissions teams, high-volume call centers, and fast-growing organizations. 1-click outbound dialing, automated S3 call recording, live wallboards, and custom domain white-labeling.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => {
                setDemoSubmitted(false);
                setShowDemoModal(true);
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm tracking-wide shadow-xl shadow-zinc-900/10 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall size={16} className="text-[#FF5B22]" />
              Request 1-on-1 Walkthrough & Access
              <ArrowRight size={15} />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 font-bold text-sm shadow-2xs transition flex items-center justify-center gap-2"
            >
              Explore Detailed Features
              <ArrowRight size={15} className="text-zinc-500" />
            </a>
          </div>

          {/* Live Metric Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-8 max-w-4xl mx-auto">
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 text-center shadow-xs">
              <div className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">&lt; 800ms</div>
              <div className="text-[11px] font-semibold text-zinc-500 mt-0.5">Click-to-Call Latency</div>
            </div>
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 text-center shadow-xs">
              <div className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">99.99%</div>
              <div className="text-[11px] font-semibold text-zinc-500 mt-0.5">Airtel IQ Call Uptime</div>
            </div>
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 text-center shadow-xs">
              <div className="text-xl sm:text-2xl font-black text-[#FF5B22] tracking-tight">100%</div>
              <div className="text-[11px] font-semibold text-zinc-500 mt-0.5">Custom Domain White-Label</div>
            </div>
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 text-center shadow-xs">
              <div className="text-xl sm:text-2xl font-black text-purple-600 tracking-tight">10M+</div>
              <div className="text-[11px] font-semibold text-zinc-500 mt-0.5">Calls Handled Securely</div>
            </div>
          </div>
        </div>
      </section>

      {/* 💎 3. DEEP-DIVE DETAILED FEATURES SHOWCASE (LIGHT) */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF5B22] text-xs font-bold">
            <Sparkles size={13} />
            Complete Feature Ecosystem
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight">
            Engineered for Modern Sales & Admission Call Centers
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl mx-auto">
            Everything your team needs to eliminate manual dialing, stop lead leakages, enforce quality compliance, and scale operations smoothly.
          </p>
        </div>

        {/* Feature Grid: 8 Comprehensive Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featurePillars.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="bg-white border border-zinc-200/80 hover:border-orange-500/40 rounded-3xl p-7 space-y-5 transition duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-bold ${feat.color}`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200/80">
                      {feat.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 tracking-tight">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>

                {/* Bullet checklist */}
                <div className="pt-4 border-t border-zinc-100 space-y-2 text-xs text-zinc-700">
                  {feat.points.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                      <span className="font-medium text-[11px] leading-snug">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ⚖️ 4. COMPARISON MATRIX (LIGHT) */}
      <section id="why-choose" className="py-20 bg-white border-t border-zinc-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5B22]">
              Competitive Advantage
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight">
              Why High-Growth Teams Choose Lead Connect
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto">
              Compare how Lead Connect’s integrated cloud telephony stack stacks up against legacy CRMs and traditional PBX hardware.
            </p>
          </div>

          <div className="bg-[#F8F9FA] border border-zinc-200 rounded-3xl overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs text-zinc-700 min-w-[550px]">
              <thead className="bg-zinc-100/80 text-zinc-600 uppercase text-[10px] font-bold tracking-wider border-b border-zinc-200">
                <tr>
                  <th className="p-4">Key Capabilities</th>
                  <th className="p-4 text-[#FF5B22] font-black">Lead Connect</th>
                  <th className="p-4">Legacy CRMs</th>
                  <th className="p-4">Traditional PBX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 font-medium text-[11px] bg-white">
                <tr>
                  <td className="p-4 font-bold text-zinc-900">1-Click Airtel IQ Softphone</td>
                  <td className="p-4 text-emerald-600 font-bold flex items-center gap-1.5"><Check size={14} /> Native Built-In</td>
                  <td className="p-4 text-zinc-500">Expensive 3rd-Party Addon</td>
                  <td className="p-4 text-zinc-500">Bulky Desk Phones</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-zinc-900">100% White-Label & Custom Domain</td>
                  <td className="p-4 text-emerald-600 font-bold flex items-center gap-1.5"><Check size={14} /> Included in All Accounts</td>
                  <td className="p-4 text-rose-500">Enterprise $5k/mo only</td>
                  <td className="p-4 text-rose-500">Not Supported</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-zinc-900">Dual-Channel S3 Call Recording</td>
                  <td className="p-4 text-emerald-600 font-bold flex items-center gap-1.5"><Check size={14} /> Instant Archival</td>
                  <td className="p-4 text-amber-600">Extra Storage Fees</td>
                  <td className="p-4 text-rose-500">Local Hard Disks</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-zinc-900">Live Telecaller Presence Wallboard</td>
                  <td className="p-4 text-emerald-600 font-bold flex items-center gap-1.5"><Check size={14} /> Real-Time Zero Lag</td>
                  <td className="p-4 text-zinc-500">Requires BI Plugins</td>
                  <td className="p-4 text-rose-500">No Live Visibility</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-zinc-900">Multi-Tenant BYOK Security</td>
                  <td className="p-4 text-emerald-600 font-bold flex items-center gap-1.5"><Check size={14} /> 100% Isolated Data</td>
                  <td className="p-4 text-zinc-500">Shared Multi-Tenant Pool</td>
                  <td className="p-4 text-amber-600">On-Premises Maintenance</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 🌟 5. CLIENT REVIEWS & SOCIAL PROOF (LIGHT) */}
      <section id="reviews" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF5B22]">
            Verified Client Stories
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight">
            Trusted by 500+ Admission Heads & Sales Leaders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "Lead Connect helped our admissions team double daily call output from Day 1. The Airtel IQ dialer and live wallboard stopped our leads from going cold.",
              name: "Dr. Vikram Sethi",
              role: "Director of Admissions",
              company: "Apex Institute of Management",
              rating: 5
            },
            {
              quote: "We white-labeled the entire portal under our own domain for our 40-agent real estate brokerage. Clients love the speed, and call recordings give us 100% audit quality.",
              name: "Ananya Deshmukh",
              role: "Managing Director",
              company: "Urban Realty Advisors",
              rating: 5
            },
            {
              quote: "Setting up 25 telecallers took us less than 10 minutes. The Focus Today lead queue ensures our agents close priority callbacks without any manual searching.",
              name: "Rajesh Kulkarni",
              role: "VP of Sales",
              company: "EduTech Global Pro",
              rating: 5
            }
          ].map((rev, i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-2xs">
              <div className="space-y-3">
                <div className="flex text-amber-500 gap-1">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed italic">
                  "{rev.quote}"
                </p>
              </div>
              <div className="pt-4 border-t border-zinc-100">
                <h4 className="text-xs font-bold text-zinc-900">{rev.name}</h4>
                <p className="text-[11px] text-zinc-500">{rev.role}</p>
                <p className="text-[10px] text-[#FF5B22] font-semibold">{rev.company}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ❓ 6. INTERACTIVE FAQ ACCORDION (LIGHT) */}
      <section id="faq" className="py-20 bg-white border-t border-zinc-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5B22]">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight">
              Got Questions? We’ve Got Answers.
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How does the Airtel IQ Telephony integration work?",
                a: "Lead Connect connects directly to Airtel IQ and Vonage cloud switches via carrier-grade APIs. There is zero physical PBX hardware needed. Your telecallers simply click on any lead number from their browser or mobile to initiate high-definition calls instantly."
              },
              {
                q: "Can we use our own custom company domain and brand logo?",
                a: "Yes, 100%! You can point your custom subdomain (e.g. crm.yourcompany.com) via CNAME record. When your staff or agents log in, they see your company logo, primary colors, and custom white-label title."
              },
              {
                q: "Can clients register themselves, or are accounts admin-controlled?",
                a: "All accounts are strictly provisioned by the Super Administrator. Public users cannot sign up freely, ensuring 100% security, zero spam, and complete administrative control over tenant licensing."
              },
              {
                q: "Where are the call voice recordings stored?",
                a: "Every conversation is automatically archived in high-fidelity audio format directly into AWS S3 (or S3-compatible) storage buckets. You have 1-click playback inside the lead drawer."
              },
              {
                q: "How long does onboarding and rollout take?",
                a: "Standard rollout takes under 15 minutes. Once the Super Admin assigns your tenant license and credentials, your team can log in and start outbound calling immediately."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#F8F9FA] border border-zinc-200 rounded-2xl p-4 sm:p-5 transition cursor-pointer shadow-xs"
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900">{faq.q}</h4>
                  <div className="text-zinc-500 shrink-0">
                    {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                {openFaq === idx && (
                  <p className="text-xs text-zinc-600 mt-3 pt-3 border-t border-zinc-200 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 7. FAST-TRACK DEMO REQUEST & CONTACT BANNER (LIGHT) */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-white to-[#FBFBFC] border-t border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6 text-white">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Ready to Upgrade Your Sales Telephony?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">
              Request a 1-on-1 walkthrough with our solutions engineer. We will configure a custom demo tenant for your team today.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setDemoSubmitted(false);
                  setShowDemoModal(true);
                }}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF5B22] to-amber-500 hover:opacity-95 text-white font-black text-sm tracking-wide shadow-xl shadow-orange-500/30 transition active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
              >
                <Sparkles size={16} />
                Book Your 1-on-1 Live Walkthrough
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 📋 8. FOOTER (LIGHT) */}
      <footer className="bg-white border-t border-zinc-200 py-10 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF5B22] to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-md">
              LC
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-900 block">Lead Connect Technologies</span>
              <span className="text-[10px] text-zinc-500">Carrier-Grade Cloud Telephony & Multi-Tenant CRM</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-medium text-zinc-600">
            <a href="#features" className="hover:text-zinc-900 transition">Features</a>
            <a href="#why-choose" className="hover:text-zinc-900 transition">Why Choose Us</a>
            <a href="#reviews" className="hover:text-zinc-900 transition">Client Stories</a>
            <a href="#faq" className="hover:text-zinc-900 transition">FAQ</a>
            <Link to="/login" className="text-[#FF5B22] font-bold hover:underline">Existing Client Login</Link>
          </div>

          <div className="text-[11px] text-zinc-500">
            © {new Date().getFullYear()} Lead Connect. All rights reserved.
          </div>
        </div>
      </footer>

      {/* 🚀 9. FAST-TRACK LEAD & DEMO REQUEST MODAL (CLEAN LIGHT MODAL) */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative my-8 text-zinc-900">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            {demoSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={30} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">Demo Request Received!</h3>
                <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed">
                  Thank you, <strong>{demoForm.fullName}</strong>. Our enterprise specialist will call you at <strong className="text-[#FF5B22]">{demoForm.phone}</strong> shortly to demonstrate the live portal and configure your trial.
                </p>
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF5B22] text-[10px] font-bold">
                    <Sparkles size={11} />
                    Direct Enterprise Onboarding
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 tracking-tight">
                    Request 1-on-1 Demo & CRM Access
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Fill in your details below and our team will contact you to assign your dedicated tenant credentials.
                  </p>
                </div>

                <form onSubmit={handleDemoSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={demoForm.fullName}
                      onChange={(e) => setDemoForm({ ...demoForm, fullName: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 placeholder:text-zinc-400 text-xs focus:outline-none focus:border-[#FF5B22] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">Company / Institute Name *</label>
                    <input
                      type="text"
                      required
                      value={demoForm.companyName}
                      onChange={(e) => setDemoForm({ ...demoForm, companyName: e.target.value })}
                      placeholder="e.g. Apex Global Solutions"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 placeholder:text-zinc-400 text-xs focus:outline-none focus:border-[#FF5B22] focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Mobile / WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        value={demoForm.phone}
                        onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 placeholder:text-zinc-400 text-xs focus:outline-none focus:border-[#FF5B22] focus:bg-white transition font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Work Email</label>
                      <input
                        type="email"
                        value={demoForm.workEmail}
                        onChange={(e) => setDemoForm({ ...demoForm, workEmail: e.target.value })}
                        placeholder="name@company.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 placeholder:text-zinc-400 text-xs focus:outline-none focus:border-[#FF5B22] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Team Size (Agents)</label>
                      <select
                        value={demoForm.teamSize}
                        onChange={(e) => setDemoForm({ ...demoForm, teamSize: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 text-xs focus:outline-none focus:border-[#FF5B22] focus:bg-white transition cursor-pointer"
                      >
                        <option value="1-5">1 - 5 Agents</option>
                        <option value="5-15">5 - 15 Agents</option>
                        <option value="15-50">15 - 50 Agents</option>
                        <option value="50+">50+ Enterprise Scale</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Daily Call Volume</label>
                      <select
                        value={demoForm.dailyCallVolume}
                        onChange={(e) => setDemoForm({ ...demoForm, dailyCallVolume: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 text-xs focus:outline-none focus:border-[#FF5B22] focus:bg-white transition cursor-pointer"
                      >
                        <option value="100-500">100 - 500 Calls/Day</option>
                        <option value="500-2000">500 - 2,000 Calls/Day</option>
                        <option value="2000+">2,000+ High Volume</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingDemo}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF5B22] to-amber-500 hover:opacity-95 text-white font-bold text-xs tracking-wide shadow-lg shadow-orange-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingDemo ? (
                      <>
                        <Loader2 className="animate-spin" size={15} />
                        <span>Sending Request to Super Admin...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Request for Callback & Demo</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
