
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Smartphone, Terminal, Zap } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SignedIn>
        <Navigate to="/dashboard" replace />
      </SignedIn>
      
      <SignedOut>
        <div className="container mx-auto px-4">
          {/* Header */}
          <header className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold">Codecove</h1>
            </div>
            <SignInButton mode="modal">
              <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white">
                Sign In
              </Button>
            </SignInButton>
          </header>

          {/* Hero Section */}
          <section className="text-center py-20">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Build Full-Stack Apps with AI
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Generate complete web and mobile applications using AI. From idea to deployment in minutes, 
              not hours. Support for React, Next.js, and Expo mobile apps.
            </p>
            <SignInButton mode="modal">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                Start Building - Free
              </Button>
            </SignInButton>
          </section>

          {/* Features */}
          <section className="py-20">
            <h3 className="text-3xl font-bold text-center mb-12">Everything you need to build modern apps</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <Code className="w-8 h-8 text-blue-400 mb-2" />
                  <CardTitle className="text-white">AI Code Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400">
                    Generate complete applications with AI. Full folder structure, components, and logic.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <Smartphone className="w-8 h-8 text-green-400 mb-2" />
                  <CardTitle className="text-white">Mobile Apps</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400">
                    Build React Native apps with Expo. Generate APKs and deploy to app stores.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <Terminal className="w-8 h-8 text-purple-400 mb-2" />
                  <CardTitle className="text-white">Online Terminal</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400">
                    Full terminal access in your browser. Run npm commands, build apps, and deploy.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <Zap className="w-8 h-8 text-yellow-400 mb-2" />
                  <CardTitle className="text-white">Instant Deploy</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400">
                    Deploy to Vercel, push to GitHub, and share your creations instantly.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Pricing */}
          <section className="py-20">
            <h3 className="text-3xl font-bold text-center mb-12">Simple, Token-Based Pricing</h3>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Free Plan</CardTitle>
                  <CardDescription className="text-slate-400">Perfect for getting started</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold text-white">10,000 <span className="text-lg text-slate-400">tokens/month</span></div>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Claude 3.5 Sonnet AI</li>
                    <li>• Web app generation</li>
                    <li>• Basic mobile apps</li>
                    <li>• GitHub integration</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-blue-500 border-2">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Pro Plan</CardTitle>
                  <CardDescription className="text-slate-400">For serious developers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold text-white">100,000 <span className="text-lg text-slate-400">tokens/month</span></div>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Claude 4 Opus AI</li>
                    <li>• Advanced mobile apps</li>
                    <li>• Priority generation</li>
                    <li>• Custom deployments</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-8 text-center text-slate-400">
            <p>&copy; 2024 Codecove. Built for developers, by developers.</p>
          </footer>
        </div>
      </SignedOut>
    </div>
  );
};

export default LandingPage;
