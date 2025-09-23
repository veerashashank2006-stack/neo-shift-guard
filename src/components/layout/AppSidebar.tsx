import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  DollarSign, 
  FileText, 
  Settings, 
  Bell, 
  QrCode,
  ChevronLeft,
  ChevronRight 
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const navigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Employees",
    url: "/employees",
    icon: Users,
  },
  {
    title: "Attendance",
    url: "/attendance", 
    icon: Clock,
  },
  {
    title: "Payroll",
    url: "/payroll",
    icon: DollarSign,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "QR Sessions",
    url: "/qr-sessions",
    icon: QrCode,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar()
  const location = useLocation()
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(path)
  }

  return (
    <Sidebar className={`glass-card border-r border-sidebar-border/20 ${collapsed ? "w-16" : "w-64"} transition-all duration-300`}>
      <SidebarContent className="relative">
        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 z-50 glass-button p-1.5 rounded-full"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-primary" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-primary" />
          )}
        </button>

        {/* Header */}
        <div className="p-4 border-b border-sidebar-border/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-sm font-semibold text-sidebar-foreground">Bar Staff</h2>
                <p className="text-xs text-sidebar-foreground/60">Attendance Admin</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-medium px-4 py-2">
              Main Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`
                      group relative w-full rounded-xl transition-all duration-200
                      ${isActive(item.url)
                        ? "bg-primary/20 border border-primary/30 text-primary shadow-glow" 
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border border-transparent hover:border-primary/10"
                      }
                    `}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2.5 w-full">
                      <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive(item.url) ? "text-primary" : ""}`} />
                      {!collapsed && (
                        <span className="text-sm font-medium truncate">{item.title}</span>
                      )}
                      {isActive(item.url) && (
                        <div className="absolute inset-0 rounded-xl bg-primary/5 animate-glow-pulse" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Status indicator */}
        <div className="mt-auto p-4 border-t border-sidebar-border/20">
          {!collapsed && (
            <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>System Online</span>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  )
}