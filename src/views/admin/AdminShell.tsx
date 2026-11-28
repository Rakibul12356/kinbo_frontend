"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { adminNav } from "@/components/dashboard/nav-config";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { logout, ADMIN_ROUTES } from "@/lib/auth/auth-store";

/** Admin flavour of DashboardShell; every admin page wraps its content in this. */
export default function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { admin } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <DashboardShell
      brandLabel="Admin"
      navGroups={adminNav(unreadCount)}
      title={title}
      description={description}
      actions={actions}
      notificationHref={ADMIN_ROUTES.notifications}
      unreadNotifications={unreadCount}
      user={{
        name: admin?.name ?? "Admin",
        email: admin?.email ?? "",
        avatar: admin?.avatar ?? undefined,
      }}
      onLogout={() => {
        logout();
        queryClient.clear();
      }}
    >
      {children}
    </DashboardShell>
  );
}
