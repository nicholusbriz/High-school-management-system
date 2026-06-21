import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';
import { z } from 'zod';

const updateAttendanceSchema = z.object({
  status: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/attendance/[id] - Get single attendance record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const attendanceId = parseInt(resolvedParams.id);
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        enrollment: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
            class: {
              include: {
                course: true,
                teacher: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        markedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!attendance) {
      return NextResponse.json({ error: 'Attendance not found' }, { status: 404 });
    }

    // Check access permissions
    if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (!student || student.id !== attendance.enrollment.studentId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (user.role === 'teacher') {
      if (attendance.enrollment.class.teacherId !== user.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (user.role === 'parent') {
      const student = await prisma.student.findUnique({
        where: { id: attendance.enrollment.studentId },
      });
      if (!student || student.parentId !== user.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    
    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/attendance/[id] - Update attendance
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'department_head', 'teacher'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const attendanceId = parseInt(resolvedParams.id);
    const body = await request.json();
    const validatedData = updateAttendanceSchema.parse(body);

    // Check if attendance exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        enrollment: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!existingAttendance) {
      return NextResponse.json({ error: 'Attendance not found' }, { status: 404 });
    }

    // Teachers can only update attendance for their classes
    if (user.role === 'teacher' && existingAttendance.enrollment.class.teacherId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: validatedData,
      include: {
        enrollment: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
            class: {
              include: {
                course: true,
              },
            },
          },
        },
        markedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedAttendance);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/attendance/[id] - Delete attendance (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const attendanceId = parseInt(resolvedParams.id);

    // Check if attendance exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!existingAttendance) {
      return NextResponse.json({ error: 'Attendance not found' }, { status: 404 });
    }

    // Delete attendance
    await prisma.attendance.delete({
      where: { id: attendanceId },
    });
    
    return NextResponse.json({ message: 'Attendance deleted successfully' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
