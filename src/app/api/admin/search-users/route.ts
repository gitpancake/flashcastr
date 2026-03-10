import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '~/auth';
import { FEATURES } from '~/lib/constants';

interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  verified_addresses?: {
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

// GET /api/admin/search-users?q=username
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.fid || session.user.fid !== FEATURES.ADMIN_FID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

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
        'x-api-key': neynarApiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Neynar API error:', response.status, response.statusText, errorText);
      return NextResponse.json({ error: 'Search service error' }, { status: 500 });
    }

    const data: NeynarSearchResponse = await response.json();

    // Validate response structure
    if (!data.result || !Array.isArray(data.result.users)) {
      console.error('Unexpected Neynar API response structure:', data);
      return NextResponse.json({ error: 'Invalid search response format' }, { status: 500 });
    }

    // Transform Neynar users to our format
    const users = data.result.users.map(user => ({
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      followerCount: user.follower_count || 0,
      followingCount: user.following_count || 0,
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