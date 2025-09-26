import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Bell, Database, LogOut, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';

type UserProfile = Tables<'user_profiles'>;

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    position: ''
  });

  // Notification preferences
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    attendance_reminders: true,
    payroll_notifications: true
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setProfileForm({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || '',
        department: data.department || '',
        position: data.position || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone || null,
          department: profileForm.department || null,
          position: profileForm.position || null
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
        variant: 'default'
      });

      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'bg-destructive/20 text-destructive border-destructive/30',
      manager: 'bg-warning/20 text-warning border-warning/30',
      employee: 'bg-success/20 text-success border-success/30'
    };
    
    return variants[role as keyof typeof variants] || variants.employee;
  };

  if (profileLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Settings</h2>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="glass-card border-white/10 hover:bg-destructive/20 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass-card">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="h-4 w-4 mr-2" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Profile Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/10 border border-white/10">
                <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {profile?.full_name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{profile?.full_name}</h3>
                    <Badge className={`${getRoleBadge(profile?.role || 'employee')} border text-xs`}>
                      {profile?.role || 'employee'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{profile?.employee_id}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
              </div>

              {/* Edit Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="glass-card border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profileForm.email}
                    disabled
                    className="glass-card border-white/10 opacity-50"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="glass-card border-white/10"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))}
                    className="glass-card border-white/10"
                    placeholder="Sales, HR, Operations, etc."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={profileForm.position}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, position: e.target.value }))}
                    className="glass-card border-white/10"
                    placeholder="Manager, Developer, Analyst, etc."
                  />
                </div>
              </div>

              <Button 
                onClick={updateProfile}
                disabled={loading}
                className="w-full glass-button neon-glow"
              >
                {loading ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-pulse" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-muted/10 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Password</h4>
                    <p className="text-sm text-muted-foreground">Last changed: Never</p>
                  </div>
                  <Button variant="outline" className="glass-card border-white/10">
                    Change Password
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/10 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Badge className="bg-muted/20 text-muted-foreground border-muted/30 border">
                    Not Enabled
                  </Badge>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/10 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Session Management</h4>
                    <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                  </div>
                  <Button variant="outline" className="glass-card border-white/10">
                    View Sessions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/10 border border-white/10">
                  <div>
                    <h4 className="font-medium text-foreground">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.email_notifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, email_notifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/10 border border-white/10">
                  <div>
                    <h4 className="font-medium text-foreground">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.push_notifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, push_notifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/10 border border-white/10">
                  <div>
                    <h4 className="font-medium text-foreground">Attendance Reminders</h4>
                    <p className="text-sm text-muted-foreground">Daily check-in/check-out reminders</p>
                  </div>
                  <Switch
                    checked={notificationSettings.attendance_reminders}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, attendance_reminders: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/10 border border-white/10">
                  <div>
                    <h4 className="font-medium text-foreground">Payroll Notifications</h4>
                    <p className="text-sm text-muted-foreground">Monthly payroll and overtime alerts</p>
                  </div>
                  <Switch
                    checked={notificationSettings.payroll_notifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, payroll_notifications: checked }))
                    }
                  />
                </div>
              </div>

              <Button className="w-full glass-button neon-glow">
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-muted/10 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Export Data</h4>
                    <p className="text-sm text-muted-foreground">Download your attendance and payroll data</p>
                  </div>
                  <Button variant="outline" className="glass-card border-white/10">
                    Export Data
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/10 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Data Retention</h4>
                    <p className="text-sm text-muted-foreground">How long we keep your data</p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30 border">
                    7 Years
                  </Badge>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-destructive">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-destructive/30 text-destructive hover:bg-destructive/20"
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        try {
                          // Delete user profile first
                          await supabase.from('user_profiles').delete().eq('id', user?.id);
                          
                          // Sign out user
                          await signOut();
                          
                          toast({
                            title: "Account Deleted",
                            description: "Your account has been permanently deleted.",
                          });
                          
                          navigate('/auth');
                        } catch (error) {
                          console.error('Error deleting account:', error);
                          toast({
                            title: "Error",
                            description: "Failed to delete account. Please contact support.",
                            variant: "destructive"
                          });
                        }
                      }
                    }}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}