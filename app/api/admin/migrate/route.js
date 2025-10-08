import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function POST(request) {
  const results = [];

  try {
    // Try to add current_token column
    try {
      await db.execute(sql`
        ALTER TABLE doctor_sessions
        ADD COLUMN current_token INT DEFAULT 0 AFTER current_token_number
      `);
      console.log('✅ Added current_token column');
      results.push('Added current_token column');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('⚠️ current_token column already exists');
        results.push('current_token column already exists (skipped)');
      } else {
        throw err;
      }
    }

    // Try to add last_recall_at column
    try {
      await db.execute(sql`
        ALTER TABLE doctor_sessions
        ADD COLUMN last_recall_at INT DEFAULT 0 AFTER current_token
      `);
      console.log('✅ Added last_recall_at column');
      results.push('Added last_recall_at column');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('⚠️ last_recall_at column already exists');
        results.push('last_recall_at column already exists (skipped)');
      } else {
        throw err;
      }
    }

    // Update existing sessions
    await db.execute(sql`
      UPDATE doctor_sessions
      SET current_token = COALESCE(current_token, 0),
          last_recall_at = COALESCE(last_recall_at, 0)
    `);

    console.log('✅ Updated existing sessions with default values');
    results.push('Updated existing sessions');

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully!',
      results: results,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Migration failed: ' + error.message,
        error: error.toString(),
        completedSteps: results,
      },
      { status: 500 }
    );
  }
}
