import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type LaptopAnimationProps = {
  onComplete: () => void
}

export function LaptopAnimation({ onComplete }: LaptopAnimationProps) {
  const [stage, setStage] = useState<"closed" | "opening" | "open" | "zooming" | "fading">("closed")
  const [isLaptopVisible, setIsLaptopVisible] = useState(true)

  const handleLaptopClick = () => {
    if (stage === "closed") {
      setStage("opening")
      // After lid opens, show content and start zoom
      setTimeout(() => {
        setStage("open")
        setTimeout(() => {
          setStage("zooming")
          // After zoom completes, fade out laptop
          setTimeout(() => {
            setStage("fading")
            setTimeout(() => {
              setIsLaptopVisible(false)
              setTimeout(() => onComplete(), 300)
            }, 800)
          }, 1200)
        }, 500)
      }, 1500)
    }
  }

  return (
    <AnimatePresence>
      {isLaptopVisible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            background: "radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)",
            zIndex: 9999,
            overflow: "hidden"
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {/* MacBook Laptop Container */}
          <motion.div
            className="relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: stage === "zooming" ? 8 : stage === "fading" ? 10 : 1,
              opacity: stage === "fading" ? 0 : 1,
              y: stage === "zooming" || stage === "fading" ? -200 : 0
            }}
            transition={{ 
              duration: stage === "zooming" ? 1.2 : stage === "fading" ? 0.8 : 0.6,
              ease: stage === "zooming" ? "easeIn" : "easeInOut"
            }}
            style={{ 
              cursor: stage === "closed" ? "pointer" : "default",
              transformOrigin: "center center",
              perspective: "2000px",
              transform: "rotateY(-5deg) rotateX(2deg)"
            }}
            onClick={handleLaptopClick}
          >
            {/* MacBook Base Container */}
            <motion.div
              className="relative"
              style={{
                width: "800px",
                height: "520px",
                transformStyle: "preserve-3d"
              }}
            >
              {/* Laptop Lid/Screen */}
              <motion.div
                className="absolute"
                style={{
                  width: "800px",
                  height: "500px",
                  transformOrigin: "bottom center",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden"
                }}
                animate={{
                  rotateX: stage === "closed" 
                    ? 0  // Fully closed - lid flat down
                    : stage === "opening" || stage === "open" || stage === "zooming" || stage === "fading"
                    ? -100  // Open - lid up
                    : 0
                }}
                transition={{
                  duration: stage === "opening" ? 1.5 : 0.3,
                  ease: "easeOut"
                }}
              >
                {/* Screen Outer Frame - Dark when closed, light when open */}
                <div 
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: stage === "closed" 
                      ? "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 50%, #050505 100%)"  // Very dark when closed
                      : "linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 50%, #b8b8b8 100%)",  // Light when open
                    boxShadow: stage === "closed"
                      ? "0 10px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)"
                      : "0 10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)",
                    border: stage === "closed" ? "1px solid #222" : "1px solid #999",
                    transition: "all 0.3s ease"
                  }}
                >
                  {/* Screen Bezel and Content - Only visible when NOT closed */}
                  {stage !== "closed" && (
                    <>
                      <div 
                        className="absolute rounded-lg"
                        style={{
                          top: "8px",
                          left: "8px",
                          right: "8px",
                          bottom: "8px",
                          background: "#000",
                          borderRadius: "4px"
                        }}
                      >
                        {/* Screen Content Area */}
                        <div 
                          className="absolute rounded overflow-hidden"
                          style={{
                            top: "30px",
                            left: "12px",
                            right: "12px",
                            bottom: "12px",
                            background: "#0a0a0a",
                            borderRadius: "2px"
                          }}
                        >
                          {/* MacBook Notch - Top center */}
                          <div 
                            className="absolute top-0 left-1/2 transform -translate-x-1/2"
                            style={{
                              width: "180px",
                              height: "25px",
                              background: "#000",
                              borderRadius: "0 0 12px 12px",
                              zIndex: 10
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Keyboard Base - Dark when closed, light when open */}
              <motion.div
                className="absolute bottom-0 rounded-lg"
                style={{
                  width: "800px",
                  height: "20px",
                  transformOrigin: "top center",
                  background: stage === "closed"
                    ? "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0f0f0f 100%)"
                    : "linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 50%, #b8b8b8 100%)",
                  boxShadow: stage === "closed"
                    ? "0 -5px 20px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.05)"
                    : "0 -5px 20px rgba(0,0,0,0.2), inset 0 -1px 0 rgba(255,255,255,0.3)",
                  border: "1px solid #333",
                  transition: "all 0.3s ease"
                }}
                animate={{
                  rotateX: stage === "closed" 
                    ? 0 
                    : stage === "opening" || stage === "open" || stage === "zooming" || stage === "fading"
                    ? 3 
                    : 0,
                  y: stage === "closed"
                    ? 0
                    : stage === "opening" || stage === "open" || stage === "zooming" || stage === "fading" 
                    ? 500 
                    : 0
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeOut"
                }}
              >
                {/* Trackpad area */}
                <div 
                  className="absolute bottom-3 left-1/2 transform -translate-x-1/2 rounded"
                  style={{
                    width: "140px",
                    height: "10px",
                    background: "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)"
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Click hint (only when closed) */}
            {stage === "closed" && (
              <motion.div
                className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-70"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Click the laptop to begin
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}



