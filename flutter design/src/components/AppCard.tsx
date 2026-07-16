import React from 'react';
import { motion } from 'motion/react';
import { Star, Bookmark, BookmarkCheck, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';
import { AppItem } from '../types';
import {
  Sparkles as IconSparkles,
  FileText,
  GraduationCap,
  Camera,
  Shield,
  TrendingUp as IconTrending,
  Code,
  Layers,
  Leaf,
  FolderOpen,
  Globe,
  Gamepad2,
  HelpCircle
} from 'lucide-react';

interface AppCardProps {
  key?: string | number;
  app: AppItem;
  onClick: () => void;
  isBookmarked: boolean;
  onBookmarkToggle: (e?: React.MouseEvent) => void;
  variant?: 'grid' | 'list' | 'featured' | 'compact';
}

export function getAppIcon(iconName: string) {
  switch (iconName) {
    case 'Sparkles': return IconSparkles;
    case 'FileText': return FileText;
    case 'GraduationCap': return GraduationCap;
    case 'Camera': return Camera;
    case 'Shield': return Shield;
    case 'TrendingUp': return IconTrending;
    case 'Code': return Code;
    case 'Layers': return Layers;
    case 'Leaf': return Leaf;
    case 'FolderOpen': return FolderOpen;
    case 'Globe': return Globe;
    case 'Gamepad2': return Gamepad2;
    case 'HelpCircle': return HelpCircle;
    default: return HelpCircle;
  }
}

export default function AppCard({ app, onClick, isBookmarked, onBookmarkToggle, variant = 'grid' }: AppCardProps) {
  const IconComponent = getAppIcon(app.iconUrl);

  if (variant === 'featured') {
    return (
      <motion.div
        id={`app-card-featured-${app.id}`}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/40 via-indigo-900/10 to-slate-950/50 border border-white/15 p-6 cursor-pointer shadow-xl backdrop-blur-xl group"
      >
        {/* Glow background */}
        <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500" />
        
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${app.iconColor} flex items-center justify-center shadow-lg shadow-indigo-500/10`}>
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-semibold font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {app.category}
                </span>
                <span className="text-[10px] font-semibold font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/10 text-indigo-200 border border-white/15 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-400" /> Featured App
                </span>
                {app.searchCode && (
                  <span className="text-[10px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Search: {app.searchCode}
                  </span>
                )}
              </div>
              <h3 className="font-display font-bold text-xl text-white mt-1 group-hover:text-indigo-300 transition-colors">
                {app.name}
              </h3>
              <p className="text-xs text-white/60">{app.developer}</p>
            </div>
          </div>

          <button
            id={`bookmark-btn-featured-${app.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle(e);
            }}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all shadow backdrop-blur-md"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-indigo-300" />
            ) : (
              <Bookmark className="w-5 h-5 text-white/70" />
            )}
          </button>
        </div>

        <p className="text-sm text-white/80 mt-4 line-clamp-2 leading-relaxed">
          {app.description}
        </p>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-indigo-300 bg-indigo-500/10 border border-indigo-500/25 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 fill-indigo-400 text-indigo-400" />
              <span className="text-sm font-bold">{app.rating}</span>
            </div>
            <span className="text-xs text-white/45">{app.ratingCount} reviews</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-indigo-300 font-semibold group-hover:translate-x-1 transition-transform">
            Get App <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'list') {
    return (
      <motion.div
        id={`app-card-list-${app.id}`}
        whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer group transition-all duration-350 backdrop-blur-md"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${app.iconColor} flex items-center justify-center shrink-0 shadow-md`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-display font-bold text-sm text-white group-hover:text-indigo-300 transition-colors truncate">
                {app.name}
              </h4>
              {app.searchCode && (
                <span className="text-[10px] font-black font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                  {app.searchCode}
                </span>
              )}
              {app.isNew && (
                <span className="text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                  New
                </span>
              )}
              {app.isTrending && (
                <span className="text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.2 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/20">
                  Hot
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/60 truncate">{app.developer} • {app.category}</p>
            <div className="flex items-center gap-1 text-[11px] text-indigo-300 mt-0.5">
              <Star className="w-3 h-3 fill-indigo-400 text-indigo-400 shrink-0" />
              <span className="font-semibold">{app.rating}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id={`bookmark-btn-list-${app.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle(e);
            }}
            className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4.5 h-4.5 text-indigo-300" />
            ) : (
              <Bookmark className="w-4.5 h-4.5" />
            )}
          </button>
          <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-indigo-300 transition-colors" />
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        id={`app-card-compact-${app.id}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="flex flex-col items-center text-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer group transition-all duration-300 backdrop-blur-md"
      >
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${app.iconColor} flex items-center justify-center shadow-md shrink-0 relative mb-1.5`}>
          <IconComponent className="w-5.5 h-5.5 text-white" />
          {app.isTrending && (
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center text-[8px] text-white">
              <TrendingUp className="w-2.5 h-2.5" />
            </div>
          )}
        </div>
        <h4 className="font-display font-medium text-xs text-slate-200 group-hover:text-indigo-300 line-clamp-1 w-full px-1">
          {app.name}
        </h4>
        <span className="text-[9px] text-white/45 line-clamp-1 mt-0.5 uppercase tracking-wide">
          {app.category}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      id={`app-card-grid-${app.id}`}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="flex flex-col rounded-2xl bg-white/5 border border-white/10 p-4 cursor-pointer hover:border-indigo-500/30 hover:bg-white/8 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 backdrop-blur-lg group relative"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${app.iconColor} flex items-center justify-center shadow-md`}>
            <IconComponent className="w-6.5 h-6.5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
              {app.name}
            </h3>
            <p className="text-xs text-white/60 line-clamp-1">{app.developer}</p>
          </div>
        </div>

        <button
          id={`bookmark-btn-grid-${app.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onBookmarkToggle(e);
          }}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-4.5 h-4.5 text-indigo-300" />
          ) : (
            <Bookmark className="w-4.5 h-4.5" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-1.5 mt-3">
        <span className="text-[9px] font-semibold font-mono tracking-wide uppercase px-2 py-0.5 rounded bg-white/10 text-slate-200 border border-white/10">
          {app.category}
        </span>
        {app.searchCode && (
          <span className="text-[9px] font-bold font-mono tracking-wide uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">
            Search: {app.searchCode}
          </span>
        )}
        {app.isTrending && (
          <span className="text-[9px] font-semibold font-mono tracking-wide uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
            Trending
          </span>
        )}
        {app.isNew && (
          <span className="text-[9px] font-semibold font-mono tracking-wide uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            New
          </span>
        )}
      </div>

      <p className="text-xs text-white/70 mt-2.5 line-clamp-2 leading-relaxed flex-grow">
        {app.description}
      </p>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
          <span className="text-xs font-bold text-white/90">{app.rating}</span>
          <span className="text-[10px] text-white/45">({app.ratingCount})</span>
        </div>

        <span className="text-[10px] font-semibold text-white/50 group-hover:text-indigo-300 transition-colors">
          View details →
        </span>
      </div>
    </motion.div>
  );
}
