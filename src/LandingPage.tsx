import { useState } from "react"
import "./LandingPage.css"

const API_BASE_URL = import.meta.env.VITE_LUMRA_API_BASE ?? "http://localhost:5050"

type LandingPageProps = {
    onDemoKeySubmit: (key: string) => void
}

export default function LandingPage({ onDemoKeySubmit }: LandingPageProps) {
    const [demoKey, setDemoKey] = useState("")
    const [demoKeyError, setDemoKeyError] = useState("")
    const [contactEmail, setContactEmail] = useState("")
    const [contactMessage, setContactMessage] = useState("")
    const [contactStatus, setContactStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

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
        <div className="landing-page">
            {/* Left Vertical Accent Bar */}
            <div className="left-accent-bar"></div>

            {/* Header Section */}
            <header className="landing-header">
                <div className="header-top">
                    <div className="header-testimonials">
                        <span>David Lee, Independent Developer</span>
                        <span>Jessica Ramirez, Senior Developer</span>
                    </div>
                </div>
                <div className="header-nav">
                    <div className="logo">
                        <div className="logo-icon">✧</div>
                        <span className="logo-text">LUMRA</span>
                    </div>
                    <nav className="nav-links">
                        <a href="#products">Products</a>
                        <a href="#company">Company</a>
                        <a href="#research">Research</a>
                        <a href="#api">API</a>
                    </nav>
                    <button className="try-beta-btn">Try Beta Version</button>
                </div>
            </header>

            {/* Main Content */}
            <div className="main-content">
                {/* Top Section */}
                <section className="top-section">
                    <div className="ai-badge">
                        <span className="badge-icon">✧</span>
                        <span>Powered by AI Technology</span>
                    </div>
                    
                    <h1 className="main-headline">
                        <span className="headline-main">Smarter Learning</span>
                        <span className="headline-sub">Start with Lumra AI</span>
                    </h1>
                    
                    <p className="main-description">
                        Unlock smarter, faster, and more efficient learning with Lumra AI's advanced AI technology.
                    </p>

                    {/* Main Input Field */}
                    <form onSubmit={handleDemoKeySubmit} className="main-input-form">
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
                                className="main-input"
                            />
                            <button type="submit" className="generate-btn">
                                Generate Now
                            </button>
                        </div>
                        {demoKeyError && <p className="error-message">{demoKeyError}</p>}
                    </form>

                    {/* Quick Action Buttons */}
                    <div className="quick-actions">
                        <button className="action-btn">
                            <span className="action-icon">▼</span>
                            <span>Make a meal plan</span>
                        </button>
                        <button className="action-btn">
                            <span className="action-icon"></span>
                            <span>Fix my code</span>
                        </button>
                        <button className="action-btn">
                            <span className="action-icon">💪</span>
                            <span>Create a workout plan</span>
                        </button>
                        <button className="action-btn">
                            <span className="action-icon">💡</span>
                            <span>More Ideas</span>
                        </button>
                    </div>
                </section>

                {/* Embedded Chat Interface Panel */}
                <section className="chat-panel-section">
                    <div className="chat-panel">
                        {/* Panel Header */}
                        <div className="chat-panel-header">
                            <div className="chat-header-left">
                                <span className="chat-icon">📄</span>
                                <span className="chat-icon">✏️</span>
                            </div>
                            <div className="chat-header-center">
                                <div className="chat-logo">
                                    <div className="logo-icon">✧</div>
                                    <span>Lumra</span>
                                    <span className="dropdown-arrow">▼</span>
                                </div>
                            </div>
                            <div className="chat-header-right">
                                <span className="chat-icon">⊞</span>
                                <span className="chat-icon">👤</span>
                            </div>
                        </div>

                        {/* Chat Content Area */}
                        <div className="chat-content-area">
                            <div className="chat-welcome-center">
                                <div className="welcome-icon-large">✧</div>
                                <p className="welcome-text">Welcome Back,</p>
                                <p className="welcome-text">How Can I Help You?</p>
                            </div>

                            {/* Suggested Prompts Grid */}
                            <div className="chat-suggestions-grid">
                                {[...Array(6)].map((_, index) => (
                                    <button key={index} className="chat-suggestion-btn">
                                        <span className="suggestion-icon">▼</span>
                                        <span>Make a meal plan</span>
                                    </button>
                                ))}
                            </div>

                            {/* Chat Input Field */}
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

            {/* Footer Section */}
            <footer className="landing-footer">
                <p className="footer-text">Used by 1,000+ people from renowned companies</p>
                <div className="company-logos">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="company-logo">
                            <div className="logo-placeholder">Logo</div>
                        </div>
                    ))}
                </div>
            </footer>
        </div>
    )
}
