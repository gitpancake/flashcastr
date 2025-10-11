import { NextRequest, NextResponse } from 'next/server';
import {
  getFlashLinksFromRedis,
  linkFlashToInvaderRedis,
  unlinkFlashFromInvaderRedis,
  getInvaderLinksRedis,
  getFlashLinkRedis,
  getInvaderLinkCountRedis,
} from '~/lib/redis';
import { FlashesApi } from '~/lib/api.flashcastr.app/flashes';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fid = searchParams.get('fid');
    const invaderId = searchParams.get('invader_id');
    const flashId = searchParams.get('flash_id');
    const action = searchParams.get('action');

    if (!fid) {
      return NextResponse.json(
        { error: 'FID is required' },
        { status: 400 }
      );
    }

    const fidNumber = parseInt(fid, 10);

    // Get link count for an invader
    if (action === 'count' && invaderId) {
      const count = await getInvaderLinkCountRedis(fidNumber, invaderId);
      return NextResponse.json({ count });
    }

    // Get links for specific invader
    if (invaderId) {
      const links = await getInvaderLinksRedis(fidNumber, invaderId);
      return NextResponse.json({ links });
    }

    // Get link for specific flash
    if (flashId) {
      const link = await getFlashLinkRedis(fidNumber, parseInt(flashId, 10));
      return NextResponse.json({ link });
    }

    // Get all flash links for user
    const userLinks = await getFlashLinksFromRedis(fidNumber);
    return NextResponse.json(userLinks);
  } catch (error) {
    console.error('Error in GET /api/flash-links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, fid, flash_id, invader, city } = body;

    if (!fid) {
      return NextResponse.json(
        { error: 'FID is required' },
        { status: 400 }
      );
    }

    const fidNumber = parseInt(fid, 10);

    switch (action) {
      case 'link': {
        if (!flash_id || !invader || !city) {
          return NextResponse.json(
            { error: 'flash_id, invader, and city are required for linking' },
            { status: 400 }
          );
        }

        const userLinks = await linkFlashToInvaderRedis(
          fidNumber,
          flash_id,
          invader,
          city
        );

        return NextResponse.json(userLinks);
      }

      case 'unlink': {
        if (!flash_id) {
          return NextResponse.json(
            { error: 'flash_id is required for unlinking' },
            { status: 400 }
          );
        }

        const userLinks = await unlinkFlashFromInvaderRedis(fidNumber, flash_id);
        return NextResponse.json(userLinks);
      }

      case 'get_linkable_flashes': {
        // Get user's flashes that can be linked (filtered by city if provided)
        const { city: filterCity } = body;

        const flashesApi = new FlashesApi();
        const flashes = await flashesApi.getFlashes(1, 100, fidNumber);

        // Filter by city if provided
        const filteredFlashes = filterCity
          ? flashes.filter(f => f.flash.city.toLowerCase() === filterCity.toLowerCase())
          : flashes;

        // Get current links to mark which flashes are already linked
        const userLinks = await getFlashLinksFromRedis(fidNumber);
        const linkMap = new Map(userLinks.links.map(link => [link.flash_id, link]));

        // Enhance flashes with link info
        const flashesWithLinkInfo = filteredFlashes.map(flash => ({
          ...flash,
          linked_to: linkMap.get(flash.flash.flash_id) || null
        }));

        return NextResponse.json({ flashes: flashesWithLinkInfo });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in POST /api/flash-links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
