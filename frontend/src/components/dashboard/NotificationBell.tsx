"use client";

import { useState, useEffect } from "react";
import { Bell, X, Check } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useChildData } from "@/hooks/useChildData";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export default function NotificationBell() {
  const { registrationId, token } = useChildData();
  const [userId, setUserId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);

  const {
    notifications: realtimeNotifications,
    unreadCount: realtimeUnreadCount,
    connected,
    markAsRead,
    clearAll,
    requestNotificationPermission,
  } = useNotifications(userId || undefined, registrationId || undefined);

  // Get userId from token
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.sub);
      } catch (error) {
        console.error('Failed to parse token:', error);
      }
    }
  }, [token]);

  // Fetch existing notifications
  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_BASE}/notifications?limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setAllNotifications(data.data.notifications);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, [token]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Combine realtime and existing notifications
  const combinedNotifications = [...realtimeNotifications, ...allNotifications];
  const totalUnreadCount = realtimeUnreadCount + allNotifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = async () => {
    if (!token) return;

    try {
      await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      clearAll();
      setAllNotifications([]);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'vaccination_due':
        return '💉';
      case 'health_record':
        return '📋';
      case 'milestone':
        return '🎉';
      case 'go_green':
        return '🌱';
      case 'payment':
        return '💳';
      default:
        return '📬';
    }
  };

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100"
      >
        <Bell className="h-6 w-6" />
        {totalUnreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
          </span>
        )}
        {connected && (
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500"></span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          ></div>

          {/* Dropdown Content */}
          <div className="absolute right-0 top-12 z-50 w-96 rounded-xl border border-slate-200 bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
                {totalUnreadCount > 0 && (
                  <p className="text-sm text-slate-500">{totalUnreadCount} unread</p>
                )}
              </div>
              {totalUnreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/10"
                >
                  <Check className="h-4 w-4" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {combinedNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="mb-3 h-12 w-12 text-slate-300" />
                  <p className="text-sm text-slate-500">No notifications yet</p>
                </div>
              ) : (
                combinedNotifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`border-b border-slate-100 p-4 transition-colors hover:bg-slate-50 ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-slate-900">{notification.title}</h4>
                          <button
                            onClick={() => markAsRead(index)}
                            className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                        <p className="mt-2 text-xs text-slate-400">
                          {formatTime(notification.timestamp || notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {combinedNotifications.length > 0 && (
              <div className="border-t border-slate-200 p-3 text-center">
                <button className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
