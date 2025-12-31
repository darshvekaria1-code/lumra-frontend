import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"

type NewYearCountdownProps = {
  onClose?: () => void
  onFireworksStart?: () => void
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function NewYearCountdown({ onClose, onFireworksStart }: NewYearCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 }) // Start at 00:00:00
  const [showPopup, setShowPopup] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [isVibrating, setIsVibrating] = useState(false)

  // Show 00:00:00, light up for 3 seconds, then fade out
  useEffect(() => {
    // Start light-up effect immediately
    setIsVibrating(true)
    
    // After 3 seconds, trigger fireworks and fade out
    const timer = setTimeout(() => {
      setIsVibrating(false)
      onFireworksStart?.()
      setTimeout(() => {
        setFadeOut(true)
        setTimeout(() => {
          setShowPopup(false)
          onClose?.()
        }, 1000)
      }, 1000) // Fade out after 1 second
    }, 3000) // Pause at 00:00:00 for 3 seconds

    return () => clearTimeout(timer)
  }, [onClose, onFireworksStart])

  // Don't render if popup is hidden
  if (!showPopup) return null

  const formatTime = (time: number) => time.toString().padStart(2, "0")

  // Always render - no conditional return
  return (
    <>
      {/* Countdown Widget - Right side of screen */}
      {showPopup && (
        <motion.div
          className="fixed top-4 right-4"
          style={{ 
            zIndex: 10000, 
            position: 'fixed',
            pointerEvents: 'auto'
          }}
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ 
            opacity: fadeOut ? 0 : 1,
            x: fadeOut ? 100 : 0,
            scale: fadeOut ? 0.8 : 1
          }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            stiffness: 300,
            duration: fadeOut ? 1 : 0.5
          }}
        >
            <motion.div
              className="border border-gray-700 rounded-lg shadow-lg p-4 md:p-6"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(10px)',
                minWidth: '280px',
                maxWidth: '320px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.8)'
              }}
            >
              {/* Content */}
              <div className="text-center">
                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-4"
                >
                  <h3 className="text-lg md:text-xl font-bold text-white mb-3 text-center">
                    New Year {new Date().getFullYear() + 1}
                  </h3>
                </motion.div>

                {/* Countdown Timer */}
                {(
                  <motion.div
                    className="flex gap-2 mb-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1
                    }}
                    transition={{ delay: 0.2 }}
                  >
                    {[
                      { label: "Days", value: timeLeft.days },
                      { label: "Hours", value: timeLeft.hours },
                      { label: "Minutes", value: timeLeft.minutes },
                      { label: "Seconds", value: timeLeft.seconds },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        className="bg-black border rounded p-3 flex-1"
                        style={{
                          borderColor: isVibrating ? 'rgba(255, 255, 255, 0.5)' : 'rgb(55, 65, 81)',
                          boxShadow: isVibrating 
                            ? '0 0 15px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.2)' 
                            : 'none'
                        }}
                        initial={{ opacity: 0, x: -10, scale: 0.9 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          scale: 1,
                          backgroundColor: isVibrating 
                            ? ['rgba(0, 0, 0, 1)', 'rgba(30, 30, 30, 1)', 'rgba(0, 0, 0, 1)'] 
                            : 'rgba(0, 0, 0, 1)'
                        }}
                        transition={{ 
                          delay: 0.3 + index * 0.05,
                          type: "spring",
                          stiffness: 200,
                          backgroundColor: {
                            duration: 0.3,
                            repeat: isVibrating ? Infinity : 0,
                            repeatType: "reverse",
                            ease: "easeInOut"
                          }
                        }}
                      >
                        <motion.div 
                          className="text-xl md:text-2xl font-bold text-white mb-1 font-mono text-center"
                          key={item.value}
                          initial={{ scale: 1.2 }}
                          animate={{ 
                            scale: 1,
                            textShadow: isVibrating 
                              ? ['0 0 5px rgba(255, 255, 255, 0.5)', '0 0 10px rgba(255, 255, 255, 0.8)', '0 0 5px rgba(255, 255, 255, 0.5)']
                              : 'none'
                          }}
                          transition={{ 
                            duration: 0.3,
                            textShadow: {
                              duration: 0.3,
                              repeat: isVibrating ? Infinity : 0,
                              repeatType: "reverse",
                              ease: "easeInOut"
                            }
                          }}
                        >
                          {formatTime(item.value)}
                        </motion.div>
                        <div className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-wider text-center">
                          {item.label}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
    </>
  )
}

