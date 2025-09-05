import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { generateId } from '@/lib/utils';
import { LegalGuide } from '@/lib/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const language = searchParams.get('language') as 'en' | 'es';

    if (!state || !language) {
      return NextResponse.json(
        { success: false, error: 'State and language are required' },
        { status: 400 }
      );
    }

    // First, try to get existing guide from database
    const { data: existingGuide, error: fetchError } = await supabase
      .from('legal_guides')
      .select('*')
      .eq('state', state)
      .eq('language', language)
      .single();

    if (existingGuide && !fetchError) {
      return NextResponse.json({
        success: true,
        data: existingGuide,
      });
    }

    // If no existing guide, generate one using OpenAI
    const prompt = `Generate a comprehensive legal rights guide for ${state} in ${language === 'en' ? 'English' : 'Spanish'}. 

Include:
1. State-specific rights during police encounters
2. Key laws and statutes relevant to citizen interactions with law enforcement
3. "What to say" scripts for common scenarios (traffic stops, questioning, searches)
4. Important state-specific considerations and exceptions

Format as JSON with:
- title: Brief title for the guide
- content: Detailed legal information (markdown format)
- script: Key phrases and scripts for interactions

Keep it accurate, practical, and focused on citizen rights and safety.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a legal expert specializing in constitutional rights and state-specific law enforcement interaction guidelines. Provide accurate, practical information while emphasizing that this is general information and not legal advice.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const generatedContent = completion.choices[0]?.message?.content;
    if (!generatedContent) {
      throw new Error('Failed to generate legal guide content');
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch {
      // If JSON parsing fails, create structured content
      parsedContent = {
        title: `${state} Legal Rights Guide`,
        content: generatedContent,
        script: 'I am exercising my constitutional rights. I wish to remain silent and speak to an attorney.',
      };
    }

    // Save the generated guide to database
    const newGuide: Omit<LegalGuide, 'createdAt' | 'updatedAt'> = {
      guideId: generateId(),
      state,
      language,
      title: parsedContent.title,
      content: parsedContent.content,
      script: parsedContent.script,
    };

    const { data: savedGuide, error: saveError } = await supabase
      .from('legal_guides')
      .insert([{
        ...newGuide,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save guide:', saveError);
      // Return generated content even if save fails
      return NextResponse.json({
        success: true,
        data: { ...newGuide, createdAt: new Date(), updatedAt: new Date() },
        message: 'Guide generated successfully (not cached)',
      });
    }

    return NextResponse.json({
      success: true,
      data: savedGuide,
      message: 'Guide generated and cached successfully',
    });

  } catch (error) {
    console.error('Legal guide error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch legal guide' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { state, language, title, content, script } = await request.json();

    if (!state || !language || !title || !content || !script) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const newGuide: Omit<LegalGuide, 'createdAt' | 'updatedAt'> = {
      guideId: generateId(),
      state,
      language,
      title,
      content,
      script,
    };

    const { data: savedGuide, error } = await supabase
      .from('legal_guides')
      .insert([{
        ...newGuide,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: savedGuide,
      message: 'Legal guide created successfully',
    });

  } catch (error) {
    console.error('Create legal guide error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create legal guide' },
      { status: 500 }
    );
  }
}
