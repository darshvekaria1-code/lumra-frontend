import { useState, useRef, useEffect } from "react"
import "./LandingPage.css"

const API_BASE_URL = import.meta.env.VITE_LUMRA_API_BASE ?? "http://localhost:5050"

// Logo Component
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
            
            <div className="relative">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    Lumra
                </span>
            </div>
        </div>
    )
}

interface LandingPageProps {
    onDemoKeySubmit: (key: string) => void
}

export default function LandingPage({ onDemoKeySubmit }: LandingPageProps) {
    const [demoKey, setDemoKey] = useState("")
    const [demoKeyError, setDemoKeyError] = useState("")
    const [isValidatingDemoKey, setIsValidatingDemoKey] = useState(false)
    
    // Contact form states
    const [contactEmail, setContactEmail] = useState("")
    const [contactMessage, setContactMessage] = useState("")
    const [isSubmittingContact, setIsSubmittingContact] = useState(false)
    const [contactSuccess, setContactSuccess] = useState(false)
    const [contactError, setContactError] = useState("")
    
    const [showDemoModal, setShowDemoModal] = useState(false)
    const [activeTab, setActiveTab] = useState<"request" | "validate">("request")
    
    const chatMessagesEndRef = useRef<HTMLDivElement>(null)
    const [chatMessages, setChatMessages] = useState<Array<{role: "user" | "assistant", content: string}>>([])
    const [chatInput, setChatInput] = useState("")
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [hasAutoConversationStarted, setHasAutoConversationStarted] = useState(false)

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatMessagesEndRef.current) {
            chatMessagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [chatMessages])

    // Handle demo key validation
    const handleDemoKeySubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setDemoKeyError("")
        setIsValidatingDemoKey(true)

        try {
            const response = await fetch(`${API_BASE_URL}/api/demo/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: demoKey.trim() }),
            })

            const data = await response.json()

            if (data.valid) {
                onDemoKeySubmit(demoKey.trim())
            } else {
                setDemoKeyError(data.error || "Invalid demo key")
            }
        } catch (error) {
            setDemoKeyError("Failed to validate demo key. Please try again.")
        } finally {
            setIsValidatingDemoKey(false)
        }
    }

    // Handle contact form submission
    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setContactError("")
        setContactSuccess(false)
        setIsSubmittingContact(true)

        try {
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: contactEmail.trim(),
                    message: contactMessage.trim()
                }),
            })

            const data = await response.json()

            if (data.success) {
                setContactSuccess(true)
                setContactEmail("")
                setContactMessage("")
                // Clear success message after 5 seconds
                setTimeout(() => setContactSuccess(false), 5000)
            } else {
                setContactError(data.error || "Failed to send message. Please try again.")
            }
        } catch (error) {
            console.error("Contact form error:", error)
            setContactError("Failed to send message. Please check your connection and try again.")
        } finally {
            setIsSubmittingContact(false)
        }
    }

    // Handle chat submission
    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!chatInput.trim() || isChatLoading) return

        const userMessage = chatInput.trim()
        setChatInput("")
        setChatMessages(prev => [...prev, { role: "user", content: userMessage }])
        setIsChatLoading(true)

        try {
            const response = await fetch(`${API_BASE_URL}/api/chatgpt`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            })

            const data = await response.json()
            
            if (data.response) {
                setChatMessages(prev => [...prev, { role: "assistant", content: data.response }])
            } else {
                setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process your request. Please try again." }])
            }
        } catch (error) {
            setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, there was an error. Please try again." }])
        } finally {
            setIsChatLoading(false)
        }
    }

    // Auto-conversation when AI Assistant section is visible
    useEffect(() => {
        if (hasAutoConversationStarted) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAutoConversationStarted) {
                        setHasAutoConversationStarted(true)
                        const welcomeMessage = "Hello! I'm Lumra AI, your personalized learning assistant. What would you like to learn today?"
                        setChatMessages([{ role: "assistant", content: welcomeMessage }])
                    }
                })
            },
            { threshold: 0.3 }
        )

        const aiSection = document.getElementById("ai-assistant-section")
        if (aiSection) {
            observer.observe(aiSection)
        }

        return () => {
            if (aiSection) {
                observer.unobserve(aiSection)
            }
        }
    }, [hasAutoConversationStarted])

    return (
        <div className="landing-page-container">
            <nav className="landing-nav">
                <Logo />
                <button 
                    onClick={() => setShowDemoModal(true)}
                    className="get-started-btn"
                >
                    Get Started
                </button>
            </nav>

            <main id="landing-main-content">
                {/* Hero Section */}
                <section className="hero-section">
                    <h1 className="hero-title">Learn with Lumra</h1>
                    <p className="hero-subtitle">Your personalized AI learning assistant</p>
                    <button 
                        onClick={() => {
                            setShowDemoModal(true)
                            setActiveTab("request")
                        }}
                        className="cta-button"
                    >
                        Get Started
                    </button>
                </section>

                {/* AI Assistant Section */}
                <section id="ai-assistant-section" className="ai-assistant-section">
                    <h2>AI Learning Assistant</h2>
                    <div className="chat-container">
                        <div className="chat-messages">
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`chat-message ${msg.role}`}>
                                    <p>{msg.content}</p>
                                </div>
                            ))}
                            {isChatLoading && (
                                <div className="chat-message assistant">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatMessagesEndRef} />
                        </div>
                        <form onSubmit={handleChatSubmit} className="chat-input-form">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask me anything..."
                                disabled={isChatLoading}
                            />
                            <button type="submit" disabled={isChatLoading || !chatInput.trim()}>
                                Send
                            </button>
                        </form>
                    </div>
                </section>

                {/* Get in Touch Section */}
                <section className="contact-section">
                    <h2>Get in Touch</h2>
                    <form onSubmit={handleContactSubmit} className="contact-form">
                        <div className="form-group">
                            <label htmlFor="contact-email">Email</label>
                            <input
                                id="contact-email"
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="your.email@example.com"
                                required
                                disabled={isSubmittingContact}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="contact-message">Message</label>
                            <textarea
                                id="contact-message"
                                value={contactMessage}
                                onChange={(e) => setContactMessage(e.target.value)}
                                placeholder="Your message here..."
                                rows={5}
                                required
                                disabled={isSubmittingContact}
                            />
                        </div>
                        {contactError && (
                            <div className="error-message">{contactError}</div>
                        )}
                        {contactSuccess && (
                            <div className="success-message">
                                Thank you for your message! We'll get back to you soon.
                            </div>
                        )}
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={isSubmittingContact}
                        >
                            {isSubmittingContact ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                </section>

                {/* Footer */}
                <footer className="landing-footer">
                    <div className="footer-content">
                        <div className="footer-founders">
                            <p className="founder-name">Founder Darsh Vekaria</p>
                            <p className="founder-name">Founder Siddhant Sathe</p>
                        </div>
                        <div className="footer-badge">
                            <span>POWERED BY LUMRA AI</span>
                        </div>
                    </div>
                </footer>
            </main>

            {/* Demo Modal */}
            {showDemoModal && (
                <div className="modal-overlay" onClick={() => setShowDemoModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowDemoModal(false)}>×</button>
                        <div className="modal-tabs">
                            <button 
                                className={activeTab === "request" ? "active" : ""}
                                onClick={() => setActiveTab("request")}
                            >
                                Request Key
                            </button>
                            <button 
                                className={activeTab === "validate" ? "active" : ""}
                                onClick={() => setActiveTab("validate")}
                            >
                                Validate Key
                            </button>
                        </div>
                        {activeTab === "request" ? (
                            <div className="modal-body">
                                <h3>Request Demo Key</h3>
                                <p>Fill out the form to request a demo key.</p>
                                {/* Request key form would go here */}
                            </div>
                        ) : (
                            <div className="modal-body">
                                <h3>Validate Demo Key</h3>
                                <form onSubmit={handleDemoKeySubmit}>
                                    <input
                                        type="text"
                                        value={demoKey}
                                        onChange={(e) => setDemoKey(e.target.value)}
                                        placeholder="Enter demo key"
                                        required
                                        disabled={isValidatingDemoKey}
                                    />
                                    {demoKeyError && <div className="error-message">{demoKeyError}</div>}
                                    <button type="submit" disabled={isValidatingDemoKey}>
                                        {isValidatingDemoKey ? "Validating..." : "Validate"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

