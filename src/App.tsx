import { useEffect, useState, useMemo } from "react"
import "./App.css"
import LandingPage from "./LandingPage"

type ResponseState = {
    status: "idle" | "loading" | "success" | "error"
    message: string
    durationMs?: number
    imageUrl?: string | null
}

const API_BASE_URL = import.meta.env.VITE_LUMRA_API_BASE ?? "http://localhost:5050"

const defaultResponse: ResponseState = {
    status: "idle",
    message: "",
}

type ConversationMessage = {
    role: "user" | "assistant"
    content: string
    timestamp: number
    imageUrl?: string | null
}

type ConversationSession = {
    id: string
    title: string
    messages: ConversationMessage[]
    createdAt: number
    updatedAt: number
}

// Get or create user ID
function getUserId(): string {
    let userId = localStorage.getItem("lumra_userId")
    if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem("lumra_userId", userId)
    }
    return userId
}

// Load all conversation sessions from localStorage
function loadConversationSessions(): ConversationSession[] {
    const stored = localStorage.getItem("lumra_conversationSessions")
    if (!stored) return []
    try {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

// Save all conversation sessions to localStorage
function saveConversationSessions(sessions: ConversationSession[]) {
    // Keep only last 20 sessions to avoid localStorage size limits
    const trimmed = sessions.slice(-20)
    localStorage.setItem("lumra_conversationSessions", JSON.stringify(trimmed))
}

// Load conversation history from localStorage (legacy support)
function loadConversationHistory(): ConversationMessage[] {
    const stored = localStorage.getItem("lumra_conversationHistory")
    if (!stored) return []
    try {
        const parsed = JSON.parse(stored)
        // Keep only last 50 messages to avoid localStorage size limits
        return Array.isArray(parsed) ? parsed.slice(-50) : []
    } catch {
        return []
    }
}

// Save conversation history to localStorage (legacy support)
function saveConversationHistory(history: ConversationMessage[]) {
    // Keep only last 50 messages
    const trimmed = history.slice(-50)
    localStorage.setItem("lumra_conversationHistory", JSON.stringify(trimmed))
}

// Add message to conversation history
function addToHistory(history: ConversationMessage[], role: "user" | "assistant", content: string, imageUrl?: string | null): ConversationMessage[] {
    return [
        ...history,
        {
            role,
            content,
            timestamp: Date.now(),
            imageUrl: imageUrl || null,
        },
    ]
}

// Create a new conversation session
function createConversationSession(messages: ConversationMessage[]): ConversationSession {
    const firstUserMessage = messages.find(m => m.role === "user")
    const title = firstUserMessage 
        ? (firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? "..." : ""))
        : "New Conversation"
    
    return {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        messages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    }
}

// Update conversation session
function updateConversationSession(sessions: ConversationSession[], sessionId: string, messages: ConversationMessage[]): ConversationSession[] {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
        session.messages = messages
        session.updatedAt = Date.now()
        // Update title if it's still the default
        if (!session.title || session.title === "New Conversation") {
            const firstUserMessage = messages.find(m => m.role === "user")
            if (firstUserMessage) {
                session.title = firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "")
            }
        }
        return sessions.map(s => s.id === sessionId ? session : s)
    }
    return sessions
}

// Check if user is logged in (has valid token)
function checkLoggedIn(): boolean {
    const token = localStorage.getItem("lumra_token")
    if (!token) return false
    
    // Check if token is expired (basic check)
    try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const now = Math.floor(Date.now() / 1000)
        const isValid = payload.exp > now
        // If token is expired, clean it up
        if (!isValid) {
            localStorage.removeItem("lumra_token")
            localStorage.removeItem("lumra_loggedIn")
        }
        return isValid
    } catch {
        // Invalid token format, clean it up
        localStorage.removeItem("lumra_token")
        localStorage.removeItem("lumra_loggedIn")
        return false
    }
}

// Save login state and token
function setLoggedIn(value: boolean, token?: string) {
    if (value && token) {
        localStorage.setItem("lumra_token", token)
        localStorage.setItem("lumra_loggedIn", "true")
    } else {
        localStorage.removeItem("lumra_token")
        localStorage.removeItem("lumra_loggedIn")
    }
}

// Get auth token
function getAuthToken(): string | null {
    return localStorage.getItem("lumra_token")
}

// Fetch conversations from backend
async function fetchConversationsFromBackend(): Promise<ConversationSession[]> {
    const token = getAuthToken()
    if (!token) return []
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/conversations`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        
        if (!response.ok) {
            console.error("Failed to fetch conversations:", response.statusText)
            return []
        }
        
        const data = await response.json()
        return data.success ? (data.conversations || []) : []
    } catch (error) {
        console.error("Error fetching conversations from backend:", error)
        return []
    }
}

// Save conversation to backend
async function saveConversationToBackend(conversation: ConversationSession): Promise<boolean> {
    const token = getAuthToken()
    if (!token) return false
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/conversations`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(conversation)
        })
        
        if (!response.ok) {
            console.error("Failed to save conversation:", response.statusText)
            return false
        }
        
        return true
    } catch (error) {
        console.error("Error saving conversation to backend:", error)
        return false
    }
}

// Delete conversation from backend
async function deleteConversationFromBackend(conversationId: string): Promise<boolean> {
    const token = getAuthToken()
    if (!token) return false
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        
        if (!response.ok) {
            console.error("Failed to delete conversation:", response.statusText)
            return false
        }
        
        return true
    } catch (error) {
        console.error("Error deleting conversation from backend:", error)
        return false
    }
}

