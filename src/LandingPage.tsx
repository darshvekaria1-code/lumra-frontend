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
                        <a href="#pricing">Pricing</a>
                        <a href="#blog">Blog</a>
                        <a href="#about">About Us</a>
                        <a href="#contact">Contact</a>
                    </nav>
                    <button className="free-trial-btn" onClick={() => {
                        const demoSection = document.querySelector('.demo-key-section')
                        demoSection?.scrollIntoView({ behavior: 'smooth' })
                    }}>Free Trial</button>
                </div>
            </header>

            {/* Main Content */}
            <div className="main-content">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="ai-badge">
                        <span>User-friendly AI platform</span>
                    </div>
                    
                    <h1 className="main-headline">
                        New Era of Learning with AI ChatBot
                    </h1>
                    
                    <p className="main-description">
                        AI-powered learning platform that leverages advanced AI technology to create personalized and engaging learning experiences for students and educators.
                    </p>

                    <button 
                        className="cta-button"
                        onClick={() => {
                            const demoSection = document.querySelector('.demo-key-section')
                            demoSection?.scrollIntoView({ behavior: 'smooth' })
                        }}
                    >
                        7 Days FREE Trial
                    </button>

                    <div className="social-proof">
                        <div className="user-avatars">
                            <div className="avatar">A</div>
                            <div className="avatar">B</div>
                            <div className="avatar">C</div>
                        </div>
                        <span className="user-count">500+ Active Users</span>
                    </div>
                </section>

                {/* Content Panels */}
                <section className="content-panels">
                    {/* Left Panel - Demo/Example */}
                    <div className="left-panel">
                        <div className="demo-card">
                            <div className="demo-card-header">
                                <div className="demo-tag">AI Personalized</div>
                                <div className="play-icon">▶</div>
                            </div>
                            <div className="demo-content">
                                <h3 className="demo-title">Interactive Learning Example</h3>
                                <p className="demo-description">
                                    Experience how Lumra AI transforms complex topics into easy-to-understand explanations with interactive examples and real-time assistance.
                                </p>
                                <div className="demo-features">
                                    <div className="feature-tag">📚 Study Plans</div>
                                    <div className="feature-tag">💬 Q&A Support</div>
                                    <div className="feature-tag">📝 Document Analysis</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - AI Chatbot */}
                    <div className="right-panel">
                        <div className="ai-chatbot-section">
                            <h3 className="section-title">AI chatbot</h3>
                            <div className="progress-container">
                                <div className="progress-bar">
                                    <div className="progress-fill"></div>
                                </div>
                                <span className="progress-text">+50% of learning completed</span>
                            </div>
                            
                            <div className="chat-examples">
                                <div className="chat-message user">
                                    <span className="quote-mark">"</span>
                                    <span className="message-text">help me understand this task</span>
                                </div>
                                <div className="chat-message ai">
                                    <span className="message-text">I'll break down this task into simple steps for you. Let's start by identifying the key concepts...</span>
                                    <span className="flag-icon">🇺🇸</span>
                                </div>
                            </div>
                        </div>

                        <div className="personalized-lessons">
                            <div className="lesson-card">
                                <div className="lesson-header">
                                    <span className="lesson-icon">📖</span>
                                    <h4>Your daily study plan is ready!</h4>
                                </div>
                                <div className="lesson-meta">
                                    <span className="meta-item">⏱ 20min</span>
                                    <span className="meta-item">📋 3 Tasks</span>
                                </div>
                            </div>
                            
                            <div className="lesson-card">
                                <div className="lesson-header">
                                    <span className="lesson-icon">✏️</span>
                                    <h4>Practice exercises available!</h4>
                                </div>
                                <div className="lesson-meta">
                                    <span className="meta-item">⏱ 15min</span>
                                    <span className="meta-item">📋 2 Tasks</span>
                                </div>
                            </div>
                        </div>

                        <div className="new-content-section">
                            <h4 className="section-subtitle">New Content for You</h4>
                            <div className="content-placeholders">
                                <div className="content-box"></div>
                                <div className="content-box"></div>
                                <div className="content-box"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Demo Key Section */}
                <section className="demo-key-section">
                    <h2 className="section-heading">Get Started with Your Demo Key</h2>
                    <form onSubmit={handleDemoKeySubmit} className="demo-key-form">
                        <div className="input-wrapper">
                            <input
                                type="text"
                                value={demoKey}
                                onChange={(e) => {
                                    setDemoKey(e.target.value)
                                    setDemoKeyError("")
                                }}
                                placeholder="Enter your demo key"
                                className="demo-key-input"
                            />
                            <button type="submit" className="generate-btn">
                                Start Learning
                            </button>
                        </div>
                        {demoKeyError && <p className="error-message">{demoKeyError}</p>}
                    </form>
                </section>

                {/* AI Features Section */}
                <section className="ai-features-section">
                    <h2 className="section-heading">AI-Powered Features</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🤖</div>
                            <h3>Smart AI Assistant</h3>
                            <p>Get instant answers to your questions with our advanced AI chatbot that understands context and provides detailed explanations.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📚</div>
                            <h3>Personalized Learning</h3>
                            <p>AI adapts to your learning style and pace, creating customized study plans and recommendations just for you.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📝</div>
                            <h3>Document Analysis</h3>
                            <p>Upload documents and get AI-powered summaries, key points extraction, and detailed explanations of complex topics.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💬</div>
                            <h3>24/7 Support</h3>
                            <p>Access learning assistance anytime, anywhere. Our AI is always ready to help you understand difficult concepts.</p>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="contact-section">
                    <h2 className="section-heading">Contact Us</h2>
                    <p className="section-description">Have questions? We'd love to hear from you!</p>
                    <form onSubmit={handleContactSubmit} className="contact-form">
                        <div className="form-group">
                            <input
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="Your email"
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <textarea
                                value={contactMessage}
                                onChange={(e) => setContactMessage(e.target.value)}
                                placeholder="Your message or question"
                                className="form-textarea"
                                rows={5}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-btn" disabled={contactStatus === "loading"}>
                            {contactStatus === "loading" ? "Sending..." : contactStatus === "success" ? "Sent!" : "Send Message"}
                        </button>
                        {contactStatus === "error" && (
                            <p className="error-message">Failed to send message. Please try again.</p>
                        )}
                    </form>
                </section>
            </div>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-column">
                        <h4>Company</h4>
                        <a href="#about">About Us</a>
                        <a href="#team">Our Team</a>
                        <a href="#careers">Careers</a>
                    </div>
                    <div className="footer-column">
                        <h4>Resources</h4>
                        <a href="#blog">Blog</a>
                        <a href="#docs">Documentation</a>
                        <a href="#support">Support</a>
                    </div>
                    <div className="footer-column">
                        <h4>Legal</h4>
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                        <a href="#legal">Legal</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 Lumra. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
