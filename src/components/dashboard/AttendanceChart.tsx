import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from "@/integrations/supabase/client"

export function AttendanceChart() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttendanceData()
  }, [])

  const fetchAttendanceData = async () => {
    try {
      // Get the last 7 days
      const dates = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        dates.push(date.toISOString().split('T')[0])
      }

      const weeklyData = await Promise.all(
        dates.map(async (date) => {
          const { data: attendanceRecords } = await supabase
            .from('attendance_records')
            .select('status')
            .eq('date', date)

          const present = attendanceRecords?.filter(r => r.status === 'present').length || 0
          const late = attendanceRecords?.filter(r => r.status === 'late').length || 0
          const absent = attendanceRecords?.filter(r => r.status === 'absent').length || 0

          return {
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            present,
            late,
            absent
          }
        })
      )

      setChartData(weeklyData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching attendance data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Attendance Trends</h3>
          <p className="text-sm text-muted-foreground">Weekly attendance patterns</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading chart...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Attendance Trends</h3>
        <p className="text-sm text-muted-foreground">Weekly attendance patterns</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              color: 'hsl(var(--foreground))'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="present" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, fill: 'hsl(var(--primary))' }}
          />
          <Line 
            type="monotone" 
            dataKey="late" 
            stroke="hsl(var(--warning))" 
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Line 
            type="monotone" 
            dataKey="absent" 
            stroke="hsl(var(--destructive))" 
            strokeWidth={2}
            strokeDasharray="3 3"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-warning rounded-full" />
          <span className="text-xs text-muted-foreground">Late</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-destructive rounded-full" />
          <span className="text-xs text-muted-foreground">Absent</span>
        </div>
      </div>
    </div>
  )
}