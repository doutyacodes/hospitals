import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming');

    // In a real application, this would fetch actual data from your database
    // based on the authenticated doctor user and filters
    
    const mockAppointments = [
      {
        id: '1',
        patientName: 'John Doe',
        patientEmail: 'john@example.com',
        hospitalName: 'City General Hospital',
        appointmentDate: '2024-01-15',
        tokenNumber: 5,
        estimatedTime: '10:30 AM',
        status: 'confirmed',
        consultationFee: 500
      },
      {
        id: '2',
        patientName: 'Jane Smith',
        patientEmail: 'jane@example.com',
        hospitalName: 'Metro Medical Center',
        appointmentDate: '2024-01-15',
        tokenNumber: 3,
        estimatedTime: '2:15 PM',
        status: 'pending',
        consultationFee: 600
      }
    ];

    const mockStatusSummary = [
      { status: 'pending', count: 8 },
      { status: 'confirmed', count: 25 },
      { status: 'completed', count: 120 },
      { status: 'cancelled', count: 5 }
    ];

    return NextResponse.json({
      success: true,
      appointments: upcoming === 'true' ? mockAppointments.slice(0, 1) : mockAppointments,
      data: upcoming === 'true' ? mockAppointments.slice(0, 1) : mockAppointments,
      statusSummary: mockStatusSummary,
      pagination: {
        currentPage: page,
        totalPages: 1,
        totalItems: mockAppointments.length
      }
    });
  } catch (error) {
    console.error('Doctor appointments fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { appointmentId, status, doctorNotes } = await request.json();

    // In a real application, this would update the appointment in your database
    
    return NextResponse.json({
      success: true,
      message: `Appointment ${status} successfully`
    });
  } catch (error) {
    console.error('Doctor appointment update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}