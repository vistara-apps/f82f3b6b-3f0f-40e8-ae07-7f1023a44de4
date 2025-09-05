import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateId } from '@/lib/utils';
import { IncidentRecord } from '@/lib/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Upload to Pinata IPFS
async function uploadToPinata(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const pinataMetadata = JSON.stringify({
    name: `right-guard-recording-${Date.now()}`,
    keyvalues: {
      app: 'right-guard',
      type: 'incident-recording',
      timestamp: new Date().toISOString(),
    },
  });
  formData.append('pinataMetadata', pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', pinataOptions);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PINATA_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload to IPFS');
  }

  const result = await response.json();
  return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const latitude = parseFloat(formData.get('latitude') as string);
    const longitude = parseFloat(formData.get('longitude') as string);
    const address = formData.get('address') as string;
    const notes = formData.get('notes') as string;

    if (!file || !userId || isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload file to IPFS
    let mediaUrl: string | undefined;
    try {
      mediaUrl = await uploadToPinata(file);
    } catch (error) {
      console.error('IPFS upload failed:', error);
      // Continue without media URL - we'll store the record anyway
    }

    // Create incident record
    const newRecord: Omit<IncidentRecord, 'createdAt'> = {
      recordId: generateId(),
      userId,
      timestamp: new Date(),
      location: {
        latitude,
        longitude,
        address: address || undefined,
      },
      mediaUrl,
      notes: notes || undefined,
    };

    const { data: savedRecord, error } = await supabase
      .from('incident_records')
      .insert([{
        ...newRecord,
        timestamp: newRecord.timestamp.toISOString(),
        createdAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: savedRecord,
      message: 'Recording saved successfully',
    });

  } catch (error) {
    console.error('Recording save error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save recording' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: records, error } = await supabase
      .from('incident_records')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: records,
    });

  } catch (error) {
    console.error('Get recordings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recordings' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get('recordId');
    const userId = searchParams.get('userId');

    if (!recordId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Record ID and User ID are required' },
        { status: 400 }
      );
    }

    // Verify ownership before deletion
    const { data: record, error: fetchError } = await supabase
      .from('incident_records')
      .select('*')
      .eq('recordId', recordId)
      .eq('userId', userId)
      .single();

    if (fetchError || !record) {
      return NextResponse.json(
        { success: false, error: 'Record not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the record
    const { error: deleteError } = await supabase
      .from('incident_records')
      .delete()
      .eq('recordId', recordId)
      .eq('userId', userId);

    if (deleteError) throw deleteError;

    // Note: In a production app, you might also want to delete the file from IPFS
    // However, IPFS files are immutable, so this would require additional logic

    return NextResponse.json({
      success: true,
      message: 'Recording deleted successfully',
    });

  } catch (error) {
    console.error('Delete recording error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete recording' },
      { status: 500 }
    );
  }
}
