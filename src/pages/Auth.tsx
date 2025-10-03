import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Auth() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ 
    email: '', 
    password: '', 
    fullName: '', 
    employeeId: '',
    role: 'employee' as const
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(signInData.email, signInData.password);
    
    if (error) {
      setError(error.message || 'An error occurred during sign in');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signUp(signUpData.email, signUpData.password, {
      full_name: signUpData.fullName,
      employee_id: signUpData.employeeId,
      role: signUpData.role
    });
    
    if (error) {
      setError(error.message);
    } else {
      setError('Please check your email to confirm your account!');
    }
    
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--secondary) / 0.1))'
      }}
    >
      <Card className="w-full max-w-md glass-card border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">
            QR Attendance System
          </CardTitle>
          <p className="text-muted-foreground">Access your attendance dashboard</p>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-card">
              <TabsTrigger value="signin" className="data-[state=active]:bg-primary/20">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary/20">
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert className="mt-4 border-destructive/20 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={signInData.email}
                    onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                    className="glass-card border-white/10"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                    className="glass-card border-white/10"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full glass-button neon-glow" 
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your full name"
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="glass-card border-white/10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-employee-id">Employee ID</Label>
                  <Input
                    id="signup-employee-id"
                    type="text"
                    placeholder="EMP001"
                    value={signUpData.employeeId}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="glass-card border-white/10"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    className="glass-card border-white/10"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    className="glass-card border-white/10"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full glass-button neon-glow" 
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}