import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Clock, Calculator, Download, TrendingUp, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, differenceInHours } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type AttendanceRecord = Tables<'attendance_records'>;
type UserProfile = Tables<'user_profiles'>;

interface PayrollData {
  user_id: string;
  user_name: string;
  employee_id: string;
  regular_hours: number;
  overtime_hours: number;
  total_hours: number;
  hourly_rate: number;
  regular_pay: number;
  overtime_pay: number;
  total_pay: number;
}

export default function Payroll() {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [normalPayRate, setNormalPayRate] = useState<number>(18.50);
  const [specialPayRate, setSpecialPayRate] = useState<number>(27.75);

  useEffect(() => {
    if (user) {
      fetchPayrollData();
    }
  }, [user, selectedMonth]);

  const fetchPayrollData = async () => {
    setLoading(true);
    
    try {
      const monthStart = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');
      
      // Fetch attendance records for the selected month
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .not('check_in_time', 'is', null)
        .not('check_out_time', 'is', null);

      if (attendanceError) throw attendanceError;

      // Fetch user profiles
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('is_active', true);

      if (profilesError) throw profilesError;

      setAttendanceRecords(attendance || []);
      setProfiles(userProfiles || []);
      
      // Calculate payroll data
      calculatePayroll(attendance || [], userProfiles || []);
      
    } catch (error) {
      console.error('Error fetching payroll data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePayroll = (attendance: AttendanceRecord[], userProfiles: UserProfile[]) => {
    const payroll: PayrollData[] = [];
    
    userProfiles.forEach(profile => {
      const userAttendance = attendance.filter(record => record.user_id === profile.id);
      
      let totalRegularHours = 0;
      let totalOvertimeHours = 0;
      
      userAttendance.forEach(record => {
        if (record.check_in_time && record.check_out_time) {
          const checkIn = new Date(record.check_in_time);
          const checkOut = new Date(record.check_out_time);
          const hoursWorked = differenceInHours(checkOut, checkIn);
          
          // Assume 8 hours is regular, anything above is overtime
          const regularHours = Math.min(hoursWorked, 8);
          const overtimeHours = Math.max(hoursWorked - 8, 0);
          
          totalRegularHours += regularHours;
          totalOvertimeHours += overtimeHours;
        }
      });
      
      // Use configurable rates
      const hourlyRate = normalPayRate;
      const overtimeRate = specialPayRate;
      
      const regularPay = totalRegularHours * hourlyRate;
      const overtimePay = totalOvertimeHours * overtimeRate;
      const totalPay = regularPay + overtimePay;
      
      payroll.push({
        user_id: profile.id,
        user_name: profile.full_name,
        employee_id: profile.employee_id,
        regular_hours: totalRegularHours,
        overtime_hours: totalOvertimeHours,
        total_hours: totalRegularHours + totalOvertimeHours,
        hourly_rate: hourlyRate,
        regular_pay: regularPay,
        overtime_pay: overtimePay,
        total_pay: totalPay
      });
    });
    
    setPayrollData(payroll);
  };

  const getTotalPayroll = () => {
    return payrollData.reduce((total, employee) => total + employee.total_pay, 0);
  };

  const getTotalHours = () => {
    return payrollData.reduce((total, employee) => total + employee.total_hours, 0);
  };

  const getTotalOvertimeHours = () => {
    return payrollData.reduce((total, employee) => total + employee.overtime_hours, 0);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading payroll data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Payroll Management</h2>
          <p className="text-muted-foreground">
            Calculate and manage employee compensation for {format(selectedMonth, 'MMMM yyyy')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
            className="glass-card border-white/10"
          >
            Previous Month
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
            className="glass-card border-white/10"
          >
            Next Month
          </Button>
          <Button className="glass-button neon-glow">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Pay Rate Configuration */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Pay Rate Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="normalPay" className="text-foreground">Normal Pay Rate (per hour)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="normalPay"
                  type="number"
                  step="0.01"
                  min="0"
                  value={normalPayRate}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      setNormalPayRate(value);
                    }
                  }}
                  onBlur={() => {
                    calculatePayroll(attendanceRecords, profiles);
                  }}
                  className="pl-7"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialPay" className="text-foreground">Special Pay Rate (overtime per hour)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="specialPay"
                  type="number"
                  step="0.01"
                  min="0"
                  value={specialPayRate}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      setSpecialPayRate(value);
                    }
                  }}
                  onBlur={() => {
                    calculatePayroll(attendanceRecords, profiles);
                  }}
                  className="pl-7"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payroll</p>
                <p className="text-2xl font-bold text-foreground">${getTotalPayroll().toFixed(2)}</p>
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
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold text-foreground">{getTotalHours().toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-warning/20 border border-warning/30">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overtime Hours</p>
                <p className="text-2xl font-bold text-foreground">{getTotalOvertimeHours().toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="text-2xl font-bold text-foreground">{payrollData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-card">
          <TabsTrigger value="summary">Employee Summary</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Payroll Summary - {format(selectedMonth, 'MMMM yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollData.map((employee) => (
                  <div 
                    key={employee.user_id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/10 border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {employee.user_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{employee.user_name}</div>
                        <div className="text-sm text-muted-foreground">{employee.employee_id}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Hours</div>
                        <div className="font-semibold text-foreground">
                          {employee.total_hours.toFixed(1)}
                        </div>
                        {employee.overtime_hours > 0 && (
                          <div className="text-xs text-warning">
                            +{employee.overtime_hours.toFixed(1)} OT
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Rate</div>
                        <div className="font-semibold text-foreground">
                          ${employee.hourly_rate.toFixed(2)}/hr
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total Pay</div>
                        <div className="text-xl font-bold text-success">
                          ${employee.total_pay.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {payrollData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No payroll data available for {format(selectedMonth, 'MMMM yyyy')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Detailed Payroll Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {payrollData.map((employee) => (
                  <div key={employee.user_id} className="p-4 rounded-lg bg-muted/10 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-foreground">{employee.user_name}</h4>
                        <p className="text-sm text-muted-foreground">{employee.employee_id}</p>
                      </div>
                      <Badge className="bg-primary/20 text-primary border-primary/30 border">
                        ${employee.total_pay.toFixed(2)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted/20 border border-white/10">
                        <div className="text-sm text-muted-foreground">Regular Hours</div>
                        <div className="font-semibold text-foreground">{employee.regular_hours.toFixed(1)}</div>
                        <div className="text-xs text-success">${employee.regular_pay.toFixed(2)}</div>
                      </div>
                      
                      <div className="text-center p-3 rounded-lg bg-muted/20 border border-white/10">
                        <div className="text-sm text-muted-foreground">Overtime Hours</div>
                        <div className="font-semibold text-foreground">{employee.overtime_hours.toFixed(1)}</div>
                        <div className="text-xs text-warning">${employee.overtime_pay.toFixed(2)}</div>
                      </div>
                      
                      <div className="text-center p-3 rounded-lg bg-muted/20 border border-white/10">
                        <div className="text-sm text-muted-foreground">Hourly Rate</div>
                        <div className="font-semibold text-foreground">${employee.hourly_rate.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">Base rate</div>
                      </div>
                      
                      <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/30">
                        <div className="text-sm text-muted-foreground">Total Pay</div>
                        <div className="font-bold text-primary">${employee.total_pay.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{employee.total_hours.toFixed(1)} hrs</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}