import { NextRequest, NextResponse } from 'next/server';
import { FEATURES } from '~/lib/constants';

interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
  follower_count: number;
  following_count: number;
}

interface NeynarSearchResponse {
  result: {
    users: NeynarUser[];
  };
}

// GET /api/admin/search-users?q=username&adminFid=123
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminFid = searchParams.get('adminFid');
    const query = searchParams.get('q');

    // Check if user is admin
    if (!adminFid || parseInt(adminFid, 10) !== FEATURES.ADMIN_FID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    // Search users via Neynar API
    const neynarApiKey = process.env.NEYNAR_API_KEY;
    if (!neynarApiKey) {
      console.error('NEYNAR_API_KEY not configured');
      return NextResponse.json({ error: 'Search service unavailable' }, { status: 500 });
    }

    const neynarUrl = `https://api.neynar.com/v2/farcaster/user/search?q=${encodeURIComponent(query.trim())}&limit=10`;
    
    const response = await fetch(neynarUrl, {
      headers: {
        'Accept': 'application/json',
        'Api-Key': neynarApiKey,
      },
    });

    if (!response.ok) {
      console.error('Neynar API error:', response.status, response.statusText);
      return NextResponse.json({ error: 'Search service error' }, { status: 500 });
    }

    const data: NeynarSearchResponse = await response.json();

    // Transform Neynar users to our format
    const users = data.result.users.map(user => ({
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      followerCount: user.follower_count,
      followingCount: user.following_count,
    }));

    return NextResponse.json({
      success: true,
      users,
      query: query.trim()
    });

  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}