// Fireworks Background Component - Export for use in App.tsx
export function FireworksBackground() {
  const [fireworks, setFireworks] = useState<Array<{ id: number; x: number; y: number; color: string; size: number }>>([])

  useEffect(() => {
    const colors = [
      "rgba(255, 100, 100, 0.9)", // Bright Red
      "rgba(100, 220, 210, 0.85)", // Bright Teal
      "rgba(80, 200, 240, 0.85)", // Bright Blue
      "rgba(255, 220, 50, 0.9)", // Bright Yellow
      "rgba(255, 160, 60, 0.9)", // Bright Orange
      "rgba(255, 80, 80, 0.85)", // Bright Red-orange
      "rgba(150, 120, 255, 0.85)", // Bright Purple
      "rgba(180, 170, 255, 0.85)", // Bright Light purple
      "rgba(255, 255, 255, 0.8)", // Bright White
    ]
    
    const createFirework = () => {
      const newFirework = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 0.9 + Math.random() * 0.3,
      }
      setFireworks((prev) => {
        // Limit max fireworks but allow more
        if (prev.length >= 12) {
          return [...prev.slice(1), newFirework]
        }
        return [...prev, newFirework]
      })
      
      setTimeout(() => {
        setFireworks((prev) => prev.filter((f) => f.id !== newFirework.id))
      }, 2500)
    }

    // Create fireworks more frequently
    const interval = setInterval(createFirework, 500 + Math.random() * 300)
    
    // Create initial burst - more fireworks
    for (let i = 0; i < 6; i++) {
      setTimeout(createFirework, i * 200)
    }

    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 60%)',
        mixBlendMode: 'screen',
        opacity: 0.9
      }}
    >
      {fireworks.map((firework) => (
        <RealisticFirework 
          key={firework.id} 
          x={firework.x} 
          y={firework.y} 
          color={firework.color}
          size={firework.size}
        />
      ))}
    </div>
  )
}

// Optimized Firework Component for performance
function RealisticFirework({ x, y, color, size }: { x: number; y: number; color: string; size: number }) {
  const particles = 14 + Math.floor(Math.random() * 8) // 14-22 particles for more visible spread
  const baseDistance = 70 + Math.random() * 40

  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        willChange: 'transform',
      }}
    >
      {/* Bright center core - smoother */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: color,
          boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          willChange: 'transform, opacity',
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ 
          scale: [0, 2.2, 1.8, 0],
          opacity: [1, 1, 0.8, 0]
        }}
        transition={{ 
          duration: 1,
          ease: [0.25, 0.46, 0.45, 0.94],
          times: [0, 0.3, 0.7, 1]
        }}
      />
      
      {/* Main particles with trails - more visible */}
      {[...Array(particles)].map((_, i) => {
        const angle = (360 / particles) * i + (Math.random() - 0.5) * 15 // More randomness
        const distance = baseDistance + (Math.random() - 0.5) * 30 // Vary distance more
        const radians = (angle * Math.PI) / 180
        const particleSize = (3 + Math.random() * 3) * size // Larger particles
        const trailLength = 20 + Math.random() * 15

        return (
          <div key={i} className="absolute" style={{ left: '50%', top: '50%', willChange: 'transform' }}>
            {/* Main particle - smoother animation */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: `${particleSize}px`,
                height: `${particleSize}px`,
                backgroundColor: color,
                boxShadow: `0 0 ${particleSize * 2}px ${color}`,
                willChange: 'transform, opacity',
              }}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                x: Math.cos(radians) * distance,
                y: Math.sin(radians) * distance,
                opacity: [1, 1, 0.85, 0.5, 0],
                scale: [1, 1.15, 1.05, 0.8, 0],
              }}
              transition={{
                duration: 1.6 + Math.random() * 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
                times: [0, 0.2, 0.5, 0.8, 1],
                delay: Math.random() * 0.08,
              }}
            />
            
            {/* Sparkle effect - smoother */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: `${particleSize * 0.35}px`,
                height: `${particleSize * 0.35}px`,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: `0 0 ${particleSize * 1.5}px rgba(255, 255, 255, 0.9)`,
                willChange: 'transform, opacity',
              }}
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                x: Math.cos(radians) * distance * 0.7,
                y: Math.sin(radians) * distance * 0.7,
                opacity: [0, 0.6, 1, 0.8, 0],
                scale: [0, 0.9, 1.3, 1.1, 0],
              }}
              transition={{
                duration: 1.3,
                ease: [0.25, 0.46, 0.45, 0.94],
                times: [0, 0.25, 0.5, 0.75, 1],
                delay: 0.25,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
