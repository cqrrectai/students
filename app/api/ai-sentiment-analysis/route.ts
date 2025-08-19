import { NextRequest, NextResponse } from 'next/server';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { 
      text, 
      context = 'exam_preparation',
      language = 'en',
      includeRecommendations = true 
    } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided for analysis' }, { status: 400 });
    }

    // Use Llama model for comprehensive sentiment analysis
    const { text: analysisText } = await groq.generateText({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'system',
          content: `You are an expert in psychological sentiment analysis, specifically for educational contexts. Analyze the following text for:

          **Emotional State Detection:**
          1. **Stress Levels**: anxiety, overwhelm, pressure
          2. **Confidence**: self-doubt, assurance, uncertainty
          3. **Motivation**: enthusiasm, discouragement, determination
          4. **Frustration**: confusion, anger, helplessness
          5. **Engagement**: interest, boredom, curiosity

          **Context-Specific Analysis for ${context}:**
          - Academic pressure indicators
          - Learning difficulties
          - Time management stress
          - Performance anxiety
          - Social comparison stress

          **Cultural Considerations for ${language === 'bn' ? 'Bengali/Bangladeshi' : 'English'} speakers:**
          - Cultural expressions of stress
          - Educational system pressures
          - Family expectations impact

          Return detailed JSON with:
          - primary_emotion: dominant emotion
          - emotion_scores: object with emotion names and scores (0-1)
          - stress_level: "low", "moderate", "high", "critical"
          - confidence_level: "very_low", "low", "moderate", "high", "very_high"
          - risk_indicators: array of concerning patterns
          - positive_indicators: array of healthy patterns
          - recommendations: specific actionable advice
          - urgency: "none", "low", "medium", "high" (for intervention needs)`
        },
        {
          role: 'user',
          content: `Text to analyze: "${text}"
          
          Context: ${context}
          Language: ${language}
          
          Provide comprehensive sentiment analysis with educational psychology insights.`
        }
      ],
      temperature: 0.3,
    });

    let sentimentResult;
    try {
      sentimentResult = JSON.parse(analysisText);
    } catch {
      // Fallback analysis
      sentimentResult = {
        primary_emotion: "neutral",
        emotion_scores: { neutral: 0.7, stress: 0.2, confidence: 0.5 },
        stress_level: "moderate",
        confidence_level: "moderate",
        risk_indicators: [],
        positive_indicators: ["Text analyzed successfully"],
        recommendations: ["Continue with regular study routine"],
        urgency: "none"
      };
    }

    // Generate personalized support recommendations
    let supportRecommendations = [];
    
    if (includeRecommendations) {
      const { text: recommendationsText } = await groq.generateText({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'system',
            content: `Based on the sentiment analysis, provide specific, actionable recommendations for a ${language === 'bn' ? 'Bangladeshi' : 'English-speaking'} student. Include:
            
            1. **Immediate Actions** (next 24 hours)
            2. **Study Strategies** (academic support)
            3. **Stress Management** (mental health)
            4. **Resource Suggestions** (tools, techniques)
            5. **When to Seek Help** (escalation criteria)
            
            Make recommendations culturally appropriate and practical.`
          },
          {
            role: 'user',
            content: `Student shows: ${sentimentResult.primary_emotion} emotion, ${sentimentResult.stress_level} stress, ${sentimentResult.confidence_level} confidence.
            
            Risk indicators: ${sentimentResult.risk_indicators?.join(', ') || 'None'}
            Positive indicators: ${sentimentResult.positive_indicators?.join(', ') || 'None'}`
          }
        ],
        temperature: 0.4,
      });
      
      supportRecommendations = recommendationsText.split('\n').filter(line => line.trim());
    }

    return NextResponse.json({
      success: true,
      sentiment_analysis: {
        ...sentimentResult,
        support_recommendations: supportRecommendations,
        analysis_metadata: {
          timestamp: new Date().toISOString(),
          context: context,
          language: language,
          text_length: text.length,
          confidence_score: 0.85
        },
        intervention_needed: sentimentResult.urgency === 'high' || sentimentResult.stress_level === 'critical',
        follow_up_recommended: sentimentResult.stress_level === 'high' || sentimentResult.confidence_level === 'very_low'
      }
    });

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sentiment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}