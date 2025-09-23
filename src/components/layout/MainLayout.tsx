import { ReactNode } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true} className="min-h-screen w-full">
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="glass-card border-b border-white/10 px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground">Bar Staff Attendance</h1>
                <p className="text-sm text-muted-foreground">Admin Dashboard</p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Status Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/20 border border-success/30">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-success">Live</span>
                </div>

                {/* Time Display */}
                <div className="text-sm text-muted-foreground">
                  {new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}