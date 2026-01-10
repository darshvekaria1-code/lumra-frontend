import React, { useState, useEffect } from "react"
import { Bell, Calendar, BookOpen, FileText, ClipboardList, GraduationCap, Settings, FolderOpen, ChevronLeft, ChevronRight } from "lucide-react"
import "./Dashboard.css"

interface DashboardProps {
    studentName?: string
    studentClass?: string
    schoolName?: string
}

const getApiBaseUrl = () => {
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_LUMRA_API_BASE || ''
    } else {
        return ''
    }
}

const API_BASE_URL = getApiBaseUrl()

export default function Dashboard({ 
    studentName = "Krishna Yadav", 
    studentClass = "DP2",
    schoolName = "Indus International School Pune"
}: DashboardProps) {
    // Initialize with current date - automatically shows current month
    const [viewDate, setViewDate] = useState(new Date())
    const today = new Date()
    
    // Month names
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"]
    
    // Navigation functions
    const goToPreviousMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
    }
    
    const goToNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
    }
    
    const goToToday = () => {
        setViewDate(new Date())
    }
    
    // Get current month and year for display
    const currentMonth = monthNames[viewDate.getMonth()]
    const currentYear = viewDate.getFullYear()
    const isCurrentMonth = viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear()
    
    // Sample due dates - will be loaded from backend
    const [dueDates, setDueDates] = useState([
        { date: 8, subject: "BM-SDL 6", dueDate: "08/01" },
        { date: 23, subject: "Math-WT3", dueDate: "23/01" },
        { date: 25, subject: "TOK", dueDate: "25/01" },
        { date: 30, subject: "EE Submission", dueDate: "30/01" }
    ])
    
    // Calculate calendar days for the viewed month
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
    const todayDate = isCurrentMonth ? today.getDate() : null
    
    // Generate calendar days
    const calendarDays = []
    const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
    
    // Adjust first day to match MON=0 (instead of SUN=0)
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
        calendarDays.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day)
    }
    
    // Classes data - will be loaded from backend
    const [classes, setClasses] = useState([
        { block: "B1", level: "HL", name: "English A L&L", teacher: "Ms. Surbhi" },
        { block: "B2", level: "SL", name: "Spanish AB", teacher: "Ms." },
        { block: "B3", level: "HL", name: "Math AI SL", teacher: "Mr." },
        { block: "B4", level: "HL", name: "History", teacher: "Ms." }
    ])
    
    // Load calendar data from backend on mount
    useEffect(() => {
        const loadCalendar = async () => {
            try {
                const token = localStorage.getItem("lumra_token")
                if (!token) return
                
                const response = await fetch(`${API_BASE_URL}/api/calendar`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                
                if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.calendar) {
                        if (data.calendar.dueDates) setDueDates(data.calendar.dueDates)
                        if (data.calendar.classes) setClasses(data.calendar.classes)
                    }
                }
            } catch (error) {
                console.error("Error loading calendar:", error)
            }
        }
        
        loadCalendar()
    }, [])
    
    // Save calendar data to backend whenever it changes
    useEffect(() => {
        const saveCalendar = async () => {
            try {
                const token = localStorage.getItem("lumra_token")
                if (!token) return
                
                await fetch(`${API_BASE_URL}/api/calendar`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        events: [],
                        dueDates: dueDates,
                        classes: classes
                    })
                })
            } catch (error) {
                console.error("Error saving calendar:", error)
            }
        }
        
        // Debounce saves - only save after 2 seconds of no changes
        const timeoutId = setTimeout(saveCalendar, 2000)
        return () => clearTimeout(timeoutId)
    }, [dueDates, classes])
    
    // Projects data
    const projects = [
        { name: "CAS", type: "school projects" },
        { name: "PP", type: "for MYP5 students or some projects for particular grades" },
        { name: "Port Visual Art", teacher: "Ms. Manuree K." }
    ]

    return (
        <div className="dashboard-container">
            {/* Top Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="logo-placeholder">Logo</div>
                    <div className="header-info">
                        <span className="home-year">Home - {currentYear}</span>
                        <span className="school-name">{schoolName}</span>
                    </div>
                </div>
                <div className="header-right">
                    <div className="student-info">
                        <span>Name: {studentName}</span>
                        <span>Class: {studentClass}</span>
                    </div>
                    <div className="header-icons">
                        <div className="notification-icon" title="Notifications">
                            <Bell size={20} />
                        </div>
                        <div className="ai-icon-header" title="Ask AI">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                                <ellipse cx="12" cy="12" rx="8" ry="4" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8" transform="rotate(-30 12 12)"/>
                                <ellipse cx="12" cy="12" rx="8" ry="4" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8" transform="rotate(30 12 12)"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="dashboard-main">
                {/* Left Side - Navigation Boxes */}
                <div className="dashboard-left">
                    <div className="nav-boxes">
                        <div className="nav-box">
                            <FileText size={24} />
                            <span>Announcement</span>
                        </div>
                        <div className="nav-box">
                            <ClipboardList size={24} />
                            <span>Progress Reports</span>
                        </div>
                        <div className="nav-box">
                            <BookOpen size={24} />
                            <span>Grade book</span>
                        </div>
                        <div className="nav-box">
                            <Calendar size={24} />
                            <span>Attendance</span>
                        </div>
                        <div className="nav-box">
                            <Settings size={24} />
                            <span>School policies</span>
                        </div>
                        <div className="nav-box">
                            <FolderOpen size={24} />
                            <span>Resources</span>
                        </div>
                    </div>
                    <p className="nav-note">↳ You may add more options here.</p>
                </div>

                {/* Right Side - Calendar */}
                <div className="dashboard-right">
                    <div className="calendar-section">
                        <div className="calendar-header">
                            <div className="calendar-title-row">
                                <button 
                                    className="calendar-nav-button" 
                                    onClick={goToPreviousMonth}
                                    title="Previous month"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="calendar-month-year">
                                    <h3>{currentMonth} {currentYear}</h3>
                                    {!isCurrentMonth && (
                                        <button 
                                            className="calendar-today-button"
                                            onClick={goToToday}
                                            title="Go to current month"
                                        >
                                            Today
                                        </button>
                                    )}
                                </div>
                                <button 
                                    className="calendar-nav-button" 
                                    onClick={goToNextMonth}
                                    title="Next month"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                            <p className="calendar-note">↳ In calendar should be adding pending task /due dates</p>
                        </div>
                        <div className="calendar-wrapper">
                            <div className="calendar-grid">
                                <div className="calendar-note-column">
                                    <div className="note-header">Note</div>
                                </div>
                                <div className="calendar-days">
                                    {dayNames.map((day, idx) => (
                                        <div key={idx} className="day-header">{day}</div>
                                    ))}
                                </div>
                                {calendarDays.map((day, idx) => {
                                    if (day === null) {
                                        return <div key={idx} className="calendar-day empty"></div>
                                    }
                                    // Check if this day has a due date (match by day and month)
                                    const dueDate = dueDates.find(d => {
                                        const [dueDay, dueMonth] = d.dueDate.split('/')
                                        return parseInt(dueDay) === day && parseInt(dueMonth) === viewDate.getMonth() + 1
                                    })
                                    const isToday = isCurrentMonth && day === todayDate
                                    return (
                                        <React.Fragment key={idx}>
                                            <div className={`calendar-day ${isToday ? 'today' : ''}`}>
                                                <span className="day-number">{day}</span>
                                                {dueDate && (
                                                    <div className="due-date-marker">
                                                        <span className="due-subject">{dueDate.subject}</span>
                                                        <span className="due-date">Due {dueDate.dueDate}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </React.Fragment>
                                    )
                                })}
                            </div>
                            <p className="calendar-highlight-note">↳ Will be highlighted on the present day. (to see how close you are to the due date)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="dashboard-bottom">
                {/* My Classes */}
                <div className="classes-section">
                    <h3>My Classes</h3>
                    <div className="classes-content">
                        <div className="classes-list">
                            <div className="classes-header">
                                <span>B</span>
                                <span>HL/SL</span>
                                <span>Class Name</span>
                                <span>Teacher's Name</span>
                            </div>
                            {classes.map((cls, idx) => (
                                <div key={idx} className="class-row">
                                    <span className="block">{cls.block}</span>
                                    <span className="level">{cls.level}</span>
                                    <span className="class-name">{cls.name}</span>
                                    <span className="teacher">{cls.teacher}</span>
                                </div>
                            ))}
                        </div>
                        <div className="extra-classes">
                            <div className="extra-class-box">
                                <span>LE1</span>
                            </div>
                            <div className="extra-class-box">
                                <span>LE2</span>
                            </div>
                            <div className="extra-class-box">
                                <span>Gr</span>
                            </div>
                            <div className="extra-class-box">
                                <span>TOK</span>
                            </div>
                        </div>
                    </div>
                    <p className="classes-note">↳ You may have these blocks bigger (as big as announcement box)</p>
                    <p className="classes-note-2">↳ Second column would be all extra compulsory classes + teachers' name</p>
                </div>

                {/* My Projects */}
                <div className="projects-section">
                    <h3>My Projects</h3>
                    <div className="projects-list">
                        {projects.map((project, idx) => (
                            <div key={idx} className="project-item">
                                <span className="project-name">{project.name}</span>
                                <div className="project-box">
                                    {project.type && <span className="project-type">→ {project.type}</span>}
                                    {project.teacher && <span className="project-teacher">{project.teacher}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

