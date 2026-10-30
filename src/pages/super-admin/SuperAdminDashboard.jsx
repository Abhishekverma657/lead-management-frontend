import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Users, UserPlus, CheckCircle2, XCircle, Clock, 
  Search, RefreshCw, Copy, Check, AlertCircle, Plus, Calendar, Trash2,
  Edit2, Key, CreditCard, ShieldCheck, Settings, MessageSquare, Smartphone,
  PhoneCall, Cloud, Sliders, Shield, Zap, CheckCircle, Eye, EyeOff,
  Palette, LayoutDashboard, Server, BarChart3, Globe, ExternalLink, Sparkles, Building2, Paintbrush, ArrowUpRight,
  UploadCloud, Image as ImageIcon, X, FileUp, Loader2, Bell, Flame, ListTodo, Radio, FileText, Lock
} from "lucide-react";
import { toast } from "react-hot-toast";
import axiosClient from "../../api/axios_client";

export default function SuperAdminDashboard({ tab: defaultTab }) {
  const location = useLocation();
  const navigate = useNavigate();
  const logoFileInputRef = useRef(null);

  const getTabFromPath = () => {
    if (defaultTab) return defaultTab;
    if (location.pathname.includes("/tenants")) return "tenants";
    if (location.pathname.includes("/branding")) return "branding";
    if (location.pathname.includes("/platform-apis")) return "platform_apis";
    return "overview";
  };

  const [activeViewTab, setActiveViewTab] = useState(getTabFromPath());

  useEffect(() => {
    setActiveViewTab(getTabFromPath());
  }, [location.pathname, defaultTab]);
  const [stats, setStats] = useState(null);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedKey, setCopiedKey] = useState("");

  // Branding Hub State
  const [selectedBrandingTenantId, setSelectedBrandingTenantId] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [brandingConfig, setBrandingConfig] = useState({
    companyName: "Lead Connect",
    primaryColor: "#FF5B22",
    accentColor: "#F59E0B",
    logoUrl: "",
    customDomain: "",
    supportEmail: "",
    supportPhone: "",
  });
  const [savingBranding, setSavingBranding] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  // Extend Modal State
  const [daysToAdd, setDaysToAdd] = useState(30);
  const [customExtendDate, setCustomExtendDate] = useState("");

  // Integrations Hub State
  const [activeIntegrationTab, setActiveIntegrationTab] = useState("telephony");
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
  const [testingTelephony, setTestingTelephony] = useState(false);
  const [telephonyTestResult, setTelephonyTestResult] = useState(null);
  const [showSecrets, setShowSecrets] = useState({});

  const toggleSecret = (key) => setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));

  const [integrationsForm, setIntegrationsForm] = useState({
    telephony: {
      useDefault: true,
      provider: "AIRTEL_IQ",
      isEnabled: true,
      accountId: "",
      tokenUrl: "https://api.vonage.com/token",
      apiUrl: "https://api.vonage.com/t",
      apiEnv: "vbc.prod",
      username: "",
      password: "",
      provisionClientId: "",
      provisionClientSecret: "",
      telephonyClientId: "",
      telephonyClientSecret: "",
      recordingClientId: "",
      recordingClientSecret: "",
      reportsClientId: "",
      reportsClientSecret: "",
      pilotNumber: ""
    },
    paymentGateway: {
      useDefault: true,
      provider: "RAZORPAY",
      keyId: "",
      keySecret: "",
      webhookSecret: "",
      isEnabled: false
    },
    storage: {
      useDefault: true,
      provider: "AWS_S3",
      bucketName: "",
      region: "ap-south-1",
      accessKeyId: "",
      secretAccessKey: "",
      isEnabled: true
    },
    smsGateway: {
      useDefault: true,
      customApiUrl: "",
      senderId: "",
      apiKey: "",
      templateId: "",
      peId: ""
    }
  });

  // Master Platform Defaults State
  const [platformDefaults, setPlatformDefaults] = useState(null);
  const [loadingPlatformDefaults, setLoadingPlatformDefaults] = useState(false);
  const [showEditPlatformModal, setShowEditPlatformModal] = useState(false);
  const [activePlatformEditTab, setActivePlatformEditTab] = useState("telephony");
  const [savingPlatformDefaults, setSavingPlatformDefaults] = useState(false);
  const [testingMasterTelephony, setTestingMasterTelephony] = useState(false);
  const [masterTelephonyTestResult, setMasterTelephonyTestResult] = useState(null);
  const [showMasterSecrets, setShowMasterSecrets] = useState({});

  const toggleMasterSecret = (key) => {
    setShowMasterSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [editPlatformForm, setEditPlatformForm] = useState({
    telephony: {
      provider: "AIRTEL_IQ",
      tokenUrl: "https://api.vonage.com/token",
      apiUrl: "https://api.vonage.com/t",
      apiEnv: "vbc.prod",
      accountId: "3381014",
      pilotNumber: "+911140038800",
      username: "",
      password: "",
      provisionClientId: "",
      provisionClientSecret: "",
      telephonyClientId: "",
      telephonyClientSecret: "",
      recordingClientId: "",
      recordingClientSecret: "",
      reportsClientId: "",
      reportsClientSecret: "",
      status: "MASTER_ACTIVE"
    },
    storage: {
      provider: "AWS_S3",
      bucket: "node-media",
      region: "eu-central-1",
      endpoint: "https://s3.eu-central-1.s4.mega.io",
      accountId: "biijszzsfufvateaffbvtjapmculhceod7agr",
      accessKeyId: "",
      secretAccessKey: "",
      status: "CONNECTED"
    },
    paymentGateway: {
      provider: "RAZORPAY",
      razorpayKeyId: "rzp_live_masterKey",
      razorpayKeySecret: "",
      webhookSecret: "",
      isEnabled: true,
      mode: "Platform Central Fee Collection",
      status: "READY"
    },
    smsGateway: {
      provider: "BULKSENDERS",
      senderId: "LDCONN",
      apiKey: "",
      peId: "1701159123456789012",
      templateId: "1707161234567890123",
      apiUrl: "https://api.bulksenders.in/v1/sms/send",
      status: "DLT_APPROVED"
    }
  });

  const handleCopyText = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const fetchPlatformDefaults = async () => {
    try {
      setLoadingPlatformDefaults(true);
      const res = await axiosClient.get("/super-admin/platform-defaults");
      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        setPlatformDefaults(d);
        setEditPlatformForm({
          telephony: {
            provider: d.telephony?.provider || "AIRTEL_IQ",
            tokenUrl: d.telephony?.tokenUrl || "https://api.vonage.com/token",
            apiUrl: d.telephony?.apiUrl || "https://api.vonage.com/t",
            apiEnv: d.telephony?.apiEnv || "vbc.prod",
            accountId: d.telephony?.accountId || "",
            pilotNumber: d.telephony?.pilotNumber || "",
            username: d.telephony?.username || "",
            password: d.telephony?.password || "",
            provisionClientId: d.telephony?.provisionClientId || "",
            provisionClientSecret: d.telephony?.provisionClientSecret || "",
            telephonyClientId: d.telephony?.telephonyClientId || "",
            telephonyClientSecret: d.telephony?.telephonyClientSecret || "",
            recordingClientId: d.telephony?.recordingClientId || "",
            recordingClientSecret: d.telephony?.recordingClientSecret || "",
            reportsClientId: d.telephony?.reportsClientId || "",
            reportsClientSecret: d.telephony?.reportsClientSecret || "",
            status: d.telephony?.status || "MASTER_ACTIVE"
          },
          storage: {
            provider: d.storage?.provider || "AWS_S3",
            bucket: d.storage?.bucket || "",
            region: d.storage?.region || "ap-south-1",
            endpoint: d.storage?.endpoint || "",
            accountId: d.storage?.accountId || "",
            accessKeyId: d.storage?.accessKeyId || "",
            secretAccessKey: d.storage?.secretAccessKey || "",
            status: d.storage?.status || "CONNECTED"
          },
          paymentGateway: {
            provider: d.paymentGateway?.provider || "RAZORPAY",
            razorpayKeyId: d.paymentGateway?.razorpayKeyId || "",
            razorpayKeySecret: d.paymentGateway?.razorpayKeySecret || "",
            webhookSecret: d.paymentGateway?.webhookSecret || "",
            isEnabled: d.paymentGateway?.isEnabled !== false,
            mode: d.paymentGateway?.mode || "Platform Central Fee Collection",
            status: d.paymentGateway?.status || "READY"
          },
          smsGateway: {
            provider: d.smsGateway?.provider || "BULKSENDERS",
            senderId: d.smsGateway?.senderId || "",
            apiKey: d.smsGateway?.apiKey || "",
            peId: d.smsGateway?.peId || "",
            templateId: d.smsGateway?.templateId || "",
            apiUrl: d.smsGateway?.apiUrl || "https://api.bulksenders.in/v1/sms/send",
            status: d.smsGateway?.status || "DLT_APPROVED"
          }
        });
      }
    } catch (error) {
      console.error("Failed to load platform defaults:", error);
    } finally {
      setLoadingPlatformDefaults(false);
    }
  };

  const handleSavePlatformDefaults = async (e) => {
    if (e) e.preventDefault();
    try {
      setSavingPlatformDefaults(true);
      const res = await axiosClient.put("/super-admin/platform-defaults", editPlatformForm);
      if (res.data?.success) {
        toast.success("Master Platform Defaults updated successfully!");
        setPlatformDefaults(res.data.data);
        setShowEditPlatformModal(false);
      } else {
        toast.error(res.data?.message || "Failed to update platform defaults");
      }
    } catch (error) {
      console.error("Save Platform Defaults Error:", error);
      toast.error(error.response?.data?.message || "Failed to update platform defaults");
    } finally {
      setSavingPlatformDefaults(false);
    }
  };

  const handleTestMasterTelephony = async () => {
    try {
      setTestingMasterTelephony(true);
      setMasterTelephonyTestResult(null);
      const payload = editPlatformForm.telephony;
      const res = await axiosClient.post("/super-admin/platform-defaults/test-telephony", payload);
      if (res.data?.success) {
        setMasterTelephonyTestResult({ success: true, message: res.data.message });
        toast.success(res.data.message || "Airtel IQ Master Connection Verified!");
      } else {
        setMasterTelephonyTestResult({ success: false, message: res.data.message || "Verification failed" });
        toast.error(res.data.message || "Verification failed");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Connection test failed";
      setMasterTelephonyTestResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setTestingMasterTelephony(false);
    }
  };

  // Create Form State
  const [formData, setFormData] = useState({
    name: "",
    adminEmail: "",
    adminPassword: "",
    contactPersonName: "",
    contactPersonPhone: "",
    plan: "PRO",
    validDays: 30,
    primaryColor: "#2563eb",
    logoUrl: "",
    deploymentType: "HOSTED_SAAS",
    maxLeads: 10000,
    maxForms: 50,
    telephonyType: "default", // "default" | "custom"
    telephonyAccountId: "",
    telephonyClientId: "",
    telephonyClientSecret: "",
    telephonyUsername: "",
    telephonyPassword: "",
    telephonyPilotNumber: "",
    razorpayType: "default",
    razorpayKeyId: "",
    razorpayKeySecret: "",
    smsGatewayType: "default", // "default" | "custom"
    customSmsApiUrl: "",
    features: {
      forms: true,
      crm: true,
      staffManagement: true,
      offers: true,
      tasks: true,
      exportData: true,
      webhooks: true,
      apiAccess: true,
    }
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    name: "",
    adminEmail: "",
    plan: "PRO",
    status: "ACTIVE",
    maxLeads: 10000,
    maxForms: 50,
    notes: "",
  });

  // Incoming Landing Page Inquiries / Demo Requests
  const [demoRequests, setDemoRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [statusFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await axiosClient.get("/super-admin/stats");
      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
        setExpiringSoon(statsRes.data.expiringSoon || []);
      }

      const tenantsRes = await axiosClient.get(`/super-admin/tenants?status=${statusFilter}`);
      if (tenantsRes.data?.success) {
        setTenants(tenantsRes.data.tenants || []);
      }

      try {
        const demoRes = await axiosClient.get("/super-admin/demo-requests");
        if (demoRes.data?.success) {
          setDemoRequests(demoRes.data.data || []);
        }
      } catch (e) {
        console.error("Failed to load demo requests:", e);
      }

      fetchPlatformDefaults();
    } catch (error) {
      console.error("Super Admin Data Fetch Error:", error);
      toast.error(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeViewTab === "platform_apis" && !platformDefaults) {
      fetchPlatformDefaults();
    }
  }, [activeViewTab]);

  useEffect(() => {
    if (tenants.length > 0) {
      const activeId = selectedBrandingTenantId || tenants[0]._id;
      const targetTenant = tenants.find(t => t._id === activeId) || tenants[0];
      if (targetTenant) {
        if (!selectedBrandingTenantId) {
          setSelectedBrandingTenantId(targetTenant._id);
        }
        setBrandingConfig({
          companyName: targetTenant.branding?.companyName || targetTenant.name || "Lead Connect",
          primaryColor: targetTenant.branding?.primaryColor || "#FF5B22",
          accentColor: targetTenant.branding?.accentColor || "#F59E0B",
          logoUrl: targetTenant.branding?.logoUrl || "",
          customDomain: targetTenant.branding?.customDomain || "",
          supportEmail: targetTenant.branding?.supportEmail || targetTenant.adminEmail || "",
          supportPhone: targetTenant.branding?.supportPhone || "",
        });
      }
    }
  }, [tenants]);

  const handleSelectBrandingTenant = (tenantId) => {
    setSelectedBrandingTenantId(tenantId);
    const targetTenant = tenants.find(t => t._id === tenantId);
    if (targetTenant) {
      setBrandingConfig({
        companyName: targetTenant.branding?.companyName || targetTenant.name || "Lead Connect",
        primaryColor: targetTenant.branding?.primaryColor || "#FF5B22",
        accentColor: targetTenant.branding?.accentColor || "#F59E0B",
        logoUrl: targetTenant.branding?.logoUrl || "",
        customDomain: targetTenant.branding?.customDomain || "",
        supportEmail: targetTenant.branding?.supportEmail || targetTenant.adminEmail || "",
        supportPhone: targetTenant.branding?.supportPhone || "",
      });
    }
  };

  const handleLogoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, SVG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo file size must be less than 5MB");
      return;
    }

    setUploadingLogo(true);
    const loadingToast = toast.loading("Uploading client logo from system...");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;
        try {
          const res = await axiosClient.post("/super-admin/upload-logo", {
            image: base64Data
          });

          if (res.data?.success && res.data.url) {
            setBrandingConfig(prev => ({
              ...prev,
              logoUrl: res.data.url
            }));
            toast.success("Logo uploaded successfully from device!", { id: loadingToast });
          } else {
            toast.error("Failed to upload logo", { id: loadingToast });
          }
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to upload logo", { id: loadingToast });
        } finally {
          setUploadingLogo(false);
          if (logoFileInputRef.current) logoFileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to read file from system", { id: loadingToast });
      setUploadingLogo(false);
    }
  };

  const handleResetToDefaultTheme = () => {
    const targetTenant = tenants.find(t => t._id === selectedBrandingTenantId);
    setBrandingConfig({
      companyName: targetTenant?.name || "Lead Connect",
      primaryColor: "#FF5B22",
      accentColor: "#F59E0B",
      logoUrl: "",
      customDomain: "",
      supportEmail: targetTenant?.adminEmail || "",
      supportPhone: "",
    });
    toast.success("Theme reset to LeadConnect Default (Signature Orange). Click 'Save & Deploy' to apply.");
  };

  const handleSaveBranding = async (e) => {
    if (e) e.preventDefault();
    if (!selectedBrandingTenantId) {
      toast.error("Please select a client organization");
      return;
    }

    setSavingBranding(true);
    const loadingToast = toast.loading("Deploying live branding & theme...");
    try {
      const res = await axiosClient.put(`/super-admin/tenants/${selectedBrandingTenantId}`, {
        branding: brandingConfig
      });
      if (res.data?.success) {
        toast.success("Client branding updated & live deployed!", { id: loadingToast });
        setTenants(prev => prev.map(t => t._id === selectedBrandingTenantId ? { ...t, branding: brandingConfig } : t));
        fetchDashboardData();
      } else {
        toast.error("Failed to update branding", { id: loadingToast });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update branding", { id: loadingToast });
    } finally {
      setSavingBranding(false);
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post("/super-admin/tenants", {
        name: formData.name,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword || undefined,
        plan: formData.plan,
        validDays: formData.validDays,
        branding: {
          companyName: formData.name,
          primaryColor: "#2563eb",
          logoUrl: "",
        },
        limits: {
          maxLeads: formData.maxLeads || 10000,
          maxForms: formData.maxForms || 50,
        },
        deploymentType: "HOSTED_SAAS",
        features: {
          forms: true,
          crm: true,
          staffManagement: true,
          offers: true,
          tasks: true,
          exportData: true,
          webhooks: true,
          apiAccess: true,
        }
      });

      if (res.data?.success) {
        toast.success(`Client "${formData.name}" created successfully`);
        setShowCreateModal(false);
        fetchDashboardData();
        setFormData({
          name: "",
          adminEmail: "",
          adminPassword: "",
          contactPersonName: "",
          contactPersonPhone: "",
          plan: "PRO",
          validDays: 30,
          primaryColor: "#2563eb",
          logoUrl: "",
          deploymentType: "HOSTED_SAAS",
          maxLeads: 10000,
          maxForms: 50,
          features: {
            forms: true,
            crm: true,
            staffManagement: true,
            offers: true,
            tasks: true,
            exportData: true,
            webhooks: true,
            apiAccess: true,
          }
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create client tenant");
    }
  };

  const openEditModal = (tenant) => {
    setSelectedTenant(tenant);
    setEditFormData({
      name: tenant.name || "",
      adminEmail: tenant.adminEmail || "",
      plan: tenant.plan || "PRO",
      status: tenant.status || "ACTIVE",
      maxLeads: tenant.limits?.maxLeads || 10000,
      maxForms: tenant.limits?.maxForms || 50,
      notes: tenant.notes || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateTenant = async (e) => {
    e.preventDefault();
    if (!selectedTenant) return;

    try {
      const res = await axiosClient.put(`/super-admin/tenants/${selectedTenant._id}`, {
        name: editFormData.name,
        plan: editFormData.plan,
        status: editFormData.status,
        limits: {
          maxLeads: editFormData.maxLeads,
          maxForms: editFormData.maxForms,
        },
        notes: editFormData.notes,
      });

      if (res.data?.success) {
        toast.success(`Client "${editFormData.name}" updated successfully`);
        setShowEditModal(false);
        setSelectedTenant(null);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update client");
    }
  };

  // Open Dedicated Integrations Hub Modal
  const openIntegrationsModal = async (tenant) => {
    setSelectedTenant(tenant);
    setShowIntegrationsModal(true);
    setTelephonyTestResult(null);
    setLoadingIntegrations(true);

    try {
      const res = await axiosClient.get(`/super-admin/tenants/${tenant._id}/integrations`);
      if (res.data?.success) {
        setIntegrationsForm({
          telephony: {
            ...res.data.telephony,
            password: res.data.telephony.passwordMasked || "",
            provisionClientSecret: res.data.telephony.provisionClientSecretMasked || "",
            telephonyClientSecret: res.data.telephony.telephonyClientSecretMasked || res.data.telephony.clientSecretMasked || "",
            recordingClientSecret: res.data.telephony.recordingClientSecretMasked || "",
            reportsClientSecret: res.data.telephony.reportsClientSecretMasked || ""
          },
          paymentGateway: {
            ...res.data.paymentGateway,
            keySecret: res.data.paymentGateway.keySecretMasked || "",
            webhookSecret: res.data.paymentGateway.webhookSecretMasked || ""
          },
          storage: {
            ...res.data.storage,
            secretAccessKey: res.data.storage.secretAccessKeyMasked || ""
          },
          smsGateway: {
            ...res.data.smsGateway,
            apiKey: res.data.smsGateway.apiKeyMasked || ""
          }
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load integrations");
    } finally {
      setLoadingIntegrations(false);
    }
  };

  const handleSaveIntegrations = async (e) => {
    e.preventDefault();
    if (!selectedTenant) return;

    try {
      const res = await axiosClient.put(`/super-admin/tenants/${selectedTenant._id}/integrations`, integrationsForm);
      if (res.data?.success) {
        toast.success(`Integrations updated for ${selectedTenant.name}`);
        setShowIntegrationsModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update integrations");
    }
  };

  const handleTestTelephony = async () => {
    if (!selectedTenant) return;
    setTestingTelephony(true);
    setTelephonyTestResult(null);
    try {
      const isCustom = !integrationsForm.telephony.useDefault;
      let res;
      if (isCustom) {
        res = await axiosClient.post(`/super-admin/tenants/direct/integrations/test-telephony`, {
          accountId: integrationsForm.telephony.accountId,
          username: integrationsForm.telephony.username,
          password: integrationsForm.telephony.password,
          tokenUrl: integrationsForm.telephony.tokenUrl,
          apiUrl: integrationsForm.telephony.apiUrl,
          apiEnv: integrationsForm.telephony.apiEnv,
          provisionClientId: integrationsForm.telephony.provisionClientId,
          provisionClientSecret: integrationsForm.telephony.provisionClientSecret,
          telephonyClientId: integrationsForm.telephony.telephonyClientId,
          telephonyClientSecret: integrationsForm.telephony.telephonyClientSecret,
          recordingClientId: integrationsForm.telephony.recordingClientId,
          recordingClientSecret: integrationsForm.telephony.recordingClientSecret,
          reportsClientId: integrationsForm.telephony.reportsClientId,
          reportsClientSecret: integrationsForm.telephony.reportsClientSecret
        });
      } else {
        res = await axiosClient.post(`/super-admin/tenants/${selectedTenant._id}/integrations/test-telephony`);
      }

      if (res.data?.success) {
        setTelephonyTestResult({ success: true, message: res.data.message });
        toast.success("Airtel IQ connection verified!");
      }
    } catch (err) {
      setTelephonyTestResult({ success: false, message: err.response?.data?.message || err.message });
      toast.error(err.response?.data?.message || "Connection verification failed");
    } finally {
      setTestingTelephony(false);
    }
  };

  const handleExtendValidity = async () => {
    if (!selectedTenant) return;
    try {
      const res = await axiosClient.post(`/super-admin/tenants/${selectedTenant._id}/extend-validity`, {
        days: customExtendDate ? undefined : daysToAdd,
        newValidDate: customExtendDate || undefined,
      });
      if (res.data?.success) {
        toast.success(`Validity extended for ${selectedTenant.name}`);
        setShowExtendModal(false);
        setSelectedTenant(null);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to extend validity");
    }
  };

  const handleToggleStatus = async (tenant) => {
    const nextStatus = tenant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await axiosClient.post(`/super-admin/tenants/${tenant._id}/toggle-status`, {
        status: nextStatus,
      });
      if (res.data?.success) {
        toast.success(`Client status updated to ${nextStatus}`);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error("Failed to change client status");
    }
  };

  const handleDeleteTenant = async (tenant) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${tenant.name}"?\n\nThis will purge all their forms, leads, and drop their dedicated tenant database. This action CANNOT be undone.`
    );
    if (!confirmDelete) return;

    const loadingToast = toast.loading(`Deleting client ${tenant.name}...`);
    try {
      const res = await axiosClient.delete(`/super-admin/tenants/${tenant._id}`);
      if (res.data?.success) {
        toast.success(`Tenant ${tenant.name} & Database deleted successfully!`, { id: loadingToast });
        fetchDashboardData();
      } else {
        toast.error(res.data?.message || "Failed to delete tenant", { id: loadingToast });
      }
    } catch (error) {
      console.error("Delete Tenant Error:", error);
      toast.error(error.response?.data?.message || "Failed to delete tenant", { id: loadingToast });
    }
  };

  const filteredTenants = tenants.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.adminEmail?.toLowerCase().includes(q) ||
      t.licenseKey?.toLowerCase().includes(q)
    );
  });

  const getInitials = (name) => {
    if (!name) return "CL";
    const parts = name.trim().split(" ");
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-zinc-900">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Lead Connect Master Control Center
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Enterprise central command for client licensing, dynamic Airtel IQ telephony, custom white-label branding, and payment gateways.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-600 transition cursor-pointer"
            title="Refresh All Data"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-[#FF5B22]" : ""} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-sm transition active:scale-[0.99] cursor-pointer"
          >
            <Plus size={15} />
            Create New Client
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📊 TAB 1: EXECUTIVE OVERVIEW & ANALYTICS                                   */}
      {/* ========================================================================= */}
      {activeViewTab === "overview" && (
        <div className="space-y-6">
          {/* Primary KPI Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-2xs space-y-2 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="w-16 h-3 bg-zinc-200 rounded"></div>
                    <div className="w-4 h-4 bg-zinc-200 rounded-full"></div>
                  </div>
                  <div className="w-10 h-7 bg-zinc-200 rounded-md"></div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-medium text-zinc-500">Total Clients</span>
                    <Users size={16} />
                  </div>
                  <div className="text-2xl font-bold text-zinc-900 tracking-tight">
                    {stats?.totalTenants || tenants.length}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                    <span>🏢 Organizations on platform</span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-emerald-500 mb-2">
                    <span className="text-xs font-medium text-zinc-500">Active Licenses</span>
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 tracking-tight">
                    {stats?.activeTenants || tenants.filter(t => t.status === "ACTIVE").length}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>100% operational</span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-rose-500 mb-2">
                    <span className="text-xs font-medium text-zinc-500">Expired</span>
                    <XCircle size={16} />
                  </div>
                  <div className="text-2xl font-bold text-rose-600 tracking-tight">
                    {stats?.expiredTenants || 0}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    <span>Requires validity extension</span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-amber-500 mb-2">
                    <span className="text-xs font-medium text-zinc-500">Suspended</span>
                    <Clock size={16} />
                  </div>
                  <div className="text-2xl font-bold text-amber-600 tracking-tight">
                    {stats?.suspendedTenants || 0}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    <span>Access blocked</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Analytics Visuals Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Plan Distribution Progress Widget */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#FF5B22]" />
                  Subscription Tier Distribution
                </h3>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Live Plans</span>
              </div>

              <div className="space-y-3">
                {[
                  { name: "ENTERPRISE", color: "bg-purple-500", count: tenants.filter(t => t.plan === "ENTERPRISE").length },
                  { name: "PRO", color: "bg-[#FF5B22]", count: tenants.filter(t => t.plan === "PRO" || !t.plan).length },
                  { name: "GROWTH", color: "bg-blue-500", count: tenants.filter(t => t.plan === "GROWTH").length },
                  { name: "STARTER", color: "bg-emerald-500", count: tenants.filter(t => t.plan === "STARTER" || t.plan === "TRIAL").length },
                ].map((tier) => {
                  const pct = tenants.length > 0 ? Math.round((tier.count / tenants.length) * 100) : 0;
                  return (
                    <div key={tier.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-zinc-700">{tier.name}</span>
                        <span className="text-zinc-500 font-medium">{tier.count} clients ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${tier.color} transition-all duration-500`}
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Telephony BYOK vs Default Switch Split */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <PhoneCall size={16} className="text-[#FF5B22]" />
                  Telephony Infrastructure Split
                </h3>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Airtel IQ</span>
              </div>

              <div className="space-y-3.5">
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Zap size={13} className="text-emerald-600" /> Platform Default Switch
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {tenants.filter(t => t.telephony?.useDefault !== false).length}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Using central Airtel IQ master credentials from .env
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-orange-50/80 border border-orange-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                      <PhoneCall size={13} className="text-[#FF5B22]" /> Custom BYOK Accounts
                    </span>
                    <span className="text-xs font-bold text-[#FF5B22]">
                      {tenants.filter(t => t.telephony?.useDefault === false).length}
                    </span>
                  </div>
                  <p className="text-[11px] text-orange-700">
                    Dedicated client Vonage/Airtel sub-account IDs
                  </p>
                </div>
              </div>
            </div>

            {/* System Health Status */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Server size={16} className="text-emerald-600" />
                  Live Platform Health
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                  ALL OPERATIONAL
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-zinc-600 font-medium flex items-center gap-1.5">
                    <PhoneCall size={13} className="text-[#FF5B22]" /> Airtel IQ Switch
                  </span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={13} /> Online
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-zinc-600 font-medium flex items-center gap-1.5">
                    <Cloud size={13} className="text-blue-500" /> AWS S3 Storage
                  </span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={13} /> ap-south-1
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-zinc-600 font-medium flex items-center gap-1.5">
                    <CreditCard size={13} className="text-purple-500" /> Razorpay Gateway
                  </span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={13} /> Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Incoming Landing Page Demo Requests & Leads */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5B22] animate-pulse" />
                  <h3 className="text-sm font-bold text-zinc-900">
                    Incoming Landing Page Inquiries & Demo Requests
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-[#FF5B22]">
                    {demoRequests.length} New Inquiries
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  High-intent prospects who requested custom walkthroughs and CRM credentials from your landing page.
                </p>
              </div>
            </div>

            {demoRequests.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-400">
                No new demo requests yet. Submissions from the public landing page will display here in real-time.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-700 min-w-[650px]">
                  <thead className="bg-zinc-50 text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-100">
                    <tr>
                      <th className="p-3">Prospect & Company</th>
                      <th className="p-3">Phone / WhatsApp</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Team Size</th>
                      <th className="p-3">Call Volume</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {demoRequests.slice(0, 10).map((req) => (
                      <tr key={req._id} className="hover:bg-zinc-50/80 transition">
                        <td className="p-3">
                          <div className="font-bold text-zinc-900">{req.fullName}</div>
                          <div className="text-[11px] text-zinc-500">{req.companyName}</div>
                        </td>
                        <td className="p-3 font-mono font-semibold text-zinc-900">
                          {req.phone}
                        </td>
                        <td className="p-3 text-zinc-600">
                          {req.workEmail || "—"}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700">
                            {req.teamSize || "1-10"}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-600">
                          {req.dailyCallVolume || "100-500"}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setFormData({
                                ...formData,
                                name: req.companyName || req.fullName,
                                adminEmail: req.workEmail && !req.workEmail.includes("inquiry.leadconnect") ? req.workEmail : "",
                                contactPersonName: req.fullName,
                                contactPersonPhone: req.phone,
                              });
                              setShowCreateModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold shadow-2xs transition cursor-pointer"
                          >
                            + Onboard Client
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Launcher Banner */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Sparkles size={15} className="text-amber-400" />
                Quick Action Shortcuts
              </h4>
              <p className="text-xs text-zinc-300">
                Directly jump into client management, customize live white-label themes, or inspect master API switch defaults.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate("/super-admin/tenants")}
                className="px-3.5 py-1.5 rounded-xl bg-white text-zinc-900 text-xs font-bold hover:bg-zinc-100 transition shadow-sm cursor-pointer"
              >
                Manage Clients Table →
              </button>
              <button
                onClick={() => navigate("/super-admin/branding")}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5B22] to-amber-500 text-white text-xs font-bold hover:opacity-90 transition shadow-sm cursor-pointer"
              >
                Theme Studio →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 👥 TAB 2: CLIENT ORGANIZATIONS & LICENSING TABLE                            */}
      {/* ========================================================================= */}
      {activeViewTab === "tenants" && (
        <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-2xs">
          {/* Table Filters & Search Bar */}
          <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl">
              {["ALL", "ACTIVE", "EXPIRED", "SUSPENDED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    statusFilter === st
                      ? "bg-white text-zinc-900 shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by client or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-zinc-200 text-xs bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="p-4 space-y-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-100 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-200 shrink-0"></div>
                    <div className="space-y-1.5">
                      <div className="w-28 sm:w-36 h-3.5 bg-zinc-200 rounded"></div>
                      <div className="w-20 sm:w-28 h-2.5 bg-zinc-200 rounded"></div>
                    </div>
                  </div>
                  <div className="hidden sm:block w-14 h-5 bg-zinc-200 rounded-md"></div>
                  <div className="w-28 h-6 bg-zinc-200 rounded-lg"></div>
                  <div className="hidden md:block w-16 h-5 bg-zinc-200 rounded-full"></div>
                  <div className="hidden lg:block w-20 h-3 bg-zinc-200 rounded"></div>
                  <div className="w-20 h-6 bg-zinc-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Client Organization</th>
                    <th className="px-4 py-3 font-semibold">Plan</th>
                    <th className="px-4 py-3 font-semibold">Config Mode</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Valid Until</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredTenants.length > 0 ? (
                    filteredTenants.map((t) => {
                      const isExpired = new Date(t.validUntil) < new Date();
                      const effectiveStatus = t.status === "SUSPENDED" ? "SUSPENDED" : isExpired ? "EXPIRED" : t.status;
                      const isCustomTelephony = t.telephony?.useDefault === false;
                      const telephonyConfigured = isCustomTelephony ? !!t.telephony?.accountId : true;
                      const hasRazorpay = !!(t.paymentGateway?.razorpayKeyId);
                      const isCustomSms = t.smsGateway?.useDefault === false;
                      const brandColor = t.branding?.primaryColor || "#FF5B22";

                      return (
                        <tr key={t._id} className="hover:bg-zinc-50/80 transition">
                          {/* Client Column with Dynamic Branding Avatar */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-2xs shrink-0"
                                style={{ backgroundColor: brandColor }}
                              >
                                {getInitials(t.name)}
                              </div>
                              <div>
                                <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                                  {t.name}
                                  {t.branding?.customDomain && (
                                    <span className="text-[9px] text-zinc-400 font-mono">({t.branding.customDomain})</span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-400">{t.adminEmail}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-zinc-100 text-zinc-700 border border-zinc-200">
                              {t.plan || "PRO"}
                            </span>
                          </td>

                          {/* Config Mode Column */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col gap-1">
                              {isCustomTelephony ? (
                                telephonyConfigured ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-50 text-orange-950 border border-orange-200 shadow-2xs w-fit">
                                    <PhoneCall size={11} className="text-[#FF5B22]" />
                                    Custom BYOK (Acc: {t.telephony?.accountId})
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => openIntegrationsModal(t)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-950 border border-amber-300 hover:bg-amber-100 transition shadow-2xs w-fit cursor-pointer animate-pulse"
                                    title="Click to complete custom BYOK setup"
                                  >
                                    <AlertCircle size={11} className="text-amber-600" />
                                    BYOK Setup Pending
                                  </button>
                                )
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-950 border border-emerald-200 shadow-2xs w-fit">
                                  <Zap size={11} className="text-emerald-600" />
                                  Platform Default Config
                                </span>
                              )}

                              {/* Active Mini Tags */}
                              <div className="flex items-center gap-1 text-[9px] text-zinc-400">
                                <span className="text-zinc-500 font-medium">Add-ons:</span>
                                {hasRazorpay ? (
                                  <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                                    <CreditCard size={9} /> Razorpay
                                  </span>
                                ) : (
                                  <span className="text-zinc-400">Razorpay (Def)</span>
                                )}
                                <span>•</span>
                                {isCustomSms ? (
                                  <span className="text-purple-600 font-semibold flex items-center gap-0.5">
                                    <MessageSquare size={9} /> Custom SMS
                                  </span>
                                ) : (
                                  <span className="text-zinc-400">SMS (Def)</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Status Column */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                effectiveStatus === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : effectiveStatus === "EXPIRED"
                                  ? "bg-rose-50 text-rose-800 border border-rose-200"
                                  : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                effectiveStatus === "ACTIVE" ? "bg-emerald-500 animate-ping" : effectiveStatus === "EXPIRED" ? "bg-rose-500" : "bg-amber-500"
                              }`}></span>
                              {effectiveStatus}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-zinc-600 font-medium">
                            {new Date(t.validUntil).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>

                          <td className="px-4 py-3.5 text-right space-x-1.5">
                            {/* ⚡ Integrations Hub Button */}
                            <button
                              onClick={() => openIntegrationsModal(t)}
                              className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#FF5B22] border border-orange-200 font-semibold text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                              title="Configure Airtel IQ Telephony, Razorpay & AWS S3"
                            >
                              <Sliders size={12} />
                              Integrations
                            </button>

                            {/* Edit Client Button */}
                            <button
                              onClick={() => openEditModal(t)}
                              className="px-2.5 py-1 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-medium text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                              title="Edit Client Settings & Plan"
                            >
                              <Edit2 size={12} />
                              Edit
                            </button>

                            {/* Extend Validity Button */}
                            <button
                              onClick={() => {
                                setSelectedTenant(t);
                                setShowExtendModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-medium text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Calendar size={12} />
                              Extend
                            </button>

                            {/* Toggle Status Button */}
                            <button
                              onClick={() => handleToggleStatus(t)}
                              className={`px-2.5 py-1 rounded-lg border font-medium text-[11px] transition cursor-pointer ${
                                t.status === "ACTIVE"
                                  ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                  : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              }`}
                            >
                              {t.status === "ACTIVE" ? "Suspend" : "Activate"}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteTenant(t)}
                              className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                              title="Permanently Delete Tenant & Data"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-zinc-400 text-xs">
                        No client tenants found. Click "Create New Client" to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🎨 TAB 3: CLIENT WHITE-LABEL & THEME BRANDING STUDIO                      */}
      {/* ========================================================================= */}
      {activeViewTab === "branding" && (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-amber-50/50 border border-orange-200/80 rounded-2xl p-5 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Palette size={18} className="text-[#FF5B22] shrink-0" />
                  Client White-Label & Theme Branding Customizer
                </h3>
                <p className="text-xs text-zinc-600 mt-1 max-w-2xl">
                  Har client ke liye unka custom primary color, company logo, portal name aur domain set karein. Jab client login karega to CRM unke brand color me open hoga!
                </p>
              </div>

              {/* Client Selector Dropdown */}
              <div className="flex items-center gap-2 shrink-0 bg-white/90 border border-orange-200/90 rounded-2xl px-3.5 py-2 shadow-2xs">
                <Building2 size={15} className="text-[#FF5B22] shrink-0" />
                <span className="text-xs font-bold text-zinc-700 shrink-0">Select Client:</span>
                <select
                  value={selectedBrandingTenantId}
                  onChange={(e) => handleSelectBrandingTenant(e.target.value)}
                  className="w-48 sm:w-60 max-w-[260px] px-2.5 py-1 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#FF5B22] shadow-2xs cursor-pointer truncate"
                >
                  {tenants.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.adminEmail})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Two-Column Studio Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Theme Controls */}
            <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs space-y-5">
              <div className="border-b border-zinc-100 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                  <Paintbrush size={14} className="text-[#FF5B22]" />
                  Brand Color & Palette
                </h4>
              </div>

              {/* Primary Color Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700">
                  Primary Brand Color (Buttons, Active Tabs, Highlights)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { name: "Signature Orange", hex: "#FF5B22" },
                    { name: "Enterprise Blue", hex: "#2563EB" },
                    { name: "Emerald Green", hex: "#10B981" },
                    { name: "Royal Violet", hex: "#7C3AED" },
                    { name: "Warm Amber", hex: "#F59E0B" },
                    { name: "Ocean Cyan", hex: "#06B6D4" },
                    { name: "Crimson Red", hex: "#EF4444" },
                    { name: "Midnight Slate", hex: "#0F172A" },
                  ].map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setBrandingConfig(prev => ({ ...prev, primaryColor: c.hex }))}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                        brandingConfig.primaryColor === c.hex
                          ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
                          : "border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: c.hex }}></span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Hex Picker Input */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="color"
                    value={brandingConfig.primaryColor || "#FF5B22"}
                    onChange={(e) => setBrandingConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-9 h-9 rounded-xl border border-zinc-200 p-0.5 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingConfig.primaryColor || "#FF5B22"}
                    onChange={(e) => setBrandingConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="#FF5B22"
                    className="w-36 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-mono font-bold text-zinc-900 uppercase focus:outline-none focus:border-zinc-900"
                  />
                  <span className="text-[11px] text-zinc-400">Custom HEX Color</span>
                </div>
              </div>

              {/* Accent Color Input */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                <label className="block text-xs font-semibold text-zinc-700">
                  Accent Color (Notification badges, Call indicators)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandingConfig.accentColor || "#F59E0B"}
                    onChange={(e) => setBrandingConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                    className="w-9 h-9 rounded-xl border border-zinc-200 p-0.5 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingConfig.accentColor || "#F59E0B"}
                    onChange={(e) => setBrandingConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                    placeholder="#F59E0B"
                    className="w-36 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-mono font-bold text-zinc-900 uppercase focus:outline-none focus:border-zinc-900"
                  />
                  <span className="text-[11px] text-zinc-400">Accent HEX Color</span>
                </div>
              </div>

              {/* Organization Branding Text Inputs */}
              <div className="space-y-3 pt-2 border-t border-zinc-100">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Custom Organization Portal Title
                  </label>
                  <input
                    type="text"
                    value={brandingConfig.companyName}
                    onChange={(e) => setBrandingConfig(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="e.g. Acme Admissions CRM"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-zinc-50 text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white"
                  />
                </div>

                {/* Company Brand Logo Upload from System */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                      Company Brand Logo
                    </label>
                    <span className="text-[10px] text-zinc-400 font-medium">PNG, SVG, JPG, WebP</span>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={logoFileInputRef}
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                  />

                  {brandingConfig.logoUrl ? (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                          <img
                            src={brandingConfig.logoUrl}
                            alt="Logo"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                            <span>Uploaded Logo Active</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-mono truncate max-w-[200px]">
                            {brandingConfig.logoUrl}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={uploadingLogo}
                          onClick={() => logoFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold shadow-2xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <UploadCloud size={13} />
                          <span>Change</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBrandingConfig(prev => ({ ...prev, logoUrl: "" }))}
                          className="p-1.5 rounded-xl border border-zinc-200 hover:border-rose-300 bg-white hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition cursor-pointer"
                          title="Remove Logo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => logoFileInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-200 hover:border-[#FF5B22] bg-zinc-50/70 hover:bg-orange-50/30 rounded-2xl p-4 text-center cursor-pointer transition group"
                    >
                      {uploadingLogo ? (
                        <div className="py-2 flex flex-col items-center gap-1.5 text-zinc-500">
                          <Loader2 size={22} className="animate-spin text-[#FF5B22]" />
                          <span className="text-xs font-bold">Uploading from device...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 group-hover:border-orange-300 flex items-center justify-center text-zinc-400 group-hover:text-[#FF5B22] shadow-2xs transition">
                            <UploadCloud size={20} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-zinc-800 group-hover:text-[#FF5B22] transition">
                              Click to upload logo from system
                            </span>
                            <p className="text-[10px] text-zinc-400 mt-0.5">
                              Drag & drop or browse image file from computer
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                      Custom Subdomain / Domain
                    </label>
                    <input
                      type="text"
                      value={brandingConfig.customDomain}
                      onChange={(e) => setBrandingConfig(prev => ({ ...prev, customDomain: e.target.value }))}
                      placeholder="crm.acmecorp.com"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-zinc-50 text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                      Support Email
                    </label>
                    <input
                      type="text"
                      value={brandingConfig.supportEmail}
                      onChange={(e) => setBrandingConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
                      placeholder="support@client.com"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-zinc-50 text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResetToDefaultTheme}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  title="Revert back to default LeadConnect Orange branding"
                >
                  <RefreshCw size={13} className="text-zinc-500" />
                  <span>Reset to Default</span>
                </button>

                <button
                  type="button"
                  disabled={savingBranding}
                  onClick={handleSaveBranding}
                  className="w-full flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{savingBranding ? "Saving..." : "Save & Deploy Live Client Branding"}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Live Interactive Mockup Preview */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#FF5B22]" />
                  Live Client CRM Mockup Preview
                </h4>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Real-Time Dynamic
                  </span>
                </div>
              </div>

              {/* Realistic Desktop Browser Frame */}
              <div className="bg-white rounded-2xl shadow-xl border border-zinc-200/90 overflow-hidden ring-1 ring-black/5">
                {/* Browser Title / Omnibar Header */}
                <div className="bg-zinc-100/90 border-b border-zinc-200 px-3 py-2 flex items-center justify-between gap-3 select-none">
                  {/* Traffic Light Dots */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/50"></div>
                  </div>

                  {/* Browser Address Bar */}
                  <div className="flex-1 max-w-xs mx-auto bg-white border border-zinc-200/80 rounded-lg px-2.5 py-0.5 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-medium shadow-2xs">
                    <Lock size={10} className="text-emerald-500 shrink-0" />
                    <span className="text-zinc-700 font-semibold truncate">
                      {brandingConfig.customDomain ? `https://${brandingConfig.customDomain}` : "https://app.leadconnect.crm"}
                    </span>
                    <span className="text-zinc-400">/lead-management/dashboard</span>
                  </div>

                  {/* Right Browser Tag */}
                  <div className="text-[10px] font-semibold text-zinc-400">
                    100%
                  </div>
                </div>

                {/* Simulated Full Client CRM Dual-Pane App Layout */}
                <div className="flex min-h-[440px] bg-[#F8F9FA] text-zinc-800 text-xs overflow-hidden">
                  {/* Left Mini Sidebar */}
                  <aside className="w-40 bg-[#FAFAFA] border-r border-zinc-200/80 flex flex-col justify-between shrink-0 select-none">
                    <div>
                      {/* Sidebar Brand Header */}
                      <div className="p-2.5 border-b border-zinc-200/60 flex items-center gap-2">
                        {brandingConfig.logoUrl ? (
                          <div className="w-6 h-6 rounded-lg bg-white border border-zinc-200 shadow-2xs p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                            <img src={brandingConfig.logoUrl} alt="Brand" className="max-w-full max-h-full object-contain" />
                          </div>
                        ) : (
                          <div 
                            className="w-6 h-6 rounded-lg text-white flex items-center justify-center font-black text-[10px] shadow-2xs tracking-tight shrink-0"
                            style={{ backgroundColor: brandingConfig.primaryColor }}
                          >
                            {getInitials(brandingConfig.companyName)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold text-zinc-900 truncate leading-tight">
                            {brandingConfig.companyName || "Client CRM"}
                          </div>
                          <div className="text-[8px] text-zinc-400 truncate leading-tight">
                            {brandingConfig.customDomain || "CRM Workspace"}
                          </div>
                        </div>
                      </div>

                      {/* Mini Sidebar Search */}
                      <div className="p-2">
                        <div className="bg-white border border-zinc-200 rounded-md px-2 py-1 flex items-center gap-1.5 text-[9px] text-zinc-400">
                          <Search size={10} />
                          <span>Search... (/)</span>
                        </div>
                      </div>

                      {/* Mini Sidebar Navigation */}
                      <div className="px-1.5 space-y-2">
                        <div>
                          <div className="px-2 py-0.5 text-[8px] font-bold text-zinc-400 tracking-wider uppercase">
                            SALES OPERATIONS
                          </div>
                          <div className="space-y-0.5 mt-0.5">
                            {/* Active Dashboard */}
                            <div 
                              className="px-2 py-1 rounded-md text-[10px] font-bold flex items-center justify-between"
                              style={{ 
                                backgroundColor: `${brandingConfig.primaryColor}15`,
                                color: brandingConfig.primaryColor,
                                borderLeft: `3px solid ${brandingConfig.primaryColor}`
                              }}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <LayoutDashboard size={11} style={{ color: brandingConfig.primaryColor }} />
                                <span>Dashboard</span>
                              </div>
                              <span 
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: brandingConfig.primaryColor }}
                              ></span>
                            </div>

                            <div className="px-2 py-1 rounded-md text-[10px] text-zinc-600 font-medium flex items-center justify-between hover:bg-zinc-100">
                              <div className="flex items-center gap-1.5 truncate">
                                <Flame size={11} className="text-zinc-400" />
                                <span>Focus Today</span>
                              </div>
                              <span className="text-[8px] font-bold px-1 rounded-full bg-amber-100 text-amber-700">8</span>
                            </div>

                            <div className="px-2 py-1 rounded-md text-[10px] text-zinc-600 font-medium flex items-center justify-between hover:bg-zinc-100">
                              <div className="flex items-center gap-1.5 truncate">
                                <Users size={11} className="text-zinc-400" />
                                <span>Leads</span>
                              </div>
                              <span className="text-[8px] font-bold px-1 rounded-full bg-zinc-200 text-zinc-700">1.2k</span>
                            </div>

                            <div className="px-2 py-1 rounded-md text-[10px] text-zinc-600 font-medium flex items-center gap-1.5 hover:bg-zinc-100">
                              <ListTodo size={11} className="text-zinc-400" />
                              <span>Tasks</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="px-2 py-0.5 text-[8px] font-bold text-zinc-400 tracking-wider uppercase">
                            INSIGHTS & CALLS
                          </div>
                          <div className="space-y-0.5 mt-0.5">
                            <div className="px-2 py-1 rounded-md text-[10px] text-zinc-600 font-medium flex items-center justify-between hover:bg-zinc-100">
                              <div className="flex items-center gap-1.5 truncate">
                                <Radio size={11} className="text-emerald-500 animate-pulse" />
                                <span>Live Wallboard</span>
                              </div>
                              <span className="text-[7px] font-extrabold px-1 rounded bg-emerald-500 text-white">LIVE</span>
                            </div>

                            <div className="px-2 py-1 rounded-md text-[10px] text-zinc-600 font-medium flex items-center gap-1.5 hover:bg-zinc-100">
                              <UserPlus size={11} className="text-zinc-400" />
                              <span>Staff & Agents</span>
                            </div>

                            <div className="px-2 py-1 rounded-md text-[10px] text-zinc-600 font-medium flex items-center gap-1.5 hover:bg-zinc-100">
                              <FileText size={11} className="text-zinc-400" />
                              <span>Reports</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Mini User Footer */}
                    <div className="p-2 border-t border-zinc-200/60 flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0 shadow-2xs"
                        style={{ backgroundColor: brandingConfig.accentColor }}
                      >
                        AD
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[9px] font-bold text-zinc-800 truncate">Admin Account</div>
                        <div className="text-[7px] text-emerald-600 font-medium">● Online</div>
                      </div>
                    </div>
                  </aside>

                  {/* Right Main Workspace */}
                  <main className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA]">
                    {/* Top Workspace Header */}
                    <header className="h-10 bg-white border-b border-zinc-200/80 px-3 flex items-center justify-between gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[11px] font-bold text-zinc-900 truncate">CRM Dashboard</span>
                        <span className="text-[10px] text-zinc-300">/</span>
                        <span className="text-[10px] text-zinc-500 hidden sm:inline">Overview</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Live Airtel IQ Telephony Badge */}
                        <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[8px] font-bold text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Airtel IQ Ready</span>
                        </div>

                        {/* + New Lead Action Button with Dynamic Brand Color */}
                        <button
                          type="button"
                          className="px-2 py-1 rounded-md text-white text-[10px] font-bold shadow-2xs flex items-center gap-1 transition"
                          style={{ backgroundColor: brandingConfig.primaryColor }}
                        >
                          <Plus size={10} />
                          <span>New Lead</span>
                        </button>

                        <div className="p-1 text-zinc-400 hover:text-zinc-600 rounded">
                          <Bell size={12} />
                        </div>
                      </div>
                    </header>

                    {/* Workspace Body Content */}
                    <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
                      {/* Metric Stat Cards Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* Card 1: Total Leads */}
                        <div className="bg-white p-2.5 rounded-xl border border-zinc-200 shadow-2xs relative overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 right-0 h-0.5"
                            style={{ backgroundColor: brandingConfig.primaryColor }}
                          ></div>
                          <div className="text-[8px] font-bold uppercase text-zinc-400">Total Leads</div>
                          <div className="text-sm font-black text-zinc-900 mt-0.5">1,248</div>
                          <div className="text-[8px] font-bold flex items-center gap-0.5 mt-0.5" style={{ color: brandingConfig.primaryColor }}>
                            <span>↑ 14.2%</span>
                            <span className="text-zinc-400 font-normal">this wk</span>
                          </div>
                        </div>

                        {/* Card 2: Active Outbound Calls */}
                        <div className="bg-white p-2.5 rounded-xl border border-zinc-200 shadow-2xs relative overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 right-0 h-0.5"
                            style={{ backgroundColor: brandingConfig.accentColor }}
                          ></div>
                          <div className="text-[8px] font-bold uppercase text-zinc-400">Active Calls</div>
                          <div className="text-sm font-black text-zinc-900 mt-0.5">38 Calls</div>
                          <div className="text-[8px] font-bold text-amber-600 flex items-center gap-0.5 mt-0.5">
                            <span>● Live Bridge</span>
                          </div>
                        </div>

                        {/* Card 3: Today's Conversions */}
                        <div className="bg-white p-2.5 rounded-xl border border-zinc-200 shadow-2xs relative overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500"></div>
                          <div className="text-[8px] font-bold uppercase text-zinc-400">Won Revenue</div>
                          <div className="text-sm font-black text-zinc-900 mt-0.5">₹4.8L</div>
                          <div className="text-[8px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                            <span>88% target</span>
                          </div>
                        </div>
                      </div>

                      {/* Live Inbound Leads Pipeline Table Preview */}
                      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden">
                        <div className="px-2.5 py-1.5 border-b border-zinc-100 flex items-center justify-between">
                          <div className="text-[10px] font-bold text-zinc-800 flex items-center gap-1.5">
                            <span 
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: brandingConfig.primaryColor }}
                            ></span>
                            <span>Recent Live Inbound Leads</span>
                          </div>
                          <span className="text-[8px] text-zinc-400 font-medium">Viewing 2 of 1,248</span>
                        </div>

                        <div className="divide-y divide-zinc-100 text-[10px]">
                          {/* Row 1 */}
                          <div className="p-2 flex items-center justify-between hover:bg-zinc-50 transition">
                            <div className="flex items-center gap-2 min-w-0">
                              <div 
                                className="w-6 h-6 rounded-full text-white text-[8px] font-bold flex items-center justify-center shrink-0 shadow-2xs"
                                style={{ backgroundColor: brandingConfig.primaryColor }}
                              >
                                RS
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-zinc-900 truncate flex items-center gap-1">
                                  <span>Rahul Sharma</span>
                                  <span className="px-1 py-0.2 rounded text-[7px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                                    HOT
                                  </span>
                                </div>
                                <div className="text-[8px] text-zinc-400 truncate">
                                  +91 98765 43210 • MBA 2026
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="hidden sm:inline text-[8px] text-zinc-400">Priya S.</span>
                              <button
                                type="button"
                                className="p-1 rounded-md text-white font-bold shadow-2xs transition"
                                style={{ backgroundColor: brandingConfig.primaryColor }}
                                title="Click to Call via Airtel IQ"
                              >
                                <PhoneCall size={10} />
                              </button>
                            </div>
                          </div>

                          {/* Row 2 */}
                          <div className="p-2 flex items-center justify-between hover:bg-zinc-50 transition">
                            <div className="flex items-center gap-2 min-w-0">
                              <div 
                                className="w-6 h-6 rounded-full text-white text-[8px] font-bold flex items-center justify-center shrink-0 shadow-2xs"
                                style={{ backgroundColor: brandingConfig.accentColor }}
                              >
                                AK
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-zinc-900 truncate flex items-center gap-1">
                                  <span>Amit Kumar</span>
                                  <span className="px-1 py-0.2 rounded text-[7px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                                    NEW
                                  </span>
                                </div>
                                <div className="text-[8px] text-zinc-400 truncate">
                                  +91 91234 56780 • Web Form
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="hidden sm:inline text-[8px] text-zinc-400">Rohan M.</span>
                              <button
                                type="button"
                                className="p-1 rounded-md text-white font-bold shadow-2xs transition"
                                style={{ backgroundColor: brandingConfig.primaryColor }}
                                title="Click to Call via Airtel IQ"
                              >
                                <PhoneCall size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </main>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* ⚙️ TAB 4: PLATFORM MASTER DEFAULTS & SWITCH HUB                            */}
      {/* ========================================================================= */}
      {activeViewTab === "platform_apis" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Server size={16} className="text-[#FF5B22]" />
                Master Central Platform API Defaults & Gateways
              </h3>
              <p className="text-xs text-zinc-300">
                Centralized system credentials. When client tenants are set to <strong>"⚡ Platform Default Config"</strong>, they automatically inherit these switch endpoints.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchPlatformDefaults}
                disabled={loadingPlatformDefaults}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 transition cursor-pointer"
                title="Reload Latest Credentials"
              >
                <RefreshCw size={13} className={loadingPlatformDefaults ? "animate-spin text-[#FF5B22]" : ""} />
                Sync
              </button>
              <button
                onClick={() => {
                  setActivePlatformEditTab("telephony");
                  setShowEditPlatformModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF5B22] hover:bg-[#e04e1b] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition cursor-pointer active:scale-[0.98]"
              >
                <Edit2 size={13} />
                Edit Master APIs
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Airtel IQ Switch Fallback */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF5B22]">
                    <PhoneCall size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">Airtel IQ / Vonage VBC Switch</h4>
                    <p className="text-[10px] text-zinc-400">Master Cloud Telephony & CDR Engine</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                    {platformDefaults?.telephony?.status || "MASTER ACTIVE"}
                  </span>
                  <button
                    onClick={() => {
                      setActivePlatformEditTab("telephony");
                      setShowEditPlatformModal(true);
                    }}
                    className="p-1 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
                    title="Edit Telephony"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-zinc-50/80 p-3.5 rounded-xl border border-zinc-100 font-mono text-[11px]">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">OAuth Token URL:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 truncate max-w-[240px]">
                    <span className="truncate">{platformDefaults?.telephony?.tokenUrl || "https://api.vonage.com/token"}</span>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.telephony?.tokenUrl || "https://api.vonage.com/token", "m_tel_token")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedKey === "m_tel_token" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">API Base URL:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 truncate max-w-[240px]">
                    <span className="truncate">{platformDefaults?.telephony?.apiUrl || "https://api.vonage.com/t"}</span>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.telephony?.apiUrl || "https://api.vonage.com/t", "m_tel_api")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedKey === "m_tel_api" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">Master Account ID:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                    <span>{platformDefaults?.telephony?.accountId || "3381014"}</span>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.telephony?.accountId || "3381014", "m_tel_acc")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_tel_acc" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">Pilot Number (Caller ID):</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                    <span>{platformDefaults?.telephony?.pilotNumber || "+911140038800"}</span>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.telephony?.pilotNumber || "+911140038800", "m_tel_pilot")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_tel_pilot" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">Master Username:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                    <span>{platformDefaults?.telephony?.username || "admin_telephony"}</span>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.telephony?.username || "admin_telephony", "m_tel_user")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_tel_user" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">Master Password:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                    <span className="font-mono">
                      {showMasterSecrets.m_tel_pass
                        ? (platformDefaults?.telephony?.password || "••••••••")
                        : "••••••••••••"}
                    </span>
                    <button
                      onClick={() => toggleMasterSecret("m_tel_pass")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                      title={showMasterSecrets.m_tel_pass ? "Hide" : "Show"}
                    >
                      {showMasterSecrets.m_tel_pass ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.telephony?.password, "m_tel_pass_c")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                      title="Copy"
                    >
                      {copiedKey === "m_tel_pass_c" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Provision Client ID */}
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">Provision Client ID:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 truncate max-w-[200px]">
                    <span className="truncate">
                      {showMasterSecrets.m_tel_prov_id
                        ? (platformDefaults?.telephony?.provisionClientId || "Not Set")
                        : (platformDefaults?.telephony?.provisionClientId ? `${platformDefaults.telephony.provisionClientId.slice(0, 8)}...` : "••••••••")}
                    </span>
                    <button
                      onClick={() => toggleMasterSecret("m_tel_prov_id")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {showMasterSecrets.m_tel_prov_id ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.telephony?.provisionClientId, "m_tel_prov_id_c")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_tel_prov_id_c" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Telephony Client ID */}
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">Telephony Client ID:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 truncate max-w-[200px]">
                    <span className="truncate">
                      {showMasterSecrets.m_tel_call_id
                        ? (platformDefaults?.telephony?.telephonyClientId || "Not Set")
                        : (platformDefaults?.telephony?.telephonyClientId ? `${platformDefaults.telephony.telephonyClientId.slice(0, 8)}...` : "••••••••")}
                    </span>
                    <button
                      onClick={() => toggleMasterSecret("m_tel_call_id")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {showMasterSecrets.m_tel_call_id ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.telephony?.telephonyClientId, "m_tel_call_id_c")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_tel_call_id_c" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Recording Client ID */}
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">Recording Client ID:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 truncate max-w-[200px]">
                    <span className="truncate">
                      {showMasterSecrets.m_tel_rec_id
                        ? (platformDefaults?.telephony?.recordingClientId || "Not Set")
                        : (platformDefaults?.telephony?.recordingClientId ? `${platformDefaults.telephony.recordingClientId.slice(0, 8)}...` : "••••••••")}
                    </span>
                    <button
                      onClick={() => toggleMasterSecret("m_tel_rec_id")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {showMasterSecrets.m_tel_rec_id ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.telephony?.recordingClientId, "m_tel_rec_id_c")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_tel_rec_id_c" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Reports Client ID */}
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-sans text-xs">Reports/CDR Client ID:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 truncate max-w-[200px]">
                    <span className="truncate">
                      {showMasterSecrets.m_tel_rep_id
                        ? (platformDefaults?.telephony?.reportsClientId || "Not Set")
                        : (platformDefaults?.telephony?.reportsClientId ? `${platformDefaults.telephony.reportsClientId.slice(0, 8)}...` : "••••••••")}
                    </span>
                    <button
                      onClick={() => toggleMasterSecret("m_tel_rep_id")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {showMasterSecrets.m_tel_rep_id ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.telephony?.reportsClientId, "m_tel_rep_id_c")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_tel_rep_id_c" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: AWS S3 Master Bucket */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <Cloud size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">AWS S3 Recording & Media Storage</h4>
                    <p className="text-[10px] text-zinc-400">High-Performance Audio Archival</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-800">
                    {platformDefaults?.storage?.status || "CONNECTED"}
                  </span>
                  <button
                    onClick={() => {
                      setActivePlatformEditTab("storage");
                      setShowEditPlatformModal(true);
                    }}
                    className="p-1 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
                    title="Edit Storage"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-zinc-50/80 p-3.5 rounded-xl border border-zinc-100 font-mono text-[11px]">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">S3 Bucket:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                    <span>{platformDefaults?.storage?.bucket || "node-media"}</span>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.storage?.bucket || "node-media", "m_s3_b")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_s3_b" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">Region:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                    <span>{platformDefaults?.storage?.region || "ap-south-1"}</span>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.storage?.region || "ap-south-1", "m_s3_r")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_s3_r" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">S3 Endpoint URL:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 truncate max-w-[200px]">
                    <span className="truncate">{platformDefaults?.storage?.endpoint || "AWS Standard S3"}</span>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.storage?.endpoint, "m_s3_end")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_s3_end" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">AWS Account ID:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 truncate max-w-[200px]">
                    <span className="truncate">{platformDefaults?.storage?.accountId || "biijszzsfufvateaffbvtjapmculhceod7agr"}</span>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.storage?.accountId, "m_s3_acc")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_s3_acc" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">Access Key ID:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 truncate max-w-[200px]">
                    <span className="truncate">
                      {showMasterSecrets.m_s3_key
                        ? (platformDefaults?.storage?.accessKeyId || "Not Set")
                        : (platformDefaults?.storage?.accessKeyId ? `${platformDefaults.storage.accessKeyId.slice(0, 6)}••••••••` : "••••••••••••")}
                    </span>
                    <button
                      onClick={() => toggleMasterSecret("m_s3_key")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {showMasterSecrets.m_s3_key ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.storage?.accessKeyId, "m_s3_key_c")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_s3_key_c" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-sans text-xs">Secret Access Key:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 truncate max-w-[200px]">
                    <span className="truncate font-mono">
                      {showMasterSecrets.m_s3_sec
                        ? (platformDefaults?.storage?.secretAccessKey || "Not Set")
                        : "••••••••••••••••"}
                    </span>
                    <button
                      onClick={() => toggleMasterSecret("m_s3_sec")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {showMasterSecrets.m_s3_sec ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.storage?.secretAccessKey, "m_s3_sec_c")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_s3_sec_c" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Razorpay Gateway */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">Master Razorpay Gateway</h4>
                    <p className="text-[10px] text-zinc-400">Platform Central Billing & Payments</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-100 text-purple-800">
                    {platformDefaults?.paymentGateway?.status || "READY"}
                  </span>
                  <button
                    onClick={() => {
                      setActivePlatformEditTab("paymentGateway");
                      setShowEditPlatformModal(true);
                    }}
                    className="p-1 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
                    title="Edit Razorpay"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-zinc-50/80 p-3.5 rounded-xl border border-zinc-100 font-mono text-[11px]">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">Operation Mode:</span>
                  <span className="font-bold text-zinc-800">{platformDefaults?.paymentGateway?.mode || "Platform Central Fee Collection"}</span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">Razorpay Key ID:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 truncate max-w-[200px]">
                    <span className="truncate">{platformDefaults?.paymentGateway?.razorpayKeyId || "rzp_live_masterKey"}</span>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.paymentGateway?.razorpayKeyId || "rzp_live_masterKey", "m_rzp_k")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_rzp_k" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">Razorpay Key Secret:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 truncate max-w-[200px]">
                    <span className="truncate font-mono">
                      {showMasterSecrets.m_rzp_sec
                        ? (platformDefaults?.paymentGateway?.razorpayKeySecret || "Not Set")
                        : "••••••••••••••••"}
                    </span>
                    <button
                      onClick={() => toggleMasterSecret("m_rzp_sec")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {showMasterSecrets.m_rzp_sec ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.paymentGateway?.razorpayKeySecret, "m_rzp_sec_c")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_rzp_sec_c" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-sans text-xs">Webhook Secret:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 truncate max-w-[200px]">
                    <span className="truncate font-mono">
                      {showMasterSecrets.m_rzp_wh
                        ? (platformDefaults?.paymentGateway?.webhookSecret || "Not Set")
                        : "••••••••••••••••"}
                    </span>
                    <button
                      onClick={() => toggleMasterSecret("m_rzp_wh")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {showMasterSecrets.m_rzp_wh ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.paymentGateway?.webhookSecret, "m_rzp_wh_c")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_rzp_wh_c" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: SMS OTP Gateway */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">Master BulkSMS & OTP Gateway</h4>
                    <p className="text-[10px] text-zinc-400">TRAI DLT Compliant SMS Route</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                    {platformDefaults?.smsGateway?.status || "DLT APPROVED"}
                  </span>
                  <button
                    onClick={() => {
                      setActivePlatformEditTab("smsGateway");
                      setShowEditPlatformModal(true);
                    }}
                    className="p-1 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
                    title="Edit SMS Gateway"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-zinc-50/80 p-3.5 rounded-xl border border-zinc-100 font-mono text-[11px]">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">Provider:</span>
                  <span className="font-bold text-zinc-800">{platformDefaults?.smsGateway?.provider || "BulkSenders DLT"}</span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">API Endpoint:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 truncate max-w-[200px]">
                    <span className="truncate">{platformDefaults?.smsGateway?.apiUrl || "https://api.bulksenders.in/v1/sms/send"}</span>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.smsGateway?.apiUrl || "https://api.bulksenders.in/v1/sms/send", "m_sms_url")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_sms_url" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">Sender ID (Header):</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                    <span>{platformDefaults?.smsGateway?.senderId || "LDCONN"}</span>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.smsGateway?.senderId || "LDCONN", "m_sms_snd")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_sms_snd" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">DLT PE ID:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                    <span>{platformDefaults?.smsGateway?.peId || "1701159123456789012"}</span>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.smsGateway?.peId || "1701159123456789012", "m_sms_pe")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_sms_pe" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-sans text-xs">DLT Template ID:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                    <span>{platformDefaults?.smsGateway?.templateId || "1707161234567890123"}</span>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.smsGateway?.templateId || "1707161234567890123", "m_sms_tmpl")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_sms_tmpl" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-sans text-xs">BulkSMS API Key:</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 truncate max-w-[200px]">
                    <span className="truncate font-mono">
                      {showMasterSecrets.m_sms_key
                        ? (platformDefaults?.smsGateway?.apiKey || "Not Set")
                        : "••••••••••••••••"}
                    </span>
                    <button
                      onClick={() => toggleMasterSecret("m_sms_key")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {showMasterSecrets.m_sms_key ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button
                      onClick={() => handleCopyText(platformDefaults?.smsGateway?.apiKey, "m_sms_key_c")}
                      className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                    >
                      {copiedKey === "m_sms_key_c" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 DEDICATED CLIENT INTEGRATIONS HUB MODAL */}
      {showIntegrationsModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                    Client Integrations Hub: {selectedTenant.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#FF5B22]">
                    Multi-Tenant BYOK
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  1-Click toggle between platform default credentials and custom BYOK client keys.
                </p>
              </div>
            </div>

            {loadingIntegrations ? (
              <div className="py-12 text-center space-y-2">
                <RefreshCw className="w-7 h-7 text-[#FF5B22] animate-spin mx-auto" />
                <p className="text-xs text-zinc-500 font-medium">Loading integration settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveIntegrations} className="space-y-4">
                {/* Integration Tabs Header */}
                <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200">
                  {[
                    { id: "telephony", label: "Airtel Telephony", icon: PhoneCall },
                    { id: "payment", label: "Razorpay Payments", icon: CreditCard },
                    { id: "storage", label: "AWS S3 Storage", icon: Cloud },
                    { id: "sms", label: "SMS OTP Gateway", icon: MessageSquare },
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveIntegrationTab(tab.id)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          activeIntegrationTab === tab.id
                            ? "bg-white text-zinc-900 shadow-xs"
                            : "text-zinc-500 hover:text-zinc-800"
                        }`}
                      >
                        <Icon size={13} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: AIRTEL IQ TELEPHONY */}
                {activeIntegrationTab === "telephony" && (
                  <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                      <div>
                        <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                          <PhoneCall size={14} className="text-[#FF5B22]" />
                          Airtel IQ Cloud Switch Integration
                        </div>
                        <p className="text-[11px] text-zinc-500">Live wallboard, auto-call logging, and agent telemetry.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleTestTelephony}
                        disabled={testingTelephony}
                        className="px-3 py-1 rounded-xl bg-white hover:bg-orange-50 text-[#FF5B22] border border-orange-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {testingTelephony ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                        Test Connection
                      </button>
                    </div>

                    {/* Test Result Banner */}
                    {telephonyTestResult && (
                      <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                        telephonyTestResult.success
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}>
                        {telephonyTestResult.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                        <span>{telephonyTestResult.message}</span>
                      </div>
                    )}

                    {/* 1-Click Toggle: Default vs Custom */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                        integrationsForm.telephony.useDefault
                          ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold"
                          : "bg-white border-zinc-200 text-zinc-600"
                      }`}>
                        <input
                          type="radio"
                          name="telephonyToggle"
                          checked={integrationsForm.telephony.useDefault}
                          onChange={() => setIntegrationsForm({
                            ...integrationsForm,
                            telephony: { ...integrationsForm.telephony, useDefault: true }
                          })}
                          className="text-emerald-600"
                        />
                        <div>
                          <div className="text-xs font-bold">1-Click Platform Default</div>
                          <div className="text-[10px] text-zinc-400 font-normal">Use server master Airtel IQ switch</div>
                        </div>
                      </label>

                      <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                        !integrationsForm.telephony.useDefault
                          ? "bg-orange-50/70 border-orange-300 text-orange-950 font-bold"
                          : "bg-white border-zinc-200 text-zinc-600"
                      }`}>
                        <input
                          type="radio"
                          name="telephonyToggle"
                          checked={!integrationsForm.telephony.useDefault}
                          onChange={() => setIntegrationsForm({
                            ...integrationsForm,
                            telephony: { ...integrationsForm.telephony, useDefault: false }
                          })}
                          className="text-[#FF5B22]"
                        />
                        <div>
                          <div className="text-xs font-bold">Custom BYOK Airtel Account</div>
                          <div className="text-[10px] text-zinc-400 font-normal">Client's dedicated Airtel account</div>
                        </div>
                      </label>
                    </div>

                    {/* Custom Airtel / VBC Inputs */}
                    {!integrationsForm.telephony.useDefault && (
                      <div className="space-y-3.5 pt-3 border-t border-zinc-200">
                        {/* 1. VBC Master Account & User Credentials */}
                        <div className="bg-white p-3.5 rounded-xl border border-zinc-200 space-y-2.5">
                          <div className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-1.5">
                            <Zap size={12} className="text-amber-500" />
                            VBC Account & User Credentials
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-semibold text-zinc-600 mb-1">VBC Account ID *</label>
                              <input
                                type="text"
                                value={integrationsForm.telephony.accountId}
                                onChange={(e) => setIntegrationsForm({
                                  ...integrationsForm,
                                  telephony: { ...integrationsForm.telephony, accountId: e.target.value }
                                })}
                                placeholder="e.g. 456788"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 focus:outline-none font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-zinc-600 mb-1">VBC User Username *</label>
                              <input
                                type="text"
                                value={integrationsForm.telephony.username}
                                onChange={(e) => setIntegrationsForm({
                                  ...integrationsForm,
                                  telephony: { ...integrationsForm.telephony, username: e.target.value }
                                })}
                                placeholder="vermabhishek657@gmail.com"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-zinc-600 mb-1">VBC User Password *</label>
                              <div className="relative">
                                <input
                                  type={showSecrets["vbcPassword"] ? "text" : "password"}
                                  value={integrationsForm.telephony.password}
                                  onChange={(e) => setIntegrationsForm({
                                    ...integrationsForm,
                                    telephony: { ...integrationsForm.telephony, password: e.target.value }
                                  })}
                                  placeholder="••••••••••••••••"
                                  className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleSecret("vbcPassword")}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                                >
                                  {showSecrets["vbcPassword"] ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Provisioning API */}
                        <div className="bg-white p-3.5 rounded-xl border border-zinc-200 space-y-2">
                          <div className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider flex items-center justify-between border-b border-zinc-100 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              1. Provisioning API (Fetch Extensions & Users)
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">VBC_PROVISION</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-semibold text-zinc-600 mb-1">Provision Client ID</label>
                              <input
                                type="text"
                                value={integrationsForm.telephony.provisionClientId || ""}
                                onChange={(e) => setIntegrationsForm({
                                  ...integrationsForm,
                                  telephony: { ...integrationsForm.telephony, provisionClientId: e.target.value }
                                })}
                                placeholder="VBC_PROVISION_CLIENT_ID"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 focus:outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-zinc-600 mb-1">Provision Client Secret</label>
                              <div className="relative">
                                <input
                                  type={showSecrets["provisionSecret"] ? "text" : "password"}
                                  value={integrationsForm.telephony.provisionClientSecret || ""}
                                  onChange={(e) => setIntegrationsForm({
                                    ...integrationsForm,
                                    telephony: { ...integrationsForm.telephony, provisionClientSecret: e.target.value }
                                  })}
                                  placeholder="••••••••••••••••"
                                  className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 focus:outline-none font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleSecret("provisionSecret")}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                                >
                                  {showSecrets["provisionSecret"] ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 3. Telephony API */}
                        <div className="bg-white p-3.5 rounded-xl border border-zinc-200 space-y-2">
                          <div className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider flex items-center justify-between border-b border-zinc-100 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#FF5B22]"></span>
                              2. Telephony API (Click-to-Call / Dialing)
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">VBC_TELEPHONY</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-semibold text-zinc-600 mb-1">Telephony Client ID</label>
                              <input
                                type="text"
                                value={integrationsForm.telephony.telephonyClientId || integrationsForm.telephony.clientId || ""}
                                onChange={(e) => setIntegrationsForm({
                                  ...integrationsForm,
                                  telephony: { ...integrationsForm.telephony, telephonyClientId: e.target.value, clientId: e.target.value }
                                })}
                                placeholder="VBC_TELEPHONY_CLIENT_ID"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 focus:outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-zinc-600 mb-1">Telephony Client Secret</label>
                              <div className="relative">
                                <input
                                  type={showSecrets["telephonySecret"] ? "text" : "password"}
                                  value={integrationsForm.telephony.telephonyClientSecret || integrationsForm.telephony.clientSecret || ""}
                                  onChange={(e) => setIntegrationsForm({
                                    ...integrationsForm,
                                    telephony: { ...integrationsForm.telephony, telephonyClientSecret: e.target.value, clientSecret: e.target.value }
                                  })}
                                  placeholder="••••••••••••••••"
                                  className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 focus:outline-none font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleSecret("telephonySecret")}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                                >
                                  {showSecrets["telephonySecret"] ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 4. Call Recording API */}
                        <div className="bg-white p-3.5 rounded-xl border border-zinc-200 space-y-2">
                          <div className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider flex items-center justify-between border-b border-zinc-100 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                              3. Call Recording API (Fetch & Stream Audio)
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">VBC_RECORDING</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-semibold text-zinc-600 mb-1">Recording Client ID</label>
                              <input
                                type="text"
                                value={integrationsForm.telephony.recordingClientId || ""}
                                onChange={(e) => setIntegrationsForm({
                                  ...integrationsForm,
                                  telephony: { ...integrationsForm.telephony, recordingClientId: e.target.value }
                                })}
                                placeholder="VBC_RECORDING_CLIENT_ID"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 focus:outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-zinc-600 mb-1">Recording Client Secret</label>
                              <div className="relative">
                                <input
                                  type={showSecrets["recordingSecret"] ? "text" : "password"}
                                  value={integrationsForm.telephony.recordingClientSecret || ""}
                                  onChange={(e) => setIntegrationsForm({
                                    ...integrationsForm,
                                    telephony: { ...integrationsForm.telephony, recordingClientSecret: e.target.value }
                                  })}
                                  placeholder="••••••••••••••••"
                                  className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 focus:outline-none font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleSecret("recordingSecret")}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                                >
                                  {showSecrets["recordingSecret"] ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 5. Reports & CDR API */}
                        <div className="bg-white p-3.5 rounded-xl border border-zinc-200 space-y-2">
                          <div className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider flex items-center justify-between border-b border-zinc-100 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              4. Reports & CDR API (Call Logs Sync & Analytics)
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">VBC_REPORTS</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-semibold text-zinc-600 mb-1">Reports Client ID</label>
                              <input
                                type="text"
                                value={integrationsForm.telephony.reportsClientId || ""}
                                onChange={(e) => setIntegrationsForm({
                                  ...integrationsForm,
                                  telephony: { ...integrationsForm.telephony, reportsClientId: e.target.value }
                                })}
                                placeholder="VBC_REPORTS_CLIENT_ID"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 focus:outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-zinc-600 mb-1">Reports Client Secret</label>
                              <div className="relative">
                                <input
                                  type={showSecrets["reportsSecret"] ? "text" : "password"}
                                  value={integrationsForm.telephony.reportsClientSecret || ""}
                                  onChange={(e) => setIntegrationsForm({
                                    ...integrationsForm,
                                    telephony: { ...integrationsForm.telephony, reportsClientSecret: e.target.value }
                                  })}
                                  placeholder="••••••••••••••••"
                                  className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 focus:outline-none font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleSecret("reportsSecret")}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                                >
                                  {showSecrets["reportsSecret"] ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: RAZORPAY PAYMENT GATEWAY */}
                {activeIntegrationTab === "payment" && (
                  <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80">
                    <div className="pb-2 border-b border-zinc-200">
                      <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                        <CreditCard size={14} className="text-blue-600" />
                        Razorpay Payment Gateway Setup
                      </div>
                      <p className="text-[11px] text-zinc-500">Collect online form fees directly into client's bank account.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                        integrationsForm.paymentGateway.useDefault
                          ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold"
                          : "bg-white border-zinc-200 text-zinc-600"
                      }`}>
                        <input
                          type="radio"
                          name="razorpayToggle"
                          checked={integrationsForm.paymentGateway.useDefault}
                          onChange={() => setIntegrationsForm({
                            ...integrationsForm,
                            paymentGateway: { ...integrationsForm.paymentGateway, useDefault: true }
                          })}
                          className="text-emerald-600"
                        />
                        <div>
                          <div className="text-xs font-bold">Default System Gateway</div>
                          <div className="text-[10px] text-zinc-400 font-normal">Use master Razorpay account</div>
                        </div>
                      </label>

                      <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                        !integrationsForm.paymentGateway.useDefault
                          ? "bg-blue-50/70 border-blue-300 text-blue-950 font-bold"
                          : "bg-white border-zinc-200 text-zinc-600"
                      }`}>
                        <input
                          type="radio"
                          name="razorpayToggle"
                          checked={!integrationsForm.paymentGateway.useDefault}
                          onChange={() => setIntegrationsForm({
                            ...integrationsForm,
                            paymentGateway: { ...integrationsForm.paymentGateway, useDefault: false }
                          })}
                          className="text-blue-600"
                        />
                        <div>
                          <div className="text-xs font-bold">Custom Client Razorpay</div>
                          <div className="text-[10px] text-zinc-400 font-normal">Client's direct Razorpay account</div>
                        </div>
                      </label>
                    </div>

                    {!integrationsForm.paymentGateway.useDefault && (
                      <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-zinc-200">
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-600 mb-1">Razorpay Key ID *</label>
                          <input
                            type="text"
                            value={integrationsForm.paymentGateway.keyId}
                            onChange={(e) => setIntegrationsForm({
                              ...integrationsForm,
                              paymentGateway: { ...integrationsForm.paymentGateway, keyId: e.target.value }
                            })}
                            placeholder="rzp_live_xxxxxxxxxxxxx"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white focus:border-zinc-900 focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-600 mb-1">Razorpay Key Secret *</label>
                          <div className="relative">
                            <input
                              type={showSecrets["razorpaySecret"] ? "text" : "password"}
                              value={integrationsForm.paymentGateway.keySecret}
                              onChange={(e) => setIntegrationsForm({
                                ...integrationsForm,
                                paymentGateway: { ...integrationsForm.paymentGateway, keySecret: e.target.value }
                              })}
                              placeholder="••••••••••••••••"
                              className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white focus:border-zinc-900 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => toggleSecret("razorpaySecret")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                            >
                              {showSecrets["razorpaySecret"] ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: AWS S3 STORAGE */}
                {activeIntegrationTab === "storage" && (
                  <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80">
                    <div className="pb-2 border-b border-zinc-200">
                      <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                        <Cloud size={14} className="text-amber-600" />
                        AWS S3 Cloud Media Storage
                      </div>
                      <p className="text-[11px] text-zinc-500">Store client student photos, documents, and call recordings.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                        integrationsForm.storage.useDefault
                          ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold"
                          : "bg-white border-zinc-200 text-zinc-600"
                      }`}>
                        <input
                          type="radio"
                          name="s3Toggle"
                          checked={integrationsForm.storage.useDefault}
                          onChange={() => setIntegrationsForm({
                            ...integrationsForm,
                            storage: { ...integrationsForm.storage, useDefault: true }
                          })}
                          className="text-emerald-600"
                        />
                        <div>
                          <div className="text-xs font-bold">Default Platform S3 Bucket</div>
                          <div className="text-[10px] text-zinc-400 font-normal">Use central master S3 storage</div>
                        </div>
                      </label>

                      <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                        !integrationsForm.storage.useDefault
                          ? "bg-amber-50/70 border-amber-300 text-amber-950 font-bold"
                          : "bg-white border-zinc-200 text-zinc-600"
                      }`}>
                        <input
                          type="radio"
                          name="s3Toggle"
                          checked={!integrationsForm.storage.useDefault}
                          onChange={() => setIntegrationsForm({
                            ...integrationsForm,
                            storage: { ...integrationsForm.storage, useDefault: false }
                          })}
                          className="text-amber-600"
                        />
                        <div>
                          <div className="text-xs font-bold">Custom Client S3 Bucket</div>
                          <div className="text-[10px] text-zinc-400 font-normal">Client's isolated AWS account</div>
                        </div>
                      </label>
                    </div>

                    {!integrationsForm.storage.useDefault && (
                      <div className="space-y-2.5 pt-2 border-t border-zinc-200">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-600 mb-1">S3 Bucket Name *</label>
                            <input
                              type="text"
                              value={integrationsForm.storage.bucketName}
                              onChange={(e) => setIntegrationsForm({
                                ...integrationsForm,
                                storage: { ...integrationsForm.storage, bucketName: e.target.value }
                              })}
                              placeholder="e.g. client-media-bucket"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white focus:border-zinc-900 focus:outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-600 mb-1">AWS Region</label>
                            <input
                              type="text"
                              value={integrationsForm.storage.region}
                              onChange={(e) => setIntegrationsForm({
                                ...integrationsForm,
                                storage: { ...integrationsForm.storage, region: e.target.value }
                              })}
                              placeholder="ap-south-1"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white focus:border-zinc-900 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-600 mb-1">AWS Access Key ID *</label>
                            <input
                              type="text"
                              value={integrationsForm.storage.accessKeyId}
                              onChange={(e) => setIntegrationsForm({
                                ...integrationsForm,
                                storage: { ...integrationsForm.storage, accessKeyId: e.target.value }
                              })}
                              placeholder="AKIAxxxxxxxxxxxxxxxx"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white focus:border-zinc-900 focus:outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-600 mb-1">AWS Secret Access Key *</label>
                            <div className="relative">
                              <input
                                type={showSecrets["awsSecret"] ? "text" : "password"}
                                value={integrationsForm.storage.secretAccessKey}
                                onChange={(e) => setIntegrationsForm({
                                  ...integrationsForm,
                                  storage: { ...integrationsForm.storage, secretAccessKey: e.target.value }
                                })}
                                placeholder="••••••••••••••••"
                                className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white focus:border-zinc-900 focus:outline-none font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => toggleSecret("awsSecret")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                              >
                                {showSecrets["awsSecret"] ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: SMS OTP GATEWAY */}
                {activeIntegrationTab === "sms" && (
                  <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80">
                    <div className="pb-2 border-b border-zinc-200">
                      <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                        <MessageSquare size={14} className="text-purple-600" />
                        SMS OTP Gateway Settings
                      </div>
                      <p className="text-[11px] text-zinc-500">Send login and lead submission verification OTPs.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                        integrationsForm.smsGateway.useDefault
                          ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold"
                          : "bg-white border-zinc-200 text-zinc-600"
                      }`}>
                        <input
                          type="radio"
                          name="smsToggle"
                          checked={integrationsForm.smsGateway.useDefault}
                          onChange={() => setIntegrationsForm({
                            ...integrationsForm,
                            smsGateway: { ...integrationsForm.smsGateway, useDefault: true }
                          })}
                          className="text-emerald-600"
                        />
                        <div>
                          <div className="text-xs font-bold">Default Bulksenders SMS</div>
                          <div className="text-[10px] text-zinc-400 font-normal">Use central SMS provider</div>
                        </div>
                      </label>

                      <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                        !integrationsForm.smsGateway.useDefault
                          ? "bg-purple-50/70 border-purple-300 text-purple-950 font-bold"
                          : "bg-white border-zinc-200 text-zinc-600"
                      }`}>
                        <input
                          type="radio"
                          name="smsToggle"
                          checked={!integrationsForm.smsGateway.useDefault}
                          onChange={() => setIntegrationsForm({
                            ...integrationsForm,
                            smsGateway: { ...integrationsForm.smsGateway, useDefault: false }
                          })}
                          className="text-purple-600"
                        />
                        <div>
                          <div className="text-xs font-bold">Custom Client SMS Gateway</div>
                          <div className="text-[10px] text-zinc-400 font-normal">Use client's SMS HTTP API</div>
                        </div>
                      </label>
                    </div>

                    {!integrationsForm.smsGateway.useDefault && (
                      <div className="pt-2 border-t border-zinc-200 space-y-2">
                        <label className="block text-[10px] font-semibold text-zinc-600 mb-1">
                          Custom SMS API GET/POST URL Template *
                        </label>
                        <input
                          type="text"
                          value={integrationsForm.smsGateway.customApiUrl}
                          onChange={(e) => setIntegrationsForm({
                            ...integrationsForm,
                            smsGateway: { ...integrationsForm.smsGateway, customApiUrl: e.target.value }
                          })}
                          placeholder="https://smsapi.com/send?contacts={phone}&msg={msg}"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white focus:border-zinc-900 focus:outline-none font-mono"
                        />
                        <p className="text-[10px] text-zinc-400">
                          Use <code>{`{phone}`}</code>, <code>{`{otp}`}</code>, <code>{`{msg}`}</code> as placeholders.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowIntegrationsModal(false);
                      setSelectedTenant(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition cursor-pointer shadow-sm"
                  >
                    Save Integration Settings
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW CLIENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl my-8">
            <div className="border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">Create New Client Account</h3>
              <p className="text-xs text-zinc-500">
                Enter organization credentials and plan validity to provision a new tenant space.
              </p>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Company / Client Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Science Champ Academy"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Admin Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="admin@client.com"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Password (Optional)</label>
                  <input
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  >
                    <option value="TRIAL">Trial (30 Days)</option>
                    <option value="STARTER">Starter</option>
                    <option value="PRO">Pro</option>
                    <option value="ENTERPRISE">Enterprise</option>
                    <option value="LIFETIME">Lifetime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    value={formData.validDays}
                    onChange={(e) => setFormData({ ...formData, validDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Max Leads Limit</label>
                  <input
                    type="number"
                    value={formData.maxLeads}
                    onChange={(e) => setFormData({ ...formData, maxLeads: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Informative Notice */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-[11px] text-emerald-950">
                  <span className="font-bold">Instant Provisioning:</span> Airtel IQ Telephony, Razorpay & AWS S3 are pre-configured with Platform Defaults. You can easily switch to dedicated custom keys anytime via the <b>Integrations Hub</b>.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CLIENT & GATEWAY MODAL */}
      {showEditModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl my-8">
            <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900">Edit Client: {selectedTenant.name}</h3>
                <p className="text-xs text-zinc-500">
                  Update plan, status, and usage limits. (Use 'Integrations' for Airtel/Razorpay).
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateTenant} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Admin Email (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={editFormData.adminEmail}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs bg-zinc-50 text-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Plan</label>
                  <select
                    value={editFormData.plan}
                    onChange={(e) => setEditFormData({ ...editFormData, plan: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  >
                    <option value="TRIAL">Trial</option>
                    <option value="STARTER">Starter</option>
                    <option value="PRO">Pro</option>
                    <option value="ENTERPRISE">Enterprise</option>
                    <option value="LIFETIME">Lifetime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Max Leads Limit</label>
                  <input
                    type="number"
                    value={editFormData.maxLeads}
                    onChange={(e) => setEditFormData({ ...editFormData, maxLeads: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Max Forms Limit</label>
                  <input
                    type="number"
                    value={editFormData.maxForms}
                    onChange={(e) => setEditFormData({ ...editFormData, maxForms: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">Notes / Remarks</label>
                <textarea
                  rows="2"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="e.g. Account notes"
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTenant(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 EDIT MASTER PLATFORM DEFAULT APIS MODAL */}
      {showEditPlatformModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="border-b border-zinc-100 pb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-[#FF5B22]">
                    <Server size={16} />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                    Edit Master Platform API Defaults
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#FF5B22]">
                    Platform Fallback
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Configure the global master credentials that clients inherit when set to Platform Default mode.
                </p>
              </div>
              <button
                onClick={() => setShowEditPlatformModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* 4 Tabs */}
            <div className="flex border-b border-zinc-200 gap-2 pb-1 overflow-x-auto">
              {[
                { id: "telephony", label: "Airtel IQ Telephony", icon: PhoneCall },
                { id: "storage", label: "AWS S3 Storage", icon: Cloud },
                { id: "paymentGateway", label: "Razorpay Gateway", icon: CreditCard },
                { id: "smsGateway", label: "BulkSMS Gateway", icon: MessageSquare }
              ].map((t) => {
                const Icon = t.icon;
                const isActive = activePlatformEditTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActivePlatformEditTab(t.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-zinc-900 text-white shadow-xs"
                        : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-[#FF5B22]" : "text-zinc-400"} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSavePlatformDefaults} className="space-y-4">
              {/* TAB 1: TELEPHONY */}
              {activePlatformEditTab === "telephony" && (
                <div className="space-y-4">
                  <div className="bg-orange-50/70 border border-orange-200/60 rounded-xl p-3 text-xs text-orange-900 flex items-start gap-2">
                    <Zap size={15} className="text-[#FF5B22] shrink-0 mt-0.5" />
                    <span>
                      These master Airtel IQ / Vonage credentials will power voice calls, automatic recording synchronization, and CDR analytics for all platform tenants.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">OAuth Token URL</label>
                      <input
                        type="text"
                        value={editPlatformForm.telephony.tokenUrl}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          telephony: { ...editPlatformForm.telephony, tokenUrl: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                        placeholder="https://api.vonage.com/token"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">API Base URL</label>
                      <input
                        type="text"
                        value={editPlatformForm.telephony.apiUrl}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          telephony: { ...editPlatformForm.telephony, apiUrl: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                        placeholder="https://api.vonage.com/t"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Master Account ID</label>
                      <input
                        type="text"
                        value={editPlatformForm.telephony.accountId}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          telephony: { ...editPlatformForm.telephony, accountId: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                        placeholder="e.g. 3381014"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Pilot Number (Default Caller ID)</label>
                      <input
                        type="text"
                        value={editPlatformForm.telephony.pilotNumber}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          telephony: { ...editPlatformForm.telephony, pilotNumber: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                        placeholder="+911140038800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Master Username</label>
                      <input
                        type="text"
                        value={editPlatformForm.telephony.username}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          telephony: { ...editPlatformForm.telephony, username: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs focus:border-[#FF5B22] focus:outline-none"
                        placeholder="Master Telephony Admin Username"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Master Password</label>
                      <div className="relative">
                        <input
                          type={showSecrets.modal_m_pass ? "text" : "password"}
                          value={editPlatformForm.telephony.password}
                          onChange={(e) => setEditPlatformForm({
                            ...editPlatformForm,
                            telephony: { ...editPlatformForm.telephony, password: e.target.value }
                          })}
                          className="w-full px-3 py-2 pr-9 rounded-xl border border-zinc-200 text-xs focus:border-[#FF5B22] focus:outline-none"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret("modal_m_pass")}
                          className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                        >
                          {showSecrets.modal_m_pass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Provision Client ID</label>
                      <input
                        type="text"
                        value={editPlatformForm.telephony.provisionClientId}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          telephony: { ...editPlatformForm.telephony, provisionClientId: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                        placeholder="Client ID for User Provisioning"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Provision Client Secret</label>
                      <div className="relative">
                        <input
                          type={showSecrets.modal_m_prov_sec ? "text" : "password"}
                          value={editPlatformForm.telephony.provisionClientSecret}
                          onChange={(e) => setEditPlatformForm({
                            ...editPlatformForm,
                            telephony: { ...editPlatformForm.telephony, provisionClientSecret: e.target.value }
                          })}
                          className="w-full px-3 py-2 pr-9 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                          placeholder="Client Secret"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret("modal_m_prov_sec")}
                          className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                        >
                          {showSecrets.modal_m_prov_sec ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Telephony Client ID (Click-to-Call)</label>
                      <input
                        type="text"
                        value={editPlatformForm.telephony.telephonyClientId}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          telephony: { ...editPlatformForm.telephony, telephonyClientId: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                        placeholder="Client ID for Telephony Calls"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Telephony Client Secret</label>
                      <div className="relative">
                        <input
                          type={showSecrets.modal_m_tel_sec ? "text" : "password"}
                          value={editPlatformForm.telephony.telephonyClientSecret}
                          onChange={(e) => setEditPlatformForm({
                            ...editPlatformForm,
                            telephony: { ...editPlatformForm.telephony, telephonyClientSecret: e.target.value }
                          })}
                          className="w-full px-3 py-2 pr-9 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                          placeholder="Client Secret"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret("modal_m_tel_sec")}
                          className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                        >
                          {showSecrets.modal_m_tel_sec ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Recording Client ID</label>
                      <input
                        type="text"
                        value={editPlatformForm.telephony.recordingClientId}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          telephony: { ...editPlatformForm.telephony, recordingClientId: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                        placeholder="Client ID for Recording Sync"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Recording Client Secret</label>
                      <div className="relative">
                        <input
                          type={showSecrets.modal_m_rec_sec ? "text" : "password"}
                          value={editPlatformForm.telephony.recordingClientSecret}
                          onChange={(e) => setEditPlatformForm({
                            ...editPlatformForm,
                            telephony: { ...editPlatformForm.telephony, recordingClientSecret: e.target.value }
                          })}
                          className="w-full px-3 py-2 pr-9 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                          placeholder="Client Secret"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret("modal_m_rec_sec")}
                          className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                        >
                          {showSecrets.modal_m_rec_sec ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Reports Client ID (CDR Analytics)</label>
                      <input
                        type="text"
                        value={editPlatformForm.telephony.reportsClientId}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          telephony: { ...editPlatformForm.telephony, reportsClientId: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                        placeholder="Client ID for Reports"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Reports Client Secret</label>
                      <div className="relative">
                        <input
                          type={showSecrets.modal_m_rep_sec ? "text" : "password"}
                          value={editPlatformForm.telephony.reportsClientSecret}
                          onChange={(e) => setEditPlatformForm({
                            ...editPlatformForm,
                            telephony: { ...editPlatformForm.telephony, reportsClientSecret: e.target.value }
                          })}
                          className="w-full px-3 py-2 pr-9 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                          placeholder="Client Secret"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret("modal_m_rep_sec")}
                          className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                        >
                          {showSecrets.modal_m_rep_sec ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Telephony Connection Test Action */}
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleTestMasterTelephony}
                      disabled={testingMasterTelephony}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-[#FF5B22] text-xs font-bold transition cursor-pointer"
                    >
                      {testingMasterTelephony ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                      Test Airtel IQ Connection
                    </button>
                    {masterTelephonyTestResult && (
                      <span className={`text-[11px] font-medium flex items-center gap-1 ${masterTelephonyTestResult.success ? "text-emerald-600" : "text-rose-600"}`}>
                        {masterTelephonyTestResult.success ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {masterTelephonyTestResult.message}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: AWS S3 STORAGE */}
              {activePlatformEditTab === "storage" && (
                <div className="space-y-3">
                  <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
                    <Cloud size={15} className="text-blue-500 shrink-0 mt-0.5" />
                    <span>
                      Central AWS S3 (or S3-compatible) storage bucket used for storing all audio call recordings and uploaded lead media.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">S3 Bucket Name</label>
                      <input
                        type="text"
                        value={editPlatformForm.storage.bucket}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          storage: { ...editPlatformForm.storage, bucket: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                        placeholder="e.g. node-media"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">AWS Region</label>
                      <input
                        type="text"
                        value={editPlatformForm.storage.region}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          storage: { ...editPlatformForm.storage, region: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                        placeholder="e.g. ap-south-1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Custom Endpoint URL (Optional)</label>
                      <input
                        type="text"
                        value={editPlatformForm.storage.endpoint}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          storage: { ...editPlatformForm.storage, endpoint: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                        placeholder="https://s3.ap-south-1.amazonaws.com or compatible S3 endpoint"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Access Key ID</label>
                      <input
                        type="text"
                        value={editPlatformForm.storage.accessKeyId}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          storage: { ...editPlatformForm.storage, accessKeyId: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                        placeholder="AKIA..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Secret Access Key</label>
                      <div className="relative">
                        <input
                          type={showSecrets.modal_m_s3_sec ? "text" : "password"}
                          value={editPlatformForm.storage.secretAccessKey}
                          onChange={(e) => setEditPlatformForm({
                            ...editPlatformForm,
                            storage: { ...editPlatformForm.storage, secretAccessKey: e.target.value }
                          })}
                          className="w-full px-3 py-2 pr-9 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                          placeholder="Secret Access Key"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret("modal_m_s3_sec")}
                          className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                        >
                          {showSecrets.modal_m_s3_sec ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RAZORPAY */}
              {activePlatformEditTab === "paymentGateway" && (
                <div className="space-y-3">
                  <div className="bg-purple-50/70 border border-purple-200/60 rounded-xl p-3 text-xs text-purple-900 flex items-start gap-2">
                    <CreditCard size={15} className="text-purple-500 shrink-0 mt-0.5" />
                    <span>
                      Platform-wide master Razorpay Gateway credentials for automatic client subscription payments and license billing.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Razorpay Key ID</label>
                      <input
                        type="text"
                        value={editPlatformForm.paymentGateway.razorpayKeyId}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          paymentGateway: { ...editPlatformForm.paymentGateway, razorpayKeyId: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                        placeholder="rzp_live_..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Razorpay Key Secret</label>
                      <div className="relative">
                        <input
                          type={showSecrets.modal_m_rzp_sec ? "text" : "password"}
                          value={editPlatformForm.paymentGateway.razorpayKeySecret}
                          onChange={(e) => setEditPlatformForm({
                            ...editPlatformForm,
                            paymentGateway: { ...editPlatformForm.paymentGateway, razorpayKeySecret: e.target.value }
                          })}
                          className="w-full px-3 py-2 pr-9 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                          placeholder="Key Secret"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret("modal_m_rzp_sec")}
                          className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                        >
                          {showSecrets.modal_m_rzp_sec ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Webhook Secret</label>
                      <div className="relative">
                        <input
                          type={showSecrets.modal_m_rzp_wh ? "text" : "password"}
                          value={editPlatformForm.paymentGateway.webhookSecret}
                          onChange={(e) => setEditPlatformForm({
                            ...editPlatformForm,
                            paymentGateway: { ...editPlatformForm.paymentGateway, webhookSecret: e.target.value }
                          })}
                          className="w-full px-3 py-2 pr-9 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                          placeholder="Webhook Signature Secret"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret("modal_m_rzp_wh")}
                          className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                        >
                          {showSecrets.modal_m_rzp_wh ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: BULKSMS */}
              {activePlatformEditTab === "smsGateway" && (
                <div className="space-y-3">
                  <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
                    <MessageSquare size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Master SMS / OTP Gateway for user logins, OTP verifications, and lead notifications.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">SMS API Endpoint</label>
                      <input
                        type="text"
                        value={editPlatformForm.smsGateway.apiUrl}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          smsGateway: { ...editPlatformForm.smsGateway, apiUrl: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                        placeholder="https://api.bulksenders.in/v1/sms/send"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Sender ID (6-Char Header)</label>
                      <input
                        type="text"
                        value={editPlatformForm.smsGateway.senderId}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          smsGateway: { ...editPlatformForm.smsGateway, senderId: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono uppercase focus:border-[#FF5B22] focus:outline-none"
                        placeholder="LDCONN"
                        maxLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">DLT Principal Entity ID (PE ID)</label>
                      <input
                        type="text"
                        value={editPlatformForm.smsGateway.peId}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          smsGateway: { ...editPlatformForm.smsGateway, peId: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                        placeholder="1701159123456789012"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">DLT Template ID</label>
                      <input
                        type="text"
                        value={editPlatformForm.smsGateway.templateId}
                        onChange={(e) => setEditPlatformForm({
                          ...editPlatformForm,
                          smsGateway: { ...editPlatformForm.smsGateway, templateId: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                        placeholder="1707161234567890123"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">BulkSMS API Key</label>
                      <div className="relative">
                        <input
                          type={showSecrets.modal_m_sms_key ? "text" : "password"}
                          value={editPlatformForm.smsGateway.apiKey}
                          onChange={(e) => setEditPlatformForm({
                            ...editPlatformForm,
                            smsGateway: { ...editPlatformForm.smsGateway, apiKey: e.target.value }
                          })}
                          className="w-full px-3 py-2 pr-9 rounded-xl border border-zinc-200 text-xs font-mono focus:border-[#FF5B22] focus:outline-none"
                          placeholder="SMS API Secret Key"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret("modal_m_sms_key")}
                          className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                        >
                          {showSecrets.modal_m_sms_key ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowEditPlatformModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPlatformDefaults}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-sm transition active:scale-[0.99] cursor-pointer"
                >
                  {savingPlatformDefaults ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-[#FF5B22]" />
                      Saving Master Defaults...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} className="text-[#FF5B22]" />
                      Save Master Configuration
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXTEND VALIDITY MODAL */}
      {showExtendModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Extend Client Validity</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Client: <strong>{selectedTenant.name}</strong>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "+30d", days: 30 },
                { label: "+90d", days: 90 },
                { label: "+1 Year", days: 365 },
              ].map((b) => (
                <button
                  key={b.days}
                  onClick={() => {
                    setDaysToAdd(b.days);
                    setCustomExtendDate("");
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    daysToAdd === b.days && !customExtendDate
                      ? "border-zinc-900 bg-zinc-900 text-white font-semibold"
                      : "border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                Or pick specific date
              </label>
              <input
                type="date"
                value={customExtendDate}
                onChange={(e) => setCustomExtendDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => {
                  setShowExtendModal(false);
                  setSelectedTenant(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendValidity}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition cursor-pointer"
              >
                Apply Extension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
