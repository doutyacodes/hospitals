import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctorAdmins, doctors } from '@/lib/db/schema';
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

    // Find doctor admin by email
    const adminData = await db
      .select({
        id: doctorAdmins.id,
        email: doctorAdmins.email,
        passwordHash: doctorAdmins.passwordHash,
        doctorId: doctorAdmins.doctorId,
        role: doctorAdmins.role,
        isActive: doctorAdmins.isActive,
        doctorName: doctors.name,
        doctorImage: doctors.image,
        doctorSpecialtyId: doctors.specialtyId,
        doctorLicenseNumber: doctors.licenseNumber,
      })
      .from(doctorAdmins)
      .leftJoin(doctors, eq(doctorAdmins.doctorId, doctors.id))
      .where(eq(doctorAdmins.email, email))
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
      .update(doctorAdmins)
      .set({ lastLogin: new Date() })
      .where(eq(doctorAdmins.id, admin.id));

    // Generate JWT token
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      doctorId: admin.doctorId,
      role: admin.role,
      userType: 'doctor',
    });

    // Prepare user data (excluding password hash)
    const userData = {
      id: admin.id,
      email: admin.email,
      doctorId: admin.doctorId,
      doctorName: admin.doctorName,
      doctorImage: admin.doctorImage,
      doctorSpecialtyId: admin.doctorSpecialtyId,
      doctorLicenseNumber: admin.doctorLicenseNumber,
      role: admin.role,
      userType: 'doctor',
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
    console.error('Doctor login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}