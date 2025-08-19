"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mic, 
  Volume2, 
  Search, 
  Brain, 
  TrendingUp, 
  Bell, 
  FileText, 
  Map, 
  Shuffle,
  Languages,
  CheckCircle,
  AlertTriangle,
  Smile,
  Frown,
  Meh
} from 'lucide-react'

interface AIFeaturesDashboardProps {
  onFeatureTest?: (feature: string, result: any) => void
}

export default function AIFeaturesDashboard({ onFeatureTest }: AIFeaturesDashboardProps) {
  const [activeFeature, setActiveFeature] = useState<string>('quality')
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<{ [key: string]: any }>({})
  const [inputText, setInputText] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const testFeature = async (feature: string, data: any) => {
    setLoading(feature)
    try {
      const response = await fetch(`/api/ai-${feature}`, {
        method: 'POST',
        headers: feature === 'voice-to-text' ? {} : { 'Content-Type': 'application/json' },
        body: feature === 'voice-to-text' ? data : JSON.stringify(data)
      })
      
      const result = await response.json()
      setResults(prev => ({ ...prev, [feature]: result }))
      onFeatureTest?.(feature, result)
    } catch (error) {
      console.error(`Error testing ${feature}:`, error)
      setResults(prev => ({ ...prev, [feature]: { error: error.message } }))
    } finally {
      setLoading(null)
    }
  }

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAudioFile(file)
    }
  }

  const testVoiceToText = () => {
    if (!audioFile) return
    const formData = new FormData()
    formData.append('audio', audioFile)
    formData.append('language', 'en')
    testFeature('voice-to-text', formData)
  }

  const getSentimentIcon = (emotion: string) => {
    switch (emotion?.toLowerCase()) {
      case 'happy':
      case 'confident':
      case 'excited':
        return <Smile className="h-4 w-4 text-green-500" />
      case 'sad':
      case 'stressed':
      case 'anxious':
        return <Frown className="h-4 w-4 text-red-500" />
      default:
        return <Meh className="h-4 w-4 text-yellow-500" />
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const features = [
    {
      id: 'quality',
      title: 'Question Quality Analysis',
      icon: <CheckCircle className="h-5 w-5" />,
      description: 'Analyze question quality and educational value',
      testData: {
        questions: [
          {
            question: inputText || "What is the capital of Bangladesh?",
            options: ["Dhaka", "Chittagong", "Sylhet", "Rajshahi"],
            correctAnswer: "Dhaka",
            marks: 1,
            difficulty: "easy",
            subject: "Geography"
          }
        ],
        subject: 'Geography',
        type: 'Practice'
      }
    },
    {
      id: 'translate',
      title: 'Bengali Translation',
      icon: <Languages className="h-5 w-5" />,
      description: 'Translate content between English and Bengali',
      testData: {
        text: inputText || "What is the capital of Bangladesh?",
        fromLanguage: 'english',
        toLanguage: 'bengali',
        context: 'Geography exam question'
      }
    },
    {
      id: 'adaptive-learning',
      title: 'Adaptive Learning',
      icon: <Brain className="h-5 w-5" />,
      description: 'Create personalized learning paths',
      testData: {
        studentId: "test-student-123",
        completedTopics: ["Basic Geography", "World Capitals"],
        strugglingAreas: ["Advanced Mathematics", "Physics"],
        learningStyle: "visual",
        studyTime: 120,
        performanceHistory: [85, 78, 92, 88, 76]
      }
    },
    {
      id: 'predictive-analytics',
      title: 'Predictive Analytics',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Forecast exam outcomes and performance',
      testData: {
        studentData: {
          studentId: "test-student-123",
          completedTopics: ["Basic Geography", "World Capitals"],
          strugglingAreas: ["Advanced Mathematics", "Physics"],
          performanceHistory: [85, 78, 92, 88, 76]
        },
        examType: 'midterm',
        subject: 'Geography'
      }
    },
    {
      id: 'smart-notifications',
      title: 'Smart Notifications',
      icon: <Bell className="h-5 w-5" />,
      description: 'Generate personalized study reminders',
      testData: {
        studentData: {
          studentId: "test-student-123",
          completedTopics: ["Basic Geography", "World Capitals"],
          strugglingAreas: ["Advanced Mathematics", "Physics"],
          studyTime: 120
        },
        notificationType: 'study_reminder',
        context: 'exam_preparation'
      }
    },
    {
      id: 'auto-grading',
      title: 'Auto-grading',
      icon: <FileText className="h-5 w-5" />,
      description: 'Automatically grade subjective answers',
      testData: {
        question: "What is the capital of Bangladesh and why is it important?",
        studentAnswer: inputText || "The capital of Bangladesh is Dhaka. It is the largest city and serves as the political, economic, and cultural center of the country.",
        maxMarks: 5,
        subject: 'Geography'
      }
    },
    {
      id: 'concept-mapping',
      title: 'Concept Mapping',
      icon: <Map className="h-5 w-5" />,
      description: 'Create visual knowledge relationships',
      testData: {
        topic: inputText || 'Geography of Bangladesh',
        subject: 'Geography',
        educationLevel: 'secondary'
      }
    },
    {
      id: 'adaptive-testing',
      title: 'Adaptive Testing',
      icon: <Shuffle className="h-5 w-5" />,
      description: 'Dynamically adjust question difficulty',
      testData: {
        studentData: {
          studentId: "test-student-123",
          performanceHistory: [85, 78, 92, 88, 76]
        },
        currentQuestion: {
          question: "What is the capital of Bangladesh?",
          difficulty: "easy"
        },
        previousAnswers: [
          { correct: true, difficulty: 'easy', timeSpent: 30 },
          { correct: false, difficulty: 'medium', timeSpent: 45 }
        ],
        subject: 'Geography'
      }
    },
    {
      id: 'plagiarism-detection',
      title: 'Plagiarism Detection',
      icon: <Search className="h-5 w-5" />,
      description: 'Detect copied content in student answers',
      testData: {
        studentAnswer: inputText || "The capital of Bangladesh is Dhaka. It is the largest city and serves as the political, economic, and cultural center of the country.",
        referenceTexts: [
          "Dhaka is the capital and largest city of Bangladesh.",
          "The capital city serves as the main political center."
        ],
        threshold: 0.7,
        language: 'en'
      }
    },
    {
      id: 'text-to-speech',
      title: 'Text-to-Speech',
      icon: <Volume2 className="h-5 w-5" />,
      description: 'Convert text to natural speech',
      testData: {
        text: inputText || "Hello, this is a test of the text-to-speech functionality.",
        language: 'en',
        voice: 'alloy',
        speed: 1.0
      }
    },
    {
      id: 'sentiment-analysis',
      title: 'Sentiment Analysis',
      icon: <Smile className="h-5 w-5" />,
      description: 'Analyze student emotional state and stress levels',
      testData: {
        text: inputText || "I am feeling very stressed about my upcoming exams. I have been studying for hours but I still don't feel prepared.",
        context: 'exam_preparation',
        language: 'en',
        includeRecommendations: true
      }
    }
  ]

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI Features Dashboard</h1>
        <p className="text-muted-foreground">
          Test and explore all AI-powered features using Llama 4 Scout model
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Configuration</CardTitle>
          <CardDescription>
            Configure input text and audio for testing AI features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Test Text Input</label>
            <Textarea
              placeholder="Enter text to test various AI features..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Audio File (for Voice-to-Text)</label>
            <Input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              ref={fileInputRef}
              className="mt-1"
            />
            {audioFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {audioFile.name}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeFeature} onValueChange={setActiveFeature}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-6 gap-1">
          {features.slice(0, 6).map((feature) => (
            <TabsTrigger key={feature.id} value={feature.id} className="text-xs">
              {feature.icon}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsList className="grid grid-cols-4 lg:grid-cols-6 gap-1 mt-2">
          {features.slice(6).map((feature) => (
            <TabsTrigger key={feature.id} value={feature.id} className="text-xs">
              {feature.icon}
            </TabsTrigger>
          ))}
        </TabsList>

        {features.map((feature) => (
          <TabsContent key={feature.id} value={feature.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  {feature.icon}
                  <CardTitle>{feature.title}</CardTitle>
                </div>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => {
                    if (feature.id === 'voice-to-text') {
                      testVoiceToText()
                    } else {
                      testFeature(feature.id, feature.testData)
                    }
                  }}
                  disabled={loading === feature.id || (feature.id === 'voice-to-text' && !audioFile)}
                  className="w-full"
                >
                  {loading === feature.id ? 'Testing...' : `Test ${feature.title}`}
                </Button>

                {results[feature.id] && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Results:</h4>
                    
                    {/* Question Quality Results */}
                    {feature.id === 'quality' && results[feature.id].success && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Overall Quality Score:</span>
                          <Badge className={getQualityColor(results[feature.id].quality_analysis?.overall_score || 0)}>
                            {((results[feature.id].quality_analysis?.overall_score || 0) * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <Progress value={(results[feature.id].quality_analysis?.overall_score || 0) * 100} />
                      </div>
                    )}

                    {/* Translation Results */}
                    {feature.id === 'translate' && results[feature.id].success && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-medium">Translation:</p>
                        <p className="text-sm">{results[feature.id].translatedText}</p>
                      </div>
                    )}

                    {/* Sentiment Analysis Results */}
                    {feature.id === 'sentiment-analysis' && results[feature.id].success && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getSentimentIcon(results[feature.id].sentiment_analysis?.primary_emotion)}
                          <span>Primary Emotion: {results[feature.id].sentiment_analysis?.primary_emotion}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Stress Level:</span>
                          <Badge variant={
                            results[feature.id].sentiment_analysis?.stress_level === 'high' ? 'destructive' :
                            results[feature.id].sentiment_analysis?.stress_level === 'medium' ? 'secondary' : 'default'
                          }>
                            {results[feature.id].sentiment_analysis?.stress_level}
                          </Badge>
                        </div>
                        {results[feature.id].sentiment_analysis?.intervention_needed && (
                          <div className="flex items-center space-x-2 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">Intervention recommended</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Plagiarism Detection Results */}
                    {feature.id === 'plagiarism-detection' && results[feature.id].success && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Plagiarism Score:</span>
                          <Badge variant={
                            results[feature.id].plagiarism_analysis?.risk_level === 'high' ? 'destructive' :
                            results[feature.id].plagiarism_analysis?.risk_level === 'medium' ? 'secondary' : 'default'
                          }>
                            {((results[feature.id].plagiarism_analysis?.overall_score || 0) * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <Progress value={(results[feature.id].plagiarism_analysis?.overall_score || 0) * 100} />
                      </div>
                    )}

                    {/* Auto-grading Results */}
                    {feature.id === 'auto-grading' && results[feature.id].success && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Awarded Marks:</span>
                          <Badge>
                            {results[feature.id].grading_result?.awarded_marks || 0} / {results[feature.id].grading_result?.max_marks || 5}
                          </Badge>
                        </div>
                        <Progress value={((results[feature.id].grading_result?.awarded_marks || 0) / (results[feature.id].grading_result?.max_marks || 5)) * 100} />
                      </div>
                    )}

                    {/* Generic JSON Results */}
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium">View Raw Results</summary>
                      <pre className="mt-2 p-3 bg-muted rounded-lg overflow-auto text-xs">
                        {JSON.stringify(results[feature.id], null, 2)}
                      </pre>
                    </details>
                  </div>
                )}

                {results[feature.id]?.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">Error: {results[feature.id].error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Feature Status Overview</CardTitle>
          <CardDescription>
            Quick overview of all AI features and their test status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  activeFeature === feature.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => setActiveFeature(feature.id)}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {feature.icon}
                  <span className="text-sm font-medium truncate">{feature.title}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {results[feature.id]?.success ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : results[feature.id]?.error ? (
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-gray-300" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {results[feature.id]?.success ? 'Tested' : results[feature.id]?.error ? 'Error' : 'Not tested'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}