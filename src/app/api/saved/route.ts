import { NextRequest, NextResponse } from 'next/server';
import { 
  getWishlistFromRedis, 
  markAsFoundRedis, 
  removeFromWishlistRedis,
} from '~/lib/redis';

// GET /api/saved?fid=123 - Get user's saved list
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');

  if (!fid) {
    return NextResponse.json({ error: 'FID is required' }, { status: 400 });
  }

  const fidNumber = parseInt(fid, 10);
  if (isNaN(fidNumber)) {
    return NextResponse.json({ error: 'Invalid FID' }, { status: 400 });
  }

  try {
    const wishlist = await getWishlistFromRedis(fidNumber);
    
    // Return only saved items (found)
    const savedItems = wishlist.items.filter(item => item.status === 'found');
    
    return NextResponse.json({
      fid: fidNumber,
      items: savedItems,
      stats: {
        total: savedItems.length,
        last_updated: wishlist.stats.last_updated
      }
    });
  } catch (error) {
    console.error('Error fetching saved list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/saved - Mark as found or remove from saved
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, action, invaderId } = body;

    console.log(`[DEBUG] Saved API POST request - FID: ${fid}, Action: ${action}, InvaderID: ${invaderId}`);

    if (!fid) {
      return NextResponse.json({ error: 'FID is required' }, { status: 400 });
    }

    const fidNumber = parseInt(fid, 10);
    if (isNaN(fidNumber)) {
      return NextResponse.json({ error: 'Invalid FID' }, { status: 400 });
    }

    if (!invaderId) {
      return NextResponse.json({ error: 'Invader ID is required' }, { status: 400 });
    }

    let wishlist;

    switch (action) {
      case 'mark_found':
        wishlist = await markAsFoundRedis(fidNumber, invaderId);
        console.log(`[DEBUG] Successfully marked ${invaderId} as found for FID ${fidNumber}`);
        break;

      case 'remove':
        wishlist = await removeFromWishlistRedis(fidNumber, invaderId);
        console.log(`[DEBUG] Successfully removed ${invaderId} from saved list for FID ${fidNumber}`);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Return only saved items
    const savedItems = wishlist.items.filter(item => item.status === 'found');
    
    return NextResponse.json({
      fid: fidNumber,
      items: savedItems,
      stats: {
        total: savedItems.length,
        last_updated: wishlist.stats.last_updated
      }
    });
  } catch (error) {
    console.error('Error updating saved list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}