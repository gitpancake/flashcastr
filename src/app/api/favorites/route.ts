import { NextRequest, NextResponse } from 'next/server';
import { 
  getFavoritesFromRedis, 
  addToFavoritesRedis, 
  removeFromFavoritesRedis, 
  isFavoriteRedis,
  getFavoritesCountRedis,
  type FavoriteFlash
} from '~/lib/redis';

// GET /api/favorites?fid=123 - Get user's favorites
// GET /api/favorites?fid=123&flashId=456 - Check if flash is favorited
// GET /api/favorites?fid=123&count=true - Get favorites count only
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');
  const flashId = searchParams.get('flashId');
  const countOnly = searchParams.get('count');

  if (!fid) {
    return NextResponse.json({ error: 'FID is required' }, { status: 400 });
  }

  const fidNumber = parseInt(fid, 10);
  if (isNaN(fidNumber)) {
    return NextResponse.json({ error: 'Invalid FID' }, { status: 400 });
  }

  try {
    if (countOnly) {
      // Return just count
      const count = await getFavoritesCountRedis(fidNumber);
      return NextResponse.json({ count });
    } else if (flashId) {
      // Check if specific flash is favorited
      const flashIdNumber = parseInt(flashId, 10);
      if (isNaN(flashIdNumber)) {
        return NextResponse.json({ error: 'Invalid flash ID' }, { status: 400 });
      }
      
      const isFav = await isFavoriteRedis(fidNumber, flashIdNumber);
      return NextResponse.json({ isFavorite: isFav });
    } else {
      // Return full favorites list
      const userFavorites = await getFavoritesFromRedis(fidNumber);
      return NextResponse.json(userFavorites);
    }
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/favorites - Add or remove from favorites
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, action, flash, flashId } = body;

    if (!fid) {
      return NextResponse.json({ error: 'FID is required' }, { status: 400 });
    }

    const fidNumber = parseInt(fid, 10);
    if (isNaN(fidNumber)) {
      return NextResponse.json({ error: 'Invalid FID' }, { status: 400 });
    }

    switch (action) {
      case 'add':
        if (!flash) {
          return NextResponse.json({ error: 'Flash data is required for add action' }, { status: 400 });
        }
        
        // Validate flash data
        const flashData: Omit<FavoriteFlash, 'addedAt'> = {
          flash_id: flash.flash_id,
          player: flash.player,
          city: flash.city,
          timestamp: flash.timestamp,
          img: flash.img,
          ipfs_cid: flash.ipfs_cid,
          text: flash.text
        };
        
        const added = await addToFavoritesRedis(fidNumber, flashData);
        return NextResponse.json({ success: added, alreadyExists: !added });

      case 'remove':
        if (!flashId) {
          return NextResponse.json({ error: 'Flash ID is required for remove action' }, { status: 400 });
        }
        
        const flashIdNumber = parseInt(flashId, 10);
        if (isNaN(flashIdNumber)) {
          return NextResponse.json({ error: 'Invalid flash ID' }, { status: 400 });
        }
        
        const removed = await removeFromFavoritesRedis(fidNumber, flashIdNumber);
        return NextResponse.json({ success: removed, notFound: !removed });

      default:
        return NextResponse.json({ error: 'Invalid action. Use "add" or "remove"' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}