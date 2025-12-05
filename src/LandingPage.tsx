import { useState } from "react"
import { motion } from "framer-motion"
import "./LandingPage.css"

const API_BASE_URL = import.meta.env.VITE_LUMRA_API_BASE ?? "http://localhost:5050"

type LandingPageProps = {
    onDemoKeySubmit: (key: string) => void
}

const config = {
    videoSrc: '/videos/original-281dfa9448a600955fd3e49558d471a3.mp4', // Video path in public folder
    heroHeight: 'min-h-screen',
    overlayOpacity: 0.45,
    headlineDelay: 0.2,
    cardStagger: 0.12,
    easing: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
}

const container = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.12,
        },
    },
}

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.6, ease: config.easing } 
    },
}

const floaty = {
    hidden: { opacity: 0, y: 8 },
    show: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: 0.1 * i + 0.1, ease: config.easing },
    }),
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

            {/* Hero Section with Video Background */}
            <section className={`hero-section-video ${config.heroHeight}`}>
                {/* Background video */}
                <motion.video
                    key={config.videoSrc}
                    className="hero-video"
                    src={config.videoSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-hidden="true"
                    onLoadedMetadata={(e) => {
                        try {
                            e.currentTarget.playbackRate = 0.85
                        } catch (err) {
                            // ignore if not allowed
                        }
                    }}
                />

                {/* Dim overlay for contrast */}
                <div
                    aria-hidden="true"
                    className="hero-overlay"
                    style={{ background: `rgba(10,11,13,${config.overlayOpacity})` }}
                />

                {/* Decorative floating badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="floating-badges-container"
                >
                    <FloatingBadge text="AI tutor" />
                    <FloatingBadge text="Track progress" small />
                </motion.div>

                {/* Main content container */}
                <div className="hero-content-wrapper">
                    <motion.div variants={container} initial="hidden" animate="show">
                        {/* Headline + Subhead */}
                        <motion.div variants={fadeUp} transition={{ delay: config.headlineDelay }}>
                            <div className="ai-badge">
                                <span>User-friendly AI platform</span>
                            </div>
                            <h1 className="main-headline">
                                New Era of Learning with <span className="lumra-highlight">Lumra AI</span>
                            </h1>
                            <p className="main-description">
                                AI-powered learning platform that leverages advanced AI technology to create personalized and engaging learning experiences for students and educators.
                            </p>
                        </motion.div>

                        {/* CTA + Stats row */}
                        <motion.div
                            variants={fadeUp}
                            className="cta-stats-row"
                        >
                            <motion.button
                                className="cta-button"
                                onClick={() => {
                                    const demoSection = document.querySelector('.demo-key-section')
                                    demoSection?.scrollIntoView({ behavior: 'smooth' })
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                7 Days FREE Trial
                            </motion.button>

                            <div className="social-proof">
                                <div className="user-avatars">
                                    <div className="avatar">A</div>
                                    <div className="avatar">B</div>
                                    <div className="avatar">C</div>
                                </div>
                                <span className="user-count">
                                    <strong>For teams & schools</strong>
                                    <span className="ml-3">Schedule a demo • Trusted by 500+ educators</span>
                                </span>
                            </div>
                        </motion.div>

                        {/* Feature cards (staggered) */}
                        <motion.div
                            className="feature-cards-grid"
                            variants={{ show: { transition: { staggerChildren: config.cardStagger } } }}
                        >
                            <FeatureCard 
                                title="Adaptive Learning" 
                                desc="Content that adapts to each student's pace and learning style." 
                                index={0} 
                            />
                            <FeatureCard 
                                title="Smart AI Assistant" 
                                desc="Instant feedback and personalized explanations." 
                                index={1} 
                            />
                            <FeatureCard 
                                title="Teacher Dashboard" 
                                desc="Manage classes and track student outcomes." 
                                index={2} 
                            />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Footer wave / gradient */}
                <div className="hero-gradient-bottom" />
            </section>

            {/* Content Panels Section */}
            <section className="content-panels-section">
                <motion.div 
                    className="content-panels"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Left Panel - Demo/Example */}
                    <motion.div 
                        className="left-panel"
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
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
                    </motion.div>

                    {/* Right Panel - AI Chatbot */}
                    <motion.div 
                        className="right-panel"
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
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
                            <motion.div 
                                className="lesson-card"
                                whileHover={{ y: -6, boxShadow: '0 10px 30px rgba(2,6,23,0.5)' }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="lesson-header">
                                    <span className="lesson-icon">📖</span>
                                    <h4>Your daily study plan is ready!</h4>
                                </div>
                                <div className="lesson-meta">
                                    <span className="meta-item">⏱ 20min</span>
                                    <span className="meta-item">📋 3 Tasks</span>
                                </div>
                            </motion.div>
                            
                            <motion.div 
                                className="lesson-card"
                                whileHover={{ y: -6, boxShadow: '0 10px 30px rgba(2,6,23,0.5)' }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="lesson-header">
                                    <span className="lesson-icon">✏️</span>
                                    <h4>Practice exercises available!</h4>
                                </div>
                                <div className="lesson-meta">
                                    <span className="meta-item">⏱ 15min</span>
                                    <span className="meta-item">📋 2 Tasks</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Demo Key Section */}
            <motion.section 
                className="demo-key-section"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
            >
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
                        <motion.button 
                            type="submit" 
                            className="generate-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Start Learning
                        </motion.button>
                    </div>
                    {demoKeyError && <p className="error-message">{demoKeyError}</p>}
                </form>
            </motion.section>

            {/* AI Features Section */}
            <motion.section 
                className="ai-features-section"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="section-heading">AI-Powered Features</h2>
                <div className="features-grid">
                    <motion.div 
                        className="feature-card"
                        variants={floaty}
                        custom={0}
                        whileHover={{ y: -8, boxShadow: '0 10px 30px rgba(168,85,247,0.3)' }}
                    >
                        <div className="feature-icon">🤖</div>
                        <h3>Smart AI Assistant</h3>
                        <p>Get instant answers to your questions with our advanced AI chatbot that understands context and provides detailed explanations.</p>
                    </motion.div>
                    <motion.div 
                        className="feature-card"
                        variants={floaty}
                        custom={1}
                        whileHover={{ y: -8, boxShadow: '0 10px 30px rgba(168,85,247,0.3)' }}
                    >
                        <div className="feature-icon">📚</div>
                        <h3>Personalized Learning</h3>
                        <p>AI adapts to your learning style and pace, creating customized study plans and recommendations just for you.</p>
                    </motion.div>
                    <motion.div 
                        className="feature-card"
                        variants={floaty}
                        custom={2}
                        whileHover={{ y: -8, boxShadow: '0 10px 30px rgba(168,85,247,0.3)' }}
                    >
                        <div className="feature-icon">📝</div>
                        <h3>Document Analysis</h3>
                        <p>Upload documents and get AI-powered summaries, key points extraction, and detailed explanations of complex topics.</p>
                    </motion.div>
                    <motion.div 
                        className="feature-card"
                        variants={floaty}
                        custom={3}
                        whileHover={{ y: -8, boxShadow: '0 10px 30px rgba(168,85,247,0.3)' }}
                    >
                        <div className="feature-icon">💬</div>
                        <h3>24/7 Support</h3>
                        <p>Access learning assistance anytime, anywhere. Our AI is always ready to help you understand difficult concepts.</p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Contact Section */}
            <motion.section 
                className="contact-section"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
            >
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
                    <motion.button 
                        type="submit" 
                        className="submit-btn" 
                        disabled={contactStatus === "loading"}
                        whileHover={{ scale: contactStatus === "loading" ? 1 : 1.05 }}
                        whileTap={{ scale: contactStatus === "loading" ? 1 : 0.98 }}
                    >
                        {contactStatus === "loading" ? "Sending..." : contactStatus === "success" ? "Sent!" : "Send Message"}
                    </motion.button>
                    {contactStatus === "error" && (
                        <p className="error-message">Failed to send message. Please try again.</p>
                    )}
                </form>
            </motion.section>

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
                    <p>&copy; 2024 Lumra AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

function FloatingBadge({ text = 'Badge', small = false }: { text?: string; small?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`floating-badge ${small ? 'badge-small' : ''}`}
        >
            {text}
        </motion.div>
    )
}

function FeatureCard({ title, desc, index = 0 }: { title: string; desc: string; index?: number }) {
    return (
        <motion.div
            variants={floaty}
            custom={index}
            className="feature-card-hero"
            whileHover={{ y: -6, boxShadow: '0 10px 30px rgba(2,6,23,0.5)' }}
        >
            <h3 className="feature-card-title">{title}</h3>
            <p className="feature-card-desc">{desc}</p>
            <div className="feature-card-link">
                <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="learn-more-link"
                >
                    Learn more
                </a>
            </div>
        </motion.div>
    )
}
