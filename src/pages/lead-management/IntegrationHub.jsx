import React, { useState, useEffect } from "react";
import { 
  Code, Copy, Check, ExternalLink, Globe, Sparkles, 
  Terminal, ShieldCheck, Layers, ArrowRight, Laptop, Key, RefreshCw
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { getToken } from "../../context/AppContext";

export default function IntegrationHub() {
  const [activeTab, setActiveTab] = useState("widget");
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#FF5B22");
  const [themeMode, setThemeMode] = useState("light");
  const [widgetHeight, setWidgetHeight] = useState("650px");
  const [copiedKey, setCopiedKey] = useState("");
  const [apiKey, setApiKey] = useState("LC-LIVE-TOKEN-2026");
  const [loading, setLoading] = useState(false);

  const baseUrl = window.location.origin;

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const { data } = await import("../../api/axios_client").then(m => m.default.get("/forms"));
      const formsList = data?.data || data?.forms || [];
      setForms(formsList);
      if (formsList.length > 0) {
        setSelectedFormId(formsList[0]._id);
      }
    } catch (e) {
      console.warn("Could not fetch forms list for integration hub:", e);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedKey(""), 2000);
  };

  // 1. Script Tag Code
  const scriptTagCode = `<!-- Lead Connect Universal Embed Widget -->
<div 
  data-lead-connect-form="${selectedFormId || "FORM_ID"}" 
  data-primary-color="${primaryColor}" 
  data-theme="${themeMode}"
  data-height="${widgetHeight}">
</div>
<script src="${baseUrl}/api/embed/embed.js" async></script>`;

  // 2. Responsive iframe Code
  const iframeCode = `<iframe 
  src="${baseUrl}/forms/view/${selectedFormId || "FORM_ID"}?embed=true&primaryColor=${encodeURIComponent(primaryColor)}&theme=${themeMode}" 
  width="100%" 
  height="${widgetHeight}" 
  frameborder="0" 
  style="border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;"
  allow="camera; microphone; autoplay; encrypted-media;">
</iframe>`;

  // 3. React / Next.js Component Code
  const reactCode = `import React from 'react';

export default function LeadCaptureForm() {
  return (
    <div className="w-full max-w-2xl mx-auto my-6 overflow-hidden rounded-2xl shadow-xl border border-slate-200">
      <iframe
        src="${baseUrl}/forms/view/${selectedFormId || "FORM_ID"}?embed=true&primaryColor=${encodeURIComponent(primaryColor)}&theme=${themeMode}"
        className="w-full h-[${widgetHeight}] border-0"
        title="Lead Connect Form"
      />
    </div>
  );
}`;

  // 4. Headless REST API Code
  const curlApiCode = `curl -X POST "${baseUrl}/api/embed/submit/${selectedFormId || "FORM_ID"}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{
    "respondentName": "John Doe",
    "respondentEmail": "john@example.com",
    "respondentMobile": "+91 9876543210",
    "source": "Custom Website",
    "answers": []
  }'`;

  const nodeApiCode = `// Direct Lead Submission from Node.js / Next.js API route
import axios from 'axios';

const captureLead = async (leadData) => {
  const response = await axios.post('${baseUrl}/api/embed/submit/${selectedFormId || "FORM_ID"}', {
    respondentName: leadData.name,
    respondentEmail: leadData.email,
    respondentMobile: leadData.phone,
    source: 'Website Landing Page'
  }, {
    headers: {
      'x-api-key': '${apiKey}'
    }
  });
  return response.data;
};`;

  const presetColors = [
    { label: "Orange", hex: "#FF5B22" },
    { label: "Amber", hex: "#EA580C" },
    { label: "Emerald", hex: "#059669" },
    { label: "Purple", hex: "#7c3aed" },
    { label: "Dark Slate", hex: "#0f172a" },
    { label: "Rose", hex: "#e11d48" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 p-8 text-white shadow-2xl border border-orange-500/20">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5B22]/20 border border-[#FF5B22]/40 text-orange-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} />
            Seamless Integration
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Integration Hub & Embed Generator
          </h1>
          <p className="text-orange-100/80 max-w-2xl text-sm leading-relaxed">
            Integrate Lead Connect forms and CRM into <strong>any client website, WordPress, React, Next.js, or mobile app</strong> in under 2 minutes. Customize brand colors, set theme modes, and manage API keys effortlessly.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 bg-[#FF5B22]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Theme Customizer */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Layers className="text-[#FF5B22]" size={20} />
            Form & Theme Customizer
          </h2>

          {/* Form Picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Select Form
            </label>
            {forms.length > 0 ? (
              <select
                value={selectedFormId}
                onChange={(e) => setSelectedFormId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm text-gray-800 transition"
              >
                {forms.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.title || "Untitled Form"} ({f._id.slice(-6)})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-200">
                No active forms found. Please create a form first in the Forms tab.
              </div>
            )}
          </div>

          {/* Theme Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Brand Primary Color
            </label>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-xl border border-gray-300 cursor-pointer p-0.5 bg-white"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono uppercase bg-gray-50"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presetColors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setPrimaryColor(c.hex)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 hover:border-gray-400 transition cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Mode */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Theme Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setThemeMode("light")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  themeMode === "light"
                    ? "border-[#FF5B22] bg-orange-50 text-orange-700 font-bold"
                    : "border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                ☀️ Light Mode
              </button>
              <button
                onClick={() => setThemeMode("dark")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  themeMode === "dark"
                    ? "border-[#FF5B22] bg-orange-50 text-orange-700 font-bold"
                    : "border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                🌙 Dark Mode
              </button>
            </div>
          </div>

          {/* Height */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Embed Height
            </label>
            <input
              type="text"
              value={widgetHeight}
              onChange={(e) => setWidgetHeight(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-gray-50"
              placeholder="e.g. 650px or 100%"
            />
          </div>

          {/* Direct Form Preview Link */}
          {selectedFormId && (
            <a
              href={`${baseUrl}/forms/view/${selectedFormId}?primaryColor=${encodeURIComponent(primaryColor)}&theme=${themeMode}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
            >
              <ExternalLink size={15} />
              Open Form in New Tab
            </a>
          )}
        </div>

        {/* Right Column: Code Generator Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 gap-2 overflow-x-auto custom-scrollbar">
            {[
              { id: "widget", label: "1-Line Embed Script", icon: Code },
              { id: "iframe", label: "Responsive iFrame", icon: Globe },
              { id: "react", label: "React / Next.js", icon: Laptop },
              { id: "api", label: "Headless REST API", icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? "border-[#FF5B22] text-[#FF5B22] bg-orange-50/50 rounded-t-xl"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Embed Script */}
          {activeTab === "widget" && (
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Universal JavaScript Widget</h3>
                  <p className="text-xs text-slate-400">
                    Paste this snippet anywhere in your HTML, WordPress page, Webflow, or Shopify store.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(scriptTagCode, "widget")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FF5B22] hover:bg-[#EA580C] text-white transition cursor-pointer"
                >
                  {copiedKey === "widget" ? <Check size={14} /> : <Copy size={14} />}
                  {copiedKey === "widget" ? "Copied" : "Copy Code"}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-orange-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 custom-scrollbar">
                {scriptTagCode}
              </pre>

              <div className="text-xs text-slate-400 space-y-1">
                <p>⚡ <strong>Automatic Form Rendering</strong>: The script auto-initializes and renders smoothly.</p>
                <p>🎨 <strong>Brand Adaptation</strong>: Inherits your chosen color and theme automatically.</p>
              </div>
            </div>
          )}

          {/* Tab 2: iFrame */}
          {activeTab === "iframe" && (
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Standard HTML iFrame</h3>
                  <p className="text-xs text-slate-400">
                    Direct iframe embed with responsive styling and zero dependencies.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(iframeCode, "iframe")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FF5B22] hover:bg-[#EA580C] text-white transition cursor-pointer"
                >
                  {copiedKey === "iframe" ? <Check size={14} /> : <Copy size={14} />}
                  {copiedKey === "iframe" ? "Copied" : "Copy Code"}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 custom-scrollbar">
                {iframeCode}
              </pre>
            </div>
          )}

          {/* Tab 3: React / Next.js */}
          {activeTab === "react" && (
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">React / Next.js Component</h3>
                  <p className="text-xs text-slate-400">
                    Ready-to-use JSX component for modern web applications.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(reactCode, "react")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FF5B22] hover:bg-[#EA580C] text-white transition cursor-pointer"
                >
                  {copiedKey === "react" ? <Check size={14} /> : <Copy size={14} />}
                  {copiedKey === "react" ? "Copied" : "Copy Code"}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 custom-scrollbar">
                {reactCode}
              </pre>
            </div>
          )}

          {/* Tab 4: Headless REST API */}
          {activeTab === "api" && (
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Headless REST API Ingestion</h3>
                  <p className="text-xs text-slate-400">
                    Submit leads directly from your own custom UI, Flutter app, or server backend.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(curlApiCode, "curl")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FF5B22] hover:bg-[#EA580C] text-white transition cursor-pointer"
                >
                  {copiedKey === "curl" ? <Check size={14} /> : <Copy size={14} />}
                  {copiedKey === "curl" ? "Copied cURL" : "Copy cURL"}
                </button>
              </div>

              <div className="space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">cURL Command</span>
                <pre className="p-4 rounded-xl bg-slate-950 text-amber-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 custom-scrollbar">
                  {curlApiCode}
                </pre>
              </div>

              <div className="space-y-3">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Node.js / Axios Sample</span>
                <pre className="p-4 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 custom-scrollbar">
                  {nodeApiCode}
                </pre>
              </div>
            </div>
          )}

          {/* Security & White-label Info Card */}
          <div className="rounded-2xl p-5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-[#FF5B22] text-white shadow-md">
              <ShieldCheck size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-950">White-Label & Central License Protection</h4>
              <p className="text-xs text-gray-700/80 leading-relaxed">
                All embedded submissions and forms are verified in real-time. If the client's subscription expires or is suspended in your Super Admin panel, forms will gracefully display an inactive notice automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
