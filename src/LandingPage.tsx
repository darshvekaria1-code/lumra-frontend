import React, { useState, useEffect, useRef } from "react"
import { 
  ArrowRight, Zap, BookOpen, Brain, Target, Rocket, Code2, 
  MessageCircle, Send, Loader, Mail, Github, Linkedin, Twitter 
} from "lucide-react"
import "./LandingPage.css"

// Scroll Animation Hook - Non-intrusive version
function useScrollAnimation() {
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef<HTMLElement>(null)
    const hasAnimated = useRef(false)

    useEffect(() => {
        // Only animate after user has scrolled a bit to avoid interference
        const checkScroll = () => {
            if (window.scrollY > 50 && !hasAnimated.current) {
                hasAnimated.current = true
            }
        }
        
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Only trigger animation if user has scrolled or section is well into view
                if (entry.isIntersecting && (hasAnimated.current || entry.intersectionRatio > 0.5)) {
                    setIsVisible(true)
                    // Unobserve after animation to prevent re-triggering
                    if (ref.current) {
                        observer.unobserve(ref.current)
                    }
                }
            },
            { threshold: [0, 0.1, 0.5], rootMargin: '0px' }
        )

        window.addEventListener('scroll', checkScroll, { passive: true })

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            window.removeEventListener('scroll', checkScroll)
            if (ref.current) {
                observer.unobserve(ref.current)
            }
        }
    }, [])

    return { ref, isVisible }
}

// Use relative URL to hide backend URL from frontend inspection
const getApiBaseUrl = () => {
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_LUMRA_API_BASE || ''
    } else {
        return ''
    }
}

const API_BASE_URL = getApiBaseUrl()

type LandingPageProps = {
    onDemoKeySubmit: (key: string) => void
}

// Logo Component with animated gradient L
function Logo({ size = 40 }: { size?: number }) {
    return (
        <div className="relative flex items-center gap-3">
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative"
            >
                {/* Glow effect layers */}
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
                
                {/* Outer glow aura */}
                <rect
                    x="25"
                    y="20"
                    width="12"
                    height="60"
                    rx="2"
                    fill="url(#gradient1)"
                    opacity="0.3"
                    filter="url(#glow)"
                    className="animate-pulse"
                />
                <rect
                    x="25"
                    y="68"
                    width="38"
                    height="12"
                    rx="2"
                    fill="url(#gradient1)"
                    opacity="0.3"
                    filter="url(#glow)"
                    className="animate-pulse"
                />
                
                {/* Main L shape with gradient */}
                <rect
                    x="25"
                    y="20"
                    width="12"
                    height="60"
                    rx="2"
                    fill="url(#gradient1)"
                    filter="url(#glow)"
                />
                <rect
                    x="25"
                    y="68"
                    width="38"
                    height="12"
                    rx="2"
                    fill="url(#gradient1)"
                    filter="url(#glow)"
                />
                
                {/* Inner highlight */}
                <rect
                    x="27"
                    y="22"
                    width="8"
                    height="20"
                    rx="1"
                    fill="white"
                    opacity="0.4"
                />
            </svg>
            
            {/* Elura text with glow */}
            <div className="relative">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    Elura
                </span>
            </div>
        </div>
    )
}

