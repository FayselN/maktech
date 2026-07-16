import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Search,
  Bookmark,
  Clock,
  Bell,
  Sparkles,
  TrendingUp,
  Flame,
  Award,
  Zap,
  RotateCcw,
  BookOpen,
  Laptop,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  Activity,
  Download,
  BookmarkCheck,
  ChevronRight,
  RefreshCw,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { CURATED_APPS } from './data/apps';
import { AppItem, AppNotification, Review } from './types';
import AppCard from './components/AppCard';
import AppDetails from './components/AppDetails';
import NotificationCenter from './components/NotificationCenter';
import { getPromoApp } from './lib/promo';

// Unlockable apps dataset that will get added when they click "Simulate App Drop"
const UNLOCKABLE_APPS: AppItem[] = [
  {
    id: 'capcut',
    name: 'CapCut',
    developer: 'Bytedance Ltd.',
    category: 'Photo Editing',
    rating: 4.5,
    ratingCount: '8.2M',
    description: 'An all-in-one photo and video editing tool with smart AI background removal, stickers, and audio transitions.',
    longDescription: 'CapCut is the premier mobile video and photo editing application. Backed by state-of-the-art AI filters, it allows creators to auto-generate subtitles, remove backgrounds with a single tap, apply keyframe animations, and use hundreds of viral audio templates from TikTok. It is highly optimized for short-form social media production.',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.gpro.coedit',
    iconUrl: 'Camera',
    iconColor: 'from-fuchsia-600 to-indigo-600',
    features: [
      'Advanced Multi-layer timeline: Layer videos, sound effects, text, and graphics',
      'AI background remover: Instantly extract subjects with clean outlines',
      'Auto-captions: Instantly translate voice audio into stylized text overlay titles',
      'Speed curves: Smooth ramp slowdowns and fast-forwards for cinematic energy',
      'Thousands of royalty-free sound effects and viral music integrations'
    ],
    advantages: [
      'Extremely intuitive interface for modern social media formats',
      'Powerful automated AI features (Subtitles, cutouts, stabilization)',
      'Free base tier with regular content library updates'
    ],
    disadvantages: [
      'Large video files can slow down compiling on budget smartphones',
      'Requires watermarks in free templates unless manually disabled',
      'Privacy parameters require Bytedance network permissions'
    ],
    screenshots: [
      {
        title: 'Timeline Editor',
        type: 'editor',
        content: '🎬 Video Track: travel_vlog.mp4\n🎵 Audio Track: lofi_beat_02.mp3\n💬 Subtitle Track: "Welcome to Bali!" [Auto]\n⏱️ Progress: 12.4s / 30.0s',
        accentColor: '#d946ef'
      }
    ],
    reviews: [
      {
        id: 'cc1',
        username: 'Toby Parker',
        rating: 5,
        date: '2026-07-14',
        comment: 'Unbelievably good video editor. Best on phone by far. The auto-captioning is extremely accurate and saves hours!'
      }
    ],
    isNew: true
  },
  {
    id: 'mimo',
    name: 'Mimo Coding',
    developer: 'Mimo-code',
    category: 'Education',
    rating: 4.7,
    ratingCount: '250K',
    description: 'Learn coding in Python, JavaScript, HTML, and SQL via 5-minute interactive daily exercises.',
    longDescription: 'Mimo is an incredibly accessible coding platform designed for busy learners. With short, bite-sized quizzes and an in-app interactive playground playground, it lets you write, run, and compile code in real time on your phone. Perfect for beginners looking to build coding habits.',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.getmimo',
    iconUrl: 'Code',
    iconColor: 'from-amber-400 to-yellow-600',
    features: [
      'Bite-sized visual quizzes teaching JS, Python, and SQL concepts',
      'Built-in compiler: Write and run actual code on a custom smartphone console',
      'Streak mechanics and custom ranks to encourage daily practice',
      'Full certificate curriculum modules to build a developer portfolio'
    ],
    advantages: [
      'Excellent introductory learning curve for absolute coding beginners',
      'Sleek, responsive console sandbox makes writing code on screen easy',
      'Vibrant community with weekly challenges'
    ],
    disadvantages: [
      'Does not cover advanced software architecture or massive system tools',
      'Premium tier is required to unlock full development certificates',
      'Requires constant web connection to load playground sandboxes'
    ],
    screenshots: [
      {
        title: 'Quiz Sandbox',
        type: 'chat',
        content: '💡 Question: Complete the console.log output!\n\nlet name = "Mak Tech";\nconsole.log(______);\n\nOptions: [ name ] [ "name" ] [ let ]\nConsole Output: "Mak Tech"',
        accentColor: '#f59e0b'
      }
    ],
    reviews: [
      {
        id: 'mm1',
        username: 'Lucas H.',
        rating: 5,
        date: '2026-07-15',
        comment: 'The absolute best way to learn JS while sitting on the bus. Daily streaks keep you hooked. Excellent layout!'
      }
    ],
    isNew: true
  },
  {
    id: 'nordvpn',
    name: 'NordVPN',
    developer: 'Nord Security',
    category: 'VPN',
    rating: 4.5,
    ratingCount: '1.8M',
    description: 'Fast, secure, and private VPN offering double encryption and smart tracker blocking tools.',
    longDescription: 'NordVPN is a market-leading security tool that encrypts your internet traffic. Boasting ultra-fast connection speeds across 60+ countries, it includes smart tracker blocking, malware defense, and dedicated Onion-over-VPN servers for total anonymity.',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.nordvpn.android',
    iconUrl: 'Shield',
    iconColor: 'from-blue-600 to-sky-800',
    features: [
      '6000+ lightning-fast servers in 60 countries globally',
      'Threat Protection: Automatically block tracker cookies, malware, and intrusive ads',
      'Double VPN: Encrypt data twice by routing it through two separate secure servers',
      'Dark Web Monitor: Notifies you immediately if your credentials are leaked online'
    ],
    advantages: [
      'Industry-leading speed performance benchmarks (NordLynx protocol)',
      'Double-hop security and strict audited zero-logs policies',
      'Supports up to 6 simultaneous device logins on a single account'
    ],
    disadvantages: [
      'Requires a premium paid subscription (no permanent free tier available)',
      'In-app map can look slightly crowded on compact smartphone screens',
      'Some servers can occasionally trigger CAPTCHA prompts on major search sites'
    ],
    screenshots: [
      {
        title: 'Security Dial',
        type: 'stats',
        content: '📡 NordVPN: SECURED\nLocation: Tokyo, Japan\nIP: 210.140.10.42\nBandwidth Usage: 112 GB total\nSpeed Rank: Ultra Fast (92ms ping)',
        accentColor: '#1d4ed8'
      }
    ],
    reviews: [
      {
        id: 'nv1',
        username: 'Aiden Smith',
        rating: 4,
        date: '2026-07-10',
        comment: 'Extremely fast server responses. Barely notice any speed drop. Definitely worth the subscription for travel security.'
      }
    ],
    isNew: true
  }
];

