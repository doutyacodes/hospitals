import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctors, doctorAdmins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, generateToken } from '@/lib/auth';
import { nanoid } from 'nanoid';

export async function POST(request) {
  try {
    const {
      // Doctor personal info
      name,
      email,
      phone,
      specialtyId,
      qualification,
      experience,
      bio,
      licenseNumber,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      consultationFee,
      // Admin account info
      password,
    } = await request.json();

    // Validate required fields
    if (!name || !email || !phone || !specialtyId || !qualification || !experience || 
        !bio || !licenseNumber || !consultationFee || !password) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Check if doctor with same email already exists
    const existingDoctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.email, email))
      .limit(1);

    if (existingDoctor.length > 0) {
      return NextResponse.json(
        { error: 'Doctor with this email already exists' },
        { status: 409 }
      );
    }

    // Check if doctor with same license number already exists
    const existingLicense = await db
      .select()
      .from(doctors)
      .where(eq(doctors.licenseNumber, licenseNumber))
      .limit(1);

    if (existingLicense.length > 0) {
      return NextResponse.json(
        { error: 'Doctor with this license number already exists' },
        { status: 409 }
      );
    }

    // Check if admin email already exists
    const existingAdmin = await db
      .select()
      .from(doctorAdmins)
      .where(eq(doctorAdmins.email, email))
      .limit(1);

    if (existingAdmin.length > 0) {
      return NextResponse.json(
        { error: 'Admin account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate IDs
    const doctorId = nanoid();
    const adminId = nanoid();

    // Create doctor record first
    console.log('Creating doctor with ID:', doctorId);
    await db.insert(doctors).values({
      id: doctorId,
      name,
      email,
      phone,
      specialtyId,
      qualification,
      experience: parseInt(experience),
      bio,
      licenseNumber,
      dateOfBirth: dateOfBirth || null,
      address: address || null,
      city: city || null,
      state: state || null,
      zipCode: zipCode || null,
      consultationFee: parseFloat(consultationFee),
      isAvailable: true,
      status: 'offline',
      rating: '0.00',
      totalReviews: 0,
    });

    console.log('Doctor created successfully');

    // Verify doctor exists before creating admin (important for FK constraint)
    const verifyDoctor = await db
      .select({ id: doctors.id })
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1);

    console.log('Doctor verification:', verifyDoctor);

    if (verifyDoctor.length === 0) {
      throw new Error('Doctor record not found after insert');
    }

    // Small delay to ensure DB commit (for InnoDB)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create doctor admin record
    console.log('Creating doctor admin with doctorId:', doctorId);
    await db.insert(doctorAdmins).values({
      id: adminId,
      doctorId: doctorId,
      email,
      passwordHash,
      role: 'doctor',
      isActive: true,
    });

    console.log('Doctor admin created successfully');

    // Generate JWT token
    const token = generateToken({
      id: adminId,
      email,
      doctorId,
      role: 'doctor',
      userType: 'doctor',
    });

    // Prepare user data
    const userData = {
      id: adminId,
      email,
      doctorId,
      doctorName: name,
      doctorImage: null,
      doctorSpecialtyId: specialtyId,
      doctorLicenseNumber: licenseNumber,
      role: 'doctor',
      userType: 'doctor',
    };

    const response = NextResponse.json({
      success: true,
      message: 'Doctor registration successful',
      user: userData,
    });

    // Set HTTP-only cookie with the token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Set client-readable cookie
    response.cookies.set('auth-user', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Doctor signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}