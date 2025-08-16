import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthButton } from "@/components/auth-button"
import { ArrowRight, Zap, Shield, Rocket, Code2, Database, Palette } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <Zap className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                HackTemplate
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="#features"
              >
                Features
              </Link>
              <Link
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="#tech"
              >
                Tech Stack
              </Link>
              <Link
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="https://github.com"
                target="_blank"
              >
                GitHub
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
            </div>
            <nav className="flex items-center">
              <AuthButton />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background"></div>
        <div className="container relative">
          <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4">
              <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
                Build 5 Apps in 5 Hours
                <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent"> Lightning Fast</span>
              </h1>
              <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
                Production-ready Next.js template with authentication, AI integration, 
                and beautiful UI components. Clone, customize, ship.
              </p>
              <div className="flex gap-4 mt-8">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="https://github.com" target="_blank">
                  <Button size="lg" variant="outline">
                    View on GitHub
                  </Button>
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Auth Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-primary" />
                  <span>Deploy in Minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  <span>TypeScript</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
            Everything You Need to Win
          </h2>
          <p className="max-w-[750px] text-lg text-muted-foreground">
            Stop wasting time on boilerplate. Focus on your unique features.
          </p>
        </div>
        <div className="mx-auto grid gap-4 md:grid-cols-3 mt-12">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <CardHeader className="relative">
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Authentication Built-in</CardTitle>
              <CardDescription>
                Supabase auth with email/password and Google OAuth. 
                Protected routes, middleware, and user hooks ready to use.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Email & OAuth login</li>
                <li>• Protected routes</li>
                <li>• User management</li>
                <li>• Session handling</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <CardHeader className="relative">
              <Rocket className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI-Powered Features</CardTitle>
              <CardDescription>
                Anthropic Claude integration with streaming responses. 
                Ready-to-use AI endpoint with error handling.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Claude API integration</li>
                <li>• Streaming responses</li>
                <li>• Function calling</li>
                <li>• Rate limiting</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <CardHeader className="relative">
              <Palette className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Beautiful UI Components</CardTitle>
              <CardDescription>
                Shadcn/ui components with dark mode. Forms, modals, 
                toasts, and more - all customizable and accessible.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 10+ components</li>
                <li>• Dark mode support</li>
                <li>• Fully accessible</li>
                <li>• Tailwind styling</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="container py-20 border-t">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
            Modern Tech Stack
          </h2>
          <p className="max-w-[750px] text-lg text-muted-foreground">
            Built with the latest and greatest tools for maximum productivity
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
              <Code2 className="h-4 w-4" />
              <span className="font-mono text-sm">Next.js 15</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
              <Code2 className="h-4 w-4" />
              <span className="font-mono text-sm">TypeScript</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
              <Database className="h-4 w-4" />
              <span className="font-mono text-sm">Supabase</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
              <Palette className="h-4 w-4" />
              <span className="font-mono text-sm">Tailwind CSS</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
              <Zap className="h-4 w-4" />
              <span className="font-mono text-sm">Claude AI</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
              <Shield className="h-4 w-4" />
              <span className="font-mono text-sm">shadcn/ui</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="mx-auto flex max-w-[600px] flex-col items-center gap-4 text-center rounded-lg border bg-card p-8">
          <h2 className="text-2xl font-bold">Ready to Build?</h2>
          <p className="text-muted-foreground">
            Stop reading, start shipping. Your next hackathon win is one clone away.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/dashboard">
              <Button size="lg">Start Building</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Zap className="h-5 w-5" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built for speed. Open source. Made with ❤️ for hackathons.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}