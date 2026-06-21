import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';
import { z } from 'zod';

const createAttendanceSchema = z.object({
  enrollmentId: z.number(),
  date: z.string(),
  status: z.string(),
  notes: z.string().optional(),
});

const updateAttendanceSchema = z.object({
  status: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/attendance - Get all attendance records
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let attendance;
    if (user.role === 'student') {
      // Students can only see their own attendance
      const student = await prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (!student) {
        return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
      }
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: student.id },
        select: { id: true },
      });
      const enrollmentIds = enrollments.map(e => e.id);
      attendance = await prisma.attendance.findMany({
        where: { enrollmentId: { in: enrollmentIds } },
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
        orderBy: { date: 'desc' },
      });
    } else if (user.role === 'teacher') {
      // Teachers can see attendance for their classes
      attendance = await prisma.attendance.findMany({
        where: {
          enrollment: {
            class: {
              teacherId: user.userId,
            },
          },
        },
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
        orderBy: { date: 'desc' },
      });
    } else if (user.role === 'parent') {
      // Parents can see their children's attendance
      const students = await prisma.student.findMany({
        where: { parentId: user.userId },
        select: { id: true },
      });
      const studentIds = students.map(s => s.id);
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: { in: studentIds } },
        select: { id: true },
      });
      const enrollmentIds = enrollments.map(e => e.id);
      attendance = await prisma.attendance.findMany({
        where: { enrollmentId: { in: enrollmentIds } },
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
        orderBy: { date: 'desc' },
      });
    } else {
      // Admins and department heads can see all attendance
      attendance = await prisma.attendance.findMany({
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
        orderBy: { date: 'desc' },
      });
    }
    
    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/attendance - Create attendance record (admin, department_head, teacher)
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'department_head', 'teacher'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createAttendanceSchema.parse(body);

    // Verify enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: validatedData.enrollmentId },
      include: {
        class: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Teachers can only create attendance for their classes
    if (user.role === 'teacher' && enrollment.class.teacherId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if attendance already exists for this enrollment and date
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        enrollmentId_date: {
          enrollmentId: validatedData.enrollmentId,
          date: new Date(validatedData.date),
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json({ error: 'Attendance already exists for this date' }, { status: 400 });
    }

    const attendance = await prisma.attendance.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        markedBy: user.userId,
      },
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
    
    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
