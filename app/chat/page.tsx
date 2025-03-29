"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, Paperclip, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toaster } from "sonner"
import Link from "next/link"
import { getClientRecommendations, fileToBase64, processImage } from "@/lib/gemini-client"
import { useToastSafe } from "@/hooks/use-toast-safe"

// Message type definition
interface Message {
  role: 'user' | 'assistant'
  content: string
  image?: string
}

export default function ChatPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const safeToast = useToastSafe()

  const categories = [
    { id: "food", emoji: "🍽️", label: "Food" },
    { id: "books", emoji: "📚", label: "Books" },
    { id: "outfit", emoji: "🧥", label: "Outfit" },
    { id: "more", emoji: "➕", label: "More", disabled: true }
  ]

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleCategorySelect = (category: string) => {
    if (category === "more") {
      safeToast.info("More categories coming soon! 👀")
      return
    }
    setSelectedCategory(category)
    // Add initial assistant message
    setMessages([{
      role: 'assistant',
      content: `Hi there! I'm your ${category} recommendation assistant. What kind of ${category} are you looking for today?`
    }])
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !imageFile) return

    const newUserMessage: Message = {
      role: 'user',
      content: inputValue,
      ...(imagePreview && { image: imagePreview })
    }

    setMessages(prev => [...prev, newUserMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      let responseText = ""
      
      // Handle image processing
      if (imageFile && imagePreview) {
        // Store references and clear state
        const currentImagePreview = imagePreview
        setImagePreview(null)
        setImageFile(null)
        
        try {
          // Process the image with context
          const imagePrompt = inputValue || `What can you recommend for ${selectedCategory}?` 
          const imageAnalysis = await processImage(
            currentImagePreview,
            imagePrompt,
            selectedCategory || undefined
          )
          
          // Create a context-rich prompt using the image analysis
          const contextPrompt = `${inputValue} ${imageAnalysis}`
          
          // Get recommendations based on image context
          const results = await getClientRecommendations(contextPrompt, selectedCategory || undefined)
          
          // Format recommendations
          responseText = "Based on your image, here are my recommendations:\n\n"
          results.forEach((item: any, index: number) => {
            responseText += `${index + 1}. **${item.title}**\n${item.reasoning}\n\n`
          })
        } catch (error: any) {
          console.error("Image processing error:", error)
          responseText = "I had trouble analyzing your image. Could you try describing what you're looking for instead?"
          safeToast.error("Image analysis failed. Please try again.")
        }
      } else {
        // Text-only recommendations
        const results = await getClientRecommendations(inputValue, selectedCategory || undefined)
        
        // Format the results conversationally
        responseText = "Here are my recommendations:\n\n"
        results.forEach((item: any, index: number) => {
          responseText += `${index + 1}. **${item.title}**\n${item.reasoning}\n\n`
        })
      }
      
      // Add AI response to messages
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responseText
      }])
    } catch (error: any) {
      console.error("Error getting recommendations:", error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I couldn't process that request. Please try again."
      }])
      safeToast.error(error.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Only allow images under 5MB
    if (file.size > 5 * 1024 * 1024) {
      safeToast.error("Image too large. Please upload an image under 5MB.")
      return
    }

    // Preview the image
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImagePreview(result)
    }
    reader.readAsDataURL(file)
    setImageFile(file)
    
    // Reset the input
    e.target.value = ''
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageFile(null)
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <Toaster position="top-center" />
      
      {selectedCategory ? (
        // Chat UI
        <div className="flex flex-col h-screen">
          <header className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2" 
              onClick={() => setSelectedCategory(null)}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-lg font-medium capitalize">
              {categories.find(c => c.id === selectedCategory)?.emoji} {" "}
              {categories.find(c => c.id === selectedCategory)?.label}
            </h1>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 shadow-sm rounded-bl-none'
                  }`}
                >
                  {message.image && (
                    <div className="mb-2">
                      <img 
                        src={message.image} 
                        alt="Uploaded" 
                        className="rounded-md max-h-48 w-auto" 
                      />
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-lg rounded-bl-none max-w-[80%]">
                  <div className="flex space-x-2 items-center">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t bg-white">
            {imagePreview && (
              <div className="mb-2 relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="h-16 w-auto rounded-md" 
                />
                <button 
                  onClick={removeImage} 
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <div className="relative flex items-center">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ask anything about ${selectedCategory}...`}
                className="pr-24 py-6 rounded-full border-gray-300"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <div className="absolute right-2 flex space-x-1">
                <label className="cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                  />
                  <div className="p-2 rounded-full hover:bg-gray-100">
                    <Paperclip className="h-5 w-5 text-gray-500" />
                  </div>
                </label>
                <Button 
                  size="icon" 
                  className="rounded-full h-10 w-10" 
                  onClick={handleSendMessage}
                  disabled={isLoading || (!inputValue.trim() && !imageFile)}
                >
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Home UI with category selection
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-8 text-center"
          >
            <div>
              <h1 className="text-2xl font-bold">Everyday Magic</h1>
              <p className="text-gray-500 mt-2">Feeling stuck? Let's help you decide.</p>
            </div>
            
            <div className="space-y-3">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 px-6 rounded-full border text-left flex items-center space-x-3 ${
                    category.disabled 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                  disabled={category.disabled}
                >
                  <span className="text-2xl">{category.emoji}</span>
                  <span className="text-lg font-medium">{category.label}</span>
                </motion.button>
              ))}
            </div>
            
            <div className="pt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  )
} 