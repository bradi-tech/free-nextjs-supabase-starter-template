import Link from "next/link";
import { Button } from "@/components/atoms/ui/button";
import { Github, Star, Code, Zap } from "lucide-react";

export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-b from-background to-secondary/20 px-4">
        <div className="container mx-auto text-center space-y-8 max-w-3xl">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter animate-fade-up">
              Free Next.js Templates
              <span className="text-primary block">by bradi.tech</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Stop overthinking. Start building with our production-ready templates.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/templates">
                Browse Templates
                <Code className="ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://github.com/yourusername/bradi-templates">
                Star on GitHub
                <Star className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Templates?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border bg-card">
              <Zap className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Production Ready</h3>
              <p className="text-muted-foreground">Built with the latest tech stack and best practices for immediate deployment.</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <Code className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Modern Stack</h3>
              <p className="text-muted-foreground">Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui components.</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <Github className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Open Source</h3>
              <p className="text-muted-foreground">Free and open source templates that you can modify and use as you wish.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Something Amazing?</h2>
          <p className="text-xl text-muted-foreground mb-8">Get started with our templates and build your next project faster.</p>
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
