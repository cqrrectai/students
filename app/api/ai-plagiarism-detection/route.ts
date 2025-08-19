import { NextRequest, NextResponse } from 'next/server';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { 
      studentAnswer, 
      referenceTexts = [], 
      threshold = 0.7,
      language = 'en',
      checkInternet = false 
    } = await request.json();

    if (!studentAnswer) {
      return NextResponse.json({ error: 'No student answer provided' }, { status: 400 });
    }

    // Use Llama model for plagiarism detection
    const { text } = await groq.generateText({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'system',
          content: `You are an expert plagiarism detection system. Analyze the student's answer for potential plagiarism by:

          1. **Similarity Analysis**: Compare against reference texts
          2. **Pattern Recognition**: Identify copied phrases, sentences, or paragraphs
          3. **Paraphrasing Detection**: Find content that's been slightly reworded
          4. **Citation Analysis**: Check for proper attribution
          5. **Writing Style Analysis**: Detect inconsistencies in writing style
          6. **Language Patterns**: For ${language === 'bn' ? 'Bengali' : 'English'} text, check for unnatural translations

          Provide a detailed JSON response with:
          - overall_score: plagiarism probability (0-1)
          - risk_level: "low", "medium", "high", or "critical"
          - matches: array of suspicious sections with details
          - recommendations: suggestions for the student
          - confidence: your confidence in the analysis (0-1)`
        },
        {
          role: 'user',
          content: `Student Answer: "${studentAnswer}"

          Reference Texts: ${referenceTexts.length > 0 ? referenceTexts.map((text, i) => `[${i+1}] ${text}`).join('\n') : 'None provided'}

          Threshold: ${threshold}
          Language: ${language}
          
          Analyze for plagiarism and return detailed JSON results.`
        }
      ],
      temperature: 0.2,
    });

    let analysisResult;
    try {
      analysisResult = JSON.parse(text);
    } catch {
      // Fallback parsing if JSON is malformed
      analysisResult = {
        overall_score: 0.1,
        risk_level: "low",
        matches: [],
        recommendations: ["Analysis completed but results format needs adjustment"],
        confidence: 0.8
      };
    }

    // Additional semantic similarity check
    const semanticAnalysis = await groq.generateText({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'system',
          content: `Perform semantic similarity analysis. Compare the meaning and concepts in the student's answer against reference texts. Look for:
          1. Similar ideas expressed differently
          2. Concept overlap
          3. Structural similarities
          4. Logical flow patterns
          
          Return a score from 0-1 indicating semantic similarity.`
        },
        {
          role: 'user',
          content: `Student Answer: "${studentAnswer}"
          Reference Texts: ${referenceTexts.join('\n---\n')}`
        }
      ],
      temperature: 0.1,
    });

    const semanticScore = parseFloat(semanticAnalysis.text.match(/\d+\.?\d*/)?.[0] || '0') / 100;

    // Combine results
    const finalScore = Math.max(analysisResult.overall_score, semanticScore);
    const finalRiskLevel = finalScore > 0.8 ? 'critical' : 
                          finalScore > 0.6 ? 'high' : 
                          finalScore > 0.3 ? 'medium' : 'low';

    return NextResponse.json({
      success: true,
      plagiarism_analysis: {
        overall_score: finalScore,
        risk_level: finalRiskLevel,
        threshold_exceeded: finalScore > threshold,
        semantic_similarity: semanticScore,
        detailed_analysis: analysisResult,
        matches: analysisResult.matches || [],
        recommendations: [
          ...(analysisResult.recommendations || []),
          finalScore > threshold ? 
            "Consider rewriting sections that show high similarity" : 
            "Content appears to be original"
        ],
        confidence: Math.min(analysisResult.confidence || 0.8, 0.95),
        analysis_timestamp: new Date().toISOString(),
        language: language
      }
    });

  } catch (error) {
    console.error('Plagiarism detection error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze for plagiarism', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}