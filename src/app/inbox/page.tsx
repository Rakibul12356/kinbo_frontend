"use client";

import React from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import PageLayout from "@/components/layout/PageLayout";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications, NOTIFICATION_QUERY_KEY } from "@/hooks/use-notifications";
import { USER_ROUTES } from "@/lib/auth/auth-store";
import { notificationService } from "@/services/notification.service";
import { Bell, Inbox } from "lucide-react";

export default function InboxPage() {
  const queryClient = useQueryClient();
  const { ready: authReady, profile } = useAuth();
  const { notifications, unreadCount, isLoading } = useNotifications();

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      await queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });
    } catch {
      toast.error("Could not mark notification as read.");
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map((n) => notificationService.markAsRead(n.id)));
      await queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Could not update notifications.");
    }
  };

  return (
    <PageLayout className="bg-[#F3F7FC]">
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 mb-1">
              <Link href="/account" className="hover:text-[#082F6B]">
                Account
              </Link>
              <span>/</span>
              <span className="text-[#082F6B]">Inbox</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">
              Inbox & Notifications
            </h1>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-[#082F6B] hover:text-[#FF6B00] transition cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>

        {!authReady || isLoading ? (
          <p className="text-sm text-zinc-500">Loading notifications…</p>
        ) : !profile ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center">
            <p className="text-sm font-semibold text-[#1F2937]">Sign in to view notifications</p>
            <Link
              href={USER_ROUTES.login}
              className="mt-4 inline-flex rounded-xl bg-[#082F6B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#062452]"
            >
              Sign In
            </Link>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
            <Inbox className="mx-auto h-10 w-10 text-zinc-300" />
            <p className="mt-3 text-sm font-semibold text-[#1F2937]">No notifications yet</p>
            <p className="mt-1 text-xs text-zinc-500">
              Order updates and restock alerts will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => !item.isRead && handleMarkRead(item.id)}
                className={`w-full text-left p-5 rounded-2xl border transition flex items-start gap-4 cursor-pointer ${
                  !item.isRead
                    ? "bg-white border-[#082F6B]/30 shadow-2xs"
                    : "bg-white/80 border-[#E5E7EB]"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#F3F7FC] flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-[#082F6B]" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`text-sm ${
                        !item.isRead ? "font-bold text-[#1F2937]" : "font-semibold text-zinc-700"
                      }`}
                    >
                      {item.title}
                    </h3>
                    <span className="text-[11px] text-zinc-400 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    {item.message}
                  </p>
                  {item.entityId && item.type === "ORDER_STATUS_UPDATE" && (
                    <Link
                      href={`/orders/${encodeURIComponent(item.entityId)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 inline-block text-xs font-semibold text-[#082F6B] hover:underline"
                    >
                      View order
                    </Link>
                  )}
                </div>

                {!item.isRead && (
                  <span className="w-2 h-2 rounded-full bg-[#FF6B00] mt-2 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </PageLayout>
  );
}
