import {
  BarChart3,
  Bell,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import type { NavGroup } from "./DashboardShell";

export function adminNav(unreadNotifications = 0): NavGroup[] {
  return [
    {
      items: [
        { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
        {
          label: "Notifications",
          href: "/admin/notifications",
          icon: Bell,
          badge: unreadNotifications > 0 ? unreadNotifications : undefined,
        },
      ],
    },
    {
      title: "Marketplace",
      items: [
        { label: "Products", href: "/admin/products", icon: Package },
        { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
        { label: "Customers", href: "/admin/customers", icon: Users, soon: true },
        { label: "Reports", href: "/admin/reports", icon: BarChart3, soon: true },
      ],
    },
    {
      title: "System",
      items: [{ label: "Settings", href: "/admin/settings", icon: Settings, soon: true }],
    },
  ];
}
