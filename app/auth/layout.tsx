import React from "react"
import Waves from "@/components/waves"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative">
      <Waves
        lineColor="#00e4a0"
        backgroundColor="transparent"
        waveSpeedX={0.0125}
        waveSpeedY={0.005}
        waveAmpX={32}
        waveAmpY={16}
        className="opacity-30"
      />
      <div className="relative z-10 w-full max-w-md mx-auto p-6">
        {children}
      </div>
    </div>
  )
} 