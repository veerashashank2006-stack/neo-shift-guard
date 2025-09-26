import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, QrCode, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type AttendanceRecord = Tables<'attendance_records'>;

export default function Attendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    if (user) {
      fetchAttendanceRecords();
      checkTodayRecord();
    }
  }, [user]);

  const fetchAttendanceRecords = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10);

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch attendance records', variant: 'destructive' });
    } else {
      setRecords(data || []);
    }
  };

  const checkTodayRecord = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    setTodayRecord(data);
  };

  const handleQRCheckIn = async () => {
    if (!user || !qrCode.trim()) {
      toast({ title: 'Error', description: 'Please enter a QR code', variant: 'destructive' });
      return;
    }

    setLoading(true);
    
    try {
      // Validate QR code
      const { data: isValid, error: validateError } = await supabase
        .rpc('validate_qr_attendance_code', { qr_code_input: qrCode.trim() });

      if (validateError || !isValid) {
        toast({ title: 'Invalid QR Code', description: 'The QR code is invalid or expired', variant: 'destructive' });
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      // Check if already checked in today
      if (todayRecord && todayRecord.check_in_time && !todayRecord.check_out_time) {
        // Check out
        const { error } = await supabase
          .from('attendance_records')
          .update({ 
            check_out_time: now,
            qr_code: qrCode.trim()
          })
          .eq('id', todayRecord.id);

        if (error) {
          toast({ title: 'Error', description: 'Failed to check out', variant: 'destructive' });
        } else {
          toast({ title: 'Success', description: 'Successfully checked out!', variant: 'default' });
          setQrCode('');
          checkTodayRecord();
          fetchAttendanceRecords();
        }
      } else {
        // Check in (create new record or update existing)
        const recordData = {
          user_id: user.id,
          date: today,
          check_in_time: now,
          qr_code: qrCode.trim(),
          status: 'present' as const
        };

        const { error } = await supabase
          .from('attendance_records')
          .upsert(recordData, { onConflict: 'user_id,date' });

        if (error) {
          toast({ title: 'Error', description: 'Failed to check in', variant: 'destructive' });
        } else {
          toast({ title: 'Success', description: 'Successfully checked in!', variant: 'default' });
          setQrCode('');
          checkTodayRecord();
          fetchAttendanceRecords();
    }
  }

  const deleteAttendanceRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', recordId)

      if (error) throw error

      setRecords(records.filter(record => record.id !== recordId))
      toast({
        title: 'Success',
        description: 'Attendance record deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting attendance record:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete attendance record',
        variant: 'destructive'
      })
    }
  }

  const editAttendanceRecord = async (recordId: string, field: string, newValue: string) => {
    try {
      const { error } = await supabase
        .from('attendance_records')
        .update({ [field]: newValue })
        .eq('id', recordId)

      if (error) throw error

      // Refresh records
      fetchAttendanceRecords()
      
      toast({
        title: 'Success',
        description: 'Attendance record updated successfully'
      })
    } catch (error) {
      console.error('Error updating attendance record:', error)
      toast({
        title: 'Error',
        description: 'Failed to update attendance record',
        variant: 'destructive'
      })
    }
  }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
    }
    
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'late': return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'absent': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      present: 'bg-success/20 text-success border-success/30',
      late: 'bg-warning/20 text-warning border-warning/30',
      absent: 'bg-destructive/20 text-destructive border-destructive/30',
      half_day: 'bg-muted/20 text-muted-foreground border-muted/30'
    };
    
    return (
      <Badge className={`${variants[status as keyof typeof variants] || variants.half_day} border`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status.replace('_', ' ')}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Attendance Management</h2>
        <p className="text-muted-foreground">Track your daily attendance with QR codes</p>
      </div>

      <Tabs defaultValue="checkin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-card">
          <TabsTrigger value="checkin">QR Check-in/out</TabsTrigger>
          <TabsTrigger value="history">Attendance History</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="space-y-6">
          {/* Today's Status */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today's Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/10 border border-white/10">
                  <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Check-in</div>
                  <div className="font-semibold text-foreground">
                    {todayRecord?.check_in_time 
                      ? format(new Date(todayRecord.check_in_time), 'HH:mm')
                      : 'Not checked in'
                    }
                  </div>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-muted/10 border border-white/10">
                  <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Check-out</div>
                  <div className="font-semibold text-foreground">
                    {todayRecord?.check_out_time 
                      ? format(new Date(todayRecord.check_out_time), 'HH:mm')
                      : 'Not checked out'
                    }
                  </div>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-muted/10 border border-white/10">
                  <div className="text-sm text-muted-foreground mb-2">Status</div>
                  {todayRecord?.status ? getStatusBadge(todayRecord.status) : (
                    <Badge className="bg-muted/20 text-muted-foreground border-muted/30 border">
                      <XCircle className="h-4 w-4" />
                      <span className="ml-1">No record</span>
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Scanner */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                QR Code {todayRecord?.check_in_time && !todayRecord?.check_out_time ? 'Check-out' : 'Check-in'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Enter or scan QR code..."
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    className="glass-card border-white/10"
                    disabled={loading}
                  />
                </div>
                
                <Button 
                  onClick={handleQRCheckIn}
                  className="w-full glass-button neon-glow"
                  disabled={loading || !qrCode.trim()}
                >
                  {loading ? 'Processing...' : (
                    todayRecord?.check_in_time && !todayRecord?.check_out_time ? 'Check Out' : 'Check In'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Recent Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {records.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No attendance records found
                  </div>
                ) : (
                  records.map((record) => (
                    <div 
                      key={record.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/10 border border-white/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Date</div>
                          <div className="font-semibold text-foreground">
                            {format(new Date(record.date), 'MMM dd')}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Check-in</div>
                          <div className="font-semibold text-foreground">
                            {record.check_in_time 
                              ? format(new Date(record.check_in_time), 'HH:mm')
                              : '--:--'
                            }
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Check-out</div>
                          <div className="font-semibold text-foreground">
                            {record.check_out_time 
                              ? format(new Date(record.check_out_time), 'HH:mm')
                              : '--:--'
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {record.status && getStatusBadge(record.status)}
                        {record.location_lat && record.location_lng && (
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}