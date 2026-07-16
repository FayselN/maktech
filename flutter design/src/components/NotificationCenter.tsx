import { Bell, Check, Trash2, Sparkles, Smartphone, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNotificationClick: (appId: string) => void;
  onSimulateNewApp: () => void;
}

export default function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick,
  onSimulateNewApp
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div id="notification-center-container" className="space-y-4 font-sans text-xs">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-sky-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <h3 className="font-display font-bold text-sm text-slate-100">
            System Alerts ({notifications.length})
          </h3>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              id="mark-all-read-btn"
              onClick={onMarkAllAsRead}
              className="py-1 px-2.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-semibold cursor-pointer transition-colors"
            >
              Mark all read
            </button>
            <button
              id="clear-all-notif-btn"
              onClick={onClearAll}
              className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-rose-400 cursor-pointer transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Simulator Button */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/20 via-white/5 to-slate-950/40 border border-white/10 text-center space-y-2 backdrop-blur-md">
        <p className="text-[11px] text-white/70 leading-relaxed">
          Test real-time updates! Click below to simulate our editors adding a new useful app recommendation in the background.
        </p>
        <button
          id="simulate-notification-btn"
          onClick={onSimulateNewApp}
          className="mx-auto py-2 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-[11px]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Simulate App Drop Alert</span>
        </button>
      </div>

      {/* Notification items list */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center rounded-xl bg-white/5 border border-white/10 text-white/40 space-y-1.5"
            >
              <Bell className="w-8 h-8 mx-auto text-white/20 stroke-[1.5]" />
              <p className="font-semibold text-[11px]">No active notifications</p>
              <p className="text-[10px]">Simulate an alert above to test the push notification receiver!</p>
            </motion.div>
          ) : (
            notifications.map((notif) => (
              <motion.div
                id={`notification-item-${notif.id}`}
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => {
                  if (notif.appId) onNotificationClick(notif.appId);
                  onMarkAsRead(notif.id);
                }}
                className={`p-3 rounded-xl border cursor-pointer relative group transition-all flex gap-3 ${
                  notif.isRead
                    ? 'bg-white/3 border-white/5 text-white/50 hover:bg-white/8 hover:border-white/10 backdrop-blur-sm'
                    : 'bg-indigo-500/10 border-indigo-500/20 text-white hover:bg-indigo-500/15 backdrop-blur-md shadow-md shadow-indigo-950/10'
                }`}
              >
                {/* Unread indicator bullet */}
                {!notif.isRead && (
                  <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                )}

                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  notif.isRead ? 'bg-white/5 text-white/40' : 'bg-indigo-500/25 text-indigo-300'
                }`}>
                  <Sparkles className="w-4.5 h-4.5" />
                </div>

                <div className="space-y-1 min-w-0 pr-2">
                  <h4 className={`font-display text-xs truncate leading-tight ${
                    notif.isRead ? 'text-white/60 font-semibold' : 'text-slate-100 font-bold'
                  }`}>
                    {notif.title}
                  </h4>
                  <p className="text-[11px] leading-relaxed text-white/70 pr-1 break-words">
                    {notif.message}
                  </p>
                  <p className="text-[9px] text-white/40 font-mono">
                    {notif.timestamp}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
