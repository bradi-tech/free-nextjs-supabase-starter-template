import Link from "next/link";
import { Button } from "@/components/atoms/ui/button";

export default async function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="space-y-4">
          <Link href="https://bradi.tech" target="_blank" className="text-4xl font-bold tracking-tighter">
            Welcome to
            <span className="text-primary block">bradi starter</span>
          </Link>
          <p className="text-lg text-muted-foreground">
            To go to dashboard please fill env variables and login
          </p>
        </div>
        
        <div className="flex flex-col gap-4 w-full">
          <Button size="lg" asChild>
            <Link href="/login">
              Login
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/register">
              Register
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
