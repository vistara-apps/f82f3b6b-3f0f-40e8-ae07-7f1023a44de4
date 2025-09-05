import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateId } from '@/lib/utils';
import { AlertLog } from '@/lib/types';
import { ALERT_TEMPLATES } from '@/lib/constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Send SMS via Twilio (you would need to set up Twilio)
async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    // In a real implementation, you would use Twilio or another SMS service
    // For now, we'll simulate the SMS sending
    console.log(`SMS to ${to}: ${message}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate 95% success rate
    return Math.random() > 0.05;
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
}

// Send Farcaster notification (via Neynar or direct API)
async function sendFarcasterNotification(username: string, message: string): Promise<boolean> {
  try {
    // In a real implementation, you would use Farcaster's API
    console.log(`Farcaster notification to @${username}: ${message}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate 90% success rate
    return Math.random() > 0.1;
  } catch (error) {
    console.error('Farcaster notification failed:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      incidentRecordId,
      recipients,
      alertType = 'emergency',
      language = 'en',
      location,
      customMessage,
    } = await request.json();

    if (!userId || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User ID and recipients are required' },
        { status: 400 }
      );
    }

    const template = ALERT_TEMPLATES[language as 'en' | 'es'][alertType as keyof typeof ALERT_TEMPLATES.en];
    const baseMessage = customMessage || template;
    
    const message = baseMessage
      .replace('{location}', location || 'Location unavailable')
      .replace('{time}', new Date().toLocaleString());

    const alertResults: AlertLog[] = [];

    // Send alerts to all recipients
    for (const recipient of recipients) {
      const alertId = generateId();
      let status: 'sent' | 'delivered' | 'failed' = 'failed';

      try {
        // Determine recipient type and send appropriate notification
        if (recipient.includes('@')) {
          // Email or Farcaster username
          if (recipient.startsWith('@')) {
            // Farcaster username
            const success = await sendFarcasterNotification(recipient.slice(1), message);
            status = success ? 'delivered' : 'failed';
          } else {
            // Email - in a real app, you'd use an email service
            console.log(`Email to ${recipient}: ${message}`);
            status = 'delivered';
          }
        } else {
          // Phone number
          const success = await sendSMS(recipient, message);
          status = success ? 'delivered' : 'failed';
        }
      } catch (error) {
        console.error(`Failed to send alert to ${recipient}:`, error);
        status = 'failed';
      }

      // Log the alert attempt
      const alertLog: Omit<AlertLog, 'createdAt'> = {
        alertId,
        userId,
        incidentRecordId: incidentRecordId || '',
        recipient,
        timestamp: new Date(),
        status,
      };

      const { data: savedAlert, error } = await supabase
        .from('alert_logs')
        .insert([{
          ...alertLog,
          timestamp: alertLog.timestamp.toISOString(),
          createdAt: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Failed to save alert log:', error);
      } else {
        alertResults.push(savedAlert);
      }
    }

    const successCount = alertResults.filter(alert => alert.status === 'delivered').length;
    const failureCount = alertResults.filter(alert => alert.status === 'failed').length;

    return NextResponse.json({
      success: true,
      data: {
        alerts: alertResults,
        summary: {
          total: recipients.length,
          successful: successCount,
          failed: failureCount,
        },
      },
      message: `Alerts sent: ${successCount} successful, ${failureCount} failed`,
    });

  } catch (error) {
    console.error('Alert sending error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send alerts' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const incidentRecordId = searchParams.get('incidentRecordId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('alert_logs')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (incidentRecordId) {
      query = query.eq('incidentRecordId', incidentRecordId);
    }

    const { data: alerts, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: alerts,
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// Update alert status (for delivery confirmations)
export async function PATCH(request: NextRequest) {
  try {
    const { alertId, status } = await request.json();

    if (!alertId || !status) {
      return NextResponse.json(
        { success: false, error: 'Alert ID and status are required' },
        { status: 400 }
      );
    }

    const { data: updatedAlert, error } = await supabase
      .from('alert_logs')
      .update({ status })
      .eq('alertId', alertId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: updatedAlert,
      message: 'Alert status updated successfully',
    });

  } catch (error) {
    console.error('Update alert error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update alert status' },
      { status: 500 }
    );
  }
}
