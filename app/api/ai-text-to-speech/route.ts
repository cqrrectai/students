import { NextRequest, NextResponse } from 'next/server';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { text, language = 'en', voice = 'alloy', speed = 1.0 } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // For Bengali text, first optimize pronunciation
    let processedText = text;
    
    if (language === 'bn') {
      const { text: optimizedText } = await groq.generateText({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'system',
            content: `You are a Bengali pronunciation expert. Optimize the following Bengali text for text-to-speech by:
            1. Adding phonetic markers where needed
            2. Breaking down complex words
            3. Adding pronunciation guides for difficult terms
            4. Ensuring proper stress patterns
            
            Return the optimized Bengali text with pronunciation guides in parentheses where helpful.`
          },
          {
            role: 'user',
            content: `Text to optimize: ${text}`
          }
        ],
        temperature: 0.2,
      });
      
      processedText = optimizedText;
    }

    // Use OpenAI-compatible TTS API through Groq or fallback
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: processedText,
        voice: voice,
        speed: speed,
        response_format: 'mp3'
      }),
    });

    if (!ttsResponse.ok) {
      // Fallback to browser-based TTS instructions
      return NextResponse.json({
        success: true,
        audioUrl: null,
        fallback: true,
        instructions: {
          text: processedText,
          language: language,
          voice: voice,
          speed: speed,
          message: 'Use browser Speech Synthesis API as fallback'
        }
      });
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      audio: {
        data: audioBase64,
        format: 'mp3',
        text: processedText,
        language: language,
        voice: voice,
        speed: speed
      },
      fallback: false
    });

  } catch (error) {
    console.error('Text-to-speech error:', error);
    
    // Return fallback instructions
    return NextResponse.json({
      success: true,
      audioUrl: null,
      fallback: true,
      instructions: {
        text: processedText || text,
        language: language,
        voice: voice,
        speed: speed,
        message: 'Use browser Speech Synthesis API as fallback'
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}