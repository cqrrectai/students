import { NextRequest, NextResponse } from 'next/server';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert audio to base64 for processing
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    // Use Groq's Whisper model for speech-to-text
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to transcribe audio');
    }

    const transcription = await response.json();

    // Post-process for Bengali language if needed
    let processedText = transcription.text;
    
    if (language === 'bn') {
      // Use Llama model to improve Bengali transcription
      const { text } = await groq.generateText({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'system',
            content: `You are a Bengali language expert. Improve the following transcribed Bengali text by:
            1. Correcting any transcription errors
            2. Adding proper punctuation
            3. Ensuring grammatical correctness
            4. Maintaining the original meaning
            
            Return only the corrected Bengali text.`
          },
          {
            role: 'user',
            content: `Original transcription: ${processedText}`
          }
        ],
        temperature: 0.3,
      });
      
      processedText = text;
    }

    return NextResponse.json({
      success: true,
      transcription: {
        original: transcription.text,
        processed: processedText,
        language: language,
        confidence: transcription.confidence || 0.95,
        duration: transcription.duration || 0
      }
    });

  } catch (error) {
    console.error('Voice-to-text error:', error);
    return NextResponse.json(
      { error: 'Failed to process audio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}