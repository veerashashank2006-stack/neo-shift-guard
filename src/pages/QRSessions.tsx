import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { QrCode, RefreshCw, Settings, MapPin, Clock, Shield, Download, Navigation } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import QRCodeLib from 'qrcode';
import type { Tables } from '@/integrations/supabase/types';

type QRConfig = Tables<'qr_attendance_config'>;

export default function QRSessions() {
  const { user } = useAuth();
  const [config, setConfig] = useState<QRConfig | null>(null);
  const [currentQR, setCurrentQR] = useState<string>('');
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form state for configuration
  const [formData, setFormData] = useState({
    organization_name: '',
    qr_code_prefix: '',
    work_start_time: '',
    work_end_time: '',
    late_threshold_minutes: 15,
    location_validation_enabled: true,
    allowed_latitude: 40.7128,
    allowed_longitude: -74.0060,
    geofence_radius_meters: 100
  });

  useEffect(() => {
    if (user) {
      fetchQRConfig();
    }
  }, [user]);

  const fetchQRConfig = async () => {
    setConfigLoading(true);
    try {
      const { data, error } = await supabase
        .from('qr_attendance_config')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
        setFormData({
          organization_name: data.organization_name,
          qr_code_prefix: data.qr_code_prefix,
          work_start_time: data.work_start_time || '',
          work_end_time: data.work_end_time || '',
          late_threshold_minutes: data.late_threshold_minutes || 15,
          location_validation_enabled: data.location_validation_enabled || false,
          allowed_latitude: data.allowed_latitude || 40.7128,
          allowed_longitude: data.allowed_longitude || -74.0060,
          geofence_radius_meters: data.geofence_radius_meters || 100
        });
      }
    } catch (error) {
      console.error('Error fetching QR config:', error);
    } finally {
      setConfigLoading(false);
    }
  };

  const generateQRCodeImage = async (qrText: string) => {
    try {
      const qrCodeDataURL = await QRCodeLib.toDataURL(qrText, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeImage(qrCodeDataURL);
    } catch (error) {
      console.error('Error generating QR code image:', error);
    }
  };

  const generateDailyQR = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_daily_qr_code');
      
      if (error) throw error;
      
      setCurrentQR(data);
      await generateQRCodeImage(data);
      
      toast({ 
        title: 'Success', 
        description: 'Daily QR code generated successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to generate QR code',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeImage) {
      const link = document.createElement('a');
      link.download = `attendance-qr-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = qrCodeImage;
      link.click();
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          allowed_latitude: position.coords.latitude,
          allowed_longitude: position.coords.longitude
        }));
        toast({
          title: 'Success',
          description: 'Location updated successfully!',
          variant: 'default'
        });
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: 'Error',
          description: 'Failed to get your current location. Please enable location permissions.',
          variant: 'destructive'
        });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const updateConfig = async () => {
    setLoading(true);
    try {
      if (!config?.id) {
        toast({ 
          title: 'Error', 
          description: 'No configuration found to update',
          variant: 'destructive'
        });
        return;
      }

      const configData = {
        organization_name: formData.organization_name,
        qr_code_prefix: formData.qr_code_prefix,
        work_start_time: formData.work_start_time || null,
        work_end_time: formData.work_end_time || null,
        late_threshold_minutes: formData.late_threshold_minutes,
        location_validation_enabled: formData.location_validation_enabled,
        allowed_latitude: formData.allowed_latitude,
        allowed_longitude: formData.allowed_longitude,
        geofence_radius_meters: formData.geofence_radius_meters
      };

      const { error } = await supabase
        .from('qr_attendance_config')
        .update(configData)
        .eq('id', config.id);

      if (error) throw error;

      toast({ 
        title: 'Success', 
        description: 'QR configuration updated successfully!',
        variant: 'default'
      });
      
      fetchQRConfig();
    } catch (error) {
      console.error('Error updating config:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update configuration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading QR session configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">QR Session Management</h2>
        <p className="text-muted-foreground">Generate and configure QR codes for attendance tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily QR Code Generation */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Daily QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-muted/10 rounded-lg border border-white/10">
              {currentQR ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    {qrCodeImage && (
                      <div className="p-4 bg-white rounded-lg shadow-lg">
                        <img 
                          src={qrCodeImage} 
                          alt="QR Code for Attendance" 
                          className="w-64 h-64 object-contain"
                        />
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground font-mono bg-black/5 p-2 rounded border max-w-full overflow-hidden">
                      {currentQR}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Generated: {format(new Date(), 'PPp')}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge className="bg-success/20 text-success border-success/30 border">
                      Active for today
                    </Badge>
                  </div>
                  {qrCodeImage && (
                    <Button
                      onClick={downloadQRCode}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download QR Code
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div className="text-muted-foreground">No QR code generated for today</div>
                </div>
              )}
            </div>
            
            <Button 
              onClick={generateDailyQR}
              className="w-full glass-button neon-glow"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate New QR Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Current Configuration */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Current Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/10 border border-white/10">
                <div className="text-sm text-muted-foreground">Organization</div>
                <div className="font-semibold text-foreground">{config?.organization_name || 'Not set'}</div>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/10 border border-white/10">
                <div className="text-sm text-muted-foreground">QR Prefix</div>
                <div className="font-mono text-sm text-foreground">{config?.qr_code_prefix || 'Not set'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/10 border border-white/10">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Work Start
                </div>
                <div className="font-semibold text-foreground">
                  {config?.work_start_time || 'Not set'}
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/10 border border-white/10">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Work End
                </div>
                <div className="font-semibold text-foreground">
                  {config?.work_end_time || 'Not set'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/10 border border-white/10">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Location Validation
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`border ${
                  config?.location_validation_enabled
                    ? 'bg-success/20 text-success border-success/30'
                    : 'bg-muted/20 text-muted-foreground border-muted/30'
                }`}>
                  {config?.location_validation_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
                {config?.location_validation_enabled && (
                  <span className="text-xs text-muted-foreground">
                    {config.geofence_radius_meters}m radius
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Form */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Update Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={formData.organization_name}
                onChange={(e) => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                className="glass-card border-white/10"
                placeholder="Your Organization"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-prefix">QR Code Prefix</Label>
              <Input
                id="qr-prefix"
                value={formData.qr_code_prefix}
                onChange={(e) => setFormData(prev => ({ ...prev, qr_code_prefix: e.target.value }))}
                className="glass-card border-white/10"
                placeholder="VERRA_ATT"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-time">Work Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={formData.work_start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, work_start_time: e.target.value }))}
                className="glass-card border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">Work End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={formData.work_end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, work_end_time: e.target.value }))}
                className="glass-card border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="late-threshold">Late Threshold (minutes)</Label>
              <Input
                id="late-threshold"
                type="number"
                value={formData.late_threshold_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, late_threshold_minutes: Number(e.target.value) }))}
                className="glass-card border-white/10"
                min="0"
                max="60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="geofence-radius">Geofence Radius (meters)</Label>
              <Input
                id="geofence-radius"
                type="number"
                value={formData.geofence_radius_meters}
                onChange={(e) => setFormData(prev => ({ ...prev, geofence_radius_meters: Number(e.target.value) }))}
                className="glass-card border-white/10"
                min="10"
                max="1000"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/10 border border-white/10">
            <div>
              <div className="font-medium text-foreground">Location Validation</div>
              <div className="text-sm text-muted-foreground">Require employees to be within specified area</div>
            </div>
            <Switch
              checked={formData.location_validation_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, location_validation_enabled: checked }))}
            />
          </div>

          {formData.location_validation_enabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Location Coordinates</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={loading}
                  className="glass-card border-white/10"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Current Location
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Allowed Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    value={formData.allowed_latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowed_latitude: Number(e.target.value) }))}
                    className="glass-card border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Allowed Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    value={formData.allowed_longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowed_longitude: Number(e.target.value) }))}
                    className="glass-card border-white/10"
                  />
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={updateConfig}
            className="w-full glass-button neon-glow"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Configuration'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}