// Rolling Background Component
function RollingBackground() {
    const containerRef = useRef<HTMLDivElement>(null)
    const cursorAuraRef = useRef<HTMLDivElement>(null)
    const trailCanvasRef = useRef<HTMLCanvasElement>(null)
    const [trail, setTrail] = useState<Array<{ id: number; x: number; y: number; createdAt: number }>>([])
    const trailIdRef = useRef(0)

    useEffect(() => {
        const canvas = trailCanvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const handleMouseMove = (e: MouseEvent) => {
            if (cursorAuraRef.current) {
                cursorAuraRef.current.style.left = `${e.clientX}px`
                cursorAuraRef.current.style.top = `${e.clientY}px`
            }

            setTrail((prevTrail) => {
                const now = Date.now()
                const newTrail = [
                    ...prevTrail,
                    {
                        id: trailIdRef.current++,
                        x: e.clientX,
                        y: e.clientY,
                        createdAt: now,
                    },
                ].filter((point) => now - point.createdAt < 2000)

                return newTrail
            })
        }

        const handleWindowResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("resize", handleWindowResize)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("resize", handleWindowResize)
        }
    }, [])

    useEffect(() => {
        const canvas = trailCanvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return

        const drawBlob = (x: number, y: number, size: number, opacity: number) => {
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.08})`
            ctx.save()
            ctx.translate(x, y)

            const points = 8
            const angles = Array.from({ length: points }, (_, i) => (i / points) * Math.PI * 2)

            ctx.beginPath()
            angles.forEach((angle, i) => {
                const randomVariation = 0.6 + Math.sin(angle * 3 + Date.now() * 0.001) * 0.4
                const radius = size * randomVariation
                const px = Math.cos(angle) * radius
                const py = Math.sin(angle) * radius

                if (i === 0) ctx.moveTo(px, py)
                else
                    ctx.quadraticCurveTo(
                        Math.cos(angle - Math.PI / points) * size * 0.7,
                        Math.sin(angle - Math.PI / points) * size * 0.7,
                        px,
                        py,
                    )
            })
            ctx.closePath()
            ctx.fill()
            ctx.restore()
        }

        const animateTrail = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 1)"
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            const now = Date.now()

            trail.forEach((point) => {
                const age = now - point.createdAt
                const progress = age / 2000
                const opacity = Math.max(0, 1 - progress)

                const size = Math.max(15, 80 * (1 - progress * 0.5))
                drawBlob(point.x, point.y, size, opacity)
            })

            requestAnimationFrame(animateTrail)
        }

        animateTrail()
    }, [trail])

    return (
        <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-black">
            <canvas ref={trailCanvasRef} className="absolute inset-0 pointer-events-none" style={{ display: "block" }} />
            <div
                ref={cursorAuraRef}
                className="absolute w-64 h-64 bg-white rounded-full filter blur-2xl opacity-10 pointer-events-none"
                style={{
                    transform: "translate(-50%, -50%)",
                    boxShadow: "0 0 40px rgba(255, 255, 255, 0.15), 0 0 60px rgba(255, 255, 255, 0.08)",
                }}
            />
        </div>
    )
}

// Scroll Section Component
const ScrollSection = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string; id?: string }>(
    ({ children, className = "", id }, externalRef) => {
        const { ref: scrollRef, isVisible } = useScrollAnimation()
        
        // Use a callback ref to set both refs
        const setRefs = React.useCallback((node: HTMLDivElement | null) => {
            // Set scrollRef for animation
            if (typeof scrollRef === 'function') {
                scrollRef(node)
            } else if (scrollRef) {
                (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node
            }
            
            // Set external ref if provided
            if (externalRef) {
                if (typeof externalRef === 'function') {
                    externalRef(node)
                } else if (externalRef) {
                    (externalRef as React.MutableRefObject<HTMLDivElement | null>).current = node
                }
            }
        }, [externalRef, scrollRef])
        
        return (
            <section 
                id={id}
                ref={setRefs}
                className={`${className} ${isVisible ? 'scroll-animate-in' : 'scroll-animate-out'}`}
                style={{ 
                    // Prevent layout shifts that might interfere with scroll
                    contain: 'layout style paint'
                }}
            >
                {children}
            </section>
        )
    }
)
ScrollSection.displayName = "ScrollSection"

// Starfield Component
function Starfield() {
    const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; opacity: number; delay: number }>>([])

    useEffect(() => {
        // Generate random stars/particles
        const starCount = 200
        const newStars = Array.from({ length: starCount }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.8 + 0.2,
            delay: Math.random() * 3,
        }))
        setStars(newStars)
    }, [])

    return (
        <div className="absolute inset-0 overflow-hidden">
            {stars.map((star, index) => (
                <div
                    key={index}
                    className="absolute rounded-full bg-white star-particle"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        opacity: star.opacity,
                        animationDelay: `${star.delay}s`,
                    }}
                />
            ))}
        </div>
    )
}

// Left Bar Component - REMOVED (no longer needed)

// Laptop Demo Component
function LaptopDemoSection() {
    const [showChat, setShowChat] = useState(false)
    const [chatMessages, setChatMessages] = useState([
        {
            type: "ai" as const,
            text: "Hi! I'm Elura AI, your personalized learning assistant. What would you like to learn today?",
        },
    ])
    const [hasAnimated, setHasAnimated] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setHasAnimated(true), 500)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (showChat && chatMessages.length === 1) {
            setTimeout(() => {
                setChatMessages((prev) => [...prev, { type: "user" as const, text: "Can you help me learn machine learning?" }])
            }, 800)

            setTimeout(() => {
                setChatMessages((prev) => [
                    ...prev,
                    {
                        type: "ai" as const,
                        text: "I've created a personalized ML learning path for you. We'll start with fundamentals and progress to advanced topics at your pace.",
                    },
                ])
            }, 2000)
        }
    }, [showChat, chatMessages.length])

    const { ref, isVisible } = useScrollAnimation()
    
    return (
        <section 
            id="demo"
            ref={ref as React.RefObject<HTMLDivElement>}
            className={`relative py-24 px-6 overflow-hidden z-10 ${isVisible ? 'scroll-animate-in' : 'scroll-animate-out'}`}
        >
            <div className="relative max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left - Laptop Container */}
                    <div
                        className={`flex justify-center transition-all duration-700 ${hasAnimated ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
                    >
                        <div className="relative w-full max-w-md">
                            {/* Laptop Body */}
                            <div className="bg-gradient-to-b from-gray-300 to-gray-400 rounded-3xl p-1 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                                {/* Screen */}
                                <div className="bg-black rounded-2xl overflow-hidden shadow-inner relative">
                                    {/* Screen Content */}
                                    <div className="aspect-video bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex flex-col justify-between p-6 relative overflow-hidden">
                                        {/* Background Pattern */}
                                        <div className="absolute inset-0 opacity-20">
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
                                        </div>

                                        {/* Header Bar */}
                                        <div className="flex justify-between items-center relative z-10">
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                            </div>
                                            <span className="text-gray-400 text-xs">Elura AI Assistant</span>
                                        </div>

                                        {/* Chat Messages */}
                                        <div className="flex-1 flex flex-col justify-end gap-3 overflow-hidden relative z-10">
                                            {chatMessages.map((msg, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`animate-fade-in flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                                                    style={{ animationDelay: `${idx * 200}ms` }}
                                                >
                                                    <div
                                                        className={`max-w-xs px-3 py-2 rounded-lg text-xs leading-relaxed ${
                                                            msg.type === "user"
                                                                ? "bg-gray-700 text-gray-100 rounded-br-none"
                                                                : "bg-gray-800 text-gray-200 rounded-bl-none"
                                                        }`}
                                                    >
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Input Bar */}
                                        <div className="mt-4 relative z-10">
                                            <input
                                                type="text"
                                                placeholder="Ask me anything..."
                                                className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-xs px-3 py-2 rounded-lg placeholder-gray-600 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Laptop Base */}
                                <div className="h-8 bg-gradient-to-b from-gray-400 to-gray-500 rounded-b-3xl" />
                            </div>

                            {!showChat && (
                                <div
                                    className="absolute -right-8 top-1/3 cursor-pointer group animate-bounce"
                                    onClick={() => setShowChat(true)}
                                >
                                    <div className="relative">
                                        {/* Hand pointer */}
                                        <div className="text-6xl transition-transform group-hover:scale-110">👆</div>
                                        {/* Pulse effect */}
                                        <div className="absolute inset-0 bg-gray-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                                    </div>
                                    <p className="text-gray-400 text-xs mt-2 text-center whitespace-nowrap">Click to interact</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right - Content */}
                    <div
                        className={`transition-all duration-700 delay-200 ${hasAnimated ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 mb-6 backdrop-blur-sm relative group">
                            {/* Glow effect layers */}
                            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-lg opacity-0 group-hover:opacity-75 transition-opacity duration-500" />

                            <Zap className="w-3.5 h-3.5 text-gray-400 relative z-10" />
                            <span className="text-xs tracking-wide text-gray-300 uppercase relative z-10 font-semibold">
                                AI Assistant
                            </span>
                        </div>

                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            Meet Your
                            <br />
                            <span className="bg-gradient-to-r from-cyan-200 via-white to-purple-200 bg-clip-text text-transparent">
                                AI Learning Companion
                            </span>
                        </h2>

                        <p className="text-gray-400 text-lg leading-relaxed mb-8">
                            Elura AI is more than just a chatbot. It's your dedicated learning partner that understands your goals,
                            adapts to your pace, and provides personalized guidance every step of the way.
                        </p>

                        <div className="space-y-4 mb-8">
                            {[
                                { icon: "🎯", title: "Adaptive Learning", desc: "Adjusts difficulty and pace to match your progress" },
                                { icon: "💡", title: "Smart Recommendations", desc: "Suggests resources based on your learning style" },
                                { icon: "📊", title: "Progress Tracking", desc: "Monitor your growth with detailed analytics" },
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${idx * 150}ms` }}>
                                    <div className="text-2xl">{item.icon}</div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">{item.title}</p>
                                        <p className="text-gray-500 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {showChat && (
                            <div className="inline-block animate-scale-in">
                                <button className="px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 border border-cyan-400/20 flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    Start Learning Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

// Scroll Reveal Text Component
function ScrollRevealText({ children, className = "" }: { children: string; className?: string }) {
    const ref = useRef<HTMLParagraphElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(entry.target)
                }
            },
            { threshold: 0.3 },
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => observer.disconnect()
    }, [])

    return (
        <p ref={ref} className={className}>
            {children.split(" ").map((word, idx) => (
                <span
                    key={idx}
                    className={`inline-block mr-1 transition-all duration-500 ${
                        isVisible ? "opacity-100 translate-y-0" : "opacity-20 translate-y-2"
                    }`}
                    style={{
                        transitionDelay: isVisible ? `${idx * 30}ms` : "0ms",
                    }}
                >
                    {word}
                </span>
            ))}
        </p>
    )
}

export default function LandingPage({ onDemoKeySubmit }: LandingPageProps) {
    const [demoKey, setDemoKey] = useState("")
    const [demoKeyError, setDemoKeyError] = useState("")
    const [contactEmail, setContactEmail] = useState("")
    const [contactMessage, setContactMessage] = useState("")
    const [contactStatus, setContactStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [isOpen, setIsOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [newsletterEmail, setNewsletterEmail] = useState("")
    const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [newsletterError, setNewsletterError] = useState("")
    const [showDemoModal, setShowDemoModal] = useState(false)
    const [chatInput, setChatInput] = useState("")
    const [chatMessages, setChatMessages] = useState<Array<{ type: "user" | "ai"; text: string }>>([
        {
            type: "ai",
            text: "Hello! I'm Elura AI, your personalized learning assistant. What would you like to learn today?",
        },
    ])
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [hasAutoConversationStarted, setHasAutoConversationStarted] = useState(false)
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [infoModalContent, setInfoModalContent] = useState({ title: "", message: "" })
    const chatEndRef = useRef<HTMLDivElement>(null)
    const aiAssistantSectionRef = useRef<HTMLDivElement>(null)
    const [headerDemoKey, setHeaderDemoKey] = useState("")
    const [headerDemoKeyError, setHeaderDemoKeyError] = useState("")
    const [demoModalTab, setDemoModalTab] = useState<"enter" | "request">("enter")
    const [requestName, setRequestName] = useState("")
    const [requestEmail, setRequestEmail] = useState("")
    const [requestStatus, setRequestStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [requestError, setRequestError] = useState("")

    // Only clear hash from URL on mount - NO scroll interference
    useEffect(() => {
        // Clear any hash from URL without scrolling
        if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname)
        }
    }, [])

    const handleDemoKeySubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!demoKey.trim()) {
            setDemoKeyError("Please enter a demo key")
            return
        }

        setDemoKeyError("")
        try {
            const response = await fetch(`${API_BASE_URL}/api/demo/validate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ key: demoKey.trim() }),
            })

            const data = await response.json()

            if (response.ok && data.valid) {
                localStorage.setItem("lumra_demo_key", demoKey.trim())
                onDemoKeySubmit(demoKey.trim())
            } else {
                setDemoKeyError(data.message || "Invalid demo key")
            }
        } catch (error) {
            console.error("Error validating demo key:", error)
            setDemoKeyError("Error validating key. Please try again.")
        }
    }

    const handleHeaderDemoKeySubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!headerDemoKey.trim()) {
            setHeaderDemoKeyError("Please enter a demo key")
            return
        }

        setHeaderDemoKeyError("")
        try {
            const response = await fetch(`${API_BASE_URL}/api/demo/validate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ key: headerDemoKey.trim() }),
            })

            const data = await response.json()

            if (response.ok && data.valid) {
                localStorage.setItem("lumra_demo_key", headerDemoKey.trim())
                setShowDemoModal(false)
                setHeaderDemoKey("")
                onDemoKeySubmit(headerDemoKey.trim())
            } else {
                setHeaderDemoKeyError(data.message || "Invalid demo key")
            }
        } catch (error) {
            console.error("Error validating demo key:", error)
            setHeaderDemoKeyError("Error validating key. Please try again.")
        }
    }

    const handleDemoKeyRequest = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!requestName.trim() || !requestEmail.trim()) {
            setRequestError("Please fill in all fields")
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(requestEmail.trim())) {
            setRequestError("Please enter a valid email address")
            return
        }

        setRequestError("")
        setRequestStatus("loading")
        
        try {
            // Add timeout to prevent hanging
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

            const response = await fetch(`${API_BASE_URL}/api/demo/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: requestName.trim(),
                    email: requestEmail.trim(),
                }),
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Server error" }))
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (data.success) {
                setRequestStatus("success")
                setRequestName("")
                setRequestEmail("")
                setTimeout(() => {
                    setRequestStatus("idle")
                    setShowDemoModal(false)
                }, 3000)
            } else {
                setRequestStatus("error")
                setRequestError(data.message || "Failed to submit request. Please try again.")
            }
        } catch (error) {
            console.error("Error requesting demo key:", error)
            setRequestStatus("error")
            if (error instanceof Error && error.name === 'AbortError') {
                setRequestError("Request timed out. Please check your connection and try again.")
            } else {
                setRequestError(error instanceof Error ? error.message : "Error submitting request. Please try again.")
            }
        }
    }

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!contactEmail || !contactMessage) {
            setContactStatus("error")
            return
        }

        setContactStatus("loading")
        try {
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: contactEmail,
                    message: contactMessage,
                }),
            })

            if (response.ok) {
                setContactStatus("success")
                setContactEmail("")
                setContactMessage("")
                setTimeout(() => setContactStatus("idle"), 3000)
            } else {
                const data = await response.json()
                setContactStatus("error")
            }
        } catch (error) {
            console.error("Error submitting contact form:", error)
            setContactStatus("error")
        }
    }

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newsletterEmail) {
            setNewsletterError("Please enter your email address")
            setNewsletterStatus("error")
            return
        }

        setNewsletterStatus("loading")
        setNewsletterError("")
        try {
            const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: newsletterEmail,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setNewsletterStatus("success")
                setNewsletterEmail("")
                setTimeout(() => setNewsletterStatus("idle"), 5000)
            } else {
                setNewsletterError(data.error || "Failed to subscribe. Please try again.")
                setNewsletterStatus("error")
            }
        } catch (error) {
            console.error("Error subscribing to newsletter:", error)
            setNewsletterError("Network error. Please check your connection and try again.")
            setNewsletterStatus("error")
        }
    }

    // Scroll chat to bottom when new messages arrive (only within chat container, not page)
    useEffect(() => {
        // Only scroll within the chat container, never scroll the page
        if (chatEndRef.current) {
            // Find the scrollable chat container parent
            let scrollableParent = chatEndRef.current.parentElement
            while (scrollableParent && !scrollableParent.classList.contains('chat-messages-container')) {
                scrollableParent = scrollableParent.parentElement
            }
            
            // Only scroll if we found a chat container and it's the scrollable parent
            if (scrollableParent && scrollableParent.classList.contains('chat-messages-container')) {
                // Scroll only the container, not the page
                scrollableParent.scrollTop = scrollableParent.scrollHeight
            } else if (chatEndRef.current.parentElement) {
                // Fallback: scroll only the immediate parent element
                const parent = chatEndRef.current.parentElement
                if (parent.scrollHeight > parent.clientHeight) {
                    parent.scrollTop = parent.scrollHeight
                }
            }
        }
    }, [chatMessages])

    // Auto-conversation when section comes into view - but don't scroll the page
    useEffect(() => {
        // Only start auto-conversation if user has scrolled down manually (not on initial load)
        const hasUserScrolled = () => {
            return window.scrollY > 100 || sessionStorage.getItem('user_has_scrolled') === 'true'
        }
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // Only trigger if section is intersecting AND user has scrolled AND conversation hasn't started
                    if (entry.isIntersecting && !hasAutoConversationStarted && hasUserScrolled()) {
                        setHasAutoConversationStarted(true)
                        // Use setTimeout to avoid blocking scroll
                        setTimeout(() => {
                            startAutoConversation()
                        }, 100)
                    }
                })
            },
            { threshold: 0.3, rootMargin: '0px' }
        )

        // Track user scroll to know if they've manually scrolled
        const handleScroll = () => {
            if (window.scrollY > 100) {
                sessionStorage.setItem('user_has_scrolled', 'true')
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })

        if (aiAssistantSectionRef.current) {
            observer.observe(aiAssistantSectionRef.current)
        }

        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (aiAssistantSectionRef.current) {
                observer.unobserve(aiAssistantSectionRef.current)
            }
        }
    }, [hasAutoConversationStarted])

    const handleFooterLinkClick = (link: string, category: string) => {
        const messages: Record<string, { title: string; message: string }> = {
            // Product links
            "Features": {
                title: "Features",
                message: "Elura AI offers personalized learning paths, real-time AI assistance, curriculum-aligned content for IB and IGCSE, progress tracking, interactive quizzes, and comprehensive study materials. Get a demo key to explore all features!"
            },
            "Pricing": {
                title: "Pricing",
                message: "Contact us for pricing information. We offer flexible plans for students, schools, and institutions. Reach out to discuss your needs and get a customized quote. Email us at darshvekaria1@gmail.com or use the contact form above."
            },
            "Security": {
                title: "Security",
                message: "Your data security is our priority. We use industry-standard encryption, secure authentication, and comply with data protection regulations. All student information is kept confidential and secure."
            },
            "Roadmap": {
                title: "Roadmap",
                message: "We're constantly improving Elura AI! Upcoming features include advanced analytics, mobile apps, offline mode, and expanded curriculum support. Stay tuned for updates by subscribing to our newsletter!"
            },
            // Company links
            "About": {
                title: "About Elura",
                message: "Elura AI is an innovative learning platform designed for IB and IGCSE students. Founded by Darsh Vekaria and Siddhant Sathe, we're committed to making personalized, AI-powered education accessible to all students."
            },
            "Blog": {
                title: "Blog",
                message: "Our blog is coming soon! We'll be sharing study tips, learning strategies, curriculum updates, and success stories. Subscribe to our newsletter to be notified when we launch."
            },
            "Careers": {
                title: "Careers",
                message: "We're growing! If you're passionate about education technology and AI, we'd love to hear from you. Send your resume to darshvekaria1@gmail.com with the subject 'Career Inquiry'."
            },
            "Contact": {
                title: "Contact Us",
                message: "Have questions? We're here to help! Use the contact form above, email us at darshvekaria1@gmail.com, or request a demo key to get started. We typically respond within 24 hours."
            },
            // Legal links
            "Privacy Policy": {
                title: "Privacy Policy",
                message: "We respect your privacy. We collect only necessary information to provide our services, use secure data storage, and never share your data with third parties. For detailed information, please contact us at darshvekaria1@gmail.com."
            },
            "Terms of Service": {
                title: "Terms of Service",
                message: "By using Lumra AI, you agree to use the platform responsibly and for educational purposes only. We reserve the right to modify these terms. For the complete terms of service, please contact us at darshvekaria1@gmail.com."
            },
            "Cookie Policy": {
                title: "Cookie Policy",
                message: "We use cookies to enhance your experience, analyze usage, and improve our services. Essential cookies are required for the platform to function. You can manage cookie preferences in your browser settings."
            },
            "Compliance": {
                title: "Compliance",
                message: "Lumra AI complies with data protection regulations including GDPR and COPPA. We maintain high standards for student data privacy and security. For compliance inquiries, contact us at darshvekaria1@gmail.com."
            }
        }

        const content = messages[link] || {
            title: link,
            message: "This page is coming soon. For more information, please contact us at darshvekaria1@gmail.com or use the contact form above."
        }

        setInfoModalContent(content)
        setShowInfoModal(true)
    }

    const startAutoConversation = async () => {
        // Wait 1 second after section is visible
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // User asks about yesterday's English class
        const userQuestion = "What did I study yesterday in my English class and where did I miss something?"
        setChatMessages((prev) => [...prev, { type: "user", text: userQuestion }])

        // Wait 1.5 seconds before AI responds
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setIsChatLoading(true)

        try {
            const response = await fetch(`${API_BASE_URL}/api/chatgpt`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: userQuestion,
                    system: "You are Elura AI, a friendly and helpful personalized learning assistant for IB and IGCSE students. The user is asking about what they studied yesterday in English class and where they might have missed something. Provide a helpful, encouraging response that acknowledges their question and offers to help them review their English studies. Keep it under 200 words.",
                    temperature: 0.7,
                }),
            })

            const data = await response.json()

            if (response.ok && data.response) {
                setChatMessages((prev) => [...prev, { type: "ai", text: data.response }])
            } else {
                // Fallback response if API fails
                setChatMessages((prev) => [
                    ...prev,
                    {
                        type: "ai",
                        text: "Based on your recent activity, you were working on essay writing techniques and literary analysis. I noticed you might have missed some key points about thesis statements and supporting evidence. Would you like me to help you review those concepts? I can create a quick summary of what you covered and highlight areas that might need more attention.",
                    },
                ])
            }
        } catch (error) {
            console.error("Error in auto-conversation:", error)
            // Fallback response
            setChatMessages((prev) => [
                ...prev,
                {
                    type: "ai",
                    text: "Based on your recent activity, you were working on essay writing techniques and literary analysis. I noticed you might have missed some key points about thesis statements and supporting evidence. Would you like me to help you review those concepts? I can create a quick summary of what you covered and highlight areas that might need more attention.",
                },
            ])
        } finally {
            setIsChatLoading(false)
        }
    }

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!chatInput.trim() || isChatLoading) return

        const userMessage = chatInput.trim()
        setChatInput("")
        setIsChatLoading(true)

        // Add user message
        setChatMessages((prev) => [...prev, { type: "user", text: userMessage }])

        try {
            const response = await fetch(`${API_BASE_URL}/api/chatgpt`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: userMessage,
                    system: "You are Elura AI, a friendly and helpful personalized learning assistant for IB and IGCSE students. Provide clear, concise, and encouraging responses. Help students with their learning goals, answer questions about subjects, and offer study tips. Keep responses under 200 words when possible.",
                    temperature: 0.7,
                }),
            })

            const data = await response.json()

            if (response.ok && data.response) {
                // Add AI response
                setChatMessages((prev) => [...prev, { type: "ai", text: data.response }])
            } else {
                // Show error message
                setChatMessages((prev) => [
                    ...prev,
                    {
                        type: "ai",
                        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or get a demo key to access the full Elura AI experience!",
                    },
                ])
            }
        } catch (error) {
            console.error("Error sending chat message:", error)
            setChatMessages((prev) => [
                ...prev,
                {
                    type: "ai",
                    text: "I'm sorry, I encountered an error. Please check your connection and try again, or get a demo key to access the full Elura AI experience!",
                },
            ])
        } finally {
            setIsChatLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 relative landing-page-container">
            <RollingBackground />

            {/* Main Content - Naturally Scrollable */}
            <div className="relative z-10" id="landing-main-content">
                {/* Header */}
                <header className="border-b border-zinc-800/50 backdrop-blur-md bg-zinc-950/80 sticky top-0 z-50">
                    <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <Logo size={40} />
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            {[
                                { label: 'Home', id: 'home', scrollFn: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
                                { label: 'Demo Key', id: 'demo-key' },
                                { label: 'AI Assistant', id: 'ai-assistant' },
                                { label: 'Features', id: 'features' },
                                { label: 'Curriculum', id: 'curriculum' },
                                { label: 'Contact', id: 'contact' },
                            ].map((item) => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (item.scrollFn) {
                                            item.scrollFn()
                                        } else {
                                            const section = document.getElementById(item.id)
                                            section?.scrollIntoView({ behavior: 'smooth' })
                                        }
                                    }}
                                    className="text-gray-400 hover:text-gray-200 transition-colors duration-300 relative group text-sm cursor-pointer"
                                >
                                    {item.label}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-500 group-hover:w-full transition-all duration-300" />
                                </a>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            <button 
                                className="px-6 py-2 rounded-full font-medium text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 active:scale-95 border border-gray-600"
                                onClick={() => setShowDemoModal(true)}
                            >
                                Try A Demo
                            </button>
                            
                            {/* IB and IGCSE Logos */}
                            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-zinc-800">
                                <div className="flex items-center justify-center">
                                    <img 
                                        src="/logos/ib-logo.png" 
                                        alt="International Baccalaureate" 
                                        className="h-12 w-auto max-w-[60px] object-contain"
                                        style={{ 
                                            imageRendering: 'high-quality',
                                            maxHeight: '48px',
                                            width: 'auto',
                                            height: 'auto'
                                        }}
                                        onError={(e) => {
                                            // Try SVG fallback
                                            e.currentTarget.src = '/logos/ib-logo.svg'
                                            e.currentTarget.onerror = () => {
                                                e.currentTarget.style.display = 'none'
                                                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                                if (fallback) fallback.style.display = 'flex'
                                            }
                                        }}
                                    />
                                    <div className="h-10 w-10 rounded flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-xs hidden">
                                        IB
                                    </div>
                                </div>
                                <div className="flex items-center justify-center">
                                    <img 
                                        src="/logos/igcse-logo.png" 
                                        alt="Cambridge Assessment International Education" 
                                        className="h-12 w-auto max-w-[80px] object-contain"
                                        style={{ 
                                            imageRendering: 'high-quality',
                                            maxHeight: '48px',
                                            width: 'auto',
                                            height: 'auto'
                                        }}
                                        onError={(e) => {
                                            // Try SVG fallback
                                            e.currentTarget.src = '/logos/igcse-logo.svg'
                                            e.currentTarget.onerror = () => {
                                                e.currentTarget.style.display = 'none'
                                                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                                if (fallback) fallback.style.display = 'flex'
                                            }
                                        }}
                                    />
                                    <div className="h-10 w-10 rounded flex items-center justify-center bg-gradient-to-br from-orange-600 to-orange-700 text-white font-bold text-xs hidden">
                                        IGCSE
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </nav>

                    {isOpen && (
                        <div className="md:hidden border-t border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md animate-slide-down">
                            <div className="px-6 py-4 space-y-4">
                                {[
                                    { label: 'Home', id: 'home', scrollFn: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
                                    { label: 'Demo Key', id: 'demo-key' },
                                    { label: 'AI Assistant', id: 'ai-assistant' },
                                    { label: 'Features', id: 'features' },
                                    { label: 'Curriculum', id: 'curriculum' },
                                    { label: 'Contact', id: 'contact' },
                                ].map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setIsOpen(false)
                                            if (item.scrollFn) {
                                                item.scrollFn()
                                            } else {
                                                const section = document.getElementById(item.id)
                                                section?.scrollIntoView({ behavior: 'smooth' })
                                            }
                                        }}
                                        className="block text-gray-400 hover:text-gray-300 transition-colors"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                                <button 
                                    className="w-full px-6 py-2 rounded-full font-medium text-white bg-gradient-to-r from-gray-700 to-gray-800 transition-all border border-gray-600"
                                    onClick={() => {
                                        setIsOpen(false)
                                        setShowDemoModal(true)
                                    }}
                                >
                                    Try A Demo
                                </button>
                            </div>
                        </div>
                    )}
                </header>

                <main className="flex-1 relative">
                    {/* Background for entire main content - seamless across all sections */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black pointer-events-none z-0">
                        {/* Starfield texture overlay */}
                        <Starfield />
                    </div>
                    
                    {/* Welcome Section */}
                    <ScrollSection id="home" className="relative py-32 px-6 overflow-hidden min-h-screen flex items-center justify-center z-10">

                        <div className="relative max-w-5xl mx-auto text-center">
                            <div className="mb-12 animate-fade-in">
                                <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full border border-gray-700 bg-gray-900/40 backdrop-blur relative group">
                                    {/* Colorful aura effect */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500 animate-pulse" />
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full opacity-10 group-hover:opacity-20 blur-lg transition-opacity duration-500" />
                                    
                                    <Zap className="w-4 h-4 text-cyan-400 relative z-10" />
                                    <span className="text-sm tracking-widest text-gray-300 uppercase relative z-10 font-semibold">POWERED BY <span className="text-white">ELURA AI</span></span>
                                    <Zap className="w-4 h-4 text-cyan-400 relative z-10" />
                                </div>

                                <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
                                    The Future of
                                    <br />
                                    <span className="bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent">
                                        Learning Starts Here
                                    </span>
                                </h1>

                                <div className="mt-12 max-w-3xl mx-auto">
                                    <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light">
                                        Personalized AI-powered learning designed for{" "}
                                        <span className="text-white font-semibold">IB and IGCSE students</span>. Get instant answers, adaptive
                                        guidance, and exam-ready preparation tailored to your curriculum and learning pace.
                                    </p>
                                </div>

                                <div className="mt-16 flex flex-col sm:flex-row gap-6 justify-center items-center">
                                    <button 
                                        className="px-10 py-3.5 bg-white text-black font-bold rounded-full text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                                        onClick={() => {
                                            const demoSection = document.querySelector('.demo-section')
                                            demoSection?.scrollIntoView({ behavior: 'smooth' })
                                        }}
                                    >
                                        Try A Demo
                                    </button>
                                    <button 
                                        className="px-10 py-3.5 border-2 border-gray-600 text-white font-bold rounded-full text-lg hover:border-white hover:bg-white/5 transition-all duration-300"
                                        onClick={() => {
                                            setShowDemoModal(true)
                                            setDemoModalTab("request")
                                        }}
                                    >
                                        Get Started <ArrowRight className="inline-block ml-2 w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mt-20">
                                    <p className="text-xs tracking-widest text-gray-500 uppercase mb-8">Configured For</p>
                                    <div className="flex justify-center items-center gap-8 flex-wrap">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-white mb-2">IB</div>
                                            <p className="text-xs text-gray-400">International Baccalaureate</p>
                                        </div>
                                        <div className="w-px h-12 bg-gray-700" />
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-white mb-2">IGCSE</div>
                                            <p className="text-xs text-gray-400">Cambridge International</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-20 flex justify-center animate-bounce" style={{ animationDelay: "0.5s" }}>
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <span>Scroll to explore</span>
                                    <ArrowRight className="w-4 h-4 rotate-90" />
                                </div>
                            </div>
                        </div>
                    </ScrollSection>

                    {/* Demo Key Section */}
                    <ScrollSection id="demo-key" className="demo-section py-32 px-6 relative overflow-hidden z-10">
                        <div className="relative max-w-5xl mx-auto text-center">
                            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">Get Started with Your Demo Key</h2>
                            <p className="text-gray-400 mb-12 text-lg max-w-2xl mx-auto">
                                Enter your demo key to access Elura AI and start your personalized learning journey.
                            </p>
                            <form onSubmit={handleDemoKeySubmit} className="max-w-md mx-auto">
                                <div className="flex gap-3 mb-4">
                                    <input
                                        type="text"
                                        value={demoKey}
                                        onChange={(e) => {
                                            setDemoKey(e.target.value)
                                            setDemoKeyError("")
                                        }}
                                        placeholder="Enter your demo key"
                                        className="flex-1 px-6 py-4 rounded-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-gray-500 focus:outline-none focus:border-zinc-700 focus:bg-zinc-900 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="px-8 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 active:scale-95 border border-gray-600"
                                    >
                                        Start Learning
                                    </button>
                                </div>
                                {demoKeyError && <p className="text-red-400 text-sm">{demoKeyError}</p>}
                            </form>
                        </div>
                    </ScrollSection>

                    {/* Laptop Demo Section */}
                    <LaptopDemoSection />

                    {/* Features Section */}
                    <ScrollSection id="features" className="py-32 px-6 relative overflow-hidden z-10">

                        <div className="relative max-w-7xl mx-auto">
                            <div className="text-center mb-20 animate-fade-in">
                                <p className="text-xs tracking-widest text-gray-500 uppercase mb-4">Key Features</p>
                                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight text-balance">
                                    Everything You Need to Learn
                                </h2>
                                <ScrollRevealText className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
                                    Lumra combines cutting-edge AI technology with personalized learning methodology. Get adaptive courses,
                                    intelligent feedback, and career-focused content designed specifically for modern learners who want to
                                    succeed.
                                </ScrollRevealText>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[
                                    { icon: Brain, title: "Personalized Learning Paths", desc: "AI adapts to your learning pace and style, creating custom courses just for you." },
                                    { icon: BookOpen, title: "Comprehensive Course Library", desc: "Access hundreds of in-depth courses across programming, design, data science, and more." },
                                    { icon: Zap, title: "Real-Time Feedback", desc: "Get instant responses to your questions and immediate feedback on assignments." },
                                    { icon: Code2, title: "Hands-On Projects", desc: "Build real-world projects with guided AI assistance and expert mentorship." },
                                    { icon: Target, title: "Goal Tracking", desc: "Track your progress with detailed analytics and insights." },
                                    { icon: Rocket, title: "Career Acceleration", desc: "Gain skills that matter in today's job market." },
                                ].map((feature, idx) => {
                                    const Icon = feature.icon
                                    return (
                                        <div
                                            key={idx}
                                            className="p-8 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-all hover:bg-zinc-900/60 group animate-fade-in backdrop-blur-sm transform hover:scale-105"
                                            style={{ animationDelay: `${idx * 100}ms` }}
                                        >
                                            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-700 flex items-center justify-center mb-6 group-hover:from-gray-600 group-hover:to-gray-700 transition-all transform group-hover:scale-110">
                                                <Icon className="w-7 h-7 text-gray-300 group-hover:text-gray-100 transition-colors" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gray-100 transition-colors">
                                                {feature.title}
                                            </h3>
                                            <p className="text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </ScrollSection>

                    {/* Curriculum Section */}
                    <ScrollSection id="curriculum" className="relative py-40 px-6 overflow-hidden z-10" data-section="curriculum">
                        <div className="relative max-w-5xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 mb-8 backdrop-blur-sm relative group">
                                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                                <BookOpen className="w-3.5 h-3.5 text-gray-400 relative z-10" />
                                <span className="text-xs tracking-wide text-gray-300 uppercase relative z-10 font-semibold">
                                    Curriculum Support
                                </span>
                            </div>

                            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                                Configured for IB & IGCSE
                            </h2>

                            <p className="text-xl text-gray-400 mb-12 max-w-3xl">
                                Optimized Learning for International Baccalaureate and IGCSE Students. Lumra AI is specifically designed to
                                support students through their academic journeys with curriculum-aligned content and expert guidance.
                            </p>

                            <div className="grid md:grid-cols-2 gap-8 mb-16">
                                <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm hover:border-cyan-500/50 transition-all hover:bg-zinc-900/60 group">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                                            <BookOpen className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white">International Baccalaureate</h3>
                                    </div>
                                    <p className="text-gray-300 mb-4 leading-relaxed">
                                        Comprehensive support for IB Diploma, Career-related, and Middle Years programmes.
                                    </p>
                                    <ul className="space-y-2 text-sm text-gray-400">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                            Full DP curriculum coverage
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                            TOK and EE guidance
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                            Interdisciplinary learning paths
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm hover:border-purple-500/50 transition-all hover:bg-zinc-900/60 group">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                                            <BookOpen className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white">IGCSE</h3>
                                    </div>
                                    <p className="text-gray-300 mb-4 leading-relaxed">
                                        Tailored learning support for IGCSE students across all major subjects and exam boards.
                                    </p>
                                    <ul className="space-y-2 text-sm text-gray-400">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                            All major IGCSE subjects
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                            Exam board specific content
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                            Practice papers & solutions
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </ScrollSection>

                    {/* Chat Section */}
                    <ScrollSection id="ai-assistant" ref={aiAssistantSectionRef} className="py-32 px-6 relative overflow-hidden z-10">

                        <div className="relative max-w-5xl mx-auto">
                            <div className="text-center mb-16 animate-fade-in">
                                <p className="text-xs tracking-widest text-gray-500 uppercase mb-4">AI Assistant</p>
                                <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight text-balance">
                                    Your Personal AI Learning Assistant
                                </h2>
                                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                                    Get instant answers, personalized recommendations, and step-by-step guidance. Our AI understands your
                                    learning style and adapts in real-time.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-2xl overflow-hidden animate-scale-in">
                                <div className="h-[400px] overflow-y-auto p-8 space-y-6 custom-scrollbar bg-gradient-to-b from-zinc-900/80 to-zinc-950/80">
                                    {chatMessages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                                            style={{ animationDelay: `${idx * 100}ms` }}
                                        >
                                            <div
                                                className={`max-w-xs sm:max-w-md px-5 py-4 rounded-lg text-sm leading-relaxed ${
                                                    msg.type === "user"
                                                        ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-br-none border border-gray-600"
                                                        : "bg-zinc-800/60 text-gray-100 rounded-bl-none border border-zinc-700"
                                                }`}
                                            >
                                                <p>{msg.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {isChatLoading && (
                                        <div className="flex justify-start animate-fade-in">
                                            <div className="max-w-xs sm:max-w-md px-5 py-4 rounded-lg bg-zinc-800/60 text-gray-100 rounded-bl-none border border-zinc-700">
                                                <div className="flex gap-2 items-center">
                                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="border-t border-zinc-800 p-6 bg-zinc-950/80 backdrop-blur-md">
                                    <form onSubmit={handleChatSubmit} className="flex gap-3">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="Ask me anything about learning or skills..."
                                            className="flex-1 bg-zinc-900/60 border border-zinc-700 text-white rounded-lg px-5 py-3 placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:bg-zinc-900 transition-all text-sm"
                                            disabled={isChatLoading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isChatLoading || !chatInput.trim()}
                                            className="px-5 py-3 rounded-lg font-medium text-white transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {isChatLoading ? (
                                                <Loader className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5" />
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </ScrollSection>

                    {/* Newsletter/Contact Section */}
                    <ScrollSection id="contact" className="py-32 px-6 relative overflow-hidden z-10">

                        <div className="relative max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                <div className="animate-slide-up">
                                    <p className="text-xs tracking-widest text-gray-500 uppercase mb-4">Stay Updated</p>
                                    <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight text-balance">
                                        Join Our Community
                                    </h2>
                                    <p className="text-gray-400 mb-12 text-lg leading-relaxed max-w-lg">
                                        Get weekly updates on new courses, learning tips, industry insights, and exclusive resources.
                                    </p>

                                    <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            value={newsletterEmail}
                                            onChange={(e) => {
                                                setNewsletterEmail(e.target.value)
                                                setNewsletterError("")
                                            }}
                                            className="flex-1 px-6 py-4 rounded-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-gray-500 focus:outline-none focus:border-zinc-700 focus:bg-zinc-900 transition-all text-sm"
                                            required
                                            disabled={newsletterStatus === "loading"}
                                        />
                                        <button 
                                            type="submit"
                                            disabled={newsletterStatus === "loading"}
                                            className="px-8 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 active:scale-95 border border-gray-600 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {newsletterStatus === "loading" ? "Subscribing..." : newsletterStatus === "success" ? "Subscribed!" : "Subscribe"}
                                            {newsletterStatus !== "loading" && <Send className="w-4 h-4" />}
                                        </button>
                                    </form>
                                    {newsletterError && (
                                        <p className="text-red-400 text-sm mb-4">{newsletterError}</p>
                                    )}
                                    {newsletterStatus === "success" && (
                                        <p className="text-green-400 text-sm mb-4">Thank you for subscribing! Check your email for updates.</p>
                                    )}
                                </div>

                                <div className="animate-slide-up animation-delay-200">
                                    <div className="p-10 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm hover:border-zinc-700 hover:bg-zinc-900/60 transition-all group">
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center mb-6 group-hover:from-gray-600 group-hover:to-gray-700 transition-all transform group-hover:scale-110">
                                            <Mail className="w-8 h-8 text-gray-300" />
                                        </div>

                                        <h3 className="text-2xl font-bold text-white mb-4">Get in Touch</h3>
                                        <p className="text-gray-400 mb-8 leading-relaxed">
                                            Have questions about our platform? Our support team is here to help. Reach out anytime.
                                        </p>

                                        <form onSubmit={handleContactSubmit} className="space-y-4">
                                            <input
                                                type="email"
                                                value={contactEmail}
                                                onChange={(e) => setContactEmail(e.target.value)}
                                                placeholder="Your email"
                                                className="w-full px-6 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-white placeholder-gray-500 focus:outline-none focus:border-zinc-700 focus:bg-zinc-900 transition-all"
                                                required
                                            />
                                            <textarea
                                                value={contactMessage}
                                                onChange={(e) => setContactMessage(e.target.value)}
                                                placeholder="Your message"
                                                rows={4}
                                                className="w-full px-6 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-white placeholder-gray-500 focus:outline-none focus:border-zinc-700 focus:bg-zinc-900 transition-all resize-none"
                                                required
                                            />
                                            <button
                                                type="submit"
                                                disabled={contactStatus === "loading"}
                                                className="w-full px-6 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 active:scale-95 border border-gray-600 flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {contactStatus === "loading" ? "Sending..." : contactStatus === "success" ? "Sent!" : "Send Message"}
                                                {contactStatus !== "loading" && <ArrowRight className="w-4 h-4" />}
                                            </button>
                                            {contactStatus === "error" && (
                                                <p className="text-red-400 text-sm">Failed to send message. Please try again.</p>
                                            )}
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollSection>
                </main>

                {/* Demo Key Modal */}
                {showDemoModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => {
                        setShowDemoModal(false)
                        setHeaderDemoKey("")
                        setHeaderDemoKeyError("")
                        setRequestName("")
                        setRequestEmail("")
                        setRequestError("")
                        setRequestStatus("idle")
                        setDemoModalTab("enter")
                    }}>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Get Demo Access</h2>
                                <button
                                    onClick={() => {
                                        setShowDemoModal(false)
                                        setHeaderDemoKey("")
                                        setHeaderDemoKeyError("")
                                        setRequestName("")
                                        setRequestEmail("")
                                        setRequestError("")
                                        setRequestStatus("idle")
                                        setDemoModalTab("enter")
                                    }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-6 border-b border-zinc-800">
                                <button
                                    onClick={() => {
                                        setDemoModalTab("enter")
                                        setHeaderDemoKeyError("")
                                        setRequestError("")
                                    }}
                                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                                        demoModalTab === "enter"
                                            ? "text-white border-b-2 border-white"
                                            : "text-gray-400 hover:text-gray-300"
                                    }`}
                                >
                                    Enter Code
                                </button>
                                <button
                                    onClick={() => {
                                        setDemoModalTab("request")
                                        setHeaderDemoKeyError("")
                                        setRequestError("")
                                    }}
                                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                                        demoModalTab === "request"
                                            ? "text-white border-b-2 border-white"
                                            : "text-gray-400 hover:text-gray-300"
                                    }`}
                                >
                                    Request Key
                                </button>
                            </div>

                            {/* Enter Code Tab */}
                            {demoModalTab === "enter" && (
                                <form onSubmit={handleHeaderDemoKeySubmit}>
                                    <div className="mb-4">
                                        <label className="block text-sm text-gray-400 mb-2">Verification Code</label>
                                        <input
                                            type="text"
                                            value={headerDemoKey}
                                            onChange={(e) => {
                                                setHeaderDemoKey(e.target.value)
                                                setHeaderDemoKeyError("")
                                            }}
                                            placeholder="Enter your demo key"
                                            className="w-full px-6 py-4 rounded-full bg-zinc-800/60 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:border-zinc-600 focus:bg-zinc-800 transition-all"
                                            autoFocus
                                        />
                                    </div>
                                    {headerDemoKeyError && (
                                        <p className="text-red-400 text-sm mb-4">{headerDemoKeyError}</p>
                                    )}
                                    <button
                                        type="submit"
                                        className="w-full px-8 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 active:scale-95 border border-gray-600"
                                    >
                                        Validate & Continue
                                    </button>
                                </form>
                            )}

                            {/* Request Key Tab */}
                            {demoModalTab === "request" && (
                                <form onSubmit={handleDemoKeyRequest}>
                                    <div className="mb-4">
                                        <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={requestName}
                                            onChange={(e) => {
                                                setRequestName(e.target.value)
                                                setRequestError("")
                                            }}
                                            placeholder="Enter your full name"
                                            className="w-full px-6 py-4 rounded-full bg-zinc-800/60 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:border-zinc-600 focus:bg-zinc-800 transition-all"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={requestEmail}
                                            onChange={(e) => {
                                                setRequestEmail(e.target.value)
                                                setRequestError("")
                                            }}
                                            placeholder="Enter your email"
                                            className="w-full px-6 py-4 rounded-full bg-zinc-800/60 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:border-zinc-600 focus:bg-zinc-800 transition-all"
                                            required
                                        />
                                    </div>
                                    {requestError && (
                                        <p className="text-red-400 text-sm mb-4">{requestError}</p>
                                    )}
                                    {requestStatus === "success" && (
                                        <p className="text-green-400 text-sm mb-4">Request submitted! We'll send you a demo key soon.</p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={requestStatus === "loading" || requestStatus === "success"}
                                        className="w-full px-8 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 active:scale-95 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {requestStatus === "loading" ? "Submitting..." : requestStatus === "success" ? "Request Sent!" : "Request Demo Key"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="border-t border-gray-800 bg-black/60 backdrop-blur-md py-16 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
                            <div className="md:col-span-2 animate-fade-in">
                                <div className="flex items-center gap-3 mb-6">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-lg"
                                        style={{ backgroundColor: "#a855f7" }}
                                    >
                                        L
                                    </div>
                                    <span className="font-bold text-xl text-white" style={{ 
                                        fontFamily: "'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                                        letterSpacing: '-0.03em',
                                        fontWeight: 700
                                    }}>Lumra</span>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    The easiest way to learn from AI-powered courses. Personalized learning paths for students of all levels.
                                </p>
                                
                                {/* Founders Section with Glow Effect */}
                                <div className="mb-6">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Founders</p>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="relative inline-block group">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg opacity-30 group-hover:opacity-60 blur-md transition-opacity duration-300 animate-pulse"></div>
                                            <p className="relative text-white text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-zinc-900/80 to-zinc-800/80 border border-purple-500/30 backdrop-blur-sm" style={{
                                                textShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
                                                boxShadow: '0 0 15px rgba(139, 92, 246, 0.3), inset 0 0 15px rgba(139, 92, 246, 0.1)'
                                            }}>
                                                Darsh Vekaria
                                            </p>
                                        </div>
                                        <div className="relative inline-block group">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg opacity-30 group-hover:opacity-60 blur-md transition-opacity duration-300 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                            <p className="relative text-white text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-zinc-900/80 to-zinc-800/80 border border-purple-500/30 backdrop-blur-sm" style={{
                                                textShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
                                                boxShadow: '0 0 15px rgba(139, 92, 246, 0.3), inset 0 0 15px rgba(139, 92, 246, 0.1)'
                                            }}>
                                                Siddhant Sathe
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4">
                                    {[
                                        { icon: Twitter, href: "#", label: "Twitter" },
                                        { icon: Github, href: "#", label: "GitHub" },
                                        { icon: Linkedin, href: "#", label: "LinkedIn" },
                                        { icon: Mail, href: "#", label: "Email" },
                                    ].map((social) => {
                                        const Icon = social.icon
                                        return (
                                            <a
                                                key={social.label}
                                                href={social.href}
                                                className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900/50 flex items-center justify-center text-gray-400 hover:text-purple-400 hover:border-purple-500/50 transition-all transform hover:scale-110"
                                                title={social.label}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </a>
                                        )
                                    })}
                                </div>
                            </div>

                            {[
                                {
                                    title: "Product",
                                    links: ["Features", "Pricing", "Security", "Roadmap"],
                                },
                                {
                                    title: "Company",
                                    links: ["About", "Blog", "Careers", "Contact"],
                                },
                                {
                                    title: "Legal",
                                    links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Compliance"],
                                },
                            ].map((section, idx) => (
                                <div key={idx} className="animate-fade-in" style={{ animationDelay: `${(idx + 1) * 100}ms` }}>
                                    <h3 className="font-semibold text-white mb-6 text-sm uppercase tracking-wide">{section.title}</h3>
                                    <ul className="space-y-4">
                                        {section.links.map((link) => (
                                            <li key={link}>
                                                <a 
                                                    href="#" 
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        handleFooterLinkClick(link, section.title)
                                                    }}
                                                    className="text-gray-400 hover:text-gray-200 transition-colors text-sm cursor-pointer"
                                                >
                                                    {link}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                            <p className="text-gray-500 text-xs">
                                &copy; 2025 Lumra AI. All rights reserved. | Made with care by the Lumra team
                            </p>
                            <div className="flex gap-6 text-xs">
                                <a 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handleFooterLinkClick("Terms and Conditions", "Legal")
                                    }}
                                    className="text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                                >
                                    Terms and Conditions
                                </a>
                                <a 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handleFooterLinkClick("Privacy Policy", "Legal")
                                    }}
                                    className="text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                                >
                                    Privacy Policy
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>

                {/* Info Modal */}
                {showInfoModal && (
                    <div 
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
                        onClick={() => setShowInfoModal(false)}
                    >
                        <div 
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-scale-in" 
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">{infoModalContent.title}</h2>
                                <button
                                    onClick={() => setShowInfoModal(false)}
                                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-300 leading-relaxed mb-6">{infoModalContent.message}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowInfoModal(false)}
                                    className="flex-1 px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all border border-gray-600"
                                >
                                    Close
                                </button>
                                {(infoModalContent.title === "Pricing" || infoModalContent.title === "Contact Us" || infoModalContent.title === "Careers") && (
                                    <button
                                        onClick={() => {
                                            setShowInfoModal(false)
                                            const contactSection = document.getElementById('contact')
                                            contactSection?.scrollIntoView({ behavior: 'smooth' })
                                        }}
                                        className="flex-1 px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all"
                                    >
                                        Contact Us
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
