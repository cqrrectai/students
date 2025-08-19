"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

export interface ProctoringConfig {
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

export interface ProctoringViolation {
  id: string
  type: 'tab_switch' | 'copy_paste' | 'right_click' | 'dev_tools' | 'fullscreen_exit' | 'inactivity' | 'suspicious_activity'
  timestamp: number
  details: any
  severity: 'low' | 'medium' | 'high'
}

export interface ProctoringData {
  sessionId: string
  startTime: number
  endTime?: number
  violations: ProctoringViolation[]
  keystrokes: number
  mouseClicks: number
  tabSwitches: number
  inactivityPeriods: number
  screenshots: string[]
  deviceInfo: any
}

export function useProctoring(examId: string, config: ProctoringConfig) {
  const [proctoringData, setProctoringData] = useState<ProctoringData | null>(null)
  const [violations, setViolations] = useState<ProctoringViolation[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [violationCount, setViolationCount] = useState(0)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const sessionIdRef = useRef<string>('')
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const keystrokeCountRef = useRef(0)
  const mouseClickCountRef = useRef(0)
  const tabSwitchCountRef = useRef(0)

  // Generate session ID
  const generateSessionId = useCallback(() => {
    return `proctoring_${examId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }, [examId])

  // Add violation with error handling
  const addViolation = useCallback((type: ProctoringViolation['type'], details: any, severity: ProctoringViolation['severity'] = 'medium') => {
    try {
      const violation: ProctoringViolation = {
        id: `violation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        timestamp: Date.now(),
        details,
        severity
      }

      setViolations(prev => [...prev, violation])
      setViolationCount(prev => prev + 1)

      // Log violation for debugging
      console.warn('Proctoring violation detected:', violation)

      // Send violation to server immediately for critical violations
      if (severity === 'high') {
        fetch('/api/proctor/violation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            examId,
            sessionId: sessionIdRef.current,
            violation
          })
        }).catch(err => {
          console.error('Failed to report critical violation:', err)
          setError('Failed to report security violation')
        })
      }

