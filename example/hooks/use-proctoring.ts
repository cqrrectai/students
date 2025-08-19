"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface ProctoringConfig {
  enableKeyboardMonitoring: boolean
  enableMouseTracking: boolean
  enableTabSwitchDetection: boolean
  enableInactivityDetection: boolean
  enableCopyPasteBlocking: boolean
  enableRightClickBlocking: boolean
  enableDevToolsBlocking: boolean
  enableFullscreenEnforcement: boolean
  enableMultiDeviceDetection: boolean
  inactivityThreshold: number
  maxViolations: number
  allowedIPs: string[]
}

interface Violation {
  id: string
  type: string
  severity: "low" | "medium" | "high"
  timestamp: number
  description: string
  metadata?: any
}

interface ProctoringData {
  sessionId: string
  userId: string
  examId: string
  startTime: number
  endTime?: number
  ipAddress: string
  userAgent: string
  screenResolution: string
  timezone: string
  violations: Violation[]
  keystrokes: number
  mouseClicks: number
  tabSwitches: number
  inactivityPeriods: number
  totalInactiveTime: number
}

export function useProctoring(examId: string, config: ProctoringConfig) {
  const [proctoringData, setProctoringData] = useState<ProctoringData | null>(null)
  const [violations, setViolations] = useState<Violation[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [violationCount, setViolationCount] = useState(0)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())

  const sessionIdRef = useRef<string>("")
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const keystrokeCountRef = useRef(0)
  const mouseClickCountRef = useRef(0)
  const tabSwitchCountRef = useRef(0)

  const generateViolation = useCallback(
    (type: string, severity: "low" | "medium" | "high", description: string, metadata?: any) => {
      const violation: Violation = {
        id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        severity,
        timestamp: Date.now(),
        description,
        metadata,
      }

      setViolations((prev) => [...prev, violation])
      setViolationCount((prev) => prev + 1)

      // Send violation to server
      fetch("/api/proctor/violation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, violation }),
      }).catch(console.error)

      return violation
    },
    [examId],
  )

  const startProctoring = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        // Get user's IP address
        const ipResponse = await fetch("/api/get-ip")
        const { ip } = await ipResponse.json()

        // Check IP whitelist if configured
        if (config.allowedIPs.length > 0 && !config.allowedIPs.includes(ip)) {
          generateViolation("ip_violation", "high", `Unauthorized IP address: ${ip}`)
          return false
        }

        // Check for multiple device sessions
        if (config.enableMultiDeviceDetection) {
          const existingSessions = localStorage.getItem(`exam_sessions_${examId}`)
          if (existingSessions) {
            generateViolation("multi_device", "high", "Multiple device login detected")
            return false
          }
          localStorage.setItem(`exam_sessions_${examId}`, "active")
        }

        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionIdRef.current = sessionId

        const initialData: ProctoringData = {
          sessionId,
          userId,
          examId,
          startTime: Date.now(),
          ipAddress: ip,
          userAgent: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          violations: [],
          keystrokes: 0,
          mouseClicks: 0,
          tabSwitches: 0,
          inactivityPeriods: 0,
          totalInactiveTime: 0,
        }

        setProctoringData(initialData)
        setIsMonitoring(true)
        setLastActivity(Date.now())

        // Send initial session data to server
        await fetch("/api/proctor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(initialData),
        })

        return true
      } catch (error) {
        console.error("Failed to start proctoring:", error)
        return false
      }
    },
    [examId, config, generateViolation],
  )

  const stopProctoring = useCallback(async () => {
    if (!proctoringData) return

    const endTime = Date.now()
    const finalData = {
      ...proctoringData,
      endTime,
      violations,
      keystrokes: keystrokeCountRef.current,
      mouseClicks: mouseClickCountRef.current,
      tabSwitches: tabSwitchCountRef.current,
    }

    setProctoringData(finalData)
    setIsMonitoring(false)

    // Clean up multi-device session
    if (config.enableMultiDeviceDetection) {
      localStorage.removeItem(`exam_sessions_${examId}`)
    }

    // Send final session data to server
    try {
      await fetch("/api/proctor", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      })
    } catch (error) {
      console.error("Failed to update proctoring data:", error)
    }
  }, [proctoringData, violations, examId, config])

  const getProctoringReport = useCallback(() => {
    return {
      sessionData: proctoringData,
      violations,
      summary: {
        totalViolations: violationCount,
        highSeverityViolations: violations.filter((v) => v.severity === "high").length,
        mediumSeverityViolations: violations.filter((v) => v.severity === "medium").length,
        lowSeverityViolations: violations.filter((v) => v.severity === "low").length,
        riskLevel: violationCount > 10 ? "high" : violationCount > 5 ? "medium" : "low",
      },
    }
  }, [proctoringData, violations, violationCount])

  // Keyboard monitoring
  useEffect(() => {
    if (!isMonitoring || !config.enableKeyboardMonitoring) return

    const handleKeyDown = (e: KeyboardEvent) => {
      keystrokeCountRef.current++
      setLastActivity(Date.now())

      // Detect suspicious key combinations
      if (e.key === "F12") {
        e.preventDefault()
        generateViolation("dev_tools", "high", "Attempted to open developer tools (F12)")
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "I") {
        e.preventDefault()
        generateViolation("dev_tools", "high", "Attempted to open developer tools (Ctrl+Shift+I)")
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "J") {
        e.preventDefault()
        generateViolation("dev_tools", "high", "Attempted to open console (Ctrl+Shift+J)")
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "u") {
        e.preventDefault()
        generateViolation("view_source", "medium", "Attempted to view page source")
      }

      if (e.altKey && e.key === "Tab") {
        e.preventDefault()
        generateViolation("alt_tab", "high", "Attempted to switch applications (Alt+Tab)")
      }

      if (e.key === "PrintScreen") {
        generateViolation("screenshot", "medium", "Screenshot attempt detected")
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMonitoring, config.enableKeyboardMonitoring, generateViolation])

  // Mouse tracking
  useEffect(() => {
    if (!isMonitoring || !config.enableMouseTracking) return

    const handleMouseClick = (e: MouseEvent) => {
      mouseClickCountRef.current++
      setLastActivity(Date.now())

      // Detect right-click attempts
      if (e.button === 2) {
        e.preventDefault()
        generateViolation("right_click", "medium", "Right-click attempt detected")
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      if (config.enableRightClickBlocking) {
        e.preventDefault()
        generateViolation("context_menu", "medium", "Context menu access attempt")
      }
    }

    document.addEventListener("click", handleMouseClick)
    document.addEventListener("contextmenu", handleContextMenu)

    return () => {
      document.removeEventListener("click", handleMouseClick)
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [isMonitoring, config.enableMouseTracking, config.enableRightClickBlocking, generateViolation])

  // Tab switch detection
  useEffect(() => {
    if (!isMonitoring || !config.enableTabSwitchDetection) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCountRef.current++
        generateViolation("tab_switch", "high", "Tab/window switch detected")
      }
    }

    const handleBlur = () => {
      generateViolation("focus_loss", "medium", "Window focus lost")
    }

    const handleFocus = () => {
      setLastActivity(Date.now())
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur", handleBlur)
    window.addEventListener("focus", handleFocus)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur", handleBlur)
      window.removeEventListener("focus", handleFocus)
    }
  }, [isMonitoring, config.enableTabSwitchDetection, generateViolation])

  // Inactivity detection
  useEffect(() => {
    if (!isMonitoring || !config.enableInactivityDetection) return

    const checkInactivity = () => {
      const now = Date.now()
      const inactiveTime = now - lastActivity

      if (inactiveTime > config.inactivityThreshold * 60 * 1000) {
        generateViolation("inactivity", "medium", `Inactive for ${Math.round(inactiveTime / 60000)} minutes`)
        setLastActivity(now)
      }
    }

    inactivityTimerRef.current = setInterval(checkInactivity, 30000) // Check every 30 seconds

    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current)
      }
    }
  }, [isMonitoring, config.enableInactivityDetection, config.inactivityThreshold, lastActivity, generateViolation])

  // Copy/paste blocking
  useEffect(() => {
    if (!isMonitoring || !config.enableCopyPasteBlocking) return

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault()
      generateViolation("copy_paste", "medium", `${e.type} attempt blocked`)
    }

    document.addEventListener("copy", handleCopyPaste)
    document.addEventListener("paste", handleCopyPaste)
    document.addEventListener("cut", handleCopyPaste)

    return () => {
      document.removeEventListener("copy", handleCopyPaste)
      document.removeEventListener("paste", handleCopyPaste)
      document.removeEventListener("cut", handleCopyPaste)
    }
  }, [isMonitoring, config.enableCopyPasteBlocking, generateViolation])

  // Fullscreen enforcement
  useEffect(() => {
    if (!isMonitoring || !config.enableFullscreenEnforcement) return

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        generateViolation("fullscreen_exit", "high", "Exited fullscreen mode")
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [isMonitoring, config.enableFullscreenEnforcement, generateViolation])

  return {
    proctoringData,
    violations,
    isMonitoring,
    violationCount,
    lastActivity,
    startProctoring,
    stopProctoring,
    getProctoringReport,
  }
}
