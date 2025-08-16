import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthButton } from "@/components/auth-button"
import { ArrowRight, Search, Shield, Brain, Code2, Database, Palette, Camera, Eye, Image } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <Search className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                VisualMemory
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
                href="https://github.com/kozhokaru/buildathon-project-one"
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
                Your Visual Memory,
                <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent"> Instantly Searchable</span>
              </h1>
              <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
                Capture, organize, and instantly search through all your screenshots 
                using AI-powered visual and text recognition. Never lose important information again.
              </p>
              <div className="flex gap-4 mt-8">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="https://github.com/kozhokaru/buildathon-project-one" target="_blank">
                  <Button size="lg" variant="outline">
                    View on GitHub
                  </Button>
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span>AI-Powered Search</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span>Visual Recognition</span>
                </div>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  <span>Instant Retrieval</span>
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
            Powerful Features for Visual Organization
          </h2>
          <p className="max-w-[750px] text-lg text-muted-foreground">
            Everything you need to capture, organize, and search your visual information.
          </p>
        </div>
        <div className="mx-auto grid gap-4 md:grid-cols-3 mt-12">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <CardHeader className="relative">
              <Camera className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Screenshot Capture</CardTitle>
              <CardDescription>
                Automatically capture and process your screenshots with intelligent 
                text extraction and visual element detection.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automatic text extraction</li>
                <li>• Visual element detection</li>
                <li>• Instant indexing</li>
                <li>• Batch processing</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <CardHeader className="relative">
              <Brain className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI-Powered Search</CardTitle>
              <CardDescription>
                Use natural language to search through your screenshots. 
                Find text, UI elements, or describe what you're looking for.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Natural language queries</li>
                <li>• Text content search</li>
                <li>• Visual element recognition</li>
                <li>• Semantic understanding</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <CardHeader className="relative">
              <Image className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Visual Library</CardTitle>
              <CardDescription>
                Organize your screenshots automatically with smart categorization 
                and instant access to your visual memory.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Auto-categorization</li>
                <li>• Smart tagging</li>
                <li>• Visual gallery</li>
                <li>• Quick filters</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="container py-20 border-t">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
            Powered by Modern Technology
          </h2>
          <p className="max-w-[750px] text-lg text-muted-foreground">
            Built with cutting-edge AI and search technology for lightning-fast visual retrieval
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
              <Brain className="h-4 w-4" />
              <span className="font-mono text-sm">Claude Vision</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
              <Search className="h-4 w-4" />
              <span className="font-mono text-sm">Vector Search</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="mx-auto flex max-w-[600px] flex-col items-center gap-4 text-center rounded-lg border bg-card p-8">
          <h2 className="text-2xl font-bold">Start Building Your Visual Memory</h2>
          <p className="text-muted-foreground">
            Stop scrolling through hundreds of screenshots. Find what you need in seconds.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/dashboard">
              <Button size="lg">Start Capturing</Button>
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
            <Search className="h-5 w-5" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Your visual memory assistant. Built for productivity. Made with ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}