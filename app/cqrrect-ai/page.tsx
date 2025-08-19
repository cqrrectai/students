"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Send,
  Menu,
  Plus,
  MessageSquare,
  Settings,
  User,
  LogOut,
  Home,
  Crown,
  HelpCircle,
  Sparkles,
  Brain,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatSession {
  id: string
  title: string
  timestamp: Date
  preview: string
}

export default function CqrrectAiPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "Math Problem Solving",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      preview: "Help me solve quadratic equations...",
    },
    {
      id: "2",
      title: "English Grammar",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      preview: "Explain the difference between...",
    },
  ])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    initialMessages: [],
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  const startNewChat = () => {
    setMessages([])
    setCurrentSessionId(null)
  }

  const promptSuggestions = [
    "Help me solve a math problem",
    "Explain a concept in simple terms",
    "Create practice questions for my exam",
    "Review my essay for grammar",
  ]

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-80" : "w-16",
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center")}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-gray-700 p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-[#00e4a0]" />
                <span className="font-semibold">Cqrrect AI</span>
              </div>
            )}
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={startNewChat}
            className={cn(
              "bg-[#00e4a0] hover:bg-[#00d494] text-white font-medium transition-all duration-200",
              sidebarOpen ? "w-full justify-start" : "w-10 h-10 p-0",
            )}
          >
            <Plus className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">New Chat</span>}
          </Button>
        </div>

        {/* Chat History */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Recent Chats</h3>
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setCurrentSessionId(session.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors duration-200 group",
                    currentSessionId === session.id ? "bg-gray-700 text-white" : "hover:bg-gray-800 text-gray-300",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{session.title}</div>
                      <div className="text-xs text-gray-400 truncate mt-1">{session.preview}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatTime(session.timestamp)}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="border-t border-gray-700 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "text-white hover:bg-gray-700 transition-colors duration-200",
                  sidebarOpen ? "w-full justify-start" : "w-10 h-10 p-0",
                )}
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-[#00e4a0] text-white text-xs">U</AvatarFallback>
                </Avatar>
                {sidebarOpen && <span className="ml-2 text-sm">User Account</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Crown className="mr-2 h-4 w-4" />
                Upgrade Plan
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="flex items-center gap-1">
                      <Home className="h-4 w-4" />
                      Home
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-[#00e4a0]" />
                      AI Assistant
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Badge className="bg-[#00e4a0]/10 text-[#00e4a0] border-[#00e4a0]/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by Llama 4 Scout
            </Badge>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="text-center space-y-6 max-w-2xl">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-[#00e4a0]/10 rounded-full flex items-center justify-center mx-auto">
                    <Brain className="h-8 w-8 text-[#00e4a0]" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">How can I help you today?</h1>
                  <p className="text-lg text-gray-600">
                    I'm your AI assistant powered by Llama 4 Scout. Ask me anything about your studies, exams, or any
                    topic you'd like to explore.
                  </p>
                </div>

                {/* Prompt Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
                  {promptSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleInputChange({ target: { value: suggestion } } as any)
                        setTimeout(() => textareaRef.current?.focus(), 100)
                      }}
                      className="p-4 text-left border border-gray-200 rounded-xl hover:border-[#00e4a0] hover:bg-[#00e4a0]/5 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 group-hover:bg-[#00e4a0]/10 rounded-lg flex items-center justify-center transition-colors duration-200">
                          <Sparkles className="h-4 w-4 text-gray-600 group-hover:text-[#00e4a0]" />
                        </div>
                        <span className="text-gray-700 group-hover:text-gray-900 font-medium">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Messages
            <div className="space-y-6 p-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn("flex gap-4", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-[#00e4a0] text-white">
                        <Brain className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={cn("max-w-3xl", message.role === "user" ? "order-first" : "")}>
                    <Card
                      className={cn(
                        "p-4 shadow-sm",
                        message.role === "user" ? "bg-[#00e4a0] text-white ml-auto" : "bg-gray-50 border-gray-200",
                      )}
                    >
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </Card>

                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-2 ml-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-gray-700">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-gray-700">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-gray-700">
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-gray-700">
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-gray-600 text-white">U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-[#00e4a0] text-white">
                      <Brain className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <Card className="p-4 bg-gray-50 border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message Cqrrect AI..."
                className="min-h-[50px] max-h-[150px] resize-none pr-12 py-3 px-4 text-base border-gray-300 focus:border-[#00e4a0] focus:ring-[#00e4a0] rounded-xl transition-all duration-200"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-[#00e4a0] hover:bg-[#00d494] disabled:bg-gray-300 rounded-lg transition-all duration-200"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 text-center mt-2">
              Cqrrect AI can make mistakes. Consider checking important information.
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
