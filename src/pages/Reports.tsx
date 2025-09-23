import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Users, Clock, TrendingUp, Download, Filter } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type AttendanceRecord = Tables<'attendance_records'>;
type UserProfile = Tables<'user_profiles'>;

export default function Reports() {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchReportData();
    }
  }, [user]);

  const fetchReportData = async () => {
    setLoading(true);
    
    try {
      // Fetch attendance records for the last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
      
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('date', thirtyDaysAgo)
        .order('date', { ascending: true });

      if (attendanceError) throw attendanceError;

      // Fetch user profiles
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');

      if (profilesError) throw profilesError;

      setAttendanceData(attendance || []);
      setProfiles(userProfiles || []);
      
      // Process data for charts
      processWeeklyData(attendance || []);
      processStatusData(attendance || []);
      
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processWeeklyData = (data: AttendanceRecord[]) => {
    const weeklyStats: { [key: string]: { present: number, late: number, absent: number } } = {};
    
    data.forEach(record => {
      const weekStart = format(startOfWeek(new Date(record.date)), 'MMM dd');
      if (!weeklyStats[weekStart]) {
        weeklyStats[weekStart] = { present: 0, late: 0, absent: 0 };
      }
      
      if (record.status && record.status in weeklyStats[weekStart]) {
        (weeklyStats[weekStart] as any)[record.status]++;
      }
    });

    const weeklyArray = Object.entries(weeklyStats).map(([week, stats]) => ({
      week,
      ...stats
    }));

    setWeeklyData(weeklyArray);
  };

  const processStatusData = (data: AttendanceRecord[]) => {
    const statusCount = data.reduce((acc, record) => {
      if (record.status) {
        acc[record.status] = (acc[record.status] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });

    const statusArray = Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
      value: count,
      color: {
        present: 'hsl(var(--success))',
        late: 'hsl(var(--warning))',
        absent: 'hsl(var(--destructive))',
        half_day: 'hsl(var(--muted-foreground))'
      }[status] || 'hsl(var(--muted-foreground))'
    }));

    setStatusData(statusArray);
  };

  const getTotalStats = () => {
    const totalRecords = attendanceData.length;
    const presentCount = attendanceData.filter(r => r.status === 'present').length;
    const lateCount = attendanceData.filter(r => r.status === 'late').length;
    const absentCount = attendanceData.filter(r => r.status === 'absent').length;
    
    return {
      total: totalRecords,
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      presentRate: totalRecords ? ((presentCount / totalRecords) * 100).toFixed(1) : '0'
    };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Attendance Reports</h2>
          <p className="text-muted-foreground">Analytics and insights for the last 30 days</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass-card border-white/10">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="glass-button neon-glow">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-success/20 border border-success/30">
                <Clock className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-foreground">{stats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-warning/20 border border-warning/30">
                <CalendarDays className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Late Arrivals</p>
                <p className="text-2xl font-bold text-foreground">{stats.late}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold text-foreground">{stats.presentRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass-card">
          <TabsTrigger value="trends">Attendance Trends</TabsTrigger>
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
          <TabsTrigger value="employees">Employee Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Weekly Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px'
                    }}
                  />
                  <Line type="monotone" dataKey="present" stroke="hsl(var(--success))" strokeWidth={3} />
                  <Line type="monotone" dataKey="late" stroke="hsl(var(--warning))" strokeWidth={2} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="absent" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle>Status Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-foreground">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">{item.value}</div>
                        <div className="text-xs text-muted-foreground">
                          {((item.value / stats.total) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Employee Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profiles.map((profile) => {
                  const userRecords = attendanceData.filter(r => r.user_id === profile.id);
                  const presentCount = userRecords.filter(r => r.status === 'present').length;
                  const totalRecords = userRecords.length;
                  const attendanceRate = totalRecords ? ((presentCount / totalRecords) * 100).toFixed(1) : '0';
                  
                  return (
                    <div key={profile.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/10 border border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {profile.full_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{profile.full_name}</div>
                          <div className="text-sm text-muted-foreground">{profile.employee_id} • {profile.role}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-foreground">{attendanceRate}%</div>
                        <div className="text-sm text-muted-foreground">{presentCount}/{totalRecords} days</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}