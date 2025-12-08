import React, { useState, useEffect } from "react"
import { X, Cookie, FileText, AlertCircle } from "lucide-react"

// Cookie utility functions
function setCookie(name: string, value: string, days: number) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    const expires = "expires=" + date.toUTCString()
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`
}

function getCookie(name: string): string | null {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') c = c.substring(1, c.length)
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
}

export default function CookieConsent() {
    const [showConsent, setShowConsent] = useState(false)
    const [showTerms, setShowTerms] = useState(false)

    useEffect(() => {
        // Check if user has already accepted cookies
        const cookieConsent = getCookie("lumra_cookie_consent")
        if (!cookieConsent) {
            // Show consent popup after a short delay
            setTimeout(() => {
                setShowConsent(true)
            }, 1000)
        }
    }, [])

    const handleAccept = () => {
        // Set cookie for 365 days
        setCookie("lumra_cookie_consent", "accepted", 365)
        setCookie("lumra_cookie_timestamp", new Date().toISOString(), 365)
        
        // Set analytics cookie (example)
        setCookie("lumra_analytics_enabled", "true", 365)
        
        // Set preference cookie
        setCookie("lumra_user_preferences", JSON.stringify({ 
            theme: "dark",
            language: "en"
        }), 365)
        
        setShowConsent(false)
    }

    const handleDecline = () => {
        // Set cookie to remember decline (so popup doesn't show again)
        setCookie("lumra_cookie_consent", "declined", 365)
        setShowConsent(false)
    }

    if (!showConsent) return null

    return (
        <>
            {/* Cookie Consent Popup */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-end justify-center p-4 sm:p-6 animate-fade-in">
                <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-purple-500/30 rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 animate-slide-up">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Cookie className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                Cookie Consent
                                <AlertCircle className="w-5 h-5 text-yellow-400" />
                            </h3>
                            <p className="text-zinc-300 text-sm sm:text-base mb-4 leading-relaxed">
                                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                                By clicking "Accept All", you consent to our use of cookies. You can learn more about our cookie 
                                policy in our <button 
                                    onClick={() => setShowTerms(true)}
                                    className="text-purple-400 hover:text-purple-300 underline font-semibold"
                                >
                                    Terms & Conditions
                                </button>.
                            </p>
                            
                            {/* Disclaimer */}
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                                <p className="text-yellow-200 text-xs sm:text-sm">
                                    <strong className="font-semibold">Disclaimer:</strong> By using this website, you agree to our 
                                    cookie policy. Cookies help us provide a better experience and are essential for certain features 
                                    to work properly.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                                >
                                    Accept All Cookies
                                </button>
                                <button
                                    onClick={handleDecline}
                                    className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg transition-all duration-200"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms & Conditions Modal */}
            {showTerms && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-purple-500/30 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                                <FileText className="w-6 h-6 text-purple-400" />
                                Cookie Policy & Terms of Service
                            </h2>
                            <button
                                onClick={() => setShowTerms(false)}
                                className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6 text-zinc-300 text-sm sm:text-base leading-relaxed">
                            {/* Cookie Policy Section */}
                            <section>
                                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                    <Cookie className="w-5 h-5 text-purple-400" />
                                    Cookie Policy
                                </h3>
                                <div className="space-y-3">
                                    <p>
                                        <strong className="text-white">What are Cookies?</strong><br />
                                        Cookies are small text files that are placed on your device when you visit our website. 
                                        They help us provide you with a better experience by remembering your preferences and 
                                        understanding how you use our site.
                                    </p>
                                    <p>
                                        <strong className="text-white">Types of Cookies We Use:</strong>
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>
                                            <strong className="text-white">Essential Cookies:</strong> These are necessary for 
                                            the website to function properly. They enable core functionality such as security, 
                                            network management, and accessibility.
                                        </li>
                                        <li>
                                            <strong className="text-white">Analytics Cookies:</strong> These help us understand 
                                            how visitors interact with our website by collecting and reporting information 
                                            anonymously. This helps us improve our website's performance and user experience.
                                        </li>
                                        <li>
                                            <strong className="text-white">Preference Cookies:</strong> These remember your 
                                            choices (such as language or region) and provide enhanced, personalized features.
                                        </li>
                                        <li>
                                            <strong className="text-white">Functional Cookies:</strong> These enable enhanced 
                                            functionality and personalization, such as remembering your login status and 
                                            preferences.
                                        </li>
                                    </ul>
                                    <p>
                                        <strong className="text-white">Cookie Duration:</strong><br />
                                        Most cookies we use are "persistent cookies" that remain on your device for up to 365 days 
                                        or until you delete them. Session cookies are temporary and are deleted when you close 
                                        your browser.
                                    </p>
                                </div>
                            </section>

                            {/* Terms of Service Section */}
                            <section>
                                <h3 className="text-xl font-bold text-white mb-3">Terms of Service</h3>
                                <div className="space-y-3">
                                    <p>
                                        <strong className="text-white">Acceptance of Terms:</strong><br />
                                        By accessing and using Lumra AI, you accept and agree to be bound by the terms and 
                                        provision of this agreement. If you do not agree to these terms, please do not use 
                                        our service.
                                    </p>
                                    <p>
                                        <strong className="text-white">Use License:</strong><br />
                                        Permission is granted to temporarily use Lumra AI for personal, non-commercial 
                                        transitory viewing only. This is the grant of a license, not a transfer of title, and 
                                        under this license you may not:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Modify or copy the materials</li>
                                        <li>Use the materials for any commercial purpose or for any public display</li>
                                        <li>Attempt to reverse engineer any software contained on the website</li>
                                        <li>Remove any copyright or other proprietary notations from the materials</li>
                                    </ul>
                                    <p>
                                        <strong className="text-white">User Responsibilities:</strong><br />
                                        You are responsible for maintaining the confidentiality of your account and password. 
                                        You agree to accept responsibility for all activities that occur under your account.
                                    </p>
                                    <p>
                                        <strong className="text-white">Privacy:</strong><br />
                                        Your use of Lumra AI is also governed by our Privacy Policy. Please review our Privacy 
                                        Policy to understand our practices regarding the collection and use of your information.
                                    </p>
                                </div>
                            </section>

                            {/* Disclaimer Section */}
                            <section>
                                <h3 className="text-xl font-bold text-white mb-3">Disclaimer</h3>
                                <div className="space-y-3">
                                    <p>
                                        The materials on Lumra AI's website are provided on an 'as is' basis. Lumra AI makes no 
                                        warranties, expressed or implied, and hereby disclaims and negates all other warranties 
                                        including, without limitation, implied warranties or conditions of merchantability, fitness 
                                        for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                                    </p>
                                    <p>
                                        Further, Lumra AI does not warrant or make any representations concerning the accuracy, 
                                        likely results, or reliability of the use of the materials on its website or otherwise 
                                        relating to such materials or on any sites linked to this site.
                                    </p>
                                    <p>
                                        <strong className="text-white">Educational Purpose:</strong><br />
                                        Lumra AI is designed for educational purposes. While we strive to provide accurate and 
                                        up-to-date information, we cannot guarantee the completeness or accuracy of all content. 
                                        Users should verify information independently when necessary.
                                    </p>
                                </div>
                            </section>

                            {/* Cookie Management Section */}
                            <section>
                                <h3 className="text-xl font-bold text-white mb-3">Managing Your Cookies</h3>
                                <div className="space-y-3">
                                    <p>
                                        You can control and/or delete cookies as you wish. You can delete all cookies that are 
                                        already on your computer and you can set most browsers to prevent them from being placed. 
                                        However, if you do this, you may have to manually adjust some preferences every time you 
                                        visit a site, and some services and functionalities may not work.
                                    </p>
                                    <p>
                                        <strong className="text-white">How to Manage Cookies in Your Browser:</strong>
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li><strong className="text-white">Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                                        <li><strong className="text-white">Firefox:</strong> Options → Privacy & Security → Cookies</li>
                                        <li><strong className="text-white">Safari:</strong> Preferences → Privacy → Cookies</li>
                                        <li><strong className="text-white">Edge:</strong> Settings → Privacy, Search, and Services → Cookies</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Contact Section */}
                            <section>
                                <h3 className="text-xl font-bold text-white mb-3">Contact Us</h3>
                                <p>
                                    If you have any questions about our Cookie Policy or Terms of Service, please contact us 
                                    through our <a href="#contact" className="text-purple-400 hover:text-purple-300 underline">Contact</a> page.
                                </p>
                            </section>

                            {/* Last Updated */}
                            <div className="pt-4 border-t border-zinc-700">
                                <p className="text-zinc-400 text-xs">
                                    Last Updated: {new Date().toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowTerms(false)}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

