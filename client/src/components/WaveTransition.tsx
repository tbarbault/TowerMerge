import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WaveTransitionProps {
  wave: number;
  show: boolean;
  onComplete: () => void;
}

export default function WaveTransition({ wave, show, onComplete }: WaveTransitionProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black"
          />

          {/* Main wave text */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ 
              duration: 0.6,
              ease: "easeOut"
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.h1
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-6xl md:text-8xl font-bold text-white mb-4"
              >
                WAVE
              </motion.h1>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.4, 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200
                }}
                className="text-8xl md:text-9xl font-bold text-yellow-400"
              >
                {wave}
              </motion.div>
              
              {/* Particle effects */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: "50%", 
                      y: "50%", 
                      scale: 0,
                      opacity: 0 
                    }}
                    animate={{ 
                      x: `${50 + (Math.cos(i * 30 * Math.PI / 180) * 300)}%`,
                      y: `${50 + (Math.sin(i * 30 * Math.PI / 180) * 300)}%`,
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      delay: 0.6 + i * 0.05,
                      duration: 1.2,
                      ease: "easeOut"
                    }}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bottom message */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
          >
            <div className="text-white text-xl md:text-2xl font-semibold text-center">
              Prepare your defenses!
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}