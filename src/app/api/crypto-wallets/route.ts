import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, TABLES, STORAGE_BUCKETS } from '@/lib/supabaseClient';

// GET: Fetch all crypto wallets
export async function GET() {
  try {
    console.log('Fetching crypto wallets using Supabase');
    
    // Create server-side Supabase client
    const supabase = createServerSupabaseClient();
    
    // Query crypto wallets from Supabase
    const { data: wallets, error } = await supabase
      .from(TABLES.CRYPTO_WALLETS)
      .select('*');
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(wallets || []);
  } catch (error) {
    console.error('Error fetching crypto wallets using Supabase:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch crypto wallets', message: error.message },
      { status: 500 }
    );
  }
}

// POST: Add a new crypto wallet (with QR code image upload)
export async function POST(req: NextRequest) {
  try {
    // Create server-side Supabase client
    const supabase = createServerSupabaseClient();
    
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const wallet_address = formData.get('address') as string;
    const network = formData.get('network') as string;
    const qrFile = formData.get('qr_code') as File;

    if (!name || !wallet_address || !network) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Handle QR code upload if provided
    let qr_code_url = '';
    if (qrFile && qrFile instanceof File) {
      try {
        // Upload the file to Supabase Storage
        const fileExt = qrFile.name.split('.').pop() || 'png';
        const fileName = `crypto_wallet_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('unit-bucket')
          .upload(`crypto_wallets/${fileName}`, qrFile);
        
        if (uploadError) {
          console.error('Error uploading QR code:', uploadError);
          return NextResponse.json({ error: 'Failed to upload QR code: ' + uploadError.message }, { status: 500 });
        }
        
        // Get the public URL for the uploaded file
        const { data: urlData } = supabase
          .storage
          .from('unit-bucket')
          .getPublicUrl(`crypto_wallets/${fileName}`);
        
        qr_code_url = urlData.publicUrl;
      } catch (uploadErr) {
        console.error('Error in QR code upload process:', uploadErr);
        return NextResponse.json({ error: 'Failed to upload QR code: ' + uploadErr.message }, { status: 500 });
      }
    }

    // Create the crypto wallet in Supabase
    const { data: wallet, error } = await supabase
      .from(TABLES.CRYPTO_WALLETS)
      .insert({
        name,
        address: wallet_address,  // Use 'address' instead of 'wallet_address'
        network,
        qr_code_url,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating crypto wallet:', error);
      return NextResponse.json({ 
        error: 'Failed to create crypto wallet', 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Crypto wallet created successfully',
      wallet
    });
  } catch (error) {
    console.error('Error creating crypto wallet:', error);
    return NextResponse.json(
      { error: 'Failed to create crypto wallet', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove a crypto wallet
export async function DELETE(request: NextRequest) {
  try {
    // Create server-side Supabase client
    const supabase = createServerSupabaseClient();
    
    // Extract ID from the query parameter
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "Invalid wallet ID" }, { status: 400 });
    }
    
    // Delete the crypto wallet
    const { error } = await supabase
      .from(TABLES.CRYPTO_WALLETS)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Failed to delete crypto wallet:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to delete crypto wallet',
        error: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting crypto wallet:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to delete crypto wallet',
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}
