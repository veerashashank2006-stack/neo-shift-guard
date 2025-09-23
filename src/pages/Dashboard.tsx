import { StatsCard } from "@/components/dashboard/StatsCard"
import { AttendanceChart } from "@/components/dashboard/AttendanceChart"
import { Users, Clock, DollarSign, TrendingUp, Calendar, Timer, AlertTriangle } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Real-time insights into your bar staff attendance and performance</p>
      </div>

      {/* Live Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Currently Logged In"
          value={47}
          change={{ value: 12, isPositive: true }}
          icon={Users}
          description="Active staff members"
        />
        
        <StatsCard
          title="Late Arrivals"
          value={8}
          change={{ value: -15, isPositive: true }}
          icon={AlertTriangle}
          description="Today's late check-ins"
        />
        
        <StatsCard
          title="Absent Today"
          value={3}
          change={{ value: -25, isPositive: true }}
          icon={Calendar}
          description="Unexcused absences"
        />
        
        <StatsCard
          title="Total Hours (Today)"
          value="347hrs"
          change={{ value: 8, isPositive: true }}
          icon={Timer}
          description="Collective work hours"
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Daily Salary Est."
          value="$2,847"
          change={{ value: 5.2, isPositive: true }}
          icon={DollarSign}
          description="Based on hours worked"
        >
          <div className="flex items-center gap-4 mt-2">
            <div className="text-xs text-muted-foreground">
              Base: $1,980 • Overtime: $867
            </div>
          </div>
        </StatsCard>
        
        <StatsCard
          title="Overtime Hours"
          value="23.5hrs"
          change={{ value: -8, isPositive: true }}
          icon={TrendingUp}
          description="Extra hours today"
        />
        
        <StatsCard
          title="Avg. Check-in Time"
          value="8:47 AM"
          icon={Clock}
          description="Today's average"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart />
        
        {/* Overtime Trends Chart */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Overtime Trends</h3>
            <p className="text-sm text-muted-foreground">Weekly overtime hours distribution</p>
          </div>
          
          <div className="space-y-4">
            {[
              { day: 'Monday', hours: 12.5, percentage: 85 },
              { day: 'Tuesday', hours: 8.2, percentage: 55 },
              { day: 'Wednesday', hours: 15.8, percentage: 100 },
              { day: 'Thursday', hours: 11.3, percentage: 75 },
              { day: 'Friday', hours: 18.7, percentage: 95 },
              { day: 'Saturday', hours: 9.4, percentage: 60 },
              { day: 'Sunday', hours: 6.1, percentage: 40 },
            ].map((item) => (
              <div key={item.day} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{item.day}</span>
                  <span className="text-foreground font-medium">{item.hours}hrs</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full transition-all duration-500 shadow-glow"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Latest check-ins and updates</p>
        </div>
        
        <div className="space-y-3">
          {[
            { name: 'Sarah Johnson', action: 'Checked in', time: '2 mins ago', status: 'success' },
            { name: 'Mike Chen', action: 'Overtime approved', time: '5 mins ago', status: 'warning' },
            { name: 'Emily Davis', action: 'Checked out', time: '12 mins ago', status: 'muted' },
            { name: 'Alex Rodriguez', action: 'Late check-in', time: '18 mins ago', status: 'destructive' },
            { name: 'Jessica Wilson', action: 'Break started', time: '25 mins ago', status: 'muted' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-muted/20 border border-white/5 hover:bg-muted/30 transition-colors">
              <div className={`w-2 h-2 rounded-full ${
                activity.status === 'success' ? 'bg-success animate-pulse' :
                activity.status === 'warning' ? 'bg-warning' :
                activity.status === 'destructive' ? 'bg-destructive' :
                'bg-muted-foreground'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{activity.name}</p>
                <p className="text-xs text-muted-foreground">{activity.action}</p>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}