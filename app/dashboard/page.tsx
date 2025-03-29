"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Coffee, Film, ShoppingBag, Dumbbell, Plane, Book, Music, User, Plus, Send, Bookmark, Home } from "lucide-react"
import { motion } from "framer-motion"
import { RecommendationCard } from "@/components/recommendation-card"
import { toast } from "sonner"
import { getClientRecommendations } from "@/lib/gemini-client"
import { Toaster } from "sonner"
import { useToastSafe } from "@/hooks/use-toast-safe"
import Link from "next/link"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("home")
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const safeToast = useToastSafe()

  // Add toast container
  useEffect(() => {
    // Clear any existing errors when component mounts
    setError(null)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setRecommendations([])
    setError(null)

    try {
      // Use our client-side function with category if selected
      const enhancedPrompt = selectedCategory 
        ? `${prompt} (Category: ${selectedCategory})` 
        : prompt
        
      const results = await getClientRecommendations(enhancedPrompt, selectedCategory || undefined)
      
      // Add image URLs to recommendations
      if (results && Array.isArray(results)) {
        const enhancedResults = results.map((item: any) => ({
          ...item,
          image: "/placeholder.svg?height=200&width=200",
        }))
        
        setRecommendations(enhancedResults)
      } else {
        throw new Error("Received invalid response format")
      }
    } catch (error: any) {
      console.error("Error fetching recommendations:", error)
      setError(error.message || "Failed to get recommendations. Please try again.")
      safeToast.error(error.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryClick = (category: string) => {
    // If it's the same category, deselect it
    if (selectedCategory === category) {
      setSelectedCategory(null)
      setPrompt("")
    } else {
      setSelectedCategory(category)
      setPrompt(`Give me ${category} recommendations`)
    }
  }

  const categoryIcons = {
    meals: Coffee,
    entertainment: Film,
    fashion: ShoppingBag,
    fitness: Dumbbell,
    travel: Plane,
    books: Book,
    music: Music,
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 to-blue-50">
      <Toaster position="top-center" />
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-primary">Everyday Magic</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild className="mr-2">
            <Link href="/chat">Try Chat UI</Link>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 container max-w-md mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="home" className="rounded-xl">
              <Home className="mr-2 h-4 w-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="saved" className="rounded-xl">
              <Bookmark className="mr-2 h-4 w-4" />
              Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            {recommendations.length === 0 ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(categoryIcons).map(([key, Icon]) => (
                    <Card
                      key={key}
                      className={`p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all ${
                        selectedCategory === key ? "bg-primary/5 border-primary" : ""
                      }`}
                      onClick={() => handleCategoryClick(key)}
                    >
                      <div className={`p-2 rounded-full ${
                        selectedCategory === key 
                          ? "bg-primary/20 text-primary" 
                          : "bg-primary/10 text-primary"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs mt-2 capitalize">{key}</span>
                    </Card>
                  ))}
                  <Card 
                    className="p-4 flex flex-col items-center justify-center cursor-pointer border-dashed border-gray-300 hover:border-primary/50 transition-all"
                    onClick={() => {
                      safeToast.info("Custom categories coming soon!");
                    }}
                  >
                    <div className="p-2 rounded-full bg-gray-100">
                      <Plus className="h-5 w-5 text-gray-500" />
                    </div>
                    <span className="text-xs mt-2 text-gray-500">Custom</span>
                  </Card>
                </div>

                <div className="space-y-2">
                  <h2 className="text-sm font-medium">Mood Filters</h2>
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {[
                      { emoji: "😌", name: "Lazy" },
                      { emoji: "🚀", name: "Productive" },
                      { emoji: "🌧️", name: "Gloomy" },
                      { emoji: "🧘", name: "Calm" },
                    ].map((mood) => (
                      <Button 
                        key={mood.name} 
                        variant="outline" 
                        className="rounded-full px-4 py-2 h-auto"
                        onClick={() => {
                          setPrompt(`Give me ${mood.name.toLowerCase()} recommendations`);
                          safeToast.info(`Set mood to "${mood.name}"`);
                        }}
                      >
                        <span className="mr-2">{mood.emoji}</span>
                        {mood.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            <form onSubmit={handleSubmit} className="sticky bottom-4">
              <div className="relative">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={selectedCategory 
                    ? `What kind of ${selectedCategory} are you looking for?` 
                    : "What should I do right now?"}
                  className="pr-12 py-6 rounded-2xl shadow-sm border-gray-200 bg-white"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-xl h-10 w-10"
                  disabled={isLoading || !prompt.trim()}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </form>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="space-y-4 pt-4">
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-gray-100 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-gray-100 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-gray-100 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            )}

            {recommendations.length > 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 pt-4"
              >
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Based on your request:</span>
                  <span className="font-medium text-foreground">{prompt}</span>
                </div>

                {recommendations.map((rec, index) => (
                  <RecommendationCard
                    key={index}
                    recommendation={rec}
                    onSave={() => {
                      safeToast.success("Recommendation saved!");
                    }}
                  />
                ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="py-4">
            <div className="text-center text-muted-foreground py-12">
              <div className="mb-4">
                <Bookmark className="h-12 w-12 mx-auto text-gray-300" />
              </div>
              <h3 className="text-lg font-medium">No saved recommendations yet</h3>
              <p className="text-sm mt-1">Your saved recommendations will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

