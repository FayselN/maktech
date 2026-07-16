import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Star,
  Download,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  BookmarkCheck,
  Send,
  ExternalLink,
  ShieldCheck,
  Wifi,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { AppItem, Review } from '../types';
import { getAppIcon } from './AppCard';

interface AppDetailsProps {
  app: AppItem;
  onClose: () => void;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  onAddReview: (review: Review) => void;
  onRecordDownload: () => void;
}

export default function AppDetails({
  app,
  onClose,
  isBookmarked,
  onBookmarkToggle,
  onAddReview,
  onRecordDownload
}: AppDetailsProps) {
  const [activeScreenshotTab, setActiveScreenshotTab] = useState(0);
  const [newUsername, setNewUsername] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStep, setDownloadStep] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);

  // Auto-scrolling slides or resetting
  useEffect(() => {
    setActiveScreenshotTab(0);
    setNewUsername('');
    setNewRating(5);
    setNewComment('');
    setReviewError('');
    setIsDownloading(false);
    setDownloadStep(0);
    setCopyCodeSuccess(false);
  }, [app]);

  // Handle Download process simulator for premium UX
  const triggerDownloadRedirect = () => {
    setIsDownloading(true);
    onRecordDownload();
    setDownloadStep(1); // "Establishing secure connection..."

    setTimeout(() => {
      setDownloadStep(2); // "Verifying package signature..."
    }, 1000);

    setTimeout(() => {
      setDownloadStep(3); // "Redirecting to official Google Play Store..."
    }, 2200);

    setTimeout(() => {
      window.open(app.downloadUrl, '_blank', 'noopener,noreferrer');
      setIsDownloading(false);
    }, 3200);
  };

  // Submit Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setReviewError('Please enter your name.');
      return;
    }
    if (!newComment.trim() || newComment.length < 5) {
      setReviewError('Please write a review comment (minimum 5 characters).');
      return;
    }

    const review: Review = {
      id: `rev-${Date.now()}`,
      username: newUsername.trim(),
      rating: newRating,
      date: new Date().toISOString().split('T')[0],
      comment: newComment.trim()
    };

    onAddReview(review);
    setNewUsername('');
    setNewComment('');
    setNewRating(5);
    setReviewError('');
  };

  // Copy app link
  const copyAppLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Copy search code to clipboard
  const copySearchCode = () => {
    if (app.searchCode) {
      navigator.clipboard.writeText(app.searchCode);
      setCopyCodeSuccess(true);
      setTimeout(() => setCopyCodeSuccess(false), 2000);
    }
  };

  const IconComponent = getAppIcon(app.iconUrl);

  // Dynamic screenshot preview render mapping
  const renderScreenshotMock = (screenshot: typeof app.screenshots[0]) => {
    switch (screenshot.type) {
      case 'chat':
        return (
          <div className="flex flex-col h-full bg-slate-950 text-xs p-3 font-sans">
            <div className="flex items-center gap-1 border-b border-slate-800 pb-2 mb-2 text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>{app.name} Assistant Core v3.5</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              <div className="bg-slate-900 rounded-lg p-2.5 max-w-[85%] border border-slate-800 text-slate-300">
                🤖 Hello! I am your curated AI companion. Ask me anything!
              </div>
              <div className="bg-blue-600 rounded-lg p-2.5 max-w-[85%] ml-auto text-white">
                How can I build an awesome app landing page?
              </div>
              <div className="bg-slate-900 rounded-lg p-2.5 max-w-[90%] border border-slate-800 text-slate-200">
                ✨ Use simple grids, clean typography like <b>Outfit</b>, and responsive frames. Add micro-animations for high-fidelity response!
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-900 flex gap-2">
              <div className="flex-1 bg-slate-900 rounded px-2.5 py-1.5 text-slate-500 border border-slate-800">
                Ask a follow-up...
              </div>
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shrink-0">
                →
              </div>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="flex flex-col h-full bg-slate-950 text-xs p-3 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="font-display font-semibold text-slate-300">{app.name} Home</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">Pro</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-850">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Active tasks</p>
                <p className="text-base font-bold text-white mt-0.5">14 items</p>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-850">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Progress</p>
                <p className="text-base font-bold text-emerald-400 mt-0.5">85%</p>
              </div>
            </div>
            <div className="space-y-1.5 flex-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Quick Board</p>
              {screenshot.content.split('\n').map((line, idx) => (
                <div key={idx} className="flex items-center gap-2 p-1.5 bg-slate-900/60 rounded border border-slate-800/40 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="truncate">{line.replace(/^- /, '')}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className="flex flex-col h-full bg-slate-950 text-xs p-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3">
              <span className="text-sky-400 text-[10px] font-bold">📈 MONITOR_SHEETS</span>
              <span className="text-slate-500 text-[10px]">REAL-TIME</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-850 text-slate-300 space-y-2 mb-3">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span>METRIC</span>
                <span className="text-emerald-400">STATUS</span>
              </div>
              {screenshot.content.split('\n').slice(0, 4).map((line, idx) => (
                <div key={idx} className="text-[10px] truncate leading-tight text-slate-400">
                  {line}
                </div>
              ))}
            </div>
            <div className="flex-1 bg-gradient-to-t from-slate-900/40 to-slate-950 p-2 rounded border border-slate-900 flex flex-col justify-end">
              <div className="flex items-end justify-between gap-1 h-12 px-2">
                <div className="w-full bg-sky-500/30 h-4 rounded-sm" />
                <div className="w-full bg-sky-500/50 h-8 rounded-sm" />
                <div className="w-full bg-sky-500/80 h-10 rounded-sm" />
                <div className="w-full bg-sky-500 h-6 rounded-sm animate-pulse" />
                <div className="w-full bg-indigo-500 h-12 rounded-sm" />
              </div>
              <div className="flex justify-between text-[8px] text-slate-600 mt-1 px-1">
                <span>MON</span>
                <span>WED</span>
                <span>FRI</span>
                <span>SUN</span>
              </div>
            </div>
          </div>
        );

      case 'editor':
        return (
          <div className="flex flex-col h-full bg-slate-950 text-xs p-3 font-sans">
            <div className="flex items-center gap-1.5 border-b border-slate-850 pb-2 mb-2 text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Canvas Canvas_01.raw</span>
            </div>
            <div className="flex-1 rounded-lg bg-slate-900/60 border border-slate-800 p-2 text-slate-400 flex flex-col justify-center items-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/40 border-t-emerald-400 animate-spin mb-2" />
              <p className="text-[10px] text-slate-500 text-center font-mono">
                {screenshot.content.split('\n').pop()}
              </p>
              <div className="absolute inset-x-0 bottom-0 p-1 bg-slate-950/80 text-[8px] flex justify-around text-slate-400 border-t border-slate-850">
                <span>Filter: +22%</span>
                <span>Contrast: 45</span>
                <span>Crop: 4:3</span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col h-full bg-slate-950 text-xs p-4 font-sans text-slate-300">
            <div className="flex items-center gap-1.5 text-indigo-400 font-mono font-bold text-[10px] tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Feature Preview
            </div>
            <div className="flex-grow flex flex-col justify-center bg-slate-900/50 rounded-xl border border-slate-800 p-3 space-y-2.5">
              {screenshot.content.split('\n').map((line, idx) => (
                <div key={idx} className="p-2 bg-slate-950/85 rounded border border-slate-850 text-[11px] leading-relaxed">
                  {line}
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      id={`app-details-overlay-${app.id}`}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex justify-center py-6 px-4 md:py-12"
    >
      <div className="w-full max-w-4xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-950/10 flex flex-col md:flex-row relative backdrop-blur-2xl">
        
        {/* App Info & Sidebar Controls (Left on wide, Top on mobile) */}
        <div className="w-full md:w-[320px] bg-white/3 border-r border-white/10 p-6 flex flex-col shrink-0 backdrop-blur-xl">
          <div className="flex items-start justify-between md:hidden mb-6">
            <button
              id="details-mobile-close-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex gap-2">
              <button
                id="details-mobile-bookmark-btn"
                onClick={onBookmarkToggle}
                className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-white"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 text-amber-400" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Icon and Title */}
          <div className="flex flex-col items-center text-center mt-2">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-24 h-24 rounded-3xl bg-gradient-to-tr ${app.iconColor} flex items-center justify-center shadow-xl mb-4 relative group`}
            >
              <IconComponent className="w-14 h-14 text-white" />
            </motion.div>

            <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
              {app.name}
            </h2>
            <p className="text-xs text-indigo-300 font-mono mt-1">{app.developer}</p>
            
            <div className="flex gap-2 flex-wrap justify-center mt-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 font-mono text-[11px] backdrop-blur-sm">
                <span>{app.category}</span>
              </div>
              {app.searchCode && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold backdrop-blur-sm">
                  <span>Search Code: {app.searchCode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3.5 mt-6 pb-6 border-b border-white/10 text-center">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 shadow-sm">
              <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">Rating</span>
              <div className="flex items-center justify-center gap-1 text-amber-400 font-bold mt-1">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{app.rating}</span>
              </div>
            </div>
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 shadow-sm">
              <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">Reviews</span>
              <p className="font-bold text-slate-200 mt-1">{app.ratingCount}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 space-y-3.5 flex-grow">
            <button
              id="details-download-btn"
              onClick={triggerDownloadRedirect}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer active:scale-95 transition-all text-sm font-display"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Get App on Play Store</span>
            </button>

            <button
              id="details-bookmark-sidebar-btn"
              onClick={onBookmarkToggle}
              className={`w-full py-3 px-4 rounded-xl border font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all text-xs ${
                isBookmarked
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Saved in Favorites</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save to Favorites</span>
                </>
              )}
            </button>

            <button
              id="details-share-btn"
              onClick={copyAppLink}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-medium flex items-center justify-center gap-2 cursor-pointer transition-all text-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>{copySuccess ? 'Link copied!' : 'Share App'}</span>
            </button>
          </div>

          {/* Social Media Search Code Copier */}
          {app.searchCode && (
            <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-left">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs font-mono uppercase tracking-wider">
                <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse animate-duration-1000" />
                <span>Quick Social Search Code</span>
              </div>
              <p className="text-[11px] text-white/60 mt-1.5 leading-normal">
                Promote on TikTok or other social channels. Tell viewers to search this code to find and install the app instantly!
              </p>
              <button
                id="copy-search-code-btn"
                onClick={copySearchCode}
                className="w-full mt-3 py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 font-mono text-xs font-bold text-amber-300 flex items-center justify-between transition-all group cursor-pointer"
              >
                <span className="tracking-wider">{app.searchCode.toUpperCase()}</span>
                <span className="text-[10px] font-sans text-amber-400 font-normal group-hover:underline">
                  {copyCodeSuccess ? 'Copied!' : 'Copy Code'}
                </span>
              </button>
            </div>
          )}

          {/* Verification badge */}
          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-white/40 font-mono">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
            <span>Verified safe by Mak Tech</span>
          </div>
        </div>

        {/* Details and Tabs Pane (Right side) */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 max-h-[85vh] md:max-h-[92vh]">
          {/* Desktop Close Button */}
          <div className="hidden md:flex justify-end absolute top-6 right-6 z-10">
            <button
              id="details-desktop-close-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer border border-white/10 backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Simple Description & Long description */}
          <section id="details-desc-section" className="space-y-3.5 pr-2">
            <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-indigo-300">
              Overview
            </h3>
            <p className="font-display text-lg font-bold text-slate-100 leading-snug">
              {app.description}
            </p>
            <p className="text-sm text-white/70 leading-relaxed font-sans">
              {app.longDescription}
            </p>
          </section>

          {/* Interactive Screen Sandbox */}
          <section id="details-screenshots-section" className="space-y-4">
            <div className="flex justify-between items-center pr-2">
              <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-indigo-300">
                Interactive Screens
              </h3>
              <span className="text-[10px] text-white/40 flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> Live UI sandbox
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch bg-white/3 rounded-2xl border border-white/10 p-4 backdrop-blur-md">
              {/* Screen selector tabs */}
              <div className="md:col-span-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                {app.screenshots.map((screen, idx) => (
                  <button
                    id={`screenshot-tab-${idx}`}
                    key={idx}
                    onClick={() => setActiveScreenshotTab(idx)}
                    className={`px-3 py-2.5 rounded-xl text-left text-xs font-medium shrink-0 transition-all border cursor-pointer ${
                      activeScreenshotTab === idx
                        ? 'bg-white/10 border-white/15 text-white shadow-sm'
                        : 'bg-transparent border-transparent text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <p className="font-bold line-clamp-1">{screen.title}</p>
                    <span className="text-[10px] text-white/40 font-mono hidden md:inline">
                      Type: {screen.type}
                    </span>
                  </button>
                ))}
              </div>

              {/* Simulated Device Frame */}
              <div className="md:col-span-8 flex justify-center">
                <div className="w-full max-w-[320px] aspect-[9/16] rounded-[32px] border-[8px] border-slate-800 bg-slate-950 shadow-2xl relative overflow-hidden flex flex-col">
                  {/* Dynamic camera notch */}
                  <div className="absolute top-0 inset-x-0 h-4 flex justify-center z-25">
                    <div className="w-24 h-4 bg-slate-800 rounded-b-xl" />
                  </div>
                  
                  {/* Internal Status Bar */}
                  <div className="h-6 flex justify-between items-center px-4 pt-1 text-[10px] text-slate-500 font-mono shrink-0 select-none bg-slate-950">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3 h-3 text-emerald-400" />
                      <span>5G</span>
                    </div>
                  </div>

                  {/* Active Screen Rendering */}
                  <div className="flex-1 overflow-hidden relative">
                    {renderScreenshotMock(app.screenshots[activeScreenshotTab])}
                  </div>

                  {/* Home indicator bar */}
                  <div className="h-4 flex justify-center items-center shrink-0 bg-slate-950">
                    <div className="w-20 h-1 bg-slate-750 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Features */}
          <section id="details-features-section" className="space-y-4">
            <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-indigo-300">
              Core Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {app.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 shadow-sm backdrop-blur-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90">{feature}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Advantages & Disadvantages */}
          <section id="details-pros-cons-section" className="space-y-4">
            <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-indigo-300">
              Analysis (Pros & Cons)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Pros */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-emerald-400 font-display font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <h4>Advantages</h4>
                </div>
                <ul className="space-y-2.5">
                  {app.advantages.map((adv, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-white/85">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-rose-400 font-display font-bold">
                  <XCircle className="w-5 h-5" />
                  <h4>Disadvantages</h4>
                </div>
                <ul className="space-y-2.5">
                  {app.disadvantages.map((dis, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-white/85">
                      <span className="text-rose-500 font-bold">✗</span>
                      <span>{dis}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Reviews & Interactive Write form */}
          <section id="details-reviews-section" className="space-y-6">
            <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-indigo-300">
              User Reviews & Ratings
            </h3>

            {/* Quick breakdown metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="sm:col-span-4 text-center border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0 sm:pr-4">
                <p className="text-5xl font-extrabold text-white">{app.rating}</p>
                <div className="flex justify-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4.5 h-4.5 ${
                        s <= Math.round(app.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-white/45 mt-2">Based on {app.ratingCount} evaluations</p>
              </div>

              {/* Bar breakdown simulator */}
              <div className="sm:col-span-8 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white/60">
                  <span className="w-3">5</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '75%' }} />
                  </div>
                  <span className="w-8 text-right">75%</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <span className="w-3">4</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '15%' }} />
                  </div>
                  <span className="w-8 text-right">15%</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <span className="w-3">3</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '6%' }} />
                  </div>
                  <span className="w-8 text-right">6%</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <span className="w-3">2</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '2%' }} />
                  </div>
                  <span className="w-8 text-right">2%</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <span className="w-3">1</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '2%' }} />
                  </div>
                  <span className="w-8 text-right">2%</span>
                </div>
              </div>
            </div>

            {/* List of comments */}
            <div className="space-y-4">
              {app.reviews.length === 0 ? (
                <p className="text-sm text-white/40 text-center py-6">
                  No reviews posted yet. Be the first to share your experience!
                </p>
              ) : (
                app.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-sm shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-display font-bold text-xs text-indigo-300">
                          {rev.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200">{rev.username}</p>
                          <p className="text-[10px] text-white/40">{rev.date}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-0.5 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        <span className="text-xs font-bold text-amber-400">{rev.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-white/80 leading-relaxed font-sans mt-1 pl-1">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Write feedback form */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 backdrop-blur-sm shadow-md">
              <h4 className="font-display font-bold text-sm text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-indigo-300" />
                <span>Write an Honest Review</span>
              </h4>

              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                {reviewError && (
                  <p className="p-2 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">
                    {reviewError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-white/60">Your Nickname</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>

                  {/* Rating Selector */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-white/60">Score Rating</label>
                    <div className="flex items-center gap-1.5 h-10">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewRating(s)}
                          className="p-1 text-white/40 hover:text-amber-400 transition-colors focus:outline-none"
                        >
                          <Star
                            className={`w-6.5 h-6.5 cursor-pointer ${
                              s <= newRating ? 'fill-amber-400 text-amber-400' : 'text-white/20 hover:text-amber-400'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comment field */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-white/60">Write your feedback</label>
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tell other users why this app is useful, how it helped you, or list some points of critique..."
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 resize-none font-sans"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    id="submit-review-btn"
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 font-bold flex items-center gap-1.5 cursor-pointer border border-white/10 active:scale-95 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Review</span>
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>

      {/* Redirect Simulator Overlay */}
      <AnimatePresence>
        {isDownloading && (
          <motion.div
            id="redirect-simulator-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Outer Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl" />
              
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center border border-slate-850">
                    <Download className="w-10 h-10 text-sky-400 animate-bounce" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-sky-400 animate-spin" />
                </div>
              </div>

              <div className="space-y-2 relative">
                <h3 className="font-display font-extrabold text-xl text-white">
                  Launching Play Store Redirect
                </h3>
                <p className="text-xs text-slate-400">
                  Preparing connection for: <b>{app.name}</b> by {app.developer}
                </p>
              </div>

              {/* Steps indicator */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2.5 text-left font-mono text-[10.5px]">
                <div className="flex items-center justify-between">
                  <span>Connection:</span>
                  <span className={downloadStep >= 1 ? 'text-emerald-400' : 'text-slate-600'}>
                    {downloadStep >= 1 ? '✓ Secure' : 'Waiting...'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Signatures:</span>
                  <span className={downloadStep >= 2 ? 'text-emerald-400' : 'text-slate-600'}>
                    {downloadStep >= 2 ? '✓ Match verified' : 'Waiting...'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Google Play link:</span>
                  <span className={downloadStep >= 3 ? 'text-sky-400 animate-pulse' : 'text-slate-600'}>
                    {downloadStep >= 3 ? 'Resolving...' : 'Waiting...'}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-normal font-sans">
                You will be taken directly to the Google Play Store. If your device doesn't open the store automatically, use the popup permissions.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
