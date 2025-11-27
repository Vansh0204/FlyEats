import { useState } from 'react'
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa'
import { apiFetch } from '../lib/api'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface AIChatbotProps {
    outletId?: string
}

export default function AIChatbot({ outletId }: AIChatbotProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hi! I'm your FlyEats AI assistant. I can help you find the perfect meal for your flight. What are you craving?"
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)

    const suggestedPrompts = [
        "What's quick to eat?",
        "I want something healthy",
        "Recommend a combo meal",
        "What's popular here?"
    ]

    const sendMessage = async (messageText?: string) => {
        const textToSend = messageText || input
        if (!textToSend.trim() || loading) return

        const userMessage: Message = { role: 'user', content: textToSend }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const response = await apiFetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: textToSend,
                    outletId,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.response
                }
                setMessages(prev => [...prev, assistantMessage])
            } else {
                throw new Error('Failed to get response')
            }
        } catch (error) {
            const errorMessage: Message = {
                role: 'assistant',
                content: "Sorry, I'm having trouble right now. Please try again!"
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-300 hover:scale-110 transition-all duration-300 animate-float"
                >
                    <FaRobot className="text-2xl" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] animate-slide-up">
                    <div className="glass-dark rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <FaRobot className="text-white text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white font-display">AI Assistant</h3>
                                    <p className="text-xs text-white/80">Powered by Gemini</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl ${message.role === 'user'
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                                : 'bg-white/10 text-white border border-white/20'
                                            }`}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 text-white border border-white/20 p-3 rounded-2xl">
                                        <FaSpinner className="animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Suggested Prompts */}
                        {messages.length === 1 && (
                            <div className="p-3 bg-slate-900/30 border-t border-white/10">
                                <p className="text-xs text-white/60 mb-2">Try asking:</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedPrompts.map((prompt, index) => (
                                        <button
                                            key={index}
                                            onClick={() => sendMessage(prompt)}
                                            className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors border border-white/20"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 bg-slate-900/50 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Ask me anything..."
                                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    disabled={loading}
                                />
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={loading || !input.trim()}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
