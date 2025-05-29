import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Zap, Globe, Share2, Rocket, Github, Sparkles, Laptop, Server, MobilePhone } from "lucide-react";

const LandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to /new if user is authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate("/new");
    }
  }, [user, loading, navigate]);

  // Example projects to showcase
  const exampleProjects = [
    {
      title: "React Dashboard",
      description: "Analytics dashboard with charts and data visualization",
      type: "web",
      tags: ["React", "Charts", "Tailwind"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "E-commerce API",
      description: "RESTful API for product catalog and orders",
      type: "api",
      tags: ["Node.js", "Express", "REST"],
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop"
    },
    {
      title: "Mobile Fitness App",
      description: "Track workouts and health metrics on the go",
      type: "mobile",
      tags: ["React Native", "Expo", "Health"],
      image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b py-4 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Codecove</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#examples" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Examples</a>
            <a href="https://github.com/BigSteppaHR/codecove-903c72cb" target="_blank" rel="noreferrer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/auth")}>Sign In</Button>
            <Button onClick={() => navigate("/new")}>Start Coding</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="outline" className="mb-4 px-3 py-1">Powered by Claude 4.0</Badge>
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Instant Code Generation & Deployment
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Describe what you want to build and get working code instantly. 
            Edit, preview, and deploy in one seamless experience.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button size="lg" onClick={() => navigate("/new")} className="group">
              Start Coding Now
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Sign Up Free
            </Button>
          </motion.div>
          <div className="text-sm text-muted-foreground">
            No credit card required • Instant access • 10,000 tokens free
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Codecove?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-background">
              <CardHeader>
                <Sparkles className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Instant Generation</CardTitle>
                <CardDescription>Claude 4.0 AI generates complete, working code from your description</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-background">
              <CardHeader>
                <Laptop className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Real-time Preview</CardTitle>
                <CardDescription>See your code running instantly with live preview as you edit</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-background">
              <CardHeader>
                <Share2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Share with a Link</CardTitle>
                <CardDescription>Instantly share your projects with anyone using a simple URL</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-background">
              <CardHeader>
                <Rocket className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Deploy Anywhere</CardTitle>
                <CardDescription>One-click deployment to Vercel, Netlify, or export your code</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* What You Can Build */}
      <section id="examples" className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">What You Can Build</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            From web apps to mobile experiences to backend APIs, Codecove handles it all with a simple prompt
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {exampleProjects.map((project, index) => (
              <Card key={index} className="overflow-hidden group">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{project.title}</CardTitle>
                    <Badge variant="outline" className="capitalize">{project.type}</Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate("/new")}>
              Start Building Your Own
              <Zap className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl font-bold mb-12">Loved by Developers</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-left">
              <CardContent className="pt-6">
                <p className="mb-4">"Codecove has completely transformed my workflow. I can prototype ideas in minutes instead of hours."</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3">JD</div>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-muted-foreground">Frontend Developer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="text-left">
              <CardContent className="pt-6">
                <p className="mb-4">"The Claude 4.0 integration is incredible. The code quality is amazing and it understands exactly what I need."</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3">AS</div>
                  <div>
                    <p className="font-medium">Alice Smith</p>
                    <p className="text-sm text-muted-foreground">Full-Stack Engineer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="text-left">
              <CardContent className="pt-6">
                <p className="mb-4">"Being able to share my projects with a simple link has made collaboration so much easier. Game changer!"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3">RJ</div>
                  <div>
                    <p className="font-medium">Robert Johnson</p>
                    <p className="text-sm text-muted-foreground">Startup Founder</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 to-blue-500/10">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Building?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers building faster with Codecove
          </p>
          <Button size="lg" onClick={() => navigate("/new")} className="group">
            Start Coding Now
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Code2 className="h-5 w-5 text-primary" />
            <span className="font-semibold">Codecove</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Codecove. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
