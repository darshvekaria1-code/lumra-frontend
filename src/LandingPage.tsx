import { useState } from "react"
import { motion } from "framer-motion"
import "./LandingPage.css"

const API_BASE_URL = import.meta.env.VITE_LUMRA_API_BASE ?? "http://localhost:5050"

type LandingPageProps = {
    onDemoKeySubmit: (key: string) => void
}

const config = {
    videoSrc: '/videos/original-281dfa9448a600955fd3e49558d471a3.mp4',
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
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: config.easing } },
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
        <div className="landing-page-wrapper">
            {/* Hero Section */}
            <section className={`hero-section ${config.heroHeight}`}>
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
                    className="floating-badges-wrapper"
                    style={{ willChange: 'transform' }}
                >
                    <div className="floating-badges-inner">
                        <FloatingBadge text="AI tutor" />
                        <FloatingBadge text="Track progress" small />
                    </div>
                </motion.div>

                {/* Main content container */}
                <div className="hero-content-container">
                    <motion.div variants={container} initial="hidden" animate="show">
                        {/* Headline + Subhead */}
                        <motion.div variants={fadeUp} transition={{ delay: config.headlineDelay }}>
                            <h1 className="hero-headline">
                                Smart learning for every learner with <span className="lumra-brand">Lumra AI</span>
                            </h1>
                            <p className="hero-subheadline">
                                Adaptive lessons, teacher tools, and instant feedback — all in one place. Launch courses,
                                track progress, and boost engagement with AI-powered personalized learning.
                            </p>
                        </motion.div>

                        {/* CTA + Stats row */}
                        <motion.div
                            variants={fadeUp}
                            className="cta-stats-container"
                        >
                            <motion.a
                                href="#demo"
                                className="cta-button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    const demoSection = document.querySelector('.demo-section')
                                    demoSection?.scrollIntoView({ behavior: 'smooth' })
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Get started — it's free
                            </motion.a>

                            <div className="stats-text">
                                <strong className="stats-strong">For teams & schools</strong>
                                <span className="stats-span">Schedule a demo • Trusted by 2,000+ educators</span>
                            </div>
                        </motion.div>

                        {/* Feature cards (staggered) */}
                        <motion.div
                            className="feature-cards-container"
                            variants={{ show: { transition: { staggerChildren: config.cardStagger } } }}
                        >
                            <FeatureCard title="Adaptive lessons" desc="Content that adapts to each student." index={0} />
                            <FeatureCard title="Smart quizzes" desc="Instant feedback and analytics." index={1} />
                            <FeatureCard title="Teacher dashboard" desc="Manage classes and track outcomes." index={2} />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Footer wave / gradient */}
                <div className="hero-gradient-bottom" />
            </section>

            {/* Demo Key Section */}
            <section className="demo-section" id="demo">
                <div className="demo-section-container">
                    <motion.h2
                        className="demo-heading"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        Get Started with Your Demo Key
                    </motion.h2>
                    <form onSubmit={handleDemoKeySubmit} className="demo-form">
                        <motion.div
                            className="demo-input-wrapper"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
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
                            <motion.button
                                type="submit"
                                className="demo-submit-button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Start Learning
                            </motion.button>
                        </motion.div>
                        {demoKeyError && <p className="error-message">{demoKeyError}</p>}
                    </form>
                </div>
            </section>

            {/* Contact Section */}
            <section className="contact-section">
                <div className="contact-section-container">
                    <motion.h2
                        className="contact-heading"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        Contact Us
                    </motion.h2>
                    <motion.p
                        className="contact-description"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Have questions? We'd love to hear from you!
                    </motion.p>
                    <form onSubmit={handleContactSubmit} className="contact-form">
                        <motion.div
                            className="form-group"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <input
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="Your email"
                                className="form-input"
                                required
                            />
                        </motion.div>
                        <motion.div
                            className="form-group"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <textarea
                                value={contactMessage}
                                onChange={(e) => setContactMessage(e.target.value)}
                                placeholder="Your message or question"
                                className="form-textarea"
                                rows={5}
                                required
                            />
                        </motion.div>
                        <motion.button
                            type="submit"
                            className="contact-submit-button"
                            disabled={contactStatus === "loading"}
                            whileHover={{ scale: contactStatus === "loading" ? 1 : 1.05 }}
                            whileTap={{ scale: contactStatus === "loading" ? 1 : 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            {contactStatus === "loading" ? "Sending..." : contactStatus === "success" ? "Sent!" : "Send Message"}
                        </motion.button>
                        {contactStatus === "error" && (
                            <p className="error-message">Failed to send message. Please try again.</p>
                        )}
                    </form>
                </div>
            </section>

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
            className="feature-card"
            whileHover={{ y: -6, boxShadow: '0 10px 30px rgba(2,6,23,0.5)' }}
        >
            <h3 className="feature-card-title">{title}</h3>
            <p className="feature-card-desc">{desc}</p>
            <div className="feature-card-link-wrapper">
                <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="feature-card-link"
                >
                    Learn more
                </a>
            </div>
        </motion.div>
    )
}
