"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

export default function Signup() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate signup process
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to onboarding after successful signup
      router.push("/onboarding")
    }, 1000)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="w-full max-w-md flex flex-col items-center space-y-8">
        <div className="w-full flex items-center justify-between">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Sign up</h1>
          <div className="w-9" />
        </div>

        <div className="w-full p-8 bg-white rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" type="text" placeholder="John Doe" className="rounded-xl h-12" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="hello@example.com" className="rounded-xl h-12" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" className="rounded-xl h-12" required />
            </div>
            <Button type="submit" className="w-full rounded-xl h-12" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="rounded-xl h-12" onClick={() => router.push("/onboarding")}>
              Google
            </Button>
            <Button variant="outline" className="rounded-xl h-12" onClick={() => router.push("/onboarding")}>
              Apple
            </Button>
          </div>
        </div>

        <Button variant="ghost" size="sm" asChild className="text-xs">
          <Link href="/auth/login">Already have an account? Log in</Link>
        </Button>
      </div>
    </main>
  )
}

