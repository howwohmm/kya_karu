"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bookmark, RefreshCw, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { getClientRecommendations } from "@/lib/gemini-client"

interface Recommendation {
  title: string
  reasoning: string
  category: string
  image?: string
}

interface RecommendationCardProps {
  recommendation: Recommendation
  onSave: () => void
  onRefresh?: () => void
}

export function RecommendationCard({ recommendation, onSave, onRefresh }: RecommendationCardProps) {
  const [saved, setSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = () => {
    setSaved(true)
    onSave()
  }

  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh()
      return
    }

    setIsLoading(true)
    try {
      // Generate a similar recommendation
      const prompt = `Give me a recommendation similar to: ${recommendation.title} in the ${recommendation.category} category`
      const results = await getClientRecommendations(prompt, recommendation.category)
      
      if (results && results.length > 0) {
        // Replace the current recommendation with the new one
        Object.assign(recommendation, results[0])
      }
    } catch (error) {
      console.error("Error refreshing recommendation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = () => {
    // For this example, we'll just open a Google search for the title
    window.open(`https://www.google.com/search?q=${encodeURIComponent(recommendation.title)}`, '_blank')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden border-gray-100">
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{recommendation.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full ${saved ? "text-primary" : ""}`}
              onClick={handleSave}
            >
              <Bookmark className="h-4 w-4" />
              <span className="sr-only">Save</span>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>

          {recommendation.image && (
            <div className="relative h-40 w-full overflow-hidden rounded-lg">
              <img
                src={recommendation.image || "/placeholder.svg"}
                alt={recommendation.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl flex-1"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
              ) : (
                <RefreshCw className="mr-2 h-3 w-3" />
              )}
              Try another
            </Button>
            <Button 
              size="sm" 
              className="rounded-xl flex-1"
              onClick={handleViewDetails}
            >
              <ExternalLink className="mr-2 h-3 w-3" />
              View details
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

