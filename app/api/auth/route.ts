import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateId } from '@/lib/utils';
import { User } from '@/lib/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { farcasterProfile, selectedState } = await request.json();

    if (!farcasterProfile) {
      return NextResponse.json(
        { success: false, error: 'Farcaster profile is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('farcasterProfile', farcasterProfile)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          selectedState: selectedState || existingUser.selectedState,
          updatedAt: new Date().toISOString(),
        })
        .eq('userId', existingUser.userId)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
      });
    }

    // Create new user
    const newUser: Omit<User, 'createdAt' | 'updatedAt'> = {
      userId: generateId(),
      farcasterProfile,
      selectedState: selectedState || 'California',
      premiumFeatures: [],
    };

    const { data: createdUser, error: createError } = await supabase
      .from('users')
      .insert([{
        ...newUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json({
      success: true,
      data: createdUser,
      message: 'User created successfully',
    });

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farcasterProfile = searchParams.get('farcasterProfile');

    if (!farcasterProfile) {
      return NextResponse.json(
        { success: false, error: 'Farcaster profile is required' },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('farcasterProfile', farcasterProfile)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
