import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hospitalAdmins, hospitals } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword, generateToken, generateId } from '@/lib/auth';

export async function POST(request) {
  try {
    const { 
      email, 
      password, 
      confirmPassword,
      firstName, 
      lastName, 
      phone,
      hospitalName,
      hospitalAddress,
      hospitalCity,
      hospitalState,
      hospitalZipCode,
      hospitalPhone,
      hospitalEmail,
      licenseNumber,
      established
    } = await request.json();

    // Validate required fields
    if (!email || !password || !confirmPassword || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'All personal information fields are required' },
        { status: 400 }
      );
    }

    if (!hospitalName || !hospitalAddress || !hospitalCity || !hospitalState || !hospitalZipCode || !hospitalPhone || !hospitalEmail) {
      return NextResponse.json(
        { error: 'All hospital information fields are required' },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if admin email already exists
    const existingAdmin = await db
      .select({ id: hospitalAdmins.id })
      .from(hospitalAdmins)
      .where(eq(hospitalAdmins.email, email))
      .limit(1);

    if (existingAdmin.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Check if hospital email already exists
    const existingHospital = await db
      .select({ id: hospitals.id })
      .from(hospitals)
      .where(eq(hospitals.email, hospitalEmail))
      .limit(1);

    if (existingHospital.length > 0) {
      return NextResponse.json(
        { error: 'A hospital with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate IDs
    const hospitalId = generateId();
    const adminId = generateId();

    // Create hospital first
    await db.insert(hospitals).values({
      id: hospitalId,
      name: hospitalName,
      address: hospitalAddress,
      city: hospitalCity,
      state: hospitalState,
      zipCode: hospitalZipCode,
      phone: hospitalPhone,
      email: hospitalEmail,
      description: `Welcome to ${hospitalName}. We provide quality healthcare services.`,
      licenseNumber: licenseNumber || null,
      established: established ? parseInt(established) : new Date().getFullYear(),
      isActive: false, // Initially inactive until verified
    });

    // Create hospital admin
    await db.insert(hospitalAdmins).values({
      id: adminId,
      hospitalId,
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      role: 'admin',
      permissions: JSON.stringify(['read', 'write', 'delete']),
      isActive: false, // Initially inactive until verified
    });

    // Generate JWT token
    const token = generateToken({
      id: adminId,
      email,
      hospitalId,
      role: 'admin',
    });

    // Prepare user data
    const userData = {
      id: adminId,
      email,
      firstName,
      lastName,
      hospitalId,
      hospitalName,
      role: 'admin',
    };

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully! Please wait for admin approval.',
      user: userData,
    });

    // Set HTTP-only cookie with the token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}