// Sync all conversations to backend
async function syncConversationsToBackend(conversations: ConversationSession[]): Promise<ConversationSession[]> {
    const token = getAuthToken()
    if (!token) return conversations
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/conversations/sync`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ conversations })
        })
        
        if (!response.ok) {
            console.error("Failed to sync conversations:", response.statusText)
            return conversations
        }
        
        const data = await response.json()
        return data.success ? (data.conversations || conversations) : conversations
    } catch (error) {
        console.error("Error syncing conversations to backend:", error)
        return conversations
    }
}

// Email validation function
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
}

// Password validation function
function isValidPassword(password: string): { valid: boolean; error?: string } {
    if (password.length < 8) {
        return { valid: false, error: "Password must be at least 8 characters long" }
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: "Password must contain at least one uppercase letter" }
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, error: "Password must contain at least one lowercase letter" }
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, error: "Password must contain at least one number" }
    }
    return { valid: true }
}

export function App() {
    // Always check fresh on mount to ensure correct initial state
    const [isLoggedIn, setIsLoggedInState] = useState<boolean>(() => {
        // Clear any invalid tokens on initial load
        const token = localStorage.getItem("lumra_token")
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]))
                const now = Math.floor(Date.now() / 1000)
                if (payload.exp <= now) {
                    // Token expired, clean up
                    localStorage.removeItem("lumra_token")
                    localStorage.removeItem("lumra_loggedIn")
                    return false
                }
                return true
            } catch {
                // Invalid token, clean up
                localStorage.removeItem("lumra_token")
                localStorage.removeItem("lumra_loggedIn")
                return false
            }
        }
        return false
    })
    const [hasValidDemoKey, setHasValidDemoKey] = useState<boolean>(() => {
        // Check if user has a valid demo key stored (only accept "11223344")
        const storedKey = localStorage.getItem("lumra_demo_key")
        const isValid = storedKey === "11223344"
        // Clean up invalid demo keys
        if (storedKey && !isValid) {
            localStorage.removeItem("lumra_demo_key")
        }
        return isValid
    })
    const [showSignUp, setShowSignUp] = useState(false)
    
    // Login form state
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loginError, setLoginError] = useState<string | null>(null)
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    
    // Sign up form state
    const [signUpName, setSignUpName] = useState("")
    const [signUpEmail, setSignUpEmail] = useState("")
    const [signUpPassword, setSignUpPassword] = useState("")
    const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")
    const [signUpError, setSignUpError] = useState<string | null>(null)
    const [isSigningUp, setIsSigningUp] = useState(false)
    
    const [prompt, setPrompt] = useState("")
    const [response, setResponse] = useState<ResponseState>(defaultResponse)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [filePreview, setFilePreview] = useState<{ file: File; preview: string }[]>([])
    const [googleOAuthEnabled, setGoogleOAuthEnabled] = useState<boolean>(false)
    const [microsoftOAuthEnabled, setMicrosoftOAuthEnabled] = useState<boolean>(false)
    const [appleOAuthEnabled, setAppleOAuthEnabled] = useState<boolean>(false)
    const [maintenanceMode, setMaintenanceMode] = useState<{ enabled: boolean; message: string } | null>(null)
    const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>(loadConversationHistory())
    const [conversationSessions, setConversationSessions] = useState<ConversationSession[]>(loadConversationSessions())
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
    const [showHistoryDropdown, setShowHistoryDropdown] = useState(false)
    const [sidebarExpanded, setSidebarExpanded] = useState(false)
    const [showHistoryPanel, setShowHistoryPanel] = useState(false)
    const [sidebarPosition, setSidebarPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [panelSize, setPanelSize] = useState<'normal' | 'minimized' | 'maximized'>('normal')
    const [showCookieConsent, setShowCookieConsent] = useState(false)
    const [showCookiePolicy, setShowCookiePolicy] = useState(false)
    const [responseMode, setResponseMode] = useState<'quick' | 'refined'>('quick')
    const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false)
    const [showAIAnimation, setShowAIAnimation] = useState(false)

    // Clean up on initial load - ensure landing page shows for new visitors
    useEffect(() => {
        // Clean up expired tokens
        const token = localStorage.getItem("lumra_token")
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]))
                const now = Math.floor(Date.now() / 1000)
                if (payload.exp <= now) {
                    localStorage.removeItem("lumra_token")
                    localStorage.removeItem("lumra_loggedIn")
                    setIsLoggedInState(false)
                }
            } catch {
                localStorage.removeItem("lumra_token")
                localStorage.removeItem("lumra_loggedIn")
                setIsLoggedInState(false)
            }
        }
        
        // Clean up invalid demo keys
        const storedKey = localStorage.getItem("lumra_demo_key")
        if (storedKey && storedKey !== "11223344") {
            localStorage.removeItem("lumra_demo_key")
            setHasValidDemoKey(false)
        }
    }, [])

    // Check if user has already accepted cookies
    useEffect(() => {
        const cookieConsent = localStorage.getItem('lumra_cookie_consent')
        if (!cookieConsent) {
            setShowCookieConsent(true)
        }
    }, [])

    const handleAcceptCookies = () => {
        localStorage.setItem('lumra_cookie_consent', 'accepted')
        localStorage.setItem('lumra_cookie_consent_date', new Date().toISOString())
        setShowCookieConsent(false)
        setShowCookiePolicy(false)
    }
    const [userId] = useState<string>(getUserId())
    const [toneAdapted, setToneAdapted] = useState(false)

    // Handle OAuth callback from URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get("token")
        const authCallback = urlParams.get("auth_callback")
        const oauthError = urlParams.get("oauth_error")
        
        if (token && (authCallback === "google" || authCallback === "microsoft" || authCallback === "apple")) {
            // Store token and set logged in
            setLoggedIn(true, token)
            setIsLoggedInState(true)
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname)
        } else if (oauthError) {
            // Handle OAuth errors
            let errorMessage = "Authentication failed"
            if (oauthError === "not_configured") {
                errorMessage = "Google OAuth is not configured. Please use email/password login or contact support."
            } else if (oauthError === "auth_failed") {
                errorMessage = "Google authentication failed. Please try again."
            } else if (oauthError === "callback_failed") {
                errorMessage = "Failed to complete authentication. Please try again."
            }
            
            if (!isLoggedIn) {
                setLoginError(errorMessage)
            }
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname)
        }
    }, [isLoggedIn])

    // Fetch conversations from backend when user logs in
    useEffect(() => {
        if (isLoggedIn && checkLoggedIn()) {
            // Fetch conversations from backend
            fetchConversationsFromBackend().then((conversations) => {
                if (conversations.length > 0) {
                    // Sync with local storage and update state
                    setConversationSessions(conversations)
                    saveConversationSessions(conversations)
                    
                    // Also sync any local conversations to backend
                    const localConversations = loadConversationSessions()
                    if (localConversations.length > 0) {
                        syncConversationsToBackend(localConversations).then((synced) => {
                            setConversationSessions(synced)
                            saveConversationSessions(synced)
                        })
                    }
                } else {
                    // If no backend conversations, try syncing local ones
                    const localConversations = loadConversationSessions()
                    if (localConversations.length > 0) {
                        syncConversationsToBackend(localConversations).then((synced) => {
                            setConversationSessions(synced)
                            saveConversationSessions(synced)
                        })
                    }
                }
            }).catch((error) => {
                console.error("Failed to fetch conversations:", error)
                // Fallback to local storage
                const localConversations = loadConversationSessions()
                setConversationSessions(localConversations)
            })
        }
    }, [isLoggedIn])

    // Calculate panel dimensions based on size state - use useMemo for performance
    const panelDimensions = useMemo(() => {
        const historyWidth = showHistoryPanel ? 320 : 0
        const baseWidth = 60 // mini sidebar
        const formWidth = 480
        const responseWidth = 400
        
        switch (panelSize) {
            case 'minimized':
                return {
                    width: baseWidth + 360, // Just mini sidebar + compact form
                    height: '60vh'
                }
            case 'maximized':
                return {
                    width: '95vw',
                    height: '95vh'
                }
            case 'normal':
            default:
                return {
                    width: baseWidth + historyWidth + formWidth + responseWidth,
                    height: '90vh'
                }
        }
    }, [panelSize, showHistoryPanel])

    // Toggle panel size
    const togglePanelSize = () => {
        if (panelSize === 'normal') {
            setPanelSize('maximized')
        } else if (panelSize === 'maximized') {
            setPanelSize('minimized')
        } else {
            setPanelSize('normal')
        }
    }

    // Adjust sidebar position when history panel is toggled or panel size changes
    useEffect(() => {
        if (sidebarExpanded && panelSize !== 'maximized') {
            const panelWidth = typeof panelDimensions.width === 'number' 
                ? panelDimensions.width 
                : panelDimensions.width.includes('vw')
                    ? (parseFloat(panelDimensions.width) / 100) * window.innerWidth
                    : parseInt(panelDimensions.width.replace('px', ''))
            const newX = Math.max(0, (window.innerWidth - panelWidth) / 2)
            setSidebarPosition(prev => ({
                ...prev,
                x: newX
            }))
        } else if (panelSize === 'maximized') {
            // Reset position when maximized (will be set by CSS)
            setSidebarPosition({ x: 0, y: 0 })
        }
    }, [showHistoryPanel, sidebarExpanded, panelSize, panelDimensions.width])

    // Check Google OAuth availability on mount
    // Check health and maintenance mode periodically
    useEffect(() => {
        let mounted = true
        
        const checkHealth = () => {
            if (!mounted) return
            
            fetch(`${API_BASE_URL}/health`)
                .then((res) => res.json())
                .then((data) => {
                    if (!mounted) return
                    
                    // Check both possible response structures for OAuth providers
                    const googleOAuth = Boolean(
                        data?.data?.services?.googleOAuth?.configured || 
                        data?.services?.googleOAuth?.configured
                    )
                    const microsoftOAuth = Boolean(
                        data?.data?.services?.microsoftOAuth?.configured || 
                        data?.services?.microsoftOAuth?.configured
                    )
                    const appleOAuth = Boolean(
                        data?.data?.services?.appleOAuth?.configured || 
                        data?.services?.appleOAuth?.configured
                    )
                    setGoogleOAuthEnabled(googleOAuth)
                    setMicrosoftOAuthEnabled(microsoftOAuth)
                    setAppleOAuthEnabled(appleOAuth)
                    
                    // Check maintenance mode
                    const maintenance = data?.data?.maintenance || data?.maintenance
                    if (maintenance) {
                        const isEnabled = Boolean(maintenance.enabled)
                        setMaintenanceMode({
                            enabled: isEnabled,
                            message: maintenance.message || "AI services are currently under maintenance. Please try again later."
                        })
                        
                        // Log maintenance mode status
                        if (isEnabled) {
                            console.log('[Maintenance Mode] AI services are DISABLED:', maintenance.message)
                        }
                    } else {
                        setMaintenanceMode({ enabled: false, message: "" })
                    }
                })
                .catch((error) => {
                    console.error("Failed to check health status:", error)
                    if (mounted) {
                        setGoogleOAuthEnabled(false)
                        setMicrosoftOAuthEnabled(false)
                        setAppleOAuthEnabled(false)
                    }
                })
        }
        
        // Check immediately
        checkHealth()
        
        // Check every 5 seconds to detect maintenance mode changes
        const interval = setInterval(checkHealth, 5000)
        
        return () => {
            mounted = false
            clearInterval(interval)
        }
    }, [isLoggedIn])

    // Drag functionality for floating sidebar - Fixed and optimized
    useEffect(() => {
        let panelElement: HTMLElement | null = null
        let panelWidth = 0
        let panelHeight = 0
        let maxX = 0
        let maxY = 0

        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && sidebarExpanded && panelElement) {
                // Calculate new position: mouse position minus the offset from panel edge
                const newX = e.clientX - dragOffset.x
                const newY = e.clientY - dragOffset.y
                
                // Constrain to viewport bounds
                const constrainedX = Math.max(0, Math.min(newX, maxX))
                const constrainedY = Math.max(0, Math.min(newY, maxY))
                
                // Use left/top directly (more reliable than transform conversion)
                panelElement.style.left = `${constrainedX}px`
                panelElement.style.top = `${constrainedY}px`
                
                // Update state asynchronously to avoid blocking
                setSidebarPosition({
                    x: constrainedX,
                    y: constrainedY
                })
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
            if (panelElement) {
                panelElement.style.transition = '' // Re-enable transitions
            }
        }

        if (isDragging) {
            // Get panel element and cache dimensions immediately
            panelElement = document.querySelector('.lumra-sidebar-expanded.floating') as HTMLElement
            if (panelElement) {
                // Clear any transform that might be interfering
                panelElement.style.transform = ''
                
                // Get current position and dimensions
                const rect = panelElement.getBoundingClientRect()
                panelWidth = rect.width
                panelHeight = rect.height
                maxX = window.innerWidth - panelWidth
                maxY = window.innerHeight - panelHeight
                
                // Disable transitions during drag
                panelElement.style.transition = 'none'
                panelElement.style.willChange = 'left, top'
            }
            
            document.addEventListener('mousemove', handleMouseMove, { passive: true })
            document.addEventListener('mouseup', handleMouseUp, { passive: true })
            document.body.style.userSelect = 'none'
            document.body.style.cursor = 'grabbing'
        } else {
            document.body.style.userSelect = ''
            document.body.style.cursor = ''
            const currentPanel = document.querySelector('.lumra-sidebar-expanded.floating') as HTMLElement
            if (currentPanel) {
                currentPanel.style.willChange = ''
                currentPanel.style.transform = '' // Clear any leftover transform
            }
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            document.body.style.userSelect = ''
            document.body.style.cursor = ''
            if (panelElement) {
                panelElement.style.transition = ''
                panelElement.style.willChange = ''
                panelElement.style.transform = ''
            }
            panelElement = null
        }
    }, [isDragging, dragOffset, sidebarExpanded])

    const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!sidebarExpanded) return
        e.preventDefault()
        
        const sidebarElement = e.currentTarget.closest('.lumra-sidebar-expanded') as HTMLElement
        if (sidebarElement) {
            const rect = sidebarElement.getBoundingClientRect()
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            })
            setIsDragging(true)
        }
    }

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoginError(null)

        const trimmedEmail = email.trim()
        const trimmedPassword = password.trim()

        if (!trimmedEmail || !trimmedPassword) {
            setLoginError("Please enter both email and password.")
            return
        }

        // Validate email format
        if (!isValidEmail(trimmedEmail)) {
            setLoginError("Please enter a valid email address.")
            return
        }

        setIsLoggingIn(true)

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: trimmedEmail,
                    password: trimmedPassword,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setLoginError(data?.error || "Login failed. Please check your credentials.")
                setIsLoggingIn(false)
                return
            }

            // Store token and set logged in
            setLoggedIn(true, data.token)
            setIsLoggedInState(true)
            setIsLoggingIn(false)
            setEmail("")
            setPassword("")
        } catch (error) {
            setLoginError("Failed to connect to server. Please try again.")
            setIsLoggingIn(false)
        }
    }

    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSignUpError(null)

        const trimmedName = signUpName.trim()
        const trimmedEmail = signUpEmail.trim()
        const trimmedPassword = signUpPassword.trim()
        const trimmedConfirmPassword = signUpConfirmPassword.trim()

        // Validate all fields are filled
        if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
            setSignUpError("Please fill in all fields.")
            return
        }

        // Validate name
        if (trimmedName.length < 2) {
            setSignUpError("Name must be at least 2 characters long.")
            return
        }

        // Validate email format
        if (!isValidEmail(trimmedEmail)) {
            setSignUpError("Please enter a valid email address.")
            return
        }

        // Validate password
        const passwordValidation = isValidPassword(trimmedPassword)
        if (!passwordValidation.valid) {
            setSignUpError(passwordValidation.error || "Invalid password.")
            return
        }

        // Validate password confirmation
        if (trimmedPassword !== trimmedConfirmPassword) {
            setSignUpError("Passwords do not match.")
            return
        }

        setIsSigningUp(true)

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: trimmedName,
                    email: trimmedEmail,
                    password: trimmedPassword,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setSignUpError(data?.error || "Sign up failed. Please try again.")
                setIsSigningUp(false)
                return
            }

            // Store token and set logged in
            setLoggedIn(true, data.token)
            setIsLoggedInState(true)
            
            // Check if this is a new user (first time signing up)
            const hasSeenWelcome = localStorage.getItem('lumra_has_seen_welcome')
            if (!hasSeenWelcome) {
                // Show welcome animation for new users
                setShowWelcomeAnimation(true)
                localStorage.setItem('lumra_has_seen_welcome', 'true')
                // Hide animation after 4 seconds
                setTimeout(() => {
                    setShowWelcomeAnimation(false)
                }, 4000)
            }
            
            setIsSigningUp(false)
            setSignUpName("")
            setSignUpEmail("")
            setSignUpPassword("")
            setSignUpConfirmPassword("")
            setShowSignUp(false)
        } catch (error) {
            setSignUpError("Failed to connect to server. Please try again.")
            setIsSigningUp(false)
        }
    }

    const handleLogout = () => {
        setLoggedIn(false)
        setIsLoggedInState(false)
        localStorage.removeItem("lumra_conversationHistory")
        localStorage.removeItem("lumra_conversationSessions")
        localStorage.removeItem("lumra_token")
        localStorage.removeItem("lumra_loggedIn")
        setConversationHistory([])
        setConversationSessions([])
        setCurrentSessionId(null)
        setToneAdapted(false)
        resetResponse()
    }

    // Start a new conversation
    const startNewConversation = async () => {
        // Save current conversation if it has messages
        if (conversationHistory.length > 0) {
            // Check if current session exists, update it, otherwise create new
            if (currentSessionId) {
                const updatedSessions = updateConversationSession(conversationSessions, currentSessionId, conversationHistory)
                setConversationSessions(updatedSessions)
                saveConversationSessions(updatedSessions)
                
                // Save to backend if logged in
                if (isLoggedIn && checkLoggedIn()) {
                    const session = updatedSessions.find(s => s.id === currentSessionId)
                    if (session) {
                        await saveConversationToBackend(session)
                    }
                }
            } else {
                // Create new session from current history
                const newSession = createConversationSession([...conversationHistory])
                const updatedSessions = [...conversationSessions, newSession]
                setConversationSessions(updatedSessions)
                saveConversationSessions(updatedSessions)
                
                // Save to backend if logged in
                if (isLoggedIn && checkLoggedIn()) {
                    await saveConversationToBackend(newSession)
                }
            }
        }
        // Clear current conversation and start fresh
        setConversationHistory([])
        setCurrentSessionId(null)
        setPrompt("")
        resetResponse()
        setShowHistoryDropdown(false)
    }

    // Load a conversation session
    const loadConversationSession = (sessionId: string) => {
        const session = conversationSessions.find(s => s.id === sessionId)
        if (session) {
            setConversationHistory(session.messages)
            setCurrentSessionId(sessionId)
            setShowHistoryDropdown(false)
            // Show the last message if available
            const lastMessage = session.messages[session.messages.length - 1]
            if (lastMessage && lastMessage.role === "assistant") {
                setResponse({
                    status: "success",
                    message: lastMessage.content,
                    imageUrl: lastMessage.imageUrl || null,
                })
            } else {
                resetResponse()
            }
        }
    }

    // Delete a conversation session
    const deleteConversationSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        
        // Delete from backend if logged in
        if (isLoggedIn && checkLoggedIn()) {
            await deleteConversationFromBackend(sessionId)
        }
        
        const updatedSessions = conversationSessions.filter(s => s.id !== sessionId)
        setConversationSessions(updatedSessions)
        saveConversationSessions(updatedSessions)
        if (currentSessionId === sessionId) {
            setConversationHistory([])
            setCurrentSessionId(null)
            resetResponse()
        }
    }

    // Format timestamp for display
    const formatTimestamp = (timestamp: number): string => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    // Extract page content
    const extractPageContent = (): string => {
        try {
            // Get main content area (excluding the sidebar)
            const mainContent = document.querySelector('.lumra-content .main-content')
            const body = document.body
            
            // Extract text from main content or body
            const contentElement = mainContent || body
            
            // Clone to avoid modifying the original
            const clone = contentElement.cloneNode(true) as HTMLElement
            
            // Remove script and style elements
            const scripts = clone.querySelectorAll('script, style, aside, .lumra-sidebar-container')
            scripts.forEach(el => el.remove())
            
            // Get text content
            let text = clone.innerText || clone.textContent || ''
            
            // Clean up: remove extra whitespace, normalize line breaks
            text = text
                .replace(/\s+/g, ' ')
                .replace(/\n\s*\n/g, '\n')
                .trim()
            
            // Limit to reasonable size (first 10000 characters to avoid token limits)
            if (text.length > 10000) {
                text = text.substring(0, 10000) + '\n\n[Content truncated - showing first 10,000 characters]'
            }
            
            return text
        } catch (error) {
            console.error('Error extracting page content:', error)
            return ''
        }
    }

    // Check if prompt is asking to read/summarize the page
    const isPageReadRequest = (prompt: string): boolean => {
        const lowerPrompt = prompt.toLowerCase().trim()
        const readKeywords = [
            'read my page', 'read the page', 'read this page',
            'summarize my page', 'summarize the page', 'summarize this page',
            'what is on my page', 'what is on this page', 'what is on the page',
            'analyze my page', 'analyze the page', 'analyze this page',
            'what does my page say', 'what does this page say',
            'tell me about my page', 'tell me about this page',
            'read page', 'read website', 'read content',
            'page summary', 'page content', 'page information'
        ]
        
        return readKeywords.some(keyword => lowerPrompt.includes(keyword))
    }

    // Scan and analyze page content
    const scanAndAnalyzePage = async () => {
        // Set initial position when opening (center-right of screen)
        if (!sidebarExpanded) {
            setSidebarPosition({
                x: window.innerWidth - 960,
                y: 50
            })
        }
        setSidebarExpanded(true)
        
        // Check maintenance mode
        if (maintenanceMode?.enabled) {
            setError(maintenanceMode.message || "AI services are currently under maintenance. Please try again later.")
            setResponse({
                status: "error",
                message: maintenanceMode.message || "AI services are currently under maintenance"
            })
            return
        }
        
        // Extract page content
        const pageContent = extractPageContent()
        if (!pageContent) {
            setError("Unable to extract page content. The page may be empty or inaccessible.")
            setResponse({ status: "error", message: "Unable to read page content." })
            return
        }

        // Set loading state
        setError(null)
        setIsSubmitting(true)
        setResponse({ status: "loading", message: "Scanning and analyzing page content..." })

        // Prepare conversation history
        const apiHistory = conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }))

        const start = performance.now()
        const token = getAuthToken()
        
        if (!token) {
            setResponse({
                status: "error",
                message: "Authentication required. Please log in again.",
                durationMs: 0,
            })
            setIsSubmitting(false)
            setLoggedIn(false)
            setIsLoggedInState(false)
            return
        }

        const analysisPrompt = `Read my page and summarize it\n\n--- PAGE CONTENT ---\n${pageContent}\n--- END PAGE CONTENT ---`

        try {
            const res = await fetch(`${API_BASE_URL}/api/fuse`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    prompt: analysisPrompt,
                    conversationHistory: apiHistory,
                    userId,
                    mode: 'refined', // Always use refined mode for page scans
                }),
            })
            
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                if (res.status === 401 || res.status === 403) {
                    setLoggedIn(false)
                    setIsLoggedInState(false)
                    localStorage.removeItem("lumra_token")
                    localStorage.removeItem("lumra_loggedIn")
                    throw new Error("Session expired. Please log in again.")
                }
                throw new Error(data?.error || "Request failed")
            }
            
            const data = await res.json()
            const reply = typeof data?.reply === "string" ? data.reply.trim() : JSON.stringify(data)
            const imageUrl = data?.imageUrl || null
            
            // Update conversation history
            const updatedHistory = addToHistory(
                addToHistory(conversationHistory, "user", "Read my page and summarize it"),
                "assistant",
                reply,
                imageUrl
            )
            setConversationHistory(updatedHistory)
            saveConversationHistory(updatedHistory)
            
            // Update or create conversation session
            if (currentSessionId) {
                const updatedSessions = updateConversationSession(conversationSessions, currentSessionId, updatedHistory)
                setConversationSessions(updatedSessions)
                saveConversationSessions(updatedSessions)
                
                // Save to backend if logged in
                if (isLoggedIn && checkLoggedIn()) {
                    const session = updatedSessions.find(s => s.id === currentSessionId)
                    if (session) {
                        saveConversationToBackend(session).catch(console.error)
                    }
                }
            } else {
                if (updatedHistory.length >= 2) {
                    const newSession = createConversationSession([...updatedHistory])
                    const updatedSessions = [...conversationSessions, newSession]
                    setConversationSessions(updatedSessions)
                    saveConversationSessions(updatedSessions)
                    setCurrentSessionId(newSession.id)
                    
                    // Save to backend if logged in
                    if (isLoggedIn && checkLoggedIn()) {
                        saveConversationToBackend(newSession).catch(console.error)
                    }
                }
            }
            
            setToneAdapted(Boolean(data?.toneAdapted))
            
            setResponse({
                status: "success",
                message: reply || "(Empty response)",
                durationMs: Math.round(performance.now() - start),
                imageUrl: imageUrl,
            })
            
            setPrompt("")
        } catch (requestError) {
            const message =
                requestError instanceof Error ? requestError.message : "Something went wrong. Please try again."
            setResponse({
                status: "error",
                message,
                durationMs: Math.round(performance.now() - start),
            })
            setError(message)
        }
        
        setIsSubmitting(false)
    }

    const submitPrompt = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        
        // Check maintenance mode
        if (maintenanceMode?.enabled) {
            setError(maintenanceMode.message || "AI services are currently under maintenance. Please try again later.")
            setResponse({
                status: "error",
                message: maintenanceMode.message || "AI services are currently under maintenance"
            })
            return
        }
        
        const trimmedPrompt = prompt.trim()
        if (!trimmedPrompt) {
            setError("Please enter a prompt before sending.")
            return
        }

        setError(null)
        setIsSubmitting(true)
        setResponse({ status: "loading", message: "" })

        // Check if user wants to read the page
        const shouldReadPage = isPageReadRequest(trimmedPrompt)
        let pageContent = ''
        let finalPrompt = trimmedPrompt
        
        if (shouldReadPage) {
            pageContent = extractPageContent()
            if (pageContent) {
                finalPrompt = `${trimmedPrompt}\n\n--- PAGE CONTENT ---\n${pageContent}\n--- END PAGE CONTENT ---`
            } else {
                setError("Unable to extract page content. The page may be empty or inaccessible.")
                setIsSubmitting(false)
                setResponse({ status: "error", message: "Unable to read page content." })
                return
            }
        }

        // Prepare conversation history for API (format: { role, content })
        const apiHistory = conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }))

        const start = performance.now()
        const token = getAuthToken()
        
        if (!token) {
            setResponse({
                status: "error",
                message: "Authentication required. Please log in again.",
                durationMs: 0,
            })
            setIsSubmitting(false)
            setLoggedIn(false)
            setIsLoggedInState(false)
            return
        }

        try {
            // Convert files to base64 if any
            const fileData = await Promise.all(
                uploadedFiles.map(async (file) => {
                    return new Promise<{ name: string; type: string; data: string }>((resolve, reject) => {
                        const reader = new FileReader()
                        reader.onload = () => {
                            const base64 = (reader.result as string).split(',')[1] // Remove data:image/...;base64, prefix
                            resolve({
                                name: file.name,
                                type: file.type,
                                data: base64
                            })
                        }
                        reader.onerror = reject
                        reader.readAsDataURL(file)
                    })
                })
            )

            const response = await fetch(`${API_BASE_URL}/api/fuse`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    prompt: finalPrompt,
                    conversationHistory: apiHistory,
                    userId,
                    mode: responseMode,
                    files: fileData.length > 0 ? fileData : undefined,
                }),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                // If unauthorized, log user out
                if (response.status === 401 || response.status === 403) {
                    setLoggedIn(false)
                    setIsLoggedInState(false)
                    localStorage.removeItem("lumra_token")
                    localStorage.removeItem("lumra_loggedIn")
                    throw new Error("Session expired. Please log in again.")
                }
                throw new Error(data?.error || "Request failed")
            }

            const data = await response.json()
            const reply = typeof data?.reply === "string" ? data.reply.trim() : JSON.stringify(data)

            // Store image URL if this is an image generation response
            const imageUrl = data?.imageUrl || null

            // Update conversation history
            const updatedHistory = addToHistory(
                addToHistory(conversationHistory, "user", trimmedPrompt),
                "assistant",
                reply,
                imageUrl
            )
            setConversationHistory(updatedHistory)
            saveConversationHistory(updatedHistory)

            // Update or create conversation session
            if (currentSessionId) {
                const updatedSessions = updateConversationSession(conversationSessions, currentSessionId, updatedHistory)
                setConversationSessions(updatedSessions)
                saveConversationSessions(updatedSessions)
                
                // Save to backend if logged in
                if (isLoggedIn && checkLoggedIn()) {
                    const session = updatedSessions.find(s => s.id === currentSessionId)
                    if (session) {
                        saveConversationToBackend(session).catch(console.error)
                    }
                }
            } else {
                // Create new session if we have enough messages
                if (updatedHistory.length >= 2) {
                    const newSession = createConversationSession([...updatedHistory])
                    const updatedSessions = [...conversationSessions, newSession]
                    setConversationSessions(updatedSessions)
                    saveConversationSessions(updatedSessions)
                    setCurrentSessionId(newSession.id)
                    
                    // Save to backend if logged in
                    if (isLoggedIn && checkLoggedIn()) {
                        saveConversationToBackend(newSession).catch(console.error)
                    }
                }
            }

            // Check if tone adaptation is active
            setToneAdapted(Boolean(data?.toneAdapted))

            setResponse({
                status: "success",
                message: reply || "(Empty response)",
                durationMs: Math.round(performance.now() - start),
                imageUrl: imageUrl, // Add image URL to response state
            })

            // Clear prompt after successful submission
            setPrompt("")
        } catch (requestError) {
            const message =
                requestError instanceof Error ? requestError.message : "Something went wrong. Please try again."
            setResponse({
                status: "error",
                message,
                durationMs: Math.round(performance.now() - start),
            })
            setError(message)
        }

        setIsSubmitting(false)
    }

    const resetResponse = () => {
        setResponse(defaultResponse)
        setError(null)
        setPrompt("")
        // Clear uploaded files and clean up preview URLs
        filePreview.forEach(item => {
            if (item.preview) {
                URL.revokeObjectURL(item.preview)
            }
        })
        setUploadedFiles([])
        setFilePreview([])
    }

    const clearHistory = () => {
        localStorage.removeItem("lumra_conversationHistory")
        setConversationHistory([])
        setCurrentSessionId(null)
        setToneAdapted(false)
        resetResponse()
    }

    // PRIORITY 1: Show landing page if user is NOT logged in AND has NO valid demo key
    if (!isLoggedIn && !hasValidDemoKey) {
        return (
            <LandingPage 
                onDemoKeySubmit={(key) => {
                    setHasValidDemoKey(true)
                    localStorage.setItem("lumra_demo_key", key)
                }}
            />
        )
    }

    // PRIORITY 2: Show login/sign up page if user is NOT logged in BUT has valid demo key
    if (!isLoggedIn && hasValidDemoKey) {
    return (
            <div className="lumra-login-container">
                <div className="lumra-login-card">
                    <div className="login-header">
                        <h1>🚀 Lumra AI</h1>
                        <p className="login-subtitle">
                            {showSignUp ? "Create an account to access combined AI intelligence" : "Sign in to access combined AI intelligence"}
                        </p>
                    </div>

                    {!showSignUp ? (
                        <form className="login-form" onSubmit={handleLogin}>
                            <label>
                                Email
                                <input
                                    type="email"
                                    value={email}
                                    placeholder="your.email@example.com"
                                    onChange={(event) => setEmail(event.target.value)}
                                    disabled={isLoggingIn}
                                    autoComplete="email"
                                    required
                                />
                            </label>

                            <label>
                                Password
                                <input
                                    type="password"
                                    value={password}
                                    placeholder="Enter your password"
                                    onChange={(event) => setPassword(event.target.value)}
                                    disabled={isLoggingIn}
                                    autoComplete="current-password"
                                    required
                                />
                            </label>

                            {loginError && <p className="form-error">{loginError}</p>}

                            <button type="submit" className="primary login-submit" disabled={isLoggingIn}>
                                {isLoggingIn ? "Signing in…" : "Sign In"}
            </button>

                            <div style={{ marginTop: "16px", textAlign: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                                    <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                                    <span style={{ padding: "0 12px", color: "#64748b", fontSize: "0.875rem" }}>OR</span>
                                    <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!googleOAuthEnabled) {
                                            setLoginError("Google OAuth is not configured on the server. Please use email/password login or configure Google OAuth credentials in the backend.")
                                            return
                                        }
                                        window.location.href = `${API_BASE_URL}/api/auth/google`
                                    }}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        padding: "12px 16px",
                                        background: googleOAuthEnabled ? "white" : "#f8fafc",
                                        border: `1px solid ${googleOAuthEnabled ? "#e2e8f0" : "#cbd5e1"}`,
                                        borderRadius: "8px",
                                        cursor: googleOAuthEnabled ? "pointer" : "not-allowed",
                                        fontSize: "0.95rem",
                                        fontWeight: 500,
                                        color: googleOAuthEnabled ? "#374151" : "#94a3b8",
                                        transition: "all 0.2s",
                                        opacity: googleOAuthEnabled ? 1 : 0.7,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (googleOAuthEnabled) {
                                            e.currentTarget.style.background = "#f8fafc"
                                            e.currentTarget.style.borderColor = "#cbd5e1"
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = googleOAuthEnabled ? "white" : "#f8fafc"
                                        e.currentTarget.style.borderColor = googleOAuthEnabled ? "#e2e8f0" : "#cbd5e1"
                                    }}
                                    title={!googleOAuthEnabled ? "Google OAuth is not configured. Please use email/password login." : "Sign in with your Google account"}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Continue with Google
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!microsoftOAuthEnabled) {
                                            setLoginError("Microsoft OAuth is not configured on the server. Please use email/password login or configure Microsoft OAuth credentials in the backend.")
                                            return
                                        }
                                        window.location.href = `${API_BASE_URL}/api/auth/microsoft`
                                    }}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        padding: "12px 16px",
                                        background: microsoftOAuthEnabled ? "white" : "#f8fafc",
                                        border: `1px solid ${microsoftOAuthEnabled ? "#e2e8f0" : "#cbd5e1"}`,
                                        borderRadius: "8px",
                                        cursor: microsoftOAuthEnabled ? "pointer" : "not-allowed",
                                        fontSize: "0.95rem",
                                        fontWeight: 500,
                                        color: microsoftOAuthEnabled ? "#374151" : "#94a3b8",
                                        transition: "all 0.2s",
                                        opacity: microsoftOAuthEnabled ? 1 : 0.7,
                                        marginTop: "12px",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (microsoftOAuthEnabled) {
                                            e.currentTarget.style.background = "#f8fafc"
                                            e.currentTarget.style.borderColor = "#cbd5e1"
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = microsoftOAuthEnabled ? "white" : "#f8fafc"
                                        e.currentTarget.style.borderColor = microsoftOAuthEnabled ? "#e2e8f0" : "#cbd5e1"
                                    }}
                                    title={!microsoftOAuthEnabled ? "Microsoft OAuth is not configured. Please use email/password login." : "Sign in with your Microsoft account"}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24">
                                        <path fill="#f25022" d="M1 1h10v10H1z"/>
                                        <path fill="#7fba00" d="M13 1h10v10H13z"/>
                                        <path fill="#00a4ef" d="M1 13h10v10H1z"/>
                                        <path fill="#ffb900" d="M13 13h10v10H13z"/>
                                    </svg>
                                    Continue with Microsoft
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!appleOAuthEnabled) {
                                            setLoginError("Apple OAuth is not configured on the server. Please use email/password login or configure Apple OAuth credentials in the backend.")
                                            return
                                        }
                                        window.location.href = `${API_BASE_URL}/api/auth/apple`
                                    }}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        padding: "12px 16px",
                                        background: appleOAuthEnabled ? "white" : "#f8fafc",
                                        border: `1px solid ${appleOAuthEnabled ? "#e2e8f0" : "#cbd5e1"}`,
                                        borderRadius: "8px",
                                        cursor: appleOAuthEnabled ? "pointer" : "not-allowed",
                                        fontSize: "0.95rem",
                                        fontWeight: 500,
                                        color: appleOAuthEnabled ? "#374151" : "#94a3b8",
                                        transition: "all 0.2s",
                                        opacity: appleOAuthEnabled ? 1 : 0.7,
                                        marginTop: "12px",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (appleOAuthEnabled) {
                                            e.currentTarget.style.background = "#f8fafc"
                                            e.currentTarget.style.borderColor = "#cbd5e1"
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = appleOAuthEnabled ? "white" : "#f8fafc"
                                        e.currentTarget.style.borderColor = appleOAuthEnabled ? "#e2e8f0" : "#cbd5e1"
                                    }}
                                    title={!appleOAuthEnabled ? "Apple OAuth is not configured. Please use email/password login." : "Sign in with your Apple account"}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path
                                            fill="#000000"
                                            d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                                        />
                                    </svg>
                                    Continue with Apple
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className="login-form" onSubmit={handleSignUp}>
                            <label>
                                Full Name
                                <input
                                    type="text"
                                    value={signUpName}
                                    placeholder="John Doe"
                                    onChange={(event) => setSignUpName(event.target.value)}
                                    disabled={isSigningUp}
                                    autoComplete="name"
                                    required
                                />
                            </label>

                            <label>
                                Email
                                <input
                                    type="email"
                                    value={signUpEmail}
                                    placeholder="your.email@example.com"
                                    onChange={(event) => setSignUpEmail(event.target.value)}
                                    disabled={isSigningUp}
                                    autoComplete="email"
                                    required
                                />
                            </label>

                            <label>
                                Password
                                <input
                                    type="password"
                                    value={signUpPassword}
                                    placeholder="At least 8 characters, with uppercase, lowercase, and number"
                                    onChange={(event) => setSignUpPassword(event.target.value)}
                                    disabled={isSigningUp}
                                    autoComplete="new-password"
                                    required
                                />
                                <small style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px", display: "block" }}>
                                    Must be at least 8 characters with uppercase, lowercase, and a number
                                </small>
                            </label>

                            <label>
                                Confirm Password
                                <input
                                    type="password"
                                    value={signUpConfirmPassword}
                                    placeholder="Re-enter your password"
                                    onChange={(event) => setSignUpConfirmPassword(event.target.value)}
                                    disabled={isSigningUp}
                                    autoComplete="new-password"
                                    required
                                />
                            </label>

                            {signUpError && <p className="form-error">{signUpError}</p>}

                            <button type="submit" className="primary login-submit" disabled={isSigningUp}>
                                {isSigningUp ? "Creating account…" : "Create Account"}
                            </button>

                            <div style={{ marginTop: "16px", textAlign: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                                    <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                                    <span style={{ padding: "0 12px", color: "#64748b", fontSize: "0.875rem" }}>OR</span>
                                    <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!googleOAuthEnabled) {
                                            setSignUpError("Google OAuth is not configured on the server. Please use email/password signup or configure Google OAuth credentials in the backend.")
                                            return
                                        }
                                        window.location.href = `${API_BASE_URL}/api/auth/google`
                                    }}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        padding: "12px 16px",
                                        background: googleOAuthEnabled ? "white" : "#f8fafc",
                                        border: `1px solid ${googleOAuthEnabled ? "#e2e8f0" : "#cbd5e1"}`,
                                        borderRadius: "8px",
                                        cursor: googleOAuthEnabled ? "pointer" : "not-allowed",
                                        fontSize: "0.95rem",
                                        fontWeight: 500,
                                        color: googleOAuthEnabled ? "#374151" : "#94a3b8",
                                        transition: "all 0.2s",
                                        opacity: googleOAuthEnabled ? 1 : 0.7,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (googleOAuthEnabled) {
                                            e.currentTarget.style.background = "#f8fafc"
                                            e.currentTarget.style.borderColor = "#cbd5e1"
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = googleOAuthEnabled ? "white" : "#f8fafc"
                                        e.currentTarget.style.borderColor = googleOAuthEnabled ? "#e2e8f0" : "#cbd5e1"
                                    }}
                                    title={!googleOAuthEnabled ? "Google OAuth is not configured. Please use email/password signup." : "Sign up with your Google account"}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Continue with Google
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!microsoftOAuthEnabled) {
                                            setSignUpError("Microsoft OAuth is not configured on the server. Please use email/password signup or configure Microsoft OAuth credentials in the backend.")
                                            return
                                        }
                                        window.location.href = `${API_BASE_URL}/api/auth/microsoft`
                                    }}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        padding: "12px 16px",
                                        background: microsoftOAuthEnabled ? "white" : "#f8fafc",
                                        border: `1px solid ${microsoftOAuthEnabled ? "#e2e8f0" : "#cbd5e1"}`,
                                        borderRadius: "8px",
                                        cursor: microsoftOAuthEnabled ? "pointer" : "not-allowed",
                                        fontSize: "0.95rem",
                                        fontWeight: 500,
                                        color: microsoftOAuthEnabled ? "#374151" : "#94a3b8",
                                        transition: "all 0.2s",
                                        opacity: microsoftOAuthEnabled ? 1 : 0.7,
                                        marginTop: "12px",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (microsoftOAuthEnabled) {
                                            e.currentTarget.style.background = "#f8fafc"
                                            e.currentTarget.style.borderColor = "#cbd5e1"
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = microsoftOAuthEnabled ? "white" : "#f8fafc"
                                        e.currentTarget.style.borderColor = microsoftOAuthEnabled ? "#e2e8f0" : "#cbd5e1"
                                    }}
                                    title={!microsoftOAuthEnabled ? "Microsoft OAuth is not configured. Please use email/password signup." : "Sign up with your Microsoft account"}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24">
                                        <path fill="#f25022" d="M1 1h10v10H1z"/>
                                        <path fill="#7fba00" d="M13 1h10v10H13z"/>
                                        <path fill="#00a4ef" d="M1 13h10v10H1z"/>
                                        <path fill="#ffb900" d="M13 13h10v10H13z"/>
                                    </svg>
                                    Continue with Microsoft
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!appleOAuthEnabled) {
                                            setSignUpError("Apple OAuth is not configured on the server. Please use email/password signup or configure Apple OAuth credentials in the backend.")
                                            return
                                        }
                                        window.location.href = `${API_BASE_URL}/api/auth/apple`
                                    }}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        padding: "12px 16px",
                                        background: appleOAuthEnabled ? "white" : "#f8fafc",
                                        border: `1px solid ${appleOAuthEnabled ? "#e2e8f0" : "#cbd5e1"}`,
                                        borderRadius: "8px",
                                        cursor: appleOAuthEnabled ? "pointer" : "not-allowed",
                                        fontSize: "0.95rem",
                                        fontWeight: 500,
                                        color: appleOAuthEnabled ? "#374151" : "#94a3b8",
                                        transition: "all 0.2s",
                                        opacity: appleOAuthEnabled ? 1 : 0.7,
                                        marginTop: "12px",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (appleOAuthEnabled) {
                                            e.currentTarget.style.background = "#f8fafc"
                                            e.currentTarget.style.borderColor = "#cbd5e1"
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = appleOAuthEnabled ? "white" : "#f8fafc"
                                        e.currentTarget.style.borderColor = appleOAuthEnabled ? "#e2e8f0" : "#cbd5e1"
                                    }}
                                    title={!appleOAuthEnabled ? "Apple OAuth is not configured. Please use email/password signup." : "Sign up with your Apple account"}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path
                                            fill="#000000"
                                            d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                                        />
                                    </svg>
                                    Continue with Apple
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="login-footer">
                        {!showSignUp ? (
                            <p style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "20px", textAlign: "center" }}>
                                Don't have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSignUp(true)
                                        setLoginError(null)
                                        setEmail("")
                                        setPassword("")
                                    }}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "#6366f1",
                                        cursor: "pointer",
                                        textDecoration: "underline",
                                        padding: 0,
                                        fontSize: "inherit",
                                    }}
                                >
                                    Sign up
                                </button>
                            </p>
                        ) : (
                            <p style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "20px", textAlign: "center" }}>
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSignUp(false)
                                        setSignUpError(null)
                                        setSignUpName("")
                                        setSignUpEmail("")
                                        setSignUpPassword("")
                                        setSignUpConfirmPassword("")
                                    }}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "#6366f1",
                                        cursor: "pointer",
                                        textDecoration: "underline",
                                        padding: 0,
                                        fontSize: "inherit",
                                    }}
                                >
                                    Sign in
                                </button>
                            </p>
                        )}
                    </div>

                    {/* Cookie Consent Banner */}
                    {showCookieConsent && (
                        <div style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            borderTop: '2px solid #6366f1',
                            padding: '20px',
                            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
                            zIndex: 10001,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '20px',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{ flex: 1, minWidth: '280px' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '12px',
                                    marginBottom: '8px'
                                }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                    </svg>
                                    <h3 style={{ 
                                        margin: 0, 
                                        fontSize: '1rem', 
                                        fontWeight: 600, 
                                        color: '#f1f5f9' 
                                    }}>
                                        Cookie Consent
                                    </h3>
                                </div>
                                <p style={{ 
                                    margin: 0, 
                                    fontSize: '0.875rem', 
                                    color: '#cbd5e1',
                                    lineHeight: '1.5'
                                }}>
                                    We use cookies to enhance your experience, authenticate users, and analyze site usage. 
                                    By clicking "Accept Cookies", you agree to our use of cookies. 
                                    <button
                                        type="button"
                                        onClick={() => setShowCookiePolicy(true)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#6366f1',
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            padding: 0,
                                            marginLeft: '4px',
                                            fontSize: 'inherit',
                                            fontWeight: 500
                                        }}
                                    >
                                        Learn More
                                    </button>
                                </p>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                gap: '12px',
                                flexShrink: 0
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCookiePolicy(true)}
                                    style={{
                                        padding: '10px 20px',
                                        background: 'transparent',
                                        border: '1px solid #475569',
                                        borderRadius: '8px',
                                        color: '#cbd5e1',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#334155'
                                        e.currentTarget.style.borderColor = '#64748b'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.borderColor = '#475569'
                                    }}
                                >
                                    Learn More
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAcceptCookies}
                                    style={{
                                        padding: '10px 24px',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        transition: 'all 0.2s',
                                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-1px)'
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)'
                                    }}
                                >
                                    Accept Cookies
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Cookie Policy Modal */}
                    {showCookiePolicy && (
                        <div 
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.7)',
                                zIndex: 10002,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '20px'
                            }}
                            onClick={() => setShowCookiePolicy(false)}
                        >
                            <div 
                                style={{
                                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                    borderRadius: '16px',
                                    padding: '32px',
                                    maxWidth: '600px',
                                    width: '100%',
                                    maxHeight: '80vh',
                                    overflow: 'auto',
                                    border: '2px solid #334155',
                                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginBottom: '24px'
                                }}>
                                    <h2 style={{ 
                                        margin: 0, 
                                        fontSize: '1.5rem', 
                                        fontWeight: 700, 
                                        color: '#f1f5f9' 
                                    }}>
                                        Cookie Policy
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setShowCookiePolicy(false)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#cbd5e1',
                                            cursor: 'pointer',
                                            fontSize: '1.5rem',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#334155'
                                            e.currentTarget.style.color = '#f1f5f9'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent'
                                            e.currentTarget.style.color = '#cbd5e1'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>

                                <div style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.7' }}>
                                    <section style={{ marginBottom: '24px' }}>
                                        <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>
                                            What are Cookies?
                                        </h3>
                                        <p style={{ margin: 0 }}>
                                            Cookies are small text files stored on your device when you visit our website. 
                                            They help us provide you with a better experience and enable essential features.
                                        </p>
                                    </section>

                                    <section style={{ marginBottom: '24px' }}>
                                        <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>
                                            Types of Cookies We Use
                                        </h3>
                                        <div style={{ marginBottom: '16px' }}>
                                            <h4 style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px' }}>
                                                Essential Cookies (Required)
                                            </h4>
                                            <p style={{ margin: 0, marginBottom: '12px' }}>
                                                These cookies are necessary for the website to function properly. They include:
                                            </p>
                                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1' }}>
                                                <li><strong>Authentication Cookies</strong>: Secure httpOnly cookies to keep you logged in</li>
                                                <li><strong>Session Cookies</strong>: To maintain your session and preferences</li>
                                                <li><strong>Security Cookies</strong>: To protect against CSRF and XSS attacks</li>
                                            </ul>
                                        </div>
                                    </section>

                                    <section style={{ marginBottom: '24px' }}>
                                        <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>
                                            Security Features
                                        </h3>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1' }}>
                                            <li><strong>httpOnly</strong>: Cookies cannot be accessed by JavaScript (XSS protection)</li>
                                            <li><strong>Secure</strong>: Cookies only sent over HTTPS connections</li>
                                            <li><strong>SameSite: Strict</strong>: Prevents CSRF attacks</li>
                                            <li><strong>Encrypted Tokens</strong>: All authentication tokens are encrypted</li>
                                        </ul>
                                    </section>

                                    <section style={{ marginBottom: '24px' }}>
                                        <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>
                                            Your Rights
                                        </h3>
                                        <p style={{ margin: 0 }}>
                                            You can manage your cookie preferences at any time. However, disabling essential cookies 
                                            may affect the functionality of the website. You can clear your cookies through your 
                                            browser settings or by logging out of your account.
                                        </p>
                                    </section>

                                    <section style={{ marginBottom: '24px' }}>
                                        <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>
                                            Data Storage
                                        </h3>
                                        <p style={{ margin: 0 }}>
                                            We store your cookie consent preference locally in your browser. This information is 
                                            only used to remember your choice and is not shared with third parties.
                                        </p>
                                    </section>
                                </div>

                                <div style={{ 
                                    display: 'flex', 
                                    gap: '12px', 
                                    marginTop: '32px',
                                    paddingTop: '24px',
                                    borderTop: '1px solid #334155'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowCookiePolicy(false)}
                                        style={{
                                            flex: 1,
                                            padding: '12px 24px',
                                            background: 'transparent',
                                            border: '1px solid #475569',
                                            borderRadius: '8px',
                                            color: '#cbd5e1',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#334155'
                                            e.currentTarget.style.borderColor = '#64748b'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent'
                                            e.currentTarget.style.borderColor = '#475569'
                                        }}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAcceptCookies}
                                        style={{
                                            flex: 1,
                                            padding: '12px 24px',
                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            transition: 'all 0.2s',
                                            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-1px)'
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)'
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)'
                                        }}
                                    >
                                        Accept Cookies
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
            </div>

        </div>
    )
}

    return (
        <div className={`lumra-shell ${sidebarExpanded ? "ai-active" : ""}`}>
            <div className="lumra-content">
                <header className="lumra-header">
                    <div>
                        <p className="eyebrow">Lumra AI · Combined Intelligence</p>
                        <h1>Powered by Lumra AI</h1>
                        <p className="subhead">
                            Ask once, get a unified answer that combines the best insights from both AI models. Lumra learns your communication style and adapts over time.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", position: "relative" }}>
                        <div className={`lumra-ai-badge ${maintenanceMode?.enabled ? "maintenance-mode" : ""}`}>
                            <span className={`lumra-dot ${maintenanceMode?.enabled ? "maintenance-dot" : ""}`} />
                            Lumra AI
                            {maintenanceMode?.enabled && (
                                <span style={{ 
                                    marginLeft: "8px", 
                                    fontSize: "0.75rem", 
                                    color: "#ef4444",
                                    fontWeight: 600
                                }}>
                                    Maintenance
                                </span>
                            )}
                        </div>
                        <div style={{ position: "relative" }}>
                            <button 
                                className="ghost" 
                                onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                                style={{ padding: "8px 16px", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}
                                title="Chat History"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                History
                                {conversationSessions.length > 0 && (
                                    <span style={{ 
                                        backgroundColor: "#6366f1", 
                                        color: "white", 
                                        borderRadius: "10px", 
                                        padding: "2px 6px", 
                                        fontSize: "0.75rem",
                                        minWidth: "18px",
                                        textAlign: "center"
                                    }}>
                                        {conversationSessions.length}
                                    </span>
                                )}
                            </button>
                            {showHistoryDropdown && (
                                <>
                                    <div 
                                        className="history-dropdown-overlay"
                                        onClick={() => setShowHistoryDropdown(false)}
                                    />
                                    <div className="history-dropdown">
                                        <div className="history-dropdown-header">
                                            <h3>Chat History</h3>
                                            <button 
                                                className="ghost"
                                                onClick={startNewConversation}
                                                style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                                            >
                                                + New Chat
                                            </button>
                                        </div>
                                        <div className="history-dropdown-list">
                                            {conversationSessions.length === 0 ? (
                                                <div style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>
                                                    No conversations yet. Start chatting to see history here.
                                                </div>
                                            ) : (
                                                conversationSessions
                                                    .sort((a, b) => b.updatedAt - a.updatedAt)
                                                    .map((session) => (
                                                        <div
                                                            key={session.id}
                                                            className={`history-item ${currentSessionId === session.id ? "active" : ""}`}
                                                            onClick={() => loadConversationSession(session.id)}
                                                        >
                                                            <div className="history-item-content">
                                                                <div className="history-item-title">{session.title}</div>
                                                                <div className="history-item-meta">
                                                                    <span>{session.messages.length} messages</span>
                                                                    <span>·</span>
                                                                    <span>{formatTimestamp(session.updatedAt)}</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                className="history-item-delete"
                                                                onClick={(e) => deleteConversationSession(session.id, e)}
                                                                title="Delete conversation"
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M18 6L6 18M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <button className="ghost" onClick={handleLogout} style={{ padding: "8px 16px", fontSize: "0.9rem" }}>
                            Logout
                        </button>
                    </div>
                </header>
                {/* Main content area - add your website content here */}
                <div className="main-content">
                    <p style={{ color: "#64748b", marginTop: "48px" }}>
                        Your main website content goes here. The Lumra AI sidebar is on the right.
                    </p>
                </div>
            </div>

            {/* Minimized Sidebar Tab (like React tab in image) - Always visible */}
            <button
                className="lumra-minimized-tab"
                onClick={() => {
                    // Check if this is the first time clicking AI button after signup
                    const hasSeenWelcome = localStorage.getItem('lumra_has_seen_welcome')
                    const hasSeenAIActivation = localStorage.getItem('lumra_has_seen_ai_activation')
                    
                    // Only show animation if user has signed up AND hasn't seen AI activation yet
                    if (hasSeenWelcome && !hasSeenAIActivation) {
                        setShowAIAnimation(true)
                        localStorage.setItem('lumra_has_seen_ai_activation', 'true')
                        
                        // After 1.5 seconds, hide animation and show AI panel
                        setTimeout(() => {
                            setShowAIAnimation(false)
                            const panelWidth = showHistoryPanel ? 1260 : 940
                            setSidebarPosition({
                                x: window.innerWidth - panelWidth,
                                y: 50
                            })
                            setSidebarExpanded(true)
                        }, 1500)
                    } else {
                        // No animation, just show AI panel directly
                        const panelWidth = showHistoryPanel ? 1260 : 940
                        setSidebarPosition({
                            x: window.innerWidth - panelWidth,
                            y: 50
                        })
                        setSidebarExpanded(true)
                    }
                }}
                title="Open Lumra AI"
            >
                <svg className="lumra-logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    {/* Lumra Logo - stylized "L" with interconnected orbits */}
                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                    <ellipse cx="12" cy="12" rx="8" ry="4" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8" transform="rotate(-30 12 12)"/>
                    <ellipse cx="12" cy="12" rx="8" ry="4" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8" transform="rotate(30 12 12)"/>
                    <ellipse cx="12" cy="12" rx="8" ry="4" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8" transform="rotate(90 12 12)"/>
                </svg>
            </button>

            {/* Sidebar container hidden - icons now in floating panel */}
            <aside 
                className={`lumra-sidebar-container ${sidebarExpanded ? "expanded" : "collapsed"}`}
                style={{
                    display: 'none'
                }}
            >
            </aside>

            {/* Floating AI Sidebar - Rendered outside container so it's always visible */}
            {sidebarExpanded && (
                <div 
                    className={`lumra-sidebar-expanded visible floating`}
                    style={{
                        position: 'fixed',
                        left: panelSize === 'maximized' ? '2.5vw' : (sidebarPosition.x > 0 ? `${sidebarPosition.x}px` : `${Math.max(0, (window.innerWidth - (typeof panelDimensions.width === 'number' ? panelDimensions.width : parseInt(panelDimensions.width))) / 2)}px`),
                        top: panelSize === 'maximized' ? '2.5vh' : (sidebarPosition.y > 0 ? `${sidebarPosition.y}px` : '50px'),
                        zIndex: 10000,
                        cursor: isDragging ? 'grabbing' : 'default',
                        display: 'flex',
                        flexDirection: 'row',
                        width: typeof panelDimensions.width === 'string' ? panelDimensions.width : `${panelDimensions.width}px`,
                        height: typeof panelDimensions.height === 'string' ? panelDimensions.height : `${panelDimensions.height}px`,
                        maxHeight: panelSize === 'maximized' ? '95vh' : '90vh',
                        maxWidth: panelSize === 'maximized' ? '95vw' : 'none',
                        overflow: 'hidden',
                        borderRadius: '20px',
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(24px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                        transition: isDragging ? 'none' : 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                        willChange: isDragging ? 'left, top' : 'auto'
                    }}
                >
                    {/* Mini Sidebar - Inside Floating Panel */}
                    <div className="lumra-mini-sidebar">
                        <div className="mini-sidebar-logo">
                            <div className="lumra-black-logo" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>L</div>
                        </div>
                        <div className="mini-sidebar-icons">
                            <button
                                className="mini-sidebar-icon-button active"
                                onClick={() => {
                                    setShowHistoryPanel(false)
                                }}
                                title="Chat"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </button>
                            <button
                                className={`mini-sidebar-icon-button ${showHistoryPanel ? "active" : ""}`}
                                onClick={() => {
                                    setShowHistoryPanel(!showHistoryPanel)
                                }}
                                title="History"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </button>
                            <button
                                className="mini-sidebar-icon-button"
                                onClick={scanAndAnalyzePage}
                                disabled={maintenanceMode?.enabled}
                                title={maintenanceMode?.enabled ? "AI services are under maintenance" : "Scan & Analyze Page"}
                                style={{
                                    opacity: maintenanceMode?.enabled ? 0.5 : 1,
                                    cursor: maintenanceMode?.enabled ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                                    <path d="M18 3v6h6" />
                                    <path d="M21 3l-6 6" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area - Now with 4 columns: Mini Sidebar | History Sidebar (collapsible) | Form | Response Panel */}
                    <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        {/* History Sidebar - Slides in from left - Glassmorphism */}
                        {panelSize !== 'minimized' && (
                            <div 
                                style={{ 
                                    width: showHistoryPanel ? '320px' : '0px',
                                    minWidth: showHistoryPanel ? '320px' : '0px',
                                    maxWidth: showHistoryPanel ? '320px' : '0px',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    backdropFilter: 'blur(20px) saturate(180%)',
                                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                    borderRight: showHistoryPanel ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    opacity: showHistoryPanel ? 1 : 0,
                                    pointerEvents: showHistoryPanel ? 'auto' : 'none'
                                }}
                            >
                            <div style={{
                                padding: '16px',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    History
                                </h3>
                                <button
                                    onClick={() => setShowHistoryPanel(false)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                                    }}
                                    title="Close history"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div style={{
                                flex: 1,
                                overflow: 'auto',
                                padding: '12px'
                            }}>
                                {/* Chat Sessions List */}
                                <div style={{
                                    marginBottom: '16px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '12px'
                                    }}>
                                        <h4 style={{
                                            margin: 0,
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            color: 'rgba(255, 255, 255, 0.8)'
                                        }}>
                                            Conversations ({conversationSessions.length})
                                        </h4>
                                        <button
                                            onClick={startNewConversation}
                                            style={{
                                                background: 'linear-gradient(135deg, #ec4899, #3b82f6)',
                                                border: 'none',
                                                color: 'white',
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.05)'
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.4)'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)'
                                                e.currentTarget.style.boxShadow = 'none'
                                            }}
                                            title="Start new chat"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 5v14M5 12h14" />
                                            </svg>
                                            New
                                        </button>
                                    </div>
                                    
                                    {conversationSessions.length > 0 ? (
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}>
                                            {conversationSessions
                                                .sort((a, b) => b.updatedAt - a.updatedAt)
                                                .map((session) => (
                                                    <div
                                                        key={session.id}
                                                        onClick={() => {
                                                            loadConversationSession(session.id)
                                                            setShowHistoryPanel(false)
                                                        }}
                                                        style={{
                                                            padding: '12px',
                                                            background: currentSessionId === session.id 
                                                                ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2))' 
                                                                : 'rgba(255, 255, 255, 0.05)',
                                                            border: currentSessionId === session.id 
                                                                ? '1px solid rgba(236, 72, 153, 0.5)' 
                                                                : '1px solid rgba(255, 255, 255, 0.1)',
                                                            borderRadius: '10px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            position: 'relative'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (currentSessionId !== session.id) {
                                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (currentSessionId !== session.id) {
                                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                                                            }
                                                        }}
                                                    >
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'flex-start',
                                                            gap: '8px'
                                                        }}>
                                                            <div style={{
                                                                flex: 1,
                                                                minWidth: 0
                                                            }}>
                                                                <div style={{
                                                                    fontSize: '0.875rem',
                                                                    fontWeight: 600,
                                                                    color: 'rgba(255, 255, 255, 0.9)',
                                                                    marginBottom: '4px',
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis'
                                                                }}>
                                                                    {session.title}
                                                                </div>
                                                                <div style={{
                                                                    fontSize: '0.75rem',
                                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px'
                                                                }}>
                                                                    <span>{session.messages.length} msgs</span>
                                                                    <span>·</span>
                                                                    <span>{formatTimestamp(session.updatedAt)}</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    deleteConversationSession(session.id, e)
                                                                }}
                                                                style={{
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                                    cursor: 'pointer',
                                                                    padding: '4px',
                                                                    borderRadius: '4px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'all 0.2s',
                                                                    opacity: 0.7
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                                                                    e.currentTarget.style.color = '#ef4444'
                                                                    e.currentTarget.style.opacity = '1'
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = 'transparent'
                                                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
                                                                    e.currentTarget.style.opacity = '0.7'
                                                                }}
                                                                title="Delete conversation"
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M18 6L6 18M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: '24px',
                                            textAlign: 'center',
                                            color: 'rgba(255, 255, 255, 0.5)'
                                        }}>
                                            <p style={{ margin: 0, fontSize: '0.875rem' }}>No conversations yet</p>
                                            <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>Start chatting to see history</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        )}
                        
                        {/* Left: Form/Input Section - Glassmorphism */}
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            flex: 1, 
                            minWidth: 0, 
                            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'rgba(15, 23, 42, 0.85)',
                            backdropFilter: 'blur(24px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(24px) saturate(180%)'
                        }}>
                            <div 
                                className="sidebar-expanded-header" 
                                style={{ 
                                    background: 'transparent',
                                    cursor: 'grab',
                                    userSelect: 'none'
                                }}
                                onMouseDown={handleDragStart}
                            >
                                <h2 className="sidebar-expanded-title">Lumra AI</h2>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z" />
                                        </svg>
                                        Drag
                                    </div>
                                    <button
                                        className="sidebar-collapse-button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            togglePanelSize()
                                        }}
                                        title={panelSize === 'maximized' ? 'Restore size' : panelSize === 'minimized' ? 'Expand' : 'Maximize'}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s',
                                            color: 'rgba(255, 255, 255, 0.7)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                                        }}
                                    >
                                        {panelSize === 'maximized' ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                                            </svg>
                                        ) : panelSize === 'minimized' ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M8 3v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V3m0 18v-3a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" />
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                            </svg>
                                        )}
                                    </button>
                                    <button
                                        className="sidebar-collapse-button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setSidebarExpanded(false)
                                        }}
                                        title="Close panel"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s',
                                            color: 'rgba(255, 255, 255, 0.7)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                                            e.currentTarget.style.color = '#ef4444'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="sidebar-expanded-content" style={{ overflow: 'auto', flex: 1, background: 'transparent' }}>
                        {maintenanceMode?.enabled && (
                            <div style={{
                                padding: "20px",
                                marginBottom: "16px",
                                background: "rgba(239, 68, 68, 0.15)",
                                border: "2px solid rgba(239, 68, 68, 0.5)",
                                borderRadius: "12px",
                                textAlign: "center"
                            }}>
                                <div style={{ 
                                    fontSize: "2.5rem", 
                                    marginBottom: "12px" 
                                }}>⚠️</div>
                                <div style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    color: "#ef4444",
                                    marginBottom: "8px"
                                }}>
                                    AI Services Disabled
                                </div>
                                <div style={{
                                    fontSize: "0.9rem",
                                    color: "rgba(255, 255, 255, 0.8)",
                                    lineHeight: "1.5"
                                }}>
                                    {maintenanceMode.message}
                                </div>
                            </div>
                        )}
                        <section className="panel-dark">
                            {/* Mode Selector */}
                            <div style={{
                                marginBottom: '20px',
                                padding: '16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    marginBottom: '12px'
                                }}>
                                    Response Mode
                                </label>
                                <div style={{
                                    display: 'flex',
                                    gap: '8px'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => setResponseMode('quick')}
                                        style={{
                                            flex: 1,
                                            padding: '10px 16px',
                                            background: responseMode === 'quick' 
                                                ? 'linear-gradient(135deg, #ec4899, #3b82f6)' 
                                                : 'rgba(255, 255, 255, 0.1)',
                                            border: `1px solid ${responseMode === 'quick' ? 'transparent' : 'rgba(255, 255, 255, 0.2)'}`,
                                            borderRadius: '8px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (responseMode !== 'quick') {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (responseMode !== 'quick') {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                                            }
                                        }}
                                        title="Fast parallel responses from both AIs"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                                        </svg>
                                        Quick Mode
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setResponseMode('refined')}
                                        style={{
                                            flex: 1,
                                            padding: '10px 16px',
                                            background: responseMode === 'refined' 
                                                ? 'linear-gradient(135deg, #ec4899, #3b82f6)' 
                                                : 'rgba(255, 255, 255, 0.1)',
                                            border: `1px solid ${responseMode === 'refined' ? 'transparent' : 'rgba(255, 255, 255, 0.2)'}`,
                                            borderRadius: '8px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (responseMode !== 'refined') {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (responseMode !== 'refined') {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                                            }
                                        }}
                                        title="ChatGPT generates → Claude refines for better quality"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                        </svg>
                                        Refined Mode
                                    </button>
                                </div>
                                <p style={{
                                    margin: '8px 0 0 0',
                                    fontSize: '0.75rem',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    lineHeight: '1.4'
                                }}>
                                    {responseMode === 'quick' 
                                        ? '⚡ Fast responses from both AIs in parallel' 
                                        : '✨ ChatGPT generates → Claude refines for better quality and organization'}
                                </p>
                            </div>

                            <form className="prompt-form-dark" onSubmit={submitPrompt}>
                                <label>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span>Prompt</span>
                                        <input
                                            type="file"
                                            id="file-upload"
                                            multiple
                                            accept="image/*,.pdf,.doc,.docx,.txt"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || [])
                                                if (files.length > 0) {
                                                    const newFiles = [...uploadedFiles, ...files]
                                                    setUploadedFiles(newFiles)
                                                    
                                                    // Create previews for images
                                                    const previews = files.map(file => {
                                                        if (file.type.startsWith('image/')) {
                                                            return {
                                                                file,
                                                                preview: URL.createObjectURL(file)
                                                            }
                                                        }
                                                        return {
                                                            file,
                                                            preview: ''
                                                        }
                                                    })
                                                    setFilePreview([...filePreview, ...previews])
                                                }
                                                // Reset input
                                                e.target.value = ''
                                            }}
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '6px 12px',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: '6px',
                                                color: 'rgba(255, 255, 255, 0.9)',
                                                cursor: 'pointer',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                transition: 'all 0.2s',
                                                whiteSpace: 'nowrap'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                                            }}
                                            title="Upload image or file"
                                        >
                                            📎 Attach
                                        </label>
                                    </div>
                                    <textarea
                                        value={prompt}
                                        placeholder={maintenanceMode?.enabled ? "AI services are under maintenance..." : "Ask Lumra anything... (Try: 'Read my page and summarize it' or paste an image with Ctrl+V)"}
                                        onChange={(event) => setPrompt(event.target.value)}
                                        onPaste={async (e) => {
                                            // Handle image paste
                                            const items = e.clipboardData?.items
                                            if (!items) return
                                            
                                            const pastedFiles: File[] = []
                                            
                                            for (let i = 0; i < items.length; i++) {
                                                const item = items[i]
                                                
                                                // Check if it's an image
                                                if (item.type.startsWith('image/')) {
                                                    const file = item.getAsFile()
                                                    if (file) {
                                                        // Create a File object with a proper name
                                                        const timestamp = Date.now()
                                                        const extension = file.type.split('/')[1] || 'png'
                                                        const fileName = `pasted-image-${timestamp}.${extension}`
                                                        const namedFile = new File([file], fileName, { type: file.type })
                                                        pastedFiles.push(namedFile)
                                                    }
                                                }
                                            }
                                            
                                            if (pastedFiles.length > 0) {
                                                e.preventDefault() // Prevent pasting image data as text
                                                
                                                // Add to uploaded files
                                                const newFiles = [...uploadedFiles, ...pastedFiles]
                                                setUploadedFiles(newFiles)
                                                
                                                // Create previews for images
                                                const previews = pastedFiles.map(file => {
                                                    return {
                                                        file,
                                                        preview: URL.createObjectURL(file)
                                                    }
                                                })
                                                setFilePreview([...filePreview, ...previews])
                                                
                                                // Show a brief notification (optional)
                                                console.log(`📎 Pasted ${pastedFiles.length} image(s)`)
                                            }
                                        }}
                                        rows={4}
                                        disabled={maintenanceMode?.enabled || isSubmitting}
                                        style={{
                                            opacity: maintenanceMode?.enabled ? 0.5 : 1,
                                            cursor: maintenanceMode?.enabled ? 'not-allowed' : 'text'
                                        }}
                                    />
                                    <small style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px", display: "block" }}>
                                        💡 Tip: Ask "Read my page and summarize it" to analyze page content
                                    </small>
                                </label>


                                {error && <p className="form-error-dark">{error}</p>}

                                {conversationHistory.length > 0 && (
                                    <div className="tone-indicator">
                                        {toneAdapted ? (
                                            <span>✓ Adapting to your communication style</span>
                                        ) : (
                                            <span>Learning your style... ({conversationHistory.filter((m) => m.role === "user").length} messages)</span>
                                        )}
                                    </div>
                                )}

                                {/* File Upload Preview */}
                                {filePreview.length > 0 && (
                                    <div style={{
                                        marginBottom: '12px',
                                        padding: '12px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '8px'
                                        }}>
                                            <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                                                📎 Attached Files ({filePreview.length})
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUploadedFiles([])
                                                    setFilePreview([])
                                                }}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'rgba(255, 255, 255, 0.6)',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem',
                                                    padding: '4px 8px'
                                                }}
                                            >
                                                ✕ Clear
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {filePreview.map((item, index) => (
                                                <div key={index} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '6px 10px',
                                                    background: 'rgba(255, 255, 255, 0.08)',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    color: 'rgba(255, 255, 255, 0.8)'
                                                }}>
                                                    {item.file.type.startsWith('image/') ? (
                                                        <img 
                                                            src={item.preview} 
                                                            alt={item.file.name}
                                                            style={{
                                                                width: '24px',
                                                                height: '24px',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px'
                                                            }}
                                                        />
                                                    ) : (
                                                        <span>📄</span>
                                                    )}
                                                    <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {item.file.name}
                                                    </span>
                                                    <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.7rem' }}>
                                                        {(item.file.size / 1024).toFixed(1)}KB
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="form-actions-dark" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <button 
                                        type="submit" 
                                        className="primary-dark" 
                                        disabled={isSubmitting || maintenanceMode?.enabled}
                                        title={maintenanceMode?.enabled ? maintenanceMode.message : "Ask Lumra AI"}
                                        style={{ flex: 1 }}
                                    >
                                        {maintenanceMode?.enabled 
                                            ? "⚠️ AI Under Maintenance" 
                                            : (isSubmitting ? "Lumra AI is thinking…" : "Ask Lumra AI")
                                        }
                                    </button>
                                    <button type="button" className="ghost-dark" onClick={resetResponse} disabled={isSubmitting || maintenanceMode?.enabled}>
                                        Clear
                                    </button>
                                    {conversationHistory.length > 0 && (
                                        <button type="button" className="ghost-dark" onClick={clearHistory} disabled={isSubmitting || maintenanceMode?.enabled}>
                                            Clear History
                                        </button>
                                    )}
                                </div>
                            </form>
                        </section>

                            </div>
                        </div>

                        {/* Right: Response Panel - Glassmorphism */}
                        {panelSize !== 'minimized' && (
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                width: '400px', 
                                minWidth: '400px',
                                background: 'rgba(15, 23, 42, 0.85)',
                                backdropFilter: 'blur(24px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                                overflow: 'hidden',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                            <div style={{
                                padding: '16px',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)'
                            }}>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    Response
                                </h3>
                            </div>
                            <div style={{ 
                                flex: 1, 
                                overflow: 'auto', 
                                padding: '16px'
                            }}>
                                <section className="panel-dark responses-dark" style={{ margin: 0 }}>
                                    {maintenanceMode?.enabled && (
                                        <div style={{
                                            padding: "20px",
                                            background: "rgba(239, 68, 68, 0.1)",
                                            border: "2px solid rgba(239, 68, 68, 0.3)",
                                            borderRadius: "12px",
                                            marginBottom: "16px",
                                            textAlign: "center"
                                        }}>
                                            <div style={{ 
                                                fontSize: "2rem", 
                                                marginBottom: "8px" 
                                            }}>⚠️</div>
                                            <div style={{
                                                fontSize: "1rem",
                                                fontWeight: 600,
                                                color: "#ef4444",
                                                marginBottom: "4px"
                                            }}>
                                                AI Services Under Maintenance
                                            </div>
                                            <div style={{
                                                fontSize: "0.85rem",
                                                color: "rgba(255, 255, 255, 0.7)"
                                            }}>
                                                {maintenanceMode.message}
                                            </div>
                                        </div>
                                    )}
                                    <article className="response-card-dark">
                                        <header>
                                            <div className="response-title">
                                                <span className="pill-dark">
                                                    Lumra AI
                                                </span>
                                                <span className={`status-dark ${response.status}`}>{response.status}</span>
                                            </div>
                                            {typeof response.durationMs === "number" && (
                                                <span className="duration-dark">{response.durationMs} ms</span>
                                            )}
                                        </header>
                                        {response.imageUrl && (
                                            <div className="response-image-container">
                                                <img 
                                                    src={response.imageUrl} 
                                                    alt="Generated image" 
                                                    className="response-image"
                                                />
                                            </div>
                                        )}
                                        {response.status === "loading" ? (
                                            <div className="lumra-thinking-indicator">
                                                <div className="thinking-sphere">
                                                    <div className="sphere-ring"></div>
                                                    <div className="sphere-waves">
                                                        <div className="wave wave-1"></div>
                                                        <div className="wave wave-2"></div>
                                                        <div className="wave wave-3"></div>
                                                    </div>
                                                    <div className="sphere-core"></div>
                                                </div>
                                                <div className="thinking-dots">
                                                    <span className="dot dot-1">.</span>
                                                    <span className="dot dot-2">.</span>
                                                    <span className="dot dot-3">.</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="response-copy-dark">
                                                {response.message || (maintenanceMode?.enabled ? maintenanceMode.message : "Awaiting prompt…")}
                                            </p>
                                        )}
                                    </article>
                                </section>
                            </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Cinematic Welcome Animation - Only for New Users on Signup */}
            {showWelcomeAnimation && (
                <div className="lumra-welcome-animation">
                    <div className="welcome-animation-content">
                        <div className="welcome-logo-container">
                            <div className="welcome-logo">L</div>
                            <div className="welcome-orbits">
                                <div className="orbit orbit-1"></div>
                                <div className="orbit orbit-2"></div>
                                <div className="orbit orbit-3"></div>
                            </div>
                        </div>
                        <h1 className="welcome-title">Welcome to Lumra AI</h1>
                        <p className="welcome-tagline">Intelligence Amplified, Possibilities Unlimited</p>
                        <div className="welcome-particles">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="particle" style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${2 + Math.random() * 2}s`
                                }}></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Smooth AI Activation Animation - For AI Button Clicks */}
            {showAIAnimation && (
                <div className="lumra-ai-activation">
                    <div className="ai-activation-content">
                        <div className="ai-activation-logo">
                            <div className="ai-logo-inner">L</div>
                            <div className="ai-ripple-ring ring-1"></div>
                            <div className="ai-ripple-ring ring-2"></div>
                            <div className="ai-ripple-ring ring-3"></div>
                            <div className="ai-energy-orb orb-1"></div>
                            <div className="ai-energy-orb orb-2"></div>
                            <div className="ai-energy-orb orb-3"></div>
                        </div>
                        <div className="ai-activation-text">
                            <span className="ai-text-line">Lumra</span>
                            <span className="ai-text-line">AI</span>
                        </div>
                        <div className="ai-grid-pattern"></div>
                        <div className="ai-light-rays">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="light-ray" style={{
                                    transform: `rotate(${i * 30}deg)`,
                                    animationDelay: `${i * 0.05}s`
                                }}></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
