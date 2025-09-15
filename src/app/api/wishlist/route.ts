import { NextRequest, NextResponse } from 'next/server';
import { 
  getWishlistFromRedis, 
  addToWishlistRedis, 
  removeFromWishlistRedis, 
  markAsFoundRedis, 
  getInvaderStatusRedis,
  getWishlistStatsRedis 
} from '~/lib/redis';

// GET /api/wishlist?fid=123 - Get user's wishlist
// GET /api/wishlist?fid=123&invaderId=TK_132 - Get invader status
// GET /api/wishlist/stats?fid=123 - Get wishlist stats
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');
  const invaderId = searchParams.get('invaderId');
  const statsOnly = searchParams.get('stats');

  if (!fid) {
    return NextResponse.json({ error: 'FID is required' }, { status: 400 });
  }

  const fidNumber = parseInt(fid, 10);
  if (isNaN(fidNumber)) {
    return NextResponse.json({ error: 'Invalid FID' }, { status: 400 });
  }

  try {
    if (statsOnly) {
      // Return just stats
      const stats = await getWishlistStatsRedis(fidNumber);
      return NextResponse.json(stats);
    } else if (invaderId) {
      // Return status of specific invader
      const status = await getInvaderStatusRedis(fidNumber, invaderId);
      return NextResponse.json({ status });
    } else {
      // Return full wishlist
      const wishlist = await getWishlistFromRedis(fidNumber);
      return NextResponse.json(wishlist);
    }
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/wishlist - Add to wishlist or mark as found
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, action, invader, invaderId } = body;

    console.log(`[DEBUG] Wishlist API POST request - FID: ${fid}, Action: ${action}, InvaderID: ${invaderId || (invader ? invader.n : 'none')}`);

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
        console.log(`[DEBUG] Successfully added ${invader.n} to wishlist for FID ${fidNumber}`);
        break;

      case 'mark_found':
        if (!invaderId) {
          return NextResponse.json({ error: 'Invader ID is required for mark_found action' }, { status: 400 });
        }
        wishlist = await markAsFoundRedis(fidNumber, invaderId);
        console.log(`[DEBUG] Successfully marked ${invaderId} as found for FID ${fidNumber}`);
        break;

      case 'remove':
        if (!invaderId) {
          return NextResponse.json({ error: 'Invader ID is required for remove action' }, { status: 400 });
        }
        wishlist = await removeFromWishlistRedis(fidNumber, invaderId);
        console.log(`[DEBUG] Successfully removed ${invaderId} from wishlist for FID ${fidNumber}`);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    console.log(`[DEBUG] Returning wishlist with ${wishlist.items.length} items`);
    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('Error updating wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}