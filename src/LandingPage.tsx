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

    const features = [
        "AI-Powered Learning Assistant",
        "Personalized Study Plans",
        "Interactive Q&A Sessions",
        "Document Analysis & Summarization",
        "Multi-Language Support",
        "24/7 Learning Support"
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
                // Store demo key in localStorage
                localStorage.setItem("lumra_demo_key", demoKey.trim())
                // Redirect to sign in
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
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">Welcome to Lumra AI</h1>
                    <p className="hero-subtitle">
                        Your intelligent learning platform powered by advanced AI technology
                    </p>
                    <p className="hero-description">
                        Lumra AI is designed to revolutionize the way you learn. Get personalized assistance, 
                        instant answers, and comprehensive support for all your educational needs.
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <h2 className="section-title">Platform Features</h2>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">✨</div>
                            <h3>{feature}</h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* Demo Key Section */}
            <section className="demo-section">
                <h2 className="section-title">Access Demo</h2>
                <p className="section-description">
                    Enter your demo key to access the platform
                </p>
                <form onSubmit={handleDemoKeySubmit} className="demo-form">
                    <input
                        type="text"
                        value={demoKey}
                        onChange={(e) => {
                            setDemoKey(e.target.value)
                            setDemoKeyError("")
                        }}
                        placeholder="Enter your demo key"
                        className="demo-input"
                    />
                    {demoKeyError && <p className="error-message">{demoKeyError}</p>}
                    <button type="submit" className="demo-button">
                        Access Platform
                    </button>
                </form>
            </section>

            {/* Contact Section */}
            <section className="contact-section">
                <h2 className="section-title">Contact Us</h2>
                <p className="section-description">
                    Have questions or need more information? Get in touch with us!
                </p>
                <form onSubmit={handleContactSubmit} className="contact-form">
                    <div className="form-group">
                        <label htmlFor="email">Your Email *</label>
                        <input
                            type="email"
                            id="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="message">Your Question or Message *</label>
                        <textarea
                            id="message"
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            placeholder="Tell us how we can help you..."
                            rows={5}
                            required
                            className="form-textarea"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="contact-button"
                        disabled={contactStatus === "loading"}
                    >
                        {contactStatus === "loading" ? "Sending..." : 
                         contactStatus === "success" ? "Message Sent! ✓" : 
                         "Send Message"}
                    </button>
                    {contactStatus === "error" && (
                        <p className="error-message">Failed to send message. Please try again.</p>
                    )}
                </form>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>&copy; 2025 Lumra AI. All rights reserved.</p>
            </footer>
        </div>
    )
}

