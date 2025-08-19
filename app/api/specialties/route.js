import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { specialties } from '@/lib/db/schema';
import { desc, like } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let whereCondition;
    if (search) {
      whereCondition = like(specialties.name, `%${search}%`);
    }

    const specialtiesList = await db
      .select({
        id: specialties.id,
        name: specialties.name,
        description: specialties.description,
        icon: specialties.icon,
        createdAt: specialties.createdAt,
      })
      .from(specialties)
      .where(whereCondition)
      .orderBy(specialties.name);

    return NextResponse.json({
      success: true,
      specialties: specialtiesList,
    });
  } catch (error) {
    console.error('Specialties fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specialties' },
      { status: 500 }
    );
  }
}