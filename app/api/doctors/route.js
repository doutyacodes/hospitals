import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctors, specialties, doctorSessions } from '@/lib/db/schema';
import { eq, and, desc, like, sql } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';
import { generateId } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    if (search) {
      whereConditions.push(like(doctors.name, `%${search}%`));
    }

    // Get doctors with their specialties and session info for this hospital
    const hospitalDoctors = await db
      .select({
        id: doctors.id,
        name: doctors.name,
        email: doctors.email,
        phone: doctors.phone,
        qualification: doctors.qualification,
        experience: doctors.experience,
        bio: doctors.bio,
        image: doctors.image,
        rating: doctors.rating,
        totalReviews: doctors.totalReviews,
        consultationFee: doctors.consultationFee,
        isAvailable: doctors.isAvailable,
        licenseNumber: doctors.licenseNumber,
        specialtyName: specialties.name,
        specialtyId: doctors.specialtyId,
        sessionCount: sql`COUNT(${doctorSessions.id})`,
        createdAt: doctors.createdAt,
      })
      .from(doctors)
      .leftJoin(specialties, eq(doctors.specialtyId, specialties.id))
      .leftJoin(doctorSessions, and(
        eq(doctorSessions.doctorId, doctors.id),
        eq(doctorSessions.hospitalId, decoded.hospitalId)
      ))
      .where(whereConditions.length > 0 ? whereConditions[0] : undefined)
      .groupBy(doctors.id, specialties.name)
      .having(sql`COUNT(${doctorSessions.id}) > 0`)
      .orderBy(desc(doctors.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql`COUNT(DISTINCT ${doctors.id})` })
      .from(doctors)
      .leftJoin(doctorSessions, and(
        eq(doctorSessions.doctorId, doctors.id),
        eq(doctorSessions.hospitalId, decoded.hospitalId)
      ))
      .where(whereConditions.length > 0 ? whereConditions[0] : undefined)
      .having(sql`COUNT(${doctorSessions.id}) > 0`);

    return NextResponse.json({
      success: true,
      doctors: hospitalDoctors,
      pagination: {
        page,
        limit,
        total: parseInt(totalCount[0]?.count || '0'),
        totalPages: Math.ceil(parseInt(totalCount[0]?.count || '0') / limit),
      },
    });
  } catch (error) {
    console.error('Doctors fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      specialtyId,
      qualification,
      experience,
      bio,
      consultationFee,
      licenseNumber,
      sessions,
    } = body;

    // Validate required fields
    if (!name || !email || !phone || !specialtyId || !qualification || !experience || !bio || !consultationFee || !licenseNumber) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const doctorId = generateId();
    const hospitalId = decoded.hospitalId;

    // Insert doctor
    await db.insert(doctors).values({
      id: doctorId,
      name,
      email,
      phone,
      specialtyId,
      qualification,
      experience: parseInt(experience),
      bio,
      consultationFee: parseFloat(consultationFee),
      licenseNumber,
    });

    // Insert doctor sessions if provided
    if (sessions && sessions.length > 0) {
      const sessionData = sessions.map(session => ({
        id: generateId(),
        doctorId,
        hospitalId,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        maxTokens: parseInt(session.maxTokens),
        avgMinutesPerPatient: parseInt(session.avgMinutesPerPatient || 15),
      }));

      await db.insert(doctorSessions).values(sessionData);
    }

    return NextResponse.json({
      success: true,
      message: 'Doctor added successfully',
      doctorId,
    });
  } catch (error) {
    console.error('Doctor creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create doctor' },
      { status: 500 }
    );
  }
}