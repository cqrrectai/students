"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  MousePointer,
  Keyboard,
  Monitor
} from 'lucide-react'

interface ProctoringDashboardProps {
  violations: any[]
  violationCount: number
  isMonitoring: boolean
  lastActivity: number
  proctoringData: any
}

export function ProctoringDashboard({ 
  violations, 
  violationCount, 
  isMonitoring, 
  lastActivity,
  proctoringData 
}: ProctoringDashboardProps) {
  const getRiskLevel = (count: number) => {
    if (count === 0) return { level: 'low', color: 'text-green-600', bg: 'bg-green-50' }
    if (count <= 3) return { level: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { level: 'high', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const risk = getRiskLevel(violationCount)
  const timeSinceActivity = Math.floor((Date.now() - lastActivity) / 1000)

  return (
    <div className="space-y-4">
      {/* Monitoring Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className={`h-5 w-5 ${isMonitoring ? 'text-green-600' : 'text-gray-400'}`} />
            Proctoring Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="font-medium">
                {isMonitoring ? 'Active Monitoring' : 'Monitoring Stopped'}
              </span>
            </div>
            <Badge variant={isMonitoring ? 'default' : 'secondary'}>
              {isMonitoring ? 'LIVE' : 'OFFLINE'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-blue-600" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg ${risk.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Risk Level</span>
              <Badge className={risk.color}>
                {risk.level.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Violations:</span>
              <span className={`font-bold ${risk.color}`}>{violationCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Monitor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-purple-600" />
            Activity Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Last Activity</span>
            </div>
            <span className="text-sm font-medium">
              {timeSinceActivity < 60 ? `${timeSinceActivity}s ago` : `${Math.floor(timeSinceActivity / 60)}m ago`}
            </span>
          </div>

          {proctoringData && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Keystrokes</span>
                </div>
                <span className="text-sm font-medium">{proctoringData.keystrokes || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Mouse Clicks</span>
                </div>
                <span className="text-sm font-medium">{proctoringData.mouseClicks || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Tab Switches</span>
                </div>
                <span className="text-sm font-medium">{proctoringData.tabSwitches || 0}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Violations */}
      {violations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Recent Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {violations.slice(-5).map((violation, index) => (
                <Alert key={index} className="py-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <span className="font-medium capitalize">
                      {violation.type.replace('_', ' ')}
                    </span>
                    {' - '}
                    <span className="text-gray-600">
                      {new Date(violation.timestamp).toLocaleTimeString()}
                    </span>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clean Session Indicator */}
      {violationCount === 0 && isMonitoring && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Clean Session</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              No violations detected. Exam is proceeding normally.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}