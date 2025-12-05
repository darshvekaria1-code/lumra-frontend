import { useState, useEffect, useRef } from "react"
import { 
  ArrowRight, Zap, BookOpen, Brain, Target, Rocket, Code2, 
  MessageCircle, Send, Loader, Mail, Github, Linkedin, Twitter 
} from "lucide-react"
import "./LandingPage.css"

const API_BASE_URL = import.meta.env.VITE_LUMRA_API_BASE ?? "http://localhost:5050"

type LandingPageProps = {
    onDemoKeySubmit: (key: string) => void
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

// Left Bar Component
function LeftBar() {
    return (
        <div className="w-[60px] bg-zinc-950 border-r border-zinc-800 flex flex-col items-center pt-8 sticky left-0 top-0 h-screen">
            <div className="w-2 h-40 rounded-full bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700 opacity-40 animate-pulse shadow-lg" />
            <div className="flex flex-col gap-8 mt-12">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="w-1 h-1 rounded-full bg-gray-700/50 hover:bg-gray-500 transition-colors cursor-pointer"
                        style={{ animation: `float 3s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}
                    />
                ))}
            </div>
        </div>
    )
}

// Laptop Demo Component
function LaptopDemoSection() {
    const [showChat, setShowChat] = useState(false)
    const [chatMessages, setChatMessages] = useState([
        {
            type: "ai" as const,
            text: "Hi! I'm Lumra AI, your personalized learning assistant. What would you like to learn today?",
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

    return (
        <section className="relative py-24 px-6 overflow-hidden z-10">
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
                                            <span className="text-gray-400 text-xs">Lumra AI Assistant</span>
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
                            Lumra AI is more than just a chatbot. It's your dedicated learning partner that understands your goals,
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
                setContactStatus("error")
            }
        } catch (error) {
            console.error("Error submitting contact form:", error)
            setContactStatus("error")
        }
    }

    return (
        <div className="flex min-h-screen bg-zinc-950 relative">
            <RollingBackground />
            <LeftBar />

            {/* Main Content - Scrollable */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                {/* Header */}
                <header className="border-b border-zinc-800/50 backdrop-blur-md bg-zinc-950/80 sticky top-0 z-50">
                    <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-lg bg-gradient-to-br from-gray-600 to-gray-800">
                                L
                            </div>
                            <span className="font-bold text-xl text-white group-hover:text-gray-300 transition-colors">Lumra AI</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            {["Features", "Pricing", "Resources", "Community"].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className="text-gray-400 hover:text-gray-200 transition-colors duration-300 relative group text-sm"
                                >
                                    {item}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-500 group-hover:w-full transition-all duration-300" />
                                </a>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            <button 
                                className="text-gray-400 hover:text-gray-200 transition-colors text-sm"
                                onClick={() => {
                                    const demoSection = document.querySelector('.demo-section')
                                    demoSection?.scrollIntoView({ behavior: 'smooth' })
                                }}
                            >
                                Sign In
                            </button>
                            <button 
                                className="px-6 py-2 rounded-full font-medium text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 active:scale-95 border border-gray-600"
                                onClick={() => {
                                    const demoSection = document.querySelector('.demo-section')
                                    demoSection?.scrollIntoView({ behavior: 'smooth' })
                                }}
                            >
                                Try A Demo
                            </button>
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
                                {["Features", "Pricing", "Resources", "Community"].map((item) => (
                                    <a
                                        key={item}
                                        href={`#${item.toLowerCase()}`}
                                        className="block text-gray-400 hover:text-gray-300 transition-colors"
                                    >
                                        {item}
                                    </a>
                                ))}
                                <button className="w-full px-6 py-2 rounded-full font-medium text-white bg-gradient-to-r from-gray-700 to-gray-800 transition-all border border-gray-600">
                                    Try A Demo
                                </button>
                            </div>
                        </div>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {/* Background for entire main content - seamless across all sections */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black pointer-events-none z-0" />
                    
                    {/* Welcome Section */}
                    <section className="relative py-32 px-6 overflow-hidden min-h-screen flex items-center justify-center z-10">

                        <div className="relative max-w-5xl mx-auto text-center">
                            <div className="mb-12 animate-fade-in">
                                <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full border border-gray-700 bg-gray-900/40 backdrop-blur">
                                    <Zap className="w-4 h-4 text-cyan-400" />
                                    <span className="text-sm tracking-widest text-gray-400 uppercase">Powered by AI</span>
                                    <Zap className="w-4 h-4 text-cyan-400" />
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
                                    <button className="px-10 py-3.5 border-2 border-gray-600 text-white font-bold rounded-full text-lg hover:border-white hover:bg-white/5 transition-all duration-300">
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
                    </section>

                    {/* Demo Key Section */}
                    <section className="demo-section py-32 px-6 relative overflow-hidden z-10">
                        <div className="relative max-w-5xl mx-auto text-center">
                            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">Get Started with Your Demo Key</h2>
                            <p className="text-gray-400 mb-12 text-lg max-w-2xl mx-auto">
                                Enter your demo key to access Lumra AI and start your personalized learning journey.
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
                    </section>

                    {/* Laptop Demo Section */}
                    <LaptopDemoSection />

                    {/* Features Section */}
                    <section className="py-32 px-6 relative overflow-hidden z-10">

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
                    </section>

                    {/* Curriculum Section */}
                    <section className="relative py-40 px-6 overflow-hidden" data-section="curriculum">
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
                    </section>

                    {/* Chat Section */}
                    <section className="py-32 px-6 relative overflow-hidden z-10">

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
                                    <div className="flex justify-start animate-fade-in">
                                        <div className="max-w-xs sm:max-w-md px-5 py-4 rounded-lg bg-zinc-800/60 text-gray-100 rounded-bl-none border border-zinc-700">
                                            <p className="text-sm leading-relaxed">
                                                Hello! I'm Lumra AI, your personalized learning assistant. What would you like to learn today?
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-zinc-800 p-6 bg-zinc-950/80 backdrop-blur-md">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="Ask me anything about learning or skills..."
                                            className="flex-1 bg-zinc-900/60 border border-zinc-700 text-white rounded-lg px-5 py-3 placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:bg-zinc-900 transition-all text-sm"
                                        />
                                        <button className="px-5 py-3 rounded-lg font-medium text-white transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border border-gray-600">
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Newsletter/Contact Section */}
                    <section className="py-32 px-6 relative overflow-hidden z-10">

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

                                    <form onSubmit={(e) => { e.preventDefault(); setNewsletterEmail("") }} className="flex flex-col sm:flex-row gap-3 mb-8">
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            value={newsletterEmail}
                                            onChange={(e) => setNewsletterEmail(e.target.value)}
                                            className="flex-1 px-6 py-4 rounded-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-gray-500 focus:outline-none focus:border-zinc-700 focus:bg-zinc-900 transition-all text-sm"
                                        />
                                        <button className="px-8 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 active:scale-95 border border-gray-600 flex items-center justify-center gap-2 whitespace-nowrap">
                                            <span>Subscribe</span>
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
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
                    </section>
                </main>

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
                                    <span className="font-bold text-xl text-white">Lumra AI</span>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    The easiest way to learn from AI-powered courses. Personalized learning paths for students of all levels.
                                </p>
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
                                                <a href="#" className="text-gray-400 hover:text-gray-200 transition-colors text-sm">
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
                                <a href="#" className="text-gray-400 hover:text-gray-200 transition-colors">
                                    Terms and Conditions
                                </a>
                                <a href="#" className="text-gray-400 hover:text-gray-200 transition-colors">
                                    Privacy Policy
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}
