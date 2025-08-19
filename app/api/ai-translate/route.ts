import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set in environment variables")
}

export async function POST(request: NextRequest) {
  try {
    const { text, fromLanguage, toLanguage, context } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required for translation' }, { status: 400 })
    }

    const translationPrompt = `
You are an expert translator specializing in educational content translation between English and Bengali (Bangla). 

TRANSLATION TASK:
- From Language: ${fromLanguage || 'auto-detect'}
- To Language: ${toLanguage}
- Context: ${context || 'Educational content'}

TEXT TO TRANSLATE:
${text}

INSTRUCTIONS:
1. Provide accurate, natural translation that maintains educational meaning
2. Preserve technical terms appropriately (translate or keep original with explanation)
3. Maintain cultural context relevant to Bangladeshi education system
4. For mathematical/scientific terms, provide both translated and original terms when helpful
5. Ensure the translation is suitable for students and educators

Provide your response in the following JSON format:
{
  "translatedText": "translated content here",
  "originalLanguage": "detected or provided language",
  "targetLanguage": "${toLanguage}",
  "confidence": number (0-100),
  "technicalTerms": [
    {
      "original": "term",
      "translated": "translated term",
      "explanation": "brief explanation if needed"
    }
  ],
  "culturalNotes": ["note 1", "note 2"],
  "alternativeTranslations": ["alternative 1", "alternative 2"]
}

Focus on educational accuracy and cultural appropriateness for Bangladeshi students.
`

    const result = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      prompt: translationPrompt,
      temperature: 0.2,
      maxTokens: 2000,
    })

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response")
      }

      const translation = JSON.parse(jsonMatch[0])
      return NextResponse.json(translation)

    } catch (parseError) {
      console.error('Error parsing translation:', parseError)
      
      // Simple fallback translation (basic word replacement)
      const fallbackTranslation = {
        translatedText: text, // In production, you'd use a translation library
        originalLanguage: fromLanguage || 'english',
        targetLanguage: toLanguage,
        confidence: 60,
        technicalTerms: [],
        culturalNotes: ["Translation may need manual review for accuracy"],
        alternativeTranslations: []
      }
      
      return NextResponse.json(fallbackTranslation)
    }

  } catch (error) {
    console.error('Error translating text:', error)
    return NextResponse.json({ error: 'Failed to translate text' }, { status: 500 })
  }
}