import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set in environment variables")
}

export async function POST(request: NextRequest) {
  try {
    const { 
      subject,
      topics,
      learningLevel,
      curriculum = 'Bangladeshi'
    } = await request.json()

    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
    }

    const conceptMappingPrompt = `
You are an expert educational content analyst specializing in creating comprehensive concept maps for ${curriculum} curriculum.

SUBJECT: ${subject}
TOPICS: ${topics?.join(', ') || 'All major topics'}
LEARNING LEVEL: ${learningLevel || 'Secondary'}
CURRICULUM: ${curriculum}

Create a detailed concept map showing relationships between concepts in the following JSON format:
{
  "conceptMap": {
    "subject": "${subject}",
    "totalConcepts": number,
    "difficultyLevels": ["beginner", "intermediate", "advanced"],
    "learningPathways": [
      {
        "pathway": "pathway name",
        "description": "pathway description",
        "concepts": ["concept1", "concept2", "concept3"],
        "estimatedTime": "time to complete",
        "prerequisites": ["prerequisite1", "prerequisite2"]
      }
    ]
  },
  "concepts": [
    {
      "id": "unique_concept_id",
      "name": "concept name",
      "description": "detailed description",
      "difficulty": "beginner|intermediate|advanced",
      "category": "category name",
      "prerequisites": ["prerequisite_concept_ids"],
      "dependents": ["dependent_concept_ids"],
      "keywords": ["keyword1", "keyword2"],
      "learningObjectives": ["objective1", "objective2"],
      "estimatedStudyTime": "hours needed",
      "importance": "high|medium|low",
      "examFrequency": "very_common|common|occasional|rare",
      "realWorldApplications": ["application1", "application2"],
      "commonMisconceptions": ["misconception1", "misconception2"],
      "studyTips": ["tip1", "tip2"],
      "relatedFormulas": ["formula1", "formula2"],
      "practiceQuestionTypes": ["type1", "type2"]
    }
  ],
  "relationships": [
    {
      "from": "concept_id",
      "to": "concept_id",
      "type": "prerequisite|builds_on|related_to|applies_to|contrasts_with",
      "strength": "strong|medium|weak",
      "description": "relationship description"
    }
  ],
  "visualStructure": {
    "clusters": [
      {
        "name": "cluster name",
        "concepts": ["concept_ids"],
        "color": "suggested color for visualization",
        "position": "suggested layout position"
      }
    ],
    "hierarchyLevels": [
      {
        "level": number,
        "concepts": ["concept_ids"],
        "description": "what this level represents"
      }
    ]
  },
  "studyRecommendations": {
    "beginnerPath": ["concept_ids in order"],
    "intermediatePath": ["concept_ids in order"],
    "advancedPath": ["concept_ids in order"],
    "reviewCycle": "suggested review pattern",
    "assessmentPoints": ["when to test understanding"],
    "commonStruggles": ["struggle1", "struggle2"],
    "successStrategies": ["strategy1", "strategy2"]
  },
  "curriculumAlignment": {
    "standardsMapping": [
      {
        "standard": "curriculum standard",
        "concepts": ["mapped_concept_ids"],
        "grade": "grade level"
      }
    ],
    "examTopics": [
      {
        "examType": "SSC|HSC|University",
        "weightage": "percentage",
        "concepts": ["concept_ids"],
        "questionTypes": ["type1", "type2"]
      }
    ]
  }
}

Focus on:
1. Bangladeshi curriculum standards and exam patterns
2. Logical learning progression from basic to advanced
3. Real-world applications relevant to Bangladesh
4. Common student difficulties and misconceptions
5. Practical study strategies and time management
6. Integration with other subjects where applicable
7. Cultural context and local examples
8. Exam preparation strategies specific to Bangladeshi education system
`

    const result = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      prompt: conceptMappingPrompt,
      temperature: 0.4,
      maxTokens: 4000,
    })

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response")
      }

      const conceptMap = JSON.parse(jsonMatch[0])
      return NextResponse.json(conceptMap)

    } catch (parseError) {
      console.error('Error parsing concept map:', parseError)
      
      // Fallback concept map for common subjects
      const fallbackMap = {
        conceptMap: {
          subject: subject,
          totalConcepts: 10,
          difficultyLevels: ["beginner", "intermediate", "advanced"],
          learningPathways: [
            {
              pathway: "Foundation to Advanced",
              description: `Complete learning path for ${subject}`,
              concepts: ["basics", "intermediate_concepts", "advanced_topics"],
              estimatedTime: "3-6 months",
              prerequisites: ["Basic mathematics", "Reading comprehension"]
            }
          ]
        },
        concepts: [
          {
            id: "basic_concepts",
            name: `Basic ${subject} Concepts`,
            description: `Fundamental concepts in ${subject}`,
            difficulty: "beginner",
            category: "Foundation",
            prerequisites: [],
            dependents: ["intermediate_concepts"],
            keywords: [subject.toLowerCase(), "basics", "foundation"],
            learningObjectives: [`Understand basic ${subject} principles`],
            estimatedStudyTime: "2-3 hours",
            importance: "high",
            examFrequency: "very_common",
            realWorldApplications: ["Daily life applications"],
            commonMisconceptions: ["Common beginner mistakes"],
            studyTips: ["Start with examples", "Practice regularly"],
            relatedFormulas: [],
            practiceQuestionTypes: ["Multiple choice", "Short answer"]
          }
        ],
        relationships: [
          {
            from: "basic_concepts",
            to: "intermediate_concepts",
            type: "prerequisite",
            strength: "strong",
            description: "Basic concepts are essential for intermediate understanding"
          }
        ],
        visualStructure: {
          clusters: [
            {
              name: "Foundation",
              concepts: ["basic_concepts"],
              color: "#4CAF50",
              position: "center-bottom"
            }
          ],
          hierarchyLevels: [
            {
              level: 1,
              concepts: ["basic_concepts"],
              description: "Foundation level concepts"
            }
          ]
        },
        studyRecommendations: {
          beginnerPath: ["basic_concepts"],
          intermediatePath: ["basic_concepts", "intermediate_concepts"],
          advancedPath: ["basic_concepts", "intermediate_concepts", "advanced_concepts"],
          reviewCycle: "Review after 1 day, 3 days, 1 week",
          assessmentPoints: ["After each concept cluster"],
          commonStruggles: ["Understanding fundamentals", "Connecting concepts"],
          successStrategies: ["Regular practice", "Concept mapping", "Real-world examples"]
        },
        curriculumAlignment: {
          standardsMapping: [
            {
              standard: `${curriculum} ${subject} Standard`,
              concepts: ["basic_concepts"],
              grade: learningLevel || "Secondary"
            }
          ],
          examTopics: [
            {
              examType: "SSC",
              weightage: "30%",
              concepts: ["basic_concepts"],
              questionTypes: ["MCQ", "Short Answer"]
            }
          ]
        }
      }
      
      return NextResponse.json(fallbackMap)
    }

  } catch (error) {
    console.error('Error creating concept map:', error)
    return NextResponse.json({ error: 'Failed to create concept map' }, { status: 500 })
  }
}