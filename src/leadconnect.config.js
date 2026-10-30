/**
 * =========================================================================
 * LEAD CONNECT - MASTER CLIENT & THEME CONFIGURATION
 * =========================================================================
 * When embedding or deploying Lead Connect inside any client or external project,
 * simply adjust this config file. The entire CRM and Forms UI will automatically
 * adapt its colors, fonts, branding, and active feature modules!
 */

export const leadConnectConfig = {
  // 🏢 BRAND IDENTITY
  brandName: "Lead Connect",
  brandTagline: "Enterprise Lead Management CRM & Dynamic Forms",
  logoUrl: "", // URL to client's custom logo image (e.g. "/logo.svg" or "https://...")
  supportEmail: "support@leadconnect.io",

  // 🎨 DYNAMIC THEME & COLOR PALETTE
  // Changing primaryColor transforms all buttons, active badges, tabs, and analytics!
  theme: {
    primaryColor: "#FF5B22", // Vibrant Orange / Warm Tangerine
    primaryHover: "#EA580C",
    accentColor: "#F97316",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    borderRadius: "14px",
    sidebarTheme: "light", // 'dark' | 'light' | 'glass'
  },

  // ⚙️ FEATURE MODULE TOGGLES
  // Enable or disable modules based on client permissions
  features: {
    forms: true,           // Dynamic Forms Builder & Response Viewer
    crm: true,             // Leads Pipeline, Status Board & Focus Today
    tasks: true,           // Follow-up task manager & Reminders
    offers: true,          // Promotional offer banners
    staffReports: true,    // Counselor / Staff performance analytics
    rewards: true,         // Field staff referral & reward tracking
    integrationHub: true,  // Embed codes, iFrame generator & API Snippets
    superAdmin: true,      // Central Multi-Client Management Portal
  },

  // 🔒 DEPLOYMENT & LICENSING
  deployment: {
    mode: "HOSTED_SAAS", // "HOSTED_SAAS" | "SELF_HOSTED" | "EMBEDDED"
    apiUrl: import.meta.env.VITE_API_URL || "",
    licenseKey: import.meta.env.VITE_LICENSE_KEY || "",
  }
};

export default leadConnectConfig;
