"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Shield, Clock } from "lucide-react"

interface Violation {
  id: string
  type: string
  severity: "low" | "medium" | "high"
  timestamp: number
  description: string
  metadata?: any
}

interface ProctoringDashboardProps {
  violations: Violation[]
  proctoringData: any
  isMonitoring: boolean
  lastActivity: number
}

export function ProctoringDashboard({
  violations,
  proctoringData,
  isMonitoring,
  lastActivity,
}: ProctoringDashboardProps) {
  const highViolations = violations.filter((v) => v.severity === "high").length
  const mediumViolations = violations.filter((v) => v.severity === "medium").length
  const lowViolations = violations.filter((v) => v.severity === "low").length
  const totalViolations = violations.length

  const getRiskLevel = () => {
    if (highViolations > 3) return "high"
    if (totalViolations > 8) return "medium"
    return "low"
  }

  const riskLevel = getRiskLevel()
  const timeSinceLastActivity = Math.floor((Date.now() - lastActivity) / 1000)

  return (
    <div className="fixed bottom-4 right-4 w-80 z-50">
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            Proctoring Status
            <Badge variant={isMonitoring ? "default" : "secondary"} className={isMonitoring ? "bg-green-500" : ""}>
              {isMonitoring ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Risk Level */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Risk Level:</span>
            <Badge
              variant={riskLevel === "high" ? "destructive" : riskLevel === "medium" ? "secondary" : "default"}
              className={riskLevel === "low" ? "bg-green-500" : ""}
            >
              {riskLevel.toUpperCase()}
            </Badge>
          </div>

          {/* Violations Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Total Violations:</span>
              <span className="font-medium">{totalViolations}</span>
            </div>

            {totalViolations > 0 && (
              <div className="space-y-1">
                {highViolations > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-600">High:</span>
                    <span className="text-red-600 font-medium">{highViolations}</span>
                  </div>
                )}
                {mediumViolations > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-600">Medium:</span>
                    <span className="text-orange-600 font-medium">{mediumViolations}</span>
                  </div>
                )}
                {lowViolations > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-yellow-600">Low:</span>
                    <span className="text-yellow-600 font-medium">{lowViolations}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Last Activity */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last Activity:
            </span>
            <span className="font-medium">
              {timeSinceLastActivity < 60
                ? `${timeSinceLastActivity}s ago`
                : `${Math.floor(timeSinceLastActivity / 60)}m ago`}
            </span>
          </div>

          {/* Recent Violations */}
          {violations.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-gray-600 font-medium">Recent Violations:</div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {violations
                  .slice(-3)
                  .reverse()
                  .map((violation) => (
                    <div key={violation.id} className="text-xs p-2 bg-gray-50 rounded border-l-2 border-red-300">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        <span className="font-medium text-red-700">{violation.type}</span>
                      </div>
                      <div className="text-gray-600 mt-1">{violation.description}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Progress Bar for Risk */}
          <div className="space-y-1">
            <div className="text-xs text-gray-600">Security Score:</div>
            <Progress value={Math.max(0, 100 - totalViolations * 10)} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
