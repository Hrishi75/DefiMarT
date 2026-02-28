import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      currency,
      category,
      condition,
      eventId,
      customEventName,
      images,
      isNft,
      nftMetadata,
      shippingInfo,
      tags,
      quantity,
    } = body;
    const validCurrencies = ['SOL', 'USDC', 'PYUSD', 'EURC'];
    const listingCurrency = currency && validCurrencies.includes(currency) ? currency : 'SOL';

    if (!title || !price || !category || !condition) {
      return NextResponse.json(
        { error: 'Missing required fields: title, price, category, condition' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // If a custom event name is provided, create a new event
    let resolvedEventId = eventId || null;
    if (!resolvedEventId && customEventName && customEventName.trim()) {
      const slug = customEventName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const { data: newEvent, error: eventError } = await (supabase as any)
        .from('events')
        .insert({
          name: customEventName.trim(),
          slug,
          description: '',
          location: 'Unknown',
          date: new Date().toISOString(),
          organizer: 'Community',
          verified: false,
          total_items: 0,
          total_collectors: 0,
          tags: [],
        })
        .select('id')
        .single();

      if (eventError) {
        console.error('Failed to create custom event:', eventError);
        // Continue without event — don't block listing creation
      } else if (newEvent) {
        resolvedEventId = newEvent.id;
      }
    }

    const { data, error } = await supabase
      .from('listings')
      .insert({
        seller_id: user.id,
        event_id: resolvedEventId,
        title,
        description: description || '',
        price: Number(price),
        currency: listingCurrency,
        category,
        condition,
        images: images || [],
        is_nft: isNft || false,
        nft_metadata: nftMetadata || null,
        shipping_info: shippingInfo || null,
        tags: tags || [],
        quantity: quantity || 1,
        quantity_available: quantity || 1,
        status: 'active',
      })
      .select('*')
      .single();

    if (error) {
      console.error('Failed to create listing:', error);
      return NextResponse.json(
        { error: 'Failed to create listing' },
        { status: 500 }
      );
    }

    return NextResponse.json({ listing: data }, { status: 201 });
  } catch (err) {
    console.error('Create listing error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
