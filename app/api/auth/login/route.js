import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hospitalAdmins, hospitals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { comparePasswords, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find hospital admin by email
    const adminData = await db
      .select({
        id: hospitalAdmins.id,
        email: hospitalAdmins.email,
        passwordHash: hospitalAdmins.passwordHash,
        firstName: hospitalAdmins.firstName,
        lastName: hospitalAdmins.lastName,
        hospitalId: hospitalAdmins.hospitalId,
        role: hospitalAdmins.role,
        isActive: hospitalAdmins.isActive,
        hospitalName: hospitals.name,
        hospitalImage: hospitals.image,
      })
      .from(hospitalAdmins)
      .leftJoin(hospitals, eq(hospitalAdmins.hospitalId, hospitals.id))
      .where(eq(hospitalAdmins.email, email))
      .limit(1);

    if (adminData.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const admin = adminData[0];

    // Check if admin is active
    if (!admin.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await comparePasswords(password, admin.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await db
      .update(hospitalAdmins)
      .set({ lastLogin: new Date() })
      .where(eq(hospitalAdmins.id, admin.id));

    // Generate JWT token
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      hospitalId: admin.hospitalId,
      role: admin.role,
      userType: 'hospital',
    });

    // Prepare user data (excluding password hash)
    const userData = {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      hospitalId: admin.hospitalId,
      hospitalName: admin.hospitalName,
      hospitalImage: admin.hospitalImage,
      role: admin.role,
      userType: 'hospital',
    };

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
    });

    // Set HTTP-only cookie with the token for server-side routes
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Also set a client-readable cookie for the AuthContext
    response.cookies.set('auth-user', JSON.stringify(userData), {
      httpOnly: false, // Client can read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}