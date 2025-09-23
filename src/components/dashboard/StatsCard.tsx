import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    isPositive: boolean
  }
  icon: LucideIcon
  description?: string
  children?: ReactNode
}

export function StatsCard({ title, value, change, icon: Icon, description, children }: StatsCardProps) {
  return (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:shadow-glow-lg transition-all duration-300 neon-glow">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {description && (
                <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>
              )}
            </div>
          </div>
          
          {change && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
              change.isPositive 
                ? "bg-success/20 text-success border border-success/30" 
                : "bg-destructive/20 text-destructive border border-destructive/30"
            }`}>
              <span>{change.isPositive ? "+" : ""}{change.value}%</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {children}
        </div>
      </div>
    </div>
  )
}