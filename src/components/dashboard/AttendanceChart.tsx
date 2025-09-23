import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const mockData = [
  { date: 'Mon', present: 85, late: 12, absent: 8 },
  { date: 'Tue', present: 92, late: 8, absent: 5 },
  { date: 'Wed', present: 78, late: 15, absent: 12 },
  { date: 'Thu', present: 88, late: 10, absent: 7 },
  { date: 'Fri', present: 95, late: 5, absent: 3 },
  { date: 'Sat', present: 82, late: 14, absent: 9 },
  { date: 'Sun', present: 76, late: 16, absent: 13 },
]

export function AttendanceChart() {
  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Attendance Trends</h3>
        <p className="text-sm text-muted-foreground">Weekly attendance patterns</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={mockData}>
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