import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hospitalAdmins, hospitals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get current user data
    const adminData = await db
      .select({
        id: hospitalAdmins.id,
        email: hospitalAdmins.email,
        firstName: hospitalAdmins.firstName,
        lastName: hospitalAdmins.lastName,
        hospitalId: hospitalAdmins.hospitalId,
        role: hospitalAdmins.role,
        isActive: hospitalAdmins.isActive,
        hospitalName: hospitals.name,
        hospitalImage: hospitals.image,
        hospitalCity: hospitals.city,
        hospitalState: hospitals.state,
        hospitalIsActive: hospitals.isActive,
      })
      .from(hospitalAdmins)
      .leftJoin(hospitals, eq(hospitalAdmins.hospitalId, hospitals.id))
      .where(eq(hospitalAdmins.id, decoded.id))
      .limit(1);

    if (adminData.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const admin = adminData[0];

    // Check if admin is active
    if (!admin.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        hospitalId: admin.hospitalId,
        hospitalName: admin.hospitalName,
        hospitalImage: admin.hospitalImage,
        hospitalCity: admin.hospitalCity,
        hospitalState: admin.hospitalState,
        role: admin.role,
        hospitalIsActive: admin.hospitalIsActive,
      },
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred while verifying authentication' },
      { status: 500 }
    );
  }
}