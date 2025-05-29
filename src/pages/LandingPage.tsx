
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Smartphone, Terminal, Zap, ArrowRight, Check, Star } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SignedIn>
        <Navigate to="/dashboard" replace />
      </SignedIn>
      
      <SignedOut>
        <div className="container mx-auto px-4">
          {/* Header */}
          <header className="flex items-center justify-between py-6 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Codecove
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Features
              </Button>
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Pricing
              </Button>
              <SignInButton mode="modal">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                  Sign In
                </Button>
              </SignInButton>
            </div>
          </header>

          {/* Hero Section */}
          <section className="text-center py-24">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full text-sm text-slate-300 mb-8">
                <Star className="w-4 h-4 mr-2 text-yellow-400" />
                Trusted by 10,000+ developers worldwide
              </div>
              
              <h2 className="text-6xl font-bold mb-6 leading-tight">
                Build Full-Stack Apps with{' '}
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  AI Magic
                </span>
              </h2>
              
              <p className="text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
                Transform your ideas into production-ready applications in minutes. 
                Generate complete web and mobile apps with AI-powered code generation, 
                from React to Next.js and Expo mobile apps.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <SignInButton mode="modal">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl">
                    Start Building - Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </SignInButton>
                <Button variant="outline" size="lg" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-4 text-lg">
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">10K+</div>
                  <div className="text-sm text-slate-400">Apps Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">95%</div>
                  <div className="text-sm text-slate-400">Code Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">5min</div>
                  <div className="text-sm text-slate-400">Avg Build Time</div>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-24">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold mb-4">Everything you need to ship faster</h3>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                From idea to deployment with powerful AI tools and integrations
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Code className="w-6 h-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-white text-lg">AI Code Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400 text-sm leading-relaxed">
                    Generate complete applications with AI. Full folder structure, components, and business logic in seconds.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Smartphone className="w-6 h-6 text-green-400" />
                  </div>
                  <CardTitle className="text-white text-lg">Mobile Apps</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400 text-sm leading-relaxed">
                    Build React Native apps with Expo. Generate APKs and deploy to app stores with one click.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Terminal className="w-6 h-6 text-purple-400" />
                  </div>
                  <CardTitle className="text-white text-lg">Cloud Terminal</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400 text-sm leading-relaxed">
                    Full terminal access in your browser. Run npm commands, build apps, and deploy without setup.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <CardTitle className="text-white text-lg">Instant Deploy</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400 text-sm leading-relaxed">
                    Deploy to Vercel, push to GitHub, and share your creations instantly with automatic CI/CD.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Pricing */}
          <section className="py-24">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold mb-4">Choose your plan</h3>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Simple, transparent pricing that scales with your needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 p-8">
                <CardHeader className="pb-8">
                  <CardTitle className="text-white text-2xl mb-2">Free Plan</CardTitle>
                  <CardDescription className="text-slate-400">Perfect for getting started</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">10,000</span>
                    <span className="text-lg text-slate-400 ml-2">tokens/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      'Claude 3.5 Sonnet AI',
                      'Web app generation',
                      'Basic mobile apps',
                      'GitHub integration',
                      'Community support'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center text-slate-300">
                        <Check className="w-4 h-4 text-green-400 mr-3" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <SignInButton mode="modal">
                    <Button className="w-full mt-8 bg-slate-700 hover:bg-slate-600 text-white">
                      Get Started
                    </Button>
                  </SignInButton>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/50 p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
                <CardHeader className="pb-8">
                  <CardTitle className="text-white text-2xl mb-2">Pro Plan</CardTitle>
                  <CardDescription className="text-slate-400">For serious developers</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">100,000</span>
                    <span className="text-lg text-slate-400 ml-2">tokens/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      'Claude 4 Opus AI',
                      'Advanced mobile apps',
                      'Priority generation',
                      'Custom deployments',
                      'Priority support'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center text-slate-300">
                        <Check className="w-4 h-4 text-green-400 mr-3" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    Upgrade to Pro
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 border-t border-slate-800 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Codecove</span>
            </div>
            <p className="text-slate-400">&copy; 2024 Codecove. Built for developers, by developers.</p>
          </footer>
        </div>
      </SignedOut>
    </div>
  );
};

export default LandingPage;
