import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PREMIUM_FEATURES } from '@/lib/constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Verify Base transaction (simplified - in production you'd use proper RPC calls)
async function verifyBaseTransaction(txHash: string, expectedAmount: number): Promise<boolean> {
  try {
    // In a real implementation, you would:
    // 1. Use Base RPC to get transaction details
    // 2. Verify the transaction is confirmed
    // 3. Verify the amount and recipient
    // 4. Verify the transaction is recent
    
    const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [txHash],
        id: 1,
      }),
    });

    const result = await response.json();
    
    if (!result.result) {
      return false;
    }

    // Simplified verification - in production, you'd check:
    // - Transaction status (confirmed)
    // - Value matches expected amount
    // - Recipient is correct
    // - Transaction is recent
    
    console.log('Transaction verified:', result.result);
    return true;

  } catch (error) {
    console.error('Transaction verification failed:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, featureKey, txHash, amount } = await request.json();

    if (!userId || !featureKey || !txHash || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate feature exists
    const feature = PREMIUM_FEATURES[featureKey as keyof typeof PREMIUM_FEATURES];
    if (!feature) {
      return NextResponse.json(
        { success: false, error: 'Invalid feature' },
        { status: 400 }
      );
    }

    // Verify amount matches feature price
    if (amount !== feature.price) {
      return NextResponse.json(
        { success: false, error: 'Amount mismatch' },
        { status: 400 }
      );
    }

    // Verify transaction on Base
    const isValidTransaction = await verifyBaseTransaction(txHash, amount);
    if (!isValidTransaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction verification failed' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('userId', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has this feature
    if (user.premiumFeatures.includes(featureKey)) {
      return NextResponse.json(
        { success: false, error: 'Feature already unlocked' },
        { status: 400 }
      );
    }

    // Add feature to user's premium features
    const updatedFeatures = [...user.premiumFeatures, featureKey];

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        premiumFeatures: updatedFeatures,
        updatedAt: new Date().toISOString(),
      })
      .eq('userId', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log the purchase (optional - for analytics)
    await supabase
      .from('purchase_logs')
      .insert([{
        userId,
        featureKey,
        amount,
        txHash,
        createdAt: new Date().toISOString(),
      }]);

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        unlockedFeature: feature,
      },
      message: `${feature.name} unlocked successfully!`,
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

// Get user's premium features
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('premiumFeatures')
      .eq('userId', userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Map feature keys to feature details
    const unlockedFeatures = user.premiumFeatures.map((key: string) => ({
      key,
      ...PREMIUM_FEATURES[key as keyof typeof PREMIUM_FEATURES],
    }));

    const availableFeatures = Object.entries(PREMIUM_FEATURES)
      .filter(([key]) => !user.premiumFeatures.includes(key))
      .map(([key, feature]) => ({
        key,
        ...feature,
      }));

    return NextResponse.json({
      success: true,
      data: {
        unlocked: unlockedFeatures,
        available: availableFeatures,
      },
    });

  } catch (error) {
    console.error('Get premium features error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch premium features' },
      { status: 500 }
    );
  }
}

// Validate feature access
export async function PATCH(request: NextRequest) {
  try {
    const { userId, featureKey } = await request.json();

    if (!userId || !featureKey) {
      return NextResponse.json(
        { success: false, error: 'User ID and feature key are required' },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('premiumFeatures')
      .eq('userId', userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const hasAccess = user.premiumFeatures.includes(featureKey);

    return NextResponse.json({
      success: true,
      data: {
        hasAccess,
        feature: PREMIUM_FEATURES[featureKey as keyof typeof PREMIUM_FEATURES],
      },
    });

  } catch (error) {
    console.error('Feature validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Feature validation failed' },
      { status: 500 }
    );
  }
}
