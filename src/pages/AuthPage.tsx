
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Code, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  const [currentMode, setCurrentMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (currentMode === 'signin') {
        await signIn(email, password);
        toast({
          title: 'Success',
          description: 'Signed in successfully!',
        });
        navigate('/dashboard');
      } else {
        await signUp(email, password, firstName, lastName);
        toast({
          title: 'Success',
          description: 'Account created successfully! Please check your email to verify your account.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred during authentication',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Codecove
            </h1>
          </div>
        </header>

        {/* Auth Content */}
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">
                {currentMode === 'signin' ? 'Welcome back' : 'Get started today'}
              </h2>
              <p className="text-slate-400">
                {currentMode === 'signin' 
                  ? 'Sign in to your account to continue building' 
                  : 'Create your account and start building amazing apps'
                }
              </p>
            </div>

            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-white text-xl">
                  {currentMode === 'signin' ? 'Sign In' : 'Sign Up'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {currentMode === 'signup' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-slate-800 border-slate-600 text-white"
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-slate-800 border-slate-600 text-white"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white pr-10"
                        placeholder="••••••••"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Loading...' : (currentMode === 'signin' ? 'Sign In' : 'Sign Up')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="text-center mt-6">
              <p className="text-slate-400">
                {currentMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setCurrentMode(currentMode === 'signin' ? 'signup' : 'signin')}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  {currentMode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            <div className="text-center mt-8 space-y-2">
              <p className="text-xs text-slate-500">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
