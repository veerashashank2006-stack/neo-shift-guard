import { useState, useEffect } from "react"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { AttendanceChart } from "@/components/dashboard/AttendanceChart"
import { Users, Clock, DollarSign, TrendingUp, Calendar, Timer, AlertTriangle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

export default function Dashboard() {
  const { user } = useAuth()
  const [dashboardStats, setDashboardStats] = useState({
    currentlyLoggedIn: 0,
    lateArrivals: 0,
    absentToday: 0,
    totalHours: 0,
    dailySalaryEst: 0,
    overtimeHours: 0,
    avgCheckinTime: "8:47 AM"
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Get today's date
      const today = new Date().toISOString().split('T')[0]

      // Fetch attendance records for today
      const { data: todayAttendance, error: attendanceError } = await supabase
        .from('attendance_records')
        .select(`
          *,
          user_profiles!inner(full_name, role)
        `)
        .eq('date', today)

      if (attendanceError) throw attendanceError

      // Calculate stats
      const currentlyLoggedIn = todayAttendance?.filter(record => 
        record.check_in_time && !record.check_out_time
      ).length || 0

      const lateArrivals = todayAttendance?.filter(record => 
        record.status === 'late'
      ).length || 0

      // Get all employees to calculate absent count
      const { data: allEmployees } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('is_active', true)

      const presentToday = todayAttendance?.length || 0
      const totalEmployees = allEmployees?.length || 0
      const absentToday = Math.max(0, totalEmployees - presentToday)

      // Calculate total hours
      let totalHours = 0
      todayAttendance?.forEach(record => {
        if (record.check_in_time) {
          const checkIn = new Date(record.check_in_time)
          const checkOut = record.check_out_time ? new Date(record.check_out_time) : new Date()
          const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
          totalHours += hours
        }
      })

      // Fetch recent activity
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setDashboardStats({
        currentlyLoggedIn,
        lateArrivals,
        absentToday,
        totalHours: Math.round(totalHours),
        dailySalaryEst: Math.round(totalHours * 15), // Assuming $15/hour average
        overtimeHours: Math.max(0, totalHours - (totalEmployees * 8)),
        avgCheckinTime: "8:47 AM" // This would need more complex calculation
      })

      setRecentActivity(notifications || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Real-time insights into your staff attendance and performance</p>
      </div>

      {/* Live Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Currently Logged In"
          value={dashboardStats.currentlyLoggedIn}
          change={{ value: 12, isPositive: true }}
          icon={Users}
          description="Active staff members"
        />
        
        <StatsCard
          title="Late Arrivals"
          value={dashboardStats.lateArrivals}
          change={{ value: -15, isPositive: true }}
          icon={AlertTriangle}
          description="Today's late check-ins"
        />
        
        <StatsCard
          title="Absent Today"
          value={dashboardStats.absentToday}
          change={{ value: -25, isPositive: true }}
          icon={Calendar}
          description="Unexcused absences"
        />
        
        <StatsCard
          title="Total Hours (Today)"
          value={`${dashboardStats.totalHours}hrs`}
          change={{ value: 8, isPositive: true }}
          icon={Timer}
          description="Collective work hours"
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Daily Salary Est."
          value={`$${dashboardStats.dailySalaryEst.toLocaleString()}`}
          change={{ value: 5.2, isPositive: true }}
          icon={DollarSign}
          description="Based on hours worked"
        >
          <div className="flex items-center gap-4 mt-2">
            <div className="text-xs text-muted-foreground">
              Base: ${Math.round(dashboardStats.dailySalaryEst * 0.7).toLocaleString()} • Overtime: ${Math.round(dashboardStats.dailySalaryEst * 0.3).toLocaleString()}
            </div>
          </div>
        </StatsCard>
        
        <StatsCard
          title="Overtime Hours"
          value={`${dashboardStats.overtimeHours.toFixed(1)}hrs`}
          change={{ value: -8, isPositive: true }}
          icon={TrendingUp}
          description="Extra hours today"
        />
        
        <StatsCard
          title="Avg. Check-in Time"
          value={dashboardStats.avgCheckinTime}
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
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={activity.id || index} className="flex items-center gap-4 p-3 rounded-xl bg-muted/20 border border-white/5 hover:bg-muted/30 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-success animate-pulse' :
                  activity.type === 'warning' ? 'bg-warning' :
                  activity.type === 'error' ? 'bg-destructive' :
                  'bg-muted-foreground'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.message}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(activity.created_at).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}