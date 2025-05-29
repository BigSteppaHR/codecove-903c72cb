
import { SignedIn, SignedOut, SignInButton, SignUpButton, SignIn, SignUp } from '@clerk/clerk-react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signin';
  const [currentMode, setCurrentMode] = useState<'signin' | 'signup'>(mode as 'signin' | 'signup');

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SignedIn>
        <Navigate to="/dashboard" replace />
      </SignedIn>
      
      <SignedOut>
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
                  {currentMode === 'signin' ? (
                    <SignIn 
                      appearance={{
                        elements: {
                          rootBox: 'w-full',
                          card: 'bg-transparent shadow-none border-0',
                          headerTitle: 'hidden',
                          headerSubtitle: 'hidden',
                          socialButtonsBlockButton: 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700',
                          formFieldInput: 'bg-slate-800 border-slate-600 text-white',
                          formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
                          footerActionLink: 'text-blue-400 hover:text-blue-300',
                        }
                      }}
                      redirectUrl="/dashboard"
                    />
                  ) : (
                    <SignUp 
                      appearance={{
                        elements: {
                          rootBox: 'w-full',
                          card: 'bg-transparent shadow-none border-0',
                          headerTitle: 'hidden',
                          headerSubtitle: 'hidden',
                          socialButtonsBlockButton: 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700',
                          formFieldInput: 'bg-slate-800 border-slate-600 text-white',
                          formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
                          footerActionLink: 'text-blue-400 hover:text-blue-300',
                        }
                      }}
                      redirectUrl="/dashboard"
                    />
                  )}
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
      </SignedOut>
    </div>
  );
};

export default AuthPage;
