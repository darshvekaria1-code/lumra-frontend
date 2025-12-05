import { useState } from "react"
import "./LandingPage.css"

const API_BASE_URL = import.meta.env.VITE_LUMRA_API_BASE ?? "http://localhost:5050"

type LandingPageProps = {
    onDemoKeySubmit: (key: string) => void
}

export default function LandingPage({ onDemoKeySubmit }: LandingPageProps) {
    const [contactEmail, setContactEmail] = useState("")
    const [contactMessage, setContactMessage] = useState("")
    const [contactStatus, setContactStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [demoKey, setDemoKey] = useState("")
    const [demoKeyError, setDemoKeyError] = useState("")
    const [expandedFaq, setExpandedFaq] = useState<number | null>(0)

    const testimonials = [
        { quote: "Highly recommend to anyone who codes!", author: "David Lee", role: "Independent Developer" },
        { quote: "Boosts our team's daily workflow.", author: "Jessica Ramirez", role: "Senior Developer" },
        { quote: "Helps us find the best solutions every time.", author: "Michael Carter", role: "CTO at InnovateTech" }
    ]

    const quickActions = [
        { label: "Make a meal plan", icon: "▼" },
        { label: "Fix my code", icon: "</>" },
        { label: "Create a workout plan", icon: "💪" },
        { label: "More Ideas", icon: "💡" }
    ]

    const faqs = [
        {
            question: "What is Lumra AI?",
            answer: "Lumra AI is an AI-powered learning platform designed to assist with education, coding, text simplification, and real-time collaboration. Get personalized assistance and instant answers for all your learning needs."
        },
        {
            question: "How does Lumra AI help with learning?",
            answer: "Lumra AI provides personalized study plans, interactive Q&A sessions, document analysis, and 24/7 learning support. Our AI adapts to your learning style and helps you understand complex topics faster."
        },
        {
            question: "How do I access Lumra AI?",
            answer: "You need a demo key to access the platform. Enter your demo key on this page, and you'll be redirected to the sign-in page where you can create an account and start learning."
        },
        {
            question: "Is Lumra AI suitable for beginners?",
            answer: "Absolutely! Lumra AI is designed for learners of all levels. Whether you're a beginner or advanced, our AI adapts to your needs and provides explanations at the right level for you."
        },
        {
            question: "What platforms does Lumra AI support?",
            answer: "Lumra AI is a web-based platform accessible from any device with a modern browser. You can use it on desktop, tablet, or mobile devices."
        }
    ]

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

    return (
        <div className="landing-page">
            {/* Left Purple Bar */}
            <div className="left-accent-bar"></div>

            {/* Header */}
            <header className="landing-header">
                <div className="header-content">
                    <div className="logo">
                        <div className="logo-icon-animated">✧</div>
                        <span className="logo-text">LUMRA</span>
                    </div>
                    <nav className="header-nav">
                        <a href="#products">Products</a>
                        <a href="#company">Company</a>
                        <a href="#research">Research</a>
                        <a href="#api">API</a>
                    </nav>
                    <button className="try-beta-btn">Try Beta Version</button>
                </div>
            </header>

            {/* Testimonials Bar */}
            <div className="testimonials-bar">
                <div className="testimonial-item">
                    <span className="testimonial-text">"{testimonials[0].quote}"</span>
                    <span className="testimonial-author">- {testimonials[0].author}, {testimonials[0].role}</span>
                </div>
                <div className="testimonial-item">
                    <span className="testimonial-text">"{testimonials[1].quote}"</span>
                    <span className="testimonial-author">- {testimonials[1].author}, {testimonials[1].role}</span>
                </div>
                <div className="testimonial-item">
                    <span className="testimonial-text">"{testimonials[2].quote}"</span>
                    <span className="testimonial-author">- {testimonials[2].author}, {testimonials[2].role}</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Top Section - Landing */}
                <section className="landing-top-section">
                    <div className="ai-badge">
                        <span className="badge-icon">✧</span>
                        <span>Powered by AI Technology</span>
                    </div>
                    
                    <h1 className="main-headline">
                        <span className="headline-main">Smarter Learning</span>
                        <span className="headline-sub">Starts with Lumra</span>
                    </h1>
                    
                    <p className="main-description">
                        Unlock smarter, faster, and more efficient learning with Lumra AI's advanced technology.
                    </p>

                    {/* Demo Key Input */}
                    <form onSubmit={handleDemoKeySubmit} className="demo-key-form">
                        <div className="input-wrapper">
                            <span className="input-icon">🔗</span>
                            <input
                                type="text"
                                value={demoKey}
                                onChange={(e) => {
                                    setDemoKey(e.target.value)
                                    setDemoKeyError("")
                                }}
                                placeholder="Type any message you'd like..."
                                className="demo-key-input"
                            />
                            <button type="submit" className="generate-btn">
                                Generate Now
                            </button>
                        </div>
                        {demoKeyError && <p className="error-message">{demoKeyError}</p>}
                    </form>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        {quickActions.map((action, index) => (
                            <button key={index} className="action-btn">
                                <span className="action-icon">{action.icon}</span>
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Bottom Section - Chat Interface */}
                <section className="chat-interface-section">
                    <div className="chat-panel">
                        <div className="chat-panel-header">
                            <div className="chat-header-left">
                                <span className="chat-icon">📄</span>
                                <span className="chat-icon">✏️</span>
                            </div>
                            <div className="chat-header-center">
                                <div className="chat-logo">
                                    <div className="logo-icon-animated">✧</div>
                                    <span>Lumra</span>
                                    <span className="dropdown-arrow">▼</span>
                                </div>
                            </div>
                            <div className="chat-header-right">
                                <span className="chat-icon">⊞</span>
                                <span className="chat-icon">👤</span>
                            </div>
                        </div>
                        
                        <div className="chat-content-area">
                            <div className="chat-welcome-center">
                                <div className="welcome-icon-large">✧</div>
                                <p className="welcome-text">Welcome Back,</p>
                                <p className="welcome-text">How Can I Help You?</p>
                            </div>
                            
                            <div className="chat-suggestions-grid">
                                {[...Array(6)].map((_, index) => (
                                    <button key={index} className="chat-suggestion-btn">
                                        <span className="suggestion-icon">▼</span>
                                        <span>Make a meal plan</span>
                                    </button>
                                ))}
                            </div>
                            
                            <div className="chat-input-area">
                                <span className="input-icon">🔗</span>
                                <input
                                    type="text"
                                    placeholder="Type any message you'd like"
                                    className="chat-input"
                                    readOnly
                                />
                                <button className="chat-generate-btn">Generate Now</button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Endorsements */}
            <div className="endorsements">
                <p className="endorsements-text">Used by 1,000+ people from renowned companies</p>
                <div className="company-logos">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="company-logo">
                            <div className="logo-placeholder">Logo</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-column">
                        <h4>Company</h4>
                        <a href="#about">About Us</a>
                        <a href="#team">Our Team</a>
                    </div>
                    <div className="footer-column">
                        <h4>Our Solutions</h4>
                        <a href="#ai-assistance">AI-Powered Learning</a>
                        <a href="#optimization">Study Optimization</a>
                        <a href="#text-generation">Text Generation</a>
                        <a href="#templates">Customizable Templates</a>
                    </div>
                    <div className="footer-column">
                        <h4>Resources</h4>
                        <a href="#blog">Blog</a>
                        <a href="#case-studies">Case Studies</a>
                        <a href="#whitepapers">Whitepapers</a>
                        <a href="#ebooks">eBooks</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <a href="#privacy">Privacy Policy</a>
                    <a href="#legal">Legal</a>
                    <a href="#terms">Term of Services</a>
                </div>
            </footer>
        </div>
    )
}
