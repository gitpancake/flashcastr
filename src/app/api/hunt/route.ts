import { NextRequest, NextResponse } from 'next/server';
import { 
  getWishlistFromRedis, 
  addToWishlistRedis, 
  removeFromWishlistRedis,
} from '~/lib/redis';

// GET /api/hunt?fid=123 - Get user's hunt list
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
    
    // Return only hunt list items (want_to_find)
    const huntItems = wishlist.items.filter(item => item.status === 'want_to_find');
    
    return NextResponse.json({
      fid: fidNumber,
      items: huntItems,
      stats: {
        total: huntItems.length,
        last_updated: wishlist.stats.last_updated
      }
    });
  } catch (error) {
    console.error('Error fetching hunt list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/hunt - Add or remove from hunt list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, action, invader, invaderId } = body;

    console.log(`[DEBUG] Hunt API POST request - FID: ${fid}, Action: ${action}, InvaderID: ${invaderId || (invader ? invader.n : 'none')}`);

    if (!fid) {
      return NextResponse.json({ error: 'FID is required' }, { status: 400 });
    }

    const fidNumber = parseInt(fid, 10);
    if (isNaN(fidNumber)) {
      return NextResponse.json({ error: 'Invalid FID' }, { status: 400 });
    }

    let wishlist;

    switch (action) {
      case 'add':
        if (!invader) {
          return NextResponse.json({ error: 'Invader data is required for add action' }, { status: 400 });
        }
        wishlist = await addToWishlistRedis(fidNumber, invader);
        console.log(`[DEBUG] Successfully added ${invader.n} to hunt list for FID ${fidNumber}`);
        break;

      case 'remove':
        if (!invaderId) {
          return NextResponse.json({ error: 'Invader ID is required for remove action' }, { status: 400 });
        }
        wishlist = await removeFromWishlistRedis(fidNumber, invaderId);
        console.log(`[DEBUG] Successfully removed ${invaderId} from hunt list for FID ${fidNumber}`);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Return only hunt list items
    const huntItems = wishlist.items.filter(item => item.status === 'want_to_find');
    
    return NextResponse.json({
      fid: fidNumber,
      items: huntItems,
      stats: {
        total: huntItems.length,
        last_updated: wishlist.stats.last_updated
      }
    });
  } catch (error) {
    console.error('Error updating hunt list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}