export default function App() {
  // --- Persistent States from Local Storage ---
  const [appsList, setAppsList] = useState<AppItem[]>(() => {
    const local = localStorage.getItem('maktech_apps');
    if (local) {
      try { return JSON.parse(local); } catch (e) { /* fallback */ }
    }
    return CURATED_APPS;
  });

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const local = localStorage.getItem('maktech_bookmarks');
    return local ? JSON.parse(local) : ['gemini', 'notion', 'snapseed'];
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    const local = localStorage.getItem('maktech_recents');
    return local ? JSON.parse(local) : ['gemini', 'brave'];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const local = localStorage.getItem('maktech_notifications');
    return local ? JSON.parse(local) : [
      {
        id: 'notif-1',
        title: '🔥 Editor\'s Pick',
        message: 'The Advanced AI Chatbot Pro was just chosen as the Daily Featured App! Check out its interactive chat capabilities.',
        timestamp: '1 hour ago',
        isRead: false,
        appId: 'gemini'
      },
      {
        id: 'notif-2',
        title: '⚡ New Release Added',
        message: 'Swiss privacy giants just released a Secure Zero-Logs Swiss Tunnel on our directory! Enjoy uncapped secure bandwidth.',
        timestamp: '3 hours ago',
        isRead: true,
        appId: 'protonvpn'
      }
    ];
  });

  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>(() => {
    const local = localStorage.getItem('maktech_downloads');
    return local ? JSON.parse(local) : {
      gemini: 452,
      notion: 312,
      duolingo: 189,
      snapseed: 124,
      protonvpn: 75,
      yotta: 42,
      phind: 110,
      ankidroid: 24,
      forest: 98,
      solidexplorer: 18,
      brave: 510,
      retroarch: 33
    };
  });

  // --- UI Layout & Navigation States ---
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'bookmarks' | 'recents' | 'alerts'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'mobile' | 'expanded'>('mobile');
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; text: string; appId: string } | null>(null);
  
  // Real-time dynamic clock state for smartphone notch
  const [phoneTime, setPhoneTime] = useState('09:41');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('maktech_apps', JSON.stringify(appsList));
  }, [appsList]);

  useEffect(() => {
    localStorage.setItem('maktech_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('maktech_recents', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem('maktech_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('maktech_downloads', JSON.stringify(downloadCounts));
  }, [downloadCounts]);

  // Clock tick
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setPhoneTime(`${hours}:${minutes}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  // --- CORE UTILITY ACTIONS ---

  // Handle open App Details sheet
  const handleOpenAppDetails = (appId: string) => {
    setSelectedAppId(appId);
    
    // Add to Recents list
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== appId);
      const updated = [appId, ...filtered].slice(0, 6); // Keep max 6 items
      return updated;
    });
  };

  // Toggle Favorite Bookmarks
  const handleToggleBookmark = (appId: string) => {
    setBookmarks((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  // Record simulated play store download metric
  const handleRecordDownload = (appId: string) => {
    setDownloadCounts((prev) => ({
      ...prev,
      [appId]: (prev[appId] || 0) + 1
    }));
  };

  // Add custom user review reactively
  const handleAddUserReview = (appId: string, review: Review) => {
    setAppsList((prevApps) =>
      prevApps.map((a) => {
        if (a.id === appId) {
          // Calculate new rating
          const originalReviews = a.reviews;
          const updatedReviews = [review, ...originalReviews];
          const sumRatings = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
          const newAvgRating = parseFloat((sumRatings / updatedReviews.length).toFixed(1));
          
          return {
            ...a,
            rating: newAvgRating,
            reviews: updatedReviews
          };
        }
        return a;
      })
    );
  };

  // Notification management
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Simulate a New App Recommendation Release
  const handleSimulateNewApp = () => {
    // Check if we have any UNLOCKABLE_APPS that are not already in appsList
    const currentIds = appsList.map((a) => a.id);
    const pendingApps = UNLOCKABLE_APPS.filter((ua) => !currentIds.includes(ua.id));

    if (pendingApps.length === 0) {
      // If all are already unlocked, show a temporary mock notification about an existing one
      const randomApp = appsList[Math.floor(Math.random() * appsList.length)];
      const promoRandomApp = getPromoApp(randomApp);
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: `⚡ Curated Recommendation`,
        message: `Our editors just updated features for the ${promoRandomApp.name}! Tap to explore review threads.`,
        timestamp: 'Just now',
        isRead: false,
        appId: randomApp.id
      };
      
      setNotifications((prev) => [notif, ...prev]);
      setActiveToast({
        id: notif.id,
        title: notif.title,
        text: notif.message,
        appId: randomApp.id
      });
      return;
    }

    // Pick the first available pending app
    const targetApp = pendingApps[0];
    const promoTargetApp = getPromoApp(targetApp);

    // 1. Add it to our active state index
    setAppsList((prev) => [...prev, targetApp]);

    // 2. Add download metrics baseline
    setDownloadCounts((prev) => ({
      ...prev,
      [targetApp.id]: Math.floor(Math.random() * 40) + 12
    }));

    // 3. Create push alert
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `🆕 NEW DROP: ${promoTargetApp.name}`,
      message: `A brand new app from ${promoTargetApp.developer} was added to our curated catalog. Explore pros, cons, and mockups!`,
      timestamp: 'Just now',
      isRead: false,
      appId: targetApp.id
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // 4. Trigger floating notification banner toast
    setActiveToast({
      id: newNotif.id,
      title: newNotif.title,
      text: newNotif.message,
      appId: targetApp.id
    });
  };

  // Close toast banner
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Categories list
  const CATEGORIES = ['All', 'AI', 'Productivity', 'Education', 'Utilities', 'Photo Editing', 'Finance', 'VPN', 'Games'];

  // Get promotional / anonymized apps for display
  const promoAppsList = appsList.map(getPromoApp);

  // Apps filtering logic based on Search and Selected Category
  const filteredApps = promoAppsList.filter((app) => {
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch =
      (app.searchCode && app.searchCode.toLowerCase() === searchLower) ||
      (app.searchCode && app.searchCode.toLowerCase().includes(searchLower)) ||
      app.name.toLowerCase().includes(searchLower) ||
      app.developer.toLowerCase().includes(searchLower) ||
      app.category.toLowerCase().includes(searchLower) ||
      app.description.toLowerCase().includes(searchLower) ||
      app.features.some((f) => f.toLowerCase().includes(searchLower));
    return matchesCategory && matchesSearch;
  });

  // Derived collections
  const trendingApps = promoAppsList.filter((a) => a.isTrending);
  const newApps = promoAppsList.filter((a) => a.isNew);
  const dailyFeaturedApp = promoAppsList.find((a) => a.isDailyFeatured) || promoAppsList[0];
  const bookmarkedApps = promoAppsList.filter((a) => bookmarks.includes(a.id));
  const recentlyViewedApps = recentlyViewed
    .map((id) => promoAppsList.find((a) => a.id === id))
    .filter((a): a is AppItem => !!a);

  // Selected App Object
  const selectedAppObj = promoAppsList.find((a) => a.id === selectedAppId);

  // Total downloads metric
  const totalSimulatedDownloads = (Object.values(downloadCounts) as number[]).reduce((acc, count) => acc + count, 0);

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-slate-100">
      
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl py-4 px-6 sticky top-0 z-30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/15">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-lg text-white leading-none tracking-tight flex items-center gap-1.5">
              <span>Mak Tech</span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 font-mono px-1.5 py-0.2 rounded-full uppercase">
                v2.0
              </span>
            </h1>
            <p className="text-[10px] text-white/50 font-medium">Curated Android Directory</p>
          </div>
        </div>

        {/* View Layout Toggle Toggles */}
        <div className="hidden lg:flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl text-xs backdrop-blur-md">
          <button
            id="layout-toggle-mobile"
            onClick={() => setViewMode('mobile')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-indigo-500 text-white shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Simulator</span>
          </button>
          
          <button
            id="layout-toggle-expanded"
            onClick={() => setViewMode('expanded')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'expanded'
                ? 'bg-indigo-500 text-white shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Responsive Web Hub</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT / CENTER COLUMN: Mobile Device Screen simulator */}
        <div className={`lg:col-span-8 ${viewMode === 'expanded' ? 'lg:col-span-12' : ''} flex justify-center`}>
          
          {/* Smartphone device shell */}
          <div className={`w-full ${
            viewMode === 'mobile'
              ? 'max-w-[420px] aspect-[9/18.5] border-[12px] border-white/15 rounded-[50px] shadow-2xl relative overflow-hidden bg-slate-950/40 backdrop-blur-3xl flex flex-col'
              : 'max-w-none rounded-3xl border border-white/10 p-6 bg-white/5 backdrop-blur-2xl flex flex-col gap-6 shadow-xl'
          }`}>
            
            {/* Dynamic camera notch inside simulator mode */}
            {viewMode === 'mobile' && (
              <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-30 select-none pointer-events-none">
                <div className="w-32 h-5 bg-slate-800 rounded-b-2xl relative">
                  {/* Camera lens hole */}
                  <div className="absolute left-[30%] top-1.5 w-2 h-2 rounded-full bg-slate-950" />
                  {/* Speaker mesh */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-10 h-1 bg-slate-700/80 rounded-full" />
                </div>
              </div>
            )}

            {/* Simulated Device Header Notch & Status Info */}
            {viewMode === 'mobile' && (
              <div className="h-7 bg-transparent flex justify-between items-center px-6 pt-2 text-[10px] text-white/50 font-mono select-none shrink-0 z-20">
                <span className="font-bold">{phoneTime}</span>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-indigo-400" />
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.2 rounded font-semibold text-[8px]">ONLINE</span>
                </div>
              </div>
            )}

            {/* REAL-TIME NOTIFICATION TOAST POPUP BANNER inside simulated phone */}
            <AnimatePresence>
              {activeToast && (
                <motion.div
                  id="notif-toast-banner"
                  initial={{ opacity: 0, y: -40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 12, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  onClick={() => {
                    handleOpenAppDetails(activeToast.appId);
                    setActiveToast(null);
                  }}
                  className="absolute top-12 inset-x-4 z-40 bg-white/10 hover:bg-white/15 border border-white/20 p-3.5 rounded-2xl shadow-2xl shadow-indigo-950/30 backdrop-blur-xl cursor-pointer flex gap-3 group transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <h5 className="font-display font-extrabold text-[11px] text-white flex items-center gap-1">
                      <span>Mak Tech Push Drop</span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
                    </h5>
                    <p className="text-[10px] text-slate-200 line-clamp-2 mt-0.5 leading-normal">
                      {activeToast.text}
                    </p>
                  </div>
                  <button
                    id="close-toast-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveToast(null);
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SIMULATED PHONE BODY VIEWPORT */}
            <div className={`flex-1 overflow-y-auto ${viewMode === 'mobile' ? 'max-h-[70vh] pt-2 pb-6 px-4' : 'p-2'}`}>
              
              {/* HEADER LOGO ON TOP OF HOME SCREEN */}
              {activeTab === 'home' && (
                <div className="mb-5 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-300 uppercase">EXPLORE DISCOVERIES</span>
                    <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
                      Editor Picks
                    </h2>
                  </div>
                  
                  {/* Alert circle bell on top right of homescreen */}
                  <button
                    id="header-nav-alerts-btn"
                    onClick={() => setActiveTab('alerts')}
                    className="p-2 rounded-full bg-white/5 border border-white/10 text-white/80 relative hover:text-white hover:bg-white/10 backdrop-blur-md transition-colors"
                  >
                    <Bell className="w-4.5 h-4.5" />
                    {notifications.filter((n) => !n.isRead).length > 0 && (
                      <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                  </button>
                </div>
              )}

              {/* TAB 1: DISCOVER (HOME) VIEW */}
              {activeTab === 'home' && (
                <div id="tab-home-viewport" className="space-y-6">
                  {/* SEARCH REDIRECT BUTTON OR BAR */}
                  <div
                    onClick={() => setActiveTab('search')}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 flex items-center justify-between text-white/40 cursor-pointer transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <Search className="w-4.5 h-4.5 text-indigo-400" />
                      <span>Search AI tools, VPNs, games...</span>
                    </div>
                    <span className="text-[9px] bg-white/10 text-white/60 font-mono px-1.5 py-0.5 rounded uppercase">Search</span>
                  </div>

                  {/* DAILY FEATURED APP COMPONENT */}
                  <section id="discover-featured-section" className="space-y-3">
                    <h3 className="text-xs font-bold font-mono text-white/50 uppercase tracking-wide">
                      Featured Today
                    </h3>
                    <AppCard
                      app={dailyFeaturedApp}
                      variant="featured"
                      onClick={() => handleOpenAppDetails(dailyFeaturedApp.id)}
                      isBookmarked={bookmarks.includes(dailyFeaturedApp.id)}
                      onBookmarkToggle={() => handleToggleBookmark(dailyFeaturedApp.id)}
                    />
                  </section>

                  {/* QUICK HORIZONTAL CATEGORIES PREVIEWS */}
                  <section id="discover-categories-section" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold font-mono text-white/50 uppercase tracking-wide">
                        Browse by Need
                      </h3>
                      <span
                        onClick={() => {
                          setSelectedCategory('All');
                          setActiveTab('search');
                        }}
                        className="text-[10px] text-indigo-300 font-semibold cursor-pointer hover:underline"
                      >
                        All Categories →
                      </span>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1.5 pr-1 text-xs whitespace-nowrap">
                      {CATEGORIES.slice(1).map((cat) => {
                        const count = appsList.filter((a) => a.category === cat).length;
                        return (
                          <button
                            id={`category-bubble-${cat}`}
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setActiveTab('search');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/85 hover:text-white cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 font-medium backdrop-blur-sm"
                          >
                            <span>{cat}</span>
                            <span className="text-[9px] font-mono text-white/40">({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* TRENDING APES SLIDER */}
                  <section id="discover-trending-section" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-rose-400" />
                        <h3 className="text-xs font-bold font-mono text-white/50 uppercase tracking-wide">
                          Trending Right Now
                        </h3>
                      </div>
                      <span className="text-[10px] text-white/40 font-mono">Ranked by clicks</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {trendingApps.slice(0, 3).map((app) => (
                        <AppCard
                          key={app.id}
                          app={app}
                          variant="compact"
                          onClick={() => handleOpenAppDetails(app.id)}
                          isBookmarked={bookmarks.includes(app.id)}
                          onBookmarkToggle={() => handleToggleBookmark(app.id)}
                        />
                      ))}
                    </div>
                  </section>

                  {/* NEW DROPS VERTICAL */}
                  <section id="discover-new-section" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4.5 h-4.5 text-emerald-300" />
                        <h3 className="text-xs font-bold font-mono text-white/50 uppercase tracking-wide">
                          New App Discoveries
                        </h3>
                      </div>
                      <span className="text-[9px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/20 font-mono font-bold uppercase">Fresh</span>
                    </div>

                    <div className="space-y-2.5">
                      {newApps.slice(0, 3).map((app) => (
                        <AppCard
                          key={app.id}
                          app={app}
                          variant="list"
                          onClick={() => handleOpenAppDetails(app.id)}
                          isBookmarked={bookmarks.includes(app.id)}
                          onBookmarkToggle={() => handleToggleBookmark(app.id)}
                        />
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* TAB 2: SEARCH CATALOG VIEW */}
              {activeTab === 'search' && (
                <div id="tab-search-viewport" className="space-y-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-300 uppercase">APP DIRECTORY</span>
                    <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
                      Search Directory
                    </h2>
                  </div>

                  {/* Interactive Search Field */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-white/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type keywords (e.g. secure, edit, python)..."
                      className="w-full pl-10.5 pr-9 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/55 backdrop-blur-md transition-all"
                    />
                    {searchQuery && (
                      <button
                        id="clear-search-btn"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-3.5 p-0.5 rounded-full bg-white/10 text-white/60 hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Search Code Quick Tip */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/15 text-[11px] text-amber-300 flex items-center gap-2">
                    <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400 animate-pulse" />
                    <span className="leading-tight">
                      <strong>Social Promo Tip:</strong> Search unique codes like <strong>sm4</strong> or <strong>sm1</strong> to find apps instantly!
                    </span>
                  </div>

                  {/* Categories Bubble List */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none whitespace-nowrap">
                    {CATEGORIES.map((cat) => (
                      <button
                        id={`search-cat-bubble-${cat}`}
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          selectedCategory === cat
                            ? 'bg-indigo-500 border-indigo-400 text-white font-bold shadow shadow-indigo-500/15'
                            : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search Results Display */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[11px] text-white/45">
                      <span>Found {filteredApps.length} recommended apps</span>
                      {(searchQuery || selectedCategory !== 'All') && (
                        <button
                          id="reset-filters-btn"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('All');
                          }}
                          className="text-indigo-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" /> Reset Filter
                        </button>
                      )}
                    </div>

                    {filteredApps.length === 0 ? (
                      <div className="p-10 text-center rounded-2xl bg-white/5 border border-white/10 text-white/40 space-y-2 backdrop-blur-md">
                        <HelpCircle className="w-10 h-10 mx-auto text-white/20 stroke-[1.5]" />
                        <h4 className="font-display font-bold text-sm text-white/80">No Apps Match Query</h4>
                        <p className="text-xs leading-normal">
                          Try searching for keywords like "VPN", "AI", "Code", or filter a different category.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredApps.map((app) => (
                          <AppCard
                            key={app.id}
                            app={app}
                            variant="grid"
                            onClick={() => handleOpenAppDetails(app.id)}
                            isBookmarked={bookmarks.includes(app.id)}
                            onBookmarkToggle={() => handleToggleBookmark(app.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: BOOKMARKS / FAVORITES VIEW */}
              {activeTab === 'bookmarks' && (
                <div id="tab-bookmarks-viewport" className="space-y-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-300 uppercase">SAVED FOR LATER</span>
                    <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
                      My Favorites
                    </h2>
                  </div>

                  {bookmarkedApps.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl bg-white/5 border border-white/10 text-white/40 space-y-3 backdrop-blur-md">
                      <Bookmark className="w-10 h-10 mx-auto text-white/20 stroke-[1.5]" />
                      <h4 className="font-display font-bold text-sm text-white/85">No Bookmarked Apps</h4>
                      <p className="text-xs leading-normal">
                        Browse recommendations and click the bookmark ribbon icon to save apps directly into your personalized quick tab!
                      </p>
                      <button
                        id="bookmarks-go-browse-btn"
                        onClick={() => setActiveTab('home')}
                        className="mx-auto py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-300 font-bold border border-white/10 cursor-pointer text-xs backdrop-blur-sm transition-colors"
                      >
                        Browse picks
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {bookmarkedApps.map((app) => (
                        <AppCard
                          key={app.id}
                          app={app}
                          variant="list"
                          onClick={() => handleOpenAppDetails(app.id)}
                          isBookmarked={true}
                          onBookmarkToggle={() => handleToggleBookmark(app.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: RECENTLY VIEWED VIEW */}
              {activeTab === 'recents' && (
                <div id="tab-recents-viewport" className="space-y-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-300 uppercase">YOUR JOURNEY</span>
                    <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
                      Recently Viewed
                    </h2>
                  </div>

                  {recentlyViewedApps.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl bg-white/5 border border-white/10 text-white/40 space-y-2 backdrop-blur-md">
                      <Clock className="w-10 h-10 mx-auto text-white/20 stroke-[1.5]" />
                      <h4 className="font-display font-bold text-sm text-white/85">No Browsing History</h4>
                      <p className="text-xs leading-normal">
                        Your explored recommendation history will appear automatically right here for fast access.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-[10px] text-white/45 font-mono">
                        <span>LATEST FIRST</span>
                        <button
                          id="clear-recents-btn"
                          onClick={() => setRecentlyViewed([])}
                          className="hover:text-rose-400 cursor-pointer font-semibold"
                        >
                          Clear History
                        </button>
                      </div>
                      
                      {recentlyViewedApps.map((app) => (
                        <AppCard
                          key={app.id}
                          app={app}
                          variant="list"
                          onClick={() => handleOpenAppDetails(app.id)}
                          isBookmarked={bookmarks.includes(app.id)}
                          onBookmarkToggle={() => handleToggleBookmark(app.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: ALERTS & SIMULATOR NOTIFICATIONS VIEW */}
              {activeTab === 'alerts' && (
                <div id="tab-alerts-viewport" className="space-y-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-300 uppercase">ALERTS ENGINE</span>
                    <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
                      System Notifications
                    </h2>
                  </div>

                  <NotificationCenter
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onClearAll={handleClearAllNotifications}
                    onNotificationClick={handleOpenAppDetails}
                    onSimulateNewApp={handleSimulateNewApp}
                  />
                </div>
              )}

            </div>

            {/* BOTTOM PHONE NAVIGATION BAR */}
            {viewMode === 'mobile' && (
              <div className="h-16 bg-white/5 border-t border-white/10 flex justify-around items-center px-4 shrink-0 z-20 select-none backdrop-blur-2xl">
                {/* Discover */}
                <button
                  id="tab-btn-home"
                  onClick={() => setActiveTab('home')}
                  className={`flex flex-col items-center gap-1 cursor-pointer group focus:outline-none`}
                >
                  <Sparkles className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    activeTab === 'home' ? 'text-indigo-300 font-bold' : 'text-white/45 hover:text-white'
                  }`} />
                  <span className={`text-[10px] font-medium ${
                    activeTab === 'home' ? 'text-indigo-300' : 'text-white/45'
                  }`}>Discover</span>
                </button>

                {/* Search */}
                <button
                  id="tab-btn-search"
                  onClick={() => setActiveTab('search')}
                  className={`flex flex-col items-center gap-1 cursor-pointer group focus:outline-none`}
                >
                  <Search className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    activeTab === 'search' ? 'text-indigo-300 font-bold' : 'text-white/45 hover:text-white'
                  }`} />
                  <span className={`text-[10px] font-medium ${
                    activeTab === 'search' ? 'text-indigo-300' : 'text-white/45'
                  }`}>Search</span>
                </button>

                {/* Bookmarks */}
                <button
                  id="tab-btn-bookmarks"
                  onClick={() => setActiveTab('bookmarks')}
                  className={`flex flex-col items-center gap-1 cursor-pointer group focus:outline-none`}
                >
                  <Bookmark className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    activeTab === 'bookmarks' ? 'text-indigo-300 font-bold' : 'text-white/45 hover:text-white'
                  }`} />
                  <span className={`text-[10px] font-medium ${
                    activeTab === 'bookmarks' ? 'text-indigo-300' : 'text-white/45'
                  }`}>Saved</span>
                </button>

                {/* Recents */}
                <button
                  id="tab-btn-recents"
                  onClick={() => setActiveTab('recents')}
                  className={`flex flex-col items-center gap-1 cursor-pointer group focus:outline-none`}
                >
                  <Clock className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    activeTab === 'recents' ? 'text-indigo-300 font-bold' : 'text-white/45 hover:text-white'
                  }`} />
                  <span className={`text-[10px] font-medium ${
                    activeTab === 'recents' ? 'text-indigo-300' : 'text-white/45'
                  }`}>History</span>
                </button>

                {/* Notifications */}
                <button
                  id="tab-btn-alerts"
                  onClick={() => setActiveTab('alerts')}
                  className={`flex flex-col items-center gap-1 cursor-pointer group focus:outline-none relative`}
                >
                  <Bell className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    activeTab === 'alerts' ? 'text-indigo-300 font-bold' : 'text-white/45 hover:text-white'
                  }`} />
                  
                  {/* Badge */}
                  {notifications.filter((n) => !n.isRead).length > 0 && (
                    <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500" />
                  )}

                  <span className={`text-[10px] font-medium ${
                    activeTab === 'alerts' ? 'text-indigo-300' : 'text-white/45'
                  }`}>Alerts</span>
                </button>
              </div>
            )}

            {/* Simulated home indicator swipe line at the very base */}
            {viewMode === 'mobile' && (
              <div className="h-4 bg-transparent flex justify-center items-center shrink-0">
                <div className="w-32 h-1 bg-white/20 rounded-full" />
              </div>
            )}

          </div>

        </div>

        {/* RIGHT SIDEBAR: Editor Analytics Panel (Visible in both, hides widget layout on mobile devices) */}
        <div className={`lg:col-span-4 space-y-6 ${viewMode === 'expanded' ? 'hidden lg:block' : ''}`}>
          
          {/* Quick Stats widget */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4 backdrop-blur-xl shadow-lg shadow-indigo-950/5">
            <h3 className="font-display font-extrabold text-sm text-slate-100 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-indigo-400" />
              <span>Mak Tech Real-Time Data</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                <p className="text-white/50 font-bold uppercase text-[9px]">Catalog Size</p>
                <p className="text-xl font-black text-white mt-0.5">{appsList.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                <p className="text-white/50 font-bold uppercase text-[9px]">Your Bookmarks</p>
                <p className="text-xl font-black text-white mt-0.5">{bookmarks.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-sm col-span-2">
                <p className="text-white/50 font-bold uppercase text-[9px] flex justify-between items-center">
                  <span>Simulated App Store Downloads</span>
                  <span className="text-[8px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-1.5 rounded">Metrics Tracker</span>
                </p>
                <p className="text-xl font-black text-emerald-300 mt-1 flex items-center gap-1.5">
                  <Download className="w-5 h-5 stroke-[2.5]" />
                  <span>{totalSimulatedDownloads.toLocaleString()}</span>
                </p>
              </div>
            </div>

            {/* Quick help layout switcher */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] leading-relaxed text-white/60 backdrop-blur-sm">
              <p className="font-bold text-slate-200 mb-1">💡 Pro-Tip for Reviewing</p>
              Toggle <b>Responsive Web Hub</b> in the top navbar if you prefer reading directories on an expanded screen width, or use <b>Mobile Simulator</b> for the original touch-first phone catalog format!
            </div>
          </div>

          {/* Recently viewed ticker panel (Right sidebar) */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-xl shadow-lg shadow-indigo-950/5">
            <h3 className="font-display font-extrabold text-sm text-slate-100 flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-indigo-400" />
              <span>Exploration Journey</span>
            </h3>

            {recentlyViewedApps.length === 0 ? (
              <p className="text-xs text-white/40 py-3 text-center">No apps opened yet this session.</p>
            ) : (
              <div className="space-y-2">
                {recentlyViewedApps.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    onClick={() => handleOpenAppDetails(app.id)}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 cursor-pointer flex items-center justify-between group transition-all backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${app.iconColor} flex items-center justify-center shrink-0`}>
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-white truncate group-hover:text-indigo-300 transition-colors">
                          {app.name}
                        </p>
                        <p className="text-[10px] text-white/40 truncate">{app.category}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:translate-x-0.5 group-hover:text-white/60 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Notification simulator control panel on desktop view */}
          <div className="p-5 rounded-3xl bg-gradient-to-tr from-indigo-950/10 via-white/5 to-slate-950/30 border border-white/10 space-y-4 backdrop-blur-xl shadow-lg shadow-indigo-950/5">
            <div className="space-y-1.5">
              <h3 className="font-display font-extrabold text-sm text-slate-100 flex items-center gap-2">
                <Bell className="w-4.5 h-4.5 text-indigo-300 animate-pulse" />
                <span>Simulated Event Broadcaster</span>
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Clicking the button triggers a live socket simulation. A new curated app gets released, which sends an overlay push banner to the phone viewport reactively.
              </p>
            </div>

            <button
              id="desktop-notif-sim-btn"
              onClick={handleSimulateNewApp}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Simulate App Drop Alert</span>
            </button>
          </div>

        </div>

      </main>

      {/* FOOTER METRICS AND CREDITS */}
      <footer className="mt-auto border-t border-white/10 bg-white/3 py-6 px-6 text-center text-[10.5px] text-white/40 font-mono backdrop-blur-md animate-fade-in">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Mak Tech Directory. Strictly Curated Recommendations.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Play Store Direct Links</span>
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero logs Swiss Privacy encryption</span>
            </span>
          </div>
        </div>
      </footer>

      {/* FULL-FIDELITY APP DETAILS PANEL SCREEN OVERLAY MODAL */}
      <AnimatePresence>
        {selectedAppObj && (
          <AppDetails
            app={selectedAppObj}
            onClose={() => setSelectedAppId(null)}
            isBookmarked={bookmarks.includes(selectedAppObj.id)}
            onBookmarkToggle={() => handleToggleBookmark(selectedAppObj.id)}
            onAddReview={(rev) => handleAddUserReview(selectedAppObj.id, rev)}
            onRecordDownload={() => handleRecordDownload(selectedAppObj.id)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
