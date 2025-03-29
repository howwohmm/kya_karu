import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="w-full max-w-md flex flex-col items-center text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Everyday Magic</h1>
          <p className="text-muted-foreground">Your AI assistant for all those little decisions</p>
        </div>

        <div className="w-full p-8 bg-white rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-medium">Welcome</h2>
            <p className="text-sm text-muted-foreground">Let's make those everyday choices easier</p>
          </div>

          <div className="flex flex-col space-y-3">
            <Button asChild className="rounded-xl h-12">
              <Link href="/auth/login">Continue with Email</Link>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="rounded-xl h-12">
                Google
              </Button>
              <Button variant="outline" className="rounded-xl h-12">
                Apple
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/auth/signup">
              Don't have an account? Sign up
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>

          {/* Quick navigation links for testing */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link href="/onboarding">Skip to Onboarding</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Skip to Dashboard</Link>
            </Button>
            <Button variant="default" size="sm" asChild className="bg-blue-500 hover:bg-blue-600">
              <Link href="/chat">Try the Chat UI</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

