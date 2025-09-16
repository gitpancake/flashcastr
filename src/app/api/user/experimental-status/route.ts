import { NextRequest, NextResponse } from 'next/server';
import { isExperimentalUserRedis } from '~/lib/redis';
import { FEATURES } from '~/lib/constants';

// GET /api/user/experimental-status?fid=123
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fidParam = searchParams.get('fid');

    if (!fidParam) {
      return NextResponse.json({ hasAccess: false });
    }

    const fid = parseInt(fidParam, 10);
    if (isNaN(fid)) {
      return NextResponse.json({ hasAccess: false });
    }

    // Admin always has access
    if (fid === FEATURES.ADMIN_FID) {
      return NextResponse.json({ hasAccess: true, reason: 'admin' });
    }

    // Check experimental users
    const isExperimental = await isExperimentalUserRedis(fid);
    
    return NextResponse.json({ 
      hasAccess: isExperimental, 
      reason: isExperimental ? 'experimental' : 'none'
    });

  } catch (error) {
    console.error('Error checking experimental status:', error);
    return NextResponse.json({ hasAccess: false });
  }
}