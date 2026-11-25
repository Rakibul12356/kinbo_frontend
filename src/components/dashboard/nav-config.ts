import {
  BarChart3,
  Bell,
  Briefcase,
  FolderTree,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Star,
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
        { label: "Categories", href: "/admin/categories", icon: FolderTree },
        { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
        { label: "Reviews", href: "/admin/reviews", icon: Star },
        { label: "Customers", href: "/admin/customers", icon: Users },
        { label: "Reports", href: "/admin/reports", icon: BarChart3 },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Careers", href: "/admin/careers", icon: Briefcase },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];
}
