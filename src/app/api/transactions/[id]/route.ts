import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, shippingTracking } = body;

    const supabase = createAdminClient();

    // Fetch the transaction
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Authorization: only buyer or seller can update
    const isBuyer = transaction.buyer_id === user.id;
    const isSeller = transaction.seller_id === user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: 'Not authorized to update this transaction' },
        { status: 403 }
      );
    }

    // Validate status transitions
    const validTransitions: Record<string, { by: string; to: string[] }[]> = {
      confirmed: [
        { by: 'seller', to: ['shipped'] },
        { by: 'buyer', to: ['disputed'] },
        { by: 'seller', to: ['disputed'] },
      ],
      shipped: [
        { by: 'buyer', to: ['completed', 'disputed'] },
      ],
      disputed: [
        // Only admin can resolve disputes — not handled here
      ],
    };

    if (status) {
      const currentStatus = transaction.status;
      const transitions = validTransitions[currentStatus] || [];
      const role = isBuyer ? 'buyer' : 'seller';
      const allowed = transitions.some(
        (t) => t.by === role && t.to.includes(status)
      );

      if (!allowed) {
        return NextResponse.json(
          { error: `Cannot transition from '${currentStatus}' to '${status}' as ${role}` },
          { status: 400 }
        );
      }
    }

    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (shippingTracking) updates.shipping_tracking = shippingTracking;
    if (status === 'completed') updates.completed_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Failed to update transaction:', error);
      return NextResponse.json(
        { error: 'Failed to update transaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ transaction: data });
  } catch (err) {
    console.error('Update transaction error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
