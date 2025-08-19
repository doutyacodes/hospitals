import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real application, this would fetch the doctor's profile from your database
    // based on the authenticated doctor user
    
    const mockProfile = {
      id: 'doctor-1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1-555-0123',
      qualification: 'MBBS, MD (Cardiology)',
      experience: 8,
      bio: 'Experienced cardiologist specializing in interventional cardiology and heart disease prevention.',
      consultationFee: 500,
      specialtyId: 'cardiology-1',
      city: 'Mumbai',
      state: 'Maharashtra',
      address: '123 Medical District, Mumbai',
      licenseNumber: 'MH-DOC-12345',
      bankAccount: 'HDFC Bank - ****1234'
    };

    return NextResponse.json({
      success: true,
      doctor: mockProfile
    });
  } catch (error) {
    console.error('Doctor profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const profileData = await request.json();
    
    // In a real application, this would update the doctor's profile in your database
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Doctor profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}