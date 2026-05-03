"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 font-sans bg-background text-foreground">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm flex flex-col gap-8">
        <h1 className="text-4xl font-bold tracking-tight">UBID Dashboard</h1>
        
        <div className="p-8 border rounded-xl bg-card text-card-foreground shadow-sm w-full max-w-md border-border">
          <h2 className="text-xl font-semibold mb-4">Welcome back, {session?.user?.name}</h2>
          <div className="space-y-2 text-muted-foreground">
            <p><span className="font-medium text-foreground">Email:</span> {session?.user?.email}</p>
            <p><span className="font-medium text-foreground">Role:</span> {(session?.user as any)?.role}</p>
          </div>
          
          <Button 
            onClick={() => signOut()} 
            variant="destructive" 
            className="w-full mt-8 font-semibold"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
