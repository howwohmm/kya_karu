"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Coffee, Film, ShoppingBag, Dumbbell, Plane, Book, Music, ChevronRight, ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"

const categories = [
  { id: "meals", name: "Meals", icon: Coffee },
  { id: "entertainment", name: "Entertainment", icon: Film },
  { id: "fashion", name: "Fashion", icon: ShoppingBag },
  { id: "fitness", name: "Fitness", icon: Dumbbell },
  { id: "travel", name: "Travel", icon: Plane },
  { id: "books", name: "Books", icon: Book },
  { id: "music", name: "Music", icon: Music },
]

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      // Save preferences and redirect to dashboard
      localStorage.setItem("preferences", JSON.stringify(selectedCategories))
      router.push("/dashboard")
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const steps = [
    {
      title: "Pick your interests",
      description: "Select categories you'd like recommendations for",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.id)
            const Icon = category.icon

            return (
              <Card
                key={category.id}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  isSelected ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div
                    className={`p-2 rounded-full ${
                      isSelected ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
              </Card>
            )
          })}
        </div>
      ),
    },
    {
      title: "Set your mood filters",
      description: "How would you like to filter recommendations?",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "lazy", emoji: "😌", name: "Lazy" },
            { id: "productive", emoji: "🚀", name: "Productive" },
            { id: "gloomy", emoji: "🌧️", name: "Gloomy" },
            { id: "calm", emoji: "🧘", name: "Calm" },
          ].map((mood) => {
            const isSelected = selectedCategories.includes(mood.id)

            return (
              <Card
                key={mood.id}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  isSelected ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => toggleCategory(mood.id)}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="text-2xl">{mood.emoji}</div>
                  <span className="text-sm font-medium">{mood.name}</span>
                </div>
              </Card>
            )
          })}
        </div>
      ),
    },
    {
      title: "Almost there!",
      description: "Your AI assistant is ready to help",
      content: (
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-4xl">✨</span>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">Ready for some magic</h3>
            <p className="text-sm text-muted-foreground">We'll help you make those everyday decisions with ease</p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full w-8 ${
                  i === step ? "bg-primary" : i < step ? "bg-primary/50" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            Skip
          </Button>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full p-8 bg-white rounded-3xl shadow-sm border border-gray-100 space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-xl font-medium">{steps[step].title}</h2>
            <p className="text-sm text-muted-foreground">{steps[step].description}</p>
          </div>

          {steps[step].content}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack} disabled={step === 0} className="rounded-xl">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleNext} className="rounded-xl">
              {step === steps.length - 1 ? "Get Started" : "Next"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

