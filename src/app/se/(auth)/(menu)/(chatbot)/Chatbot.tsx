'use client'

import React, { useState, useEffect, useRef } from "react"
import { MessageCircle, Send, CheckCircle2, Home, MessageSquare } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    setMessages([...messages, { sender: "user", text: input }])
    setInput("")

    try {
      const response = await fetch("https://weird-keely-epsmartteam-c347da1b.koyeb.app/ask_question/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.response || "Sorry, I didn't understand that." },
      ])
    } catch (error) {
      console.error("Error fetching response from API:", error)
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong. Please try again later." },
      ])
    }
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="rounded-full w-14 h-14 bg-black hover:bg-gray-800 text-white"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-[400px] shadow-lg overflow-hidden bg-white rounded-2xl border border-gray-200">
          <div className="p-4 flex items-center justify-between bg-black text-white">
            <div className="flex items-center space-x-2">
              <svg 
                viewBox="0 0 24 24" 
                className="h-8 w-8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M3 9L12 15L21 9L12 3L3 9Z" 
                  fill="white"
                  stroke="white"
                  strokeWidth="2"
                />
                <path 
                  d="M3 15L12 21L21 15" 
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
              <span className="font-bold text-xl">Sepu</span>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
          
          <CardContent className="p-0 bg-white">
            <ScrollArea className="h-[400px] px-4 py-2">
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-gray-600">Chào Son 👋</h2>
                <h1 className="text-4xl font-bold text-black">Chúng tôi có thể giúp gì cho bạn?</h1>
                
                <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Tình trạng: Tất cả các hệ thống đều hoạt động</span>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold mb-2">Chào mừng bạn đến với Hệ thống kiểm tra giám sát và phát hiện bất thường thiết bị đường dây lưới điện cao thế! 🎉</h3>
                  <p className="text-gray-600">Tôi là trợ lý ảo của bạn, sẵn sàng hỗ trợ bạn khám phá và sử dụng hệ thống.</p>
                  {/* <p className="text-gray-600">Switch to Starter to get custom domains, invite co-workers, and more</p> */}
                </div>

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg max-w-[80%] ${
                        msg.sender === "user"
                          ? "bg-black text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="mt-auto">
              <div className="p-4 bg-white border-t border-gray-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    type="text"
                    placeholder="Send a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" className="bg-black hover:bg-gray-800 text-white">
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </div>

              <div className="flex border-t border-gray-200">
                <Button variant="ghost" className="flex-1 rounded-none h-14 hover:bg-gray-100 text-gray-600">
                  <Home className="h-5 w-5" />
                  <span className="ml-2">Home</span>
                </Button>
                <Button variant="ghost" className="flex-1 rounded-none h-14 hover:bg-gray-100 text-gray-600">
                  <MessageSquare className="h-5 w-5" />
                  <span className="ml-2">Messages</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isOpen && (
        <Button
          onClick={() => setIsOpen(false)}
          size="icon"
          className="mt-4 rounded-full w-14 h-14 bg-black hover:bg-gray-800 text-white"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </Button>
      )}
    </div>
  )
}

export default ChatBot