      return violation
    } catch (err) {
      console.error('Error adding violation:', err)
      setError('Failed to record security violation')
      return null
    }
  }, [examId])

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }

    setLastActivity(Date.now())

    if (config.enableInactivityDetection && isMonitoring) {
      inactivityTimerRef.current = setTimeout(() => {
        addViolation('inactivity', {
          duration: config.inactivityThreshold * 1000,
          timestamp: Date.now()
        }, 'low')
      }, config.inactivityThreshold * 1000)
    }
  }, [config.enableInactivityDetection, config.inactivityThreshold, isMonitoring, addViolation])

  // Keyboard monitoring
  useEffect(() => {
    if (!config.enableKeyboardMonitoring || !isMonitoring) return

    const handleKeyDown = (event: KeyboardEvent) => {
      keystrokeCountRef.current++
      resetInactivityTimer()

      // Detect copy/paste attempts
      if (config.enableCopyPasteBlocking) {
        if ((event.ctrlKey || event.metaKey) && ['c', 'v', 'x', 'a'].includes(event.key.toLowerCase())) {
          event.preventDefault()
          addViolation('copy_paste', {
            key: event.key,
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey
          }, 'medium')
        }
      }

      // Detect dev tools shortcuts
      if (config.enableDevToolsBlocking) {
        if (event.key === 'F12' || 
            (event.ctrlKey && event.shiftKey && ['I', 'J', 'C'].includes(event.key)) ||
            (event.ctrlKey && event.key === 'U')) {
          event.preventDefault()
          addViolation('dev_tools', {
            key: event.key,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey
          }, 'high')
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [config.enableKeyboardMonitoring, config.enableCopyPasteBlocking, config.enableDevToolsBlocking, isMonitoring, addViolation, resetInactivityTimer])

  // Mouse monitoring
  useEffect(() => {
    if (!config.enableMouseTracking || !isMonitoring) return

    const handleMouseClick = (event: MouseEvent) => {
      mouseClickCountRef.current++
      resetInactivityTimer()

      // Block right-click
      if (config.enableRightClickBlocking && event.button === 2) {
        event.preventDefault()
        addViolation('right_click', {
          x: event.clientX,
          y: event.clientY,
          timestamp: Date.now()
        }, 'low')
      }
    }

    const handleContextMenu = (event: MouseEvent) => {
      if (config.enableRightClickBlocking) {
        event.preventDefault()
        addViolation('right_click', {
          type: 'context_menu',
          x: event.clientX,
          y: event.clientY
        }, 'low')
      }
    }

    document.addEventListener('click', handleMouseClick)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('click', handleMouseClick)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [config.enableMouseTracking, config.enableRightClickBlocking, isMonitoring, addViolation, resetInactivityTimer])

  // Tab switch detection
  useEffect(() => {
    if (!config.enableTabSwitchDetection || !isMonitoring) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCountRef.current++
        addViolation('tab_switch', {
          timestamp: Date.now(),
          hidden: true
        }, 'high')
      }
    }

    const handleBlur = () => {
      addViolation('tab_switch', {
        timestamp: Date.now(),
        type: 'window_blur'
      }, 'medium')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [config.enableTabSwitchDetection, isMonitoring, addViolation])

  // Fullscreen monitoring
  useEffect(() => {
    if (!config.enableFullscreenEnforcement || !isMonitoring) return

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        addViolation('fullscreen_exit', {
          timestamp: Date.now()
        }, 'high')
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [config.enableFullscreenEnforcement, isMonitoring, addViolation])

  // Start proctoring with comprehensive error handling
  const startProctoring = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setError(null)
      
      // Check if browser supports required features
      if (typeof window === 'undefined') {
        throw new Error('Proctoring requires a browser environment')
      }

      // Check for required permissions
      if (config.enableFullscreenEnforcement && !document.fullscreenEnabled) {
        console.warn('Fullscreen enforcement requested but not supported')
      }

      const sessionId = generateSessionId()
      sessionIdRef.current = sessionId

      const initialData: ProctoringData = {
        sessionId,
        startTime: Date.now(),
        violations: [],
        keystrokes: 0,
        mouseClicks: 0,
        tabSwitches: 0,
        inactivityPeriods: 0,
        screenshots: [],
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenResolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }

      // Initialize proctoring session on server
      const response = await fetch('/api/proctor/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          userId,
          sessionId,
          config,
          deviceInfo: initialData.deviceInfo
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to initialize proctoring session: ${response.statusText}`)
      }

      setProctoringData(initialData)
      setIsMonitoring(true)
      setViolations([])
      setViolationCount(0)
      setIsInitialized(true)
      
      // Reset counters
      keystrokeCountRef.current = 0
      mouseClickCountRef.current = 0
      tabSwitchCountRef.current = 0

      // Start inactivity monitoring
      resetInactivityTimer()

      console.log('Proctoring started for session:', sessionId)
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start proctoring'
      console.error('Failed to start proctoring:', error)
      setError(errorMessage)
      setIsInitialized(false)
      return false
    }
  }, [generateSessionId, resetInactivityTimer, examId, config])

  // Stop proctoring with error handling
  const stopProctoring = useCallback(async (): Promise<boolean> => {
    try {
      setIsMonitoring(false)
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }

      if (proctoringData) {
        const finalData: ProctoringData = {
          ...proctoringData,
          endTime: Date.now(),
          violations,
          keystrokes: keystrokeCountRef.current,
          mouseClicks: mouseClickCountRef.current,
          tabSwitches: tabSwitchCountRef.current
        }

        setProctoringData(finalData)
        
        // Save proctoring data to server with retry logic
        let retries = 3
        while (retries > 0) {
          try {
            const response = await fetch('/api/proctor/end', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                examId,
                sessionId: sessionIdRef.current,
                proctoringData: finalData
              })
            })

            if (!response.ok) {
              throw new Error(`Server responded with ${response.status}`)
            }

            console.log('Proctoring data saved successfully')
            break
          } catch (error) {
            retries--
            console.error(`Failed to save proctoring data (${3 - retries}/3):`, error)
            
            if (retries === 0) {
              setError('Failed to save proctoring data after multiple attempts')
              // Store data locally as fallback
              localStorage.setItem(`proctoring_${sessionIdRef.current}`, JSON.stringify(finalData))
              return false
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      }

      console.log('Proctoring stopped for session:', sessionIdRef.current)
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop proctoring'
      console.error('Error stopping proctoring:', error)
      setError(errorMessage)
      return false
    }
  }, [proctoringData, violations, examId])

  // Get proctoring report
  const getProctoringReport = useCallback(async () => {
    if (!proctoringData) return null

    const report = {
      sessionId: proctoringData.sessionId,
      duration: (proctoringData.endTime || Date.now()) - proctoringData.startTime,
      violations: violations,
      violationCount: violationCount,
      keystrokes: keystrokeCountRef.current,
      mouseClicks: mouseClickCountRef.current,
      tabSwitches: tabSwitchCountRef.current,
      riskScore: calculateRiskScore(violations),
      deviceInfo: proctoringData.deviceInfo,
      summary: generateSummary(violations)
    }

    return report
  }, [proctoringData, violations, violationCount])

  // Calculate risk score based on violations
  const calculateRiskScore = (violations: ProctoringViolation[]): number => {
    let score = 0
    violations.forEach(violation => {
      switch (violation.severity) {
        case 'low': score += 1; break
        case 'medium': score += 3; break
        case 'high': score += 5; break
      }
    })
    return Math.min(score, 100) // Cap at 100
  }

  // Generate summary
  const generateSummary = (violations: ProctoringViolation[]): string => {
    if (violations.length === 0) {
      return 'No violations detected. Clean exam session.'
    }

    const violationTypes = violations.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const summaryParts = Object.entries(violationTypes).map(([type, count]) => 
      `${count} ${type.replace('_', ' ')} violation${count > 1 ? 's' : ''}`
    )

    return `Detected: ${summaryParts.join(', ')}`
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [])

  return {
    proctoringData,
    violations,
    isMonitoring,
    startProctoring,
    stopProctoring,
    getProctoringReport,
    violationCount,
    lastActivity,
    error,
    isInitialized,
    clearError: () => setError(null)
  }
}