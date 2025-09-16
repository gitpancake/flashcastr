import { NextRequest, NextResponse } from 'next/server';
import { 
  getExperimentalUsersRedis,
  addExperimentalUserRedis,
  removeExperimentalUserRedis 
} from '~/lib/redis';
import { FEATURES } from '~/lib/constants';

// GET /api/admin/experimental-users - Get all experimental users
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const { searchParams } = new URL(request.url);
    const adminFid = searchParams.get('adminFid');
    
    if (!adminFid || parseInt(adminFid, 10) !== FEATURES.ADMIN_FID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const experimentalUsers = await getExperimentalUsersRedis();
    
    return NextResponse.json({
      success: true,
      users: experimentalUsers
    });
  } catch (error) {
    console.error('Error fetching experimental users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/experimental-users - Add experimental user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminFid, userFid } = body;

    // Check if user is admin
    if (!adminFid || adminFid !== FEATURES.ADMIN_FID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!userFid || typeof userFid !== 'number') {
      return NextResponse.json({ error: 'Valid userFid is required' }, { status: 400 });
    }

    // Don't allow adding the admin themselves
    if (userFid === FEATURES.ADMIN_FID) {
      return NextResponse.json({ error: 'Cannot add admin to experimental users' }, { status: 400 });
    }

    const success = await addExperimentalUserRedis(userFid);
    
    if (success) {
      console.log(`[ADMIN] Added experimental user: ${userFid} by admin: ${adminFid}`);
      return NextResponse.json({ 
        success: true, 
        message: `Added user ${userFid} to experimental users`,
        userFid 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: `User ${userFid} is already an experimental user` 
      });
    }
  } catch (error) {
    console.error('Error adding experimental user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/experimental-users - Remove experimental user
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminFid, userFid } = body;

    // Check if user is admin
    if (!adminFid || adminFid !== FEATURES.ADMIN_FID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!userFid || typeof userFid !== 'number') {
      return NextResponse.json({ error: 'Valid userFid is required' }, { status: 400 });
    }

    const success = await removeExperimentalUserRedis(userFid);
    
    if (success) {
      console.log(`[ADMIN] Removed experimental user: ${userFid} by admin: ${adminFid}`);
      return NextResponse.json({ 
        success: true, 
        message: `Removed user ${userFid} from experimental users`,
        userFid 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: `User ${userFid} was not an experimental user` 
      });
    }
  } catch (error) {
    console.error('Error removing experimental user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}