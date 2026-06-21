import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';
import { z } from 'zod';

const createEnrollmentSchema = z.object({
  studentId: z.number(),
  classId: z.number(),
});

const updateEnrollmentSchema = z.object({
  status: z.string().optional(),
});

// GET /api/enrollments - Get all enrollments
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Filter based on role
    let enrollments;
    if (user.role === 'student') {
      // Students can only see their own enrollments
      const student = await prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (!student) {
        return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
      }
      enrollments = await prisma.enrollment.findMany({
        where: { studentId: student.id },
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
      });
    } else if (user.role === 'teacher') {
      // Teachers can see enrollments for their classes
      enrollments = await prisma.enrollment.findMany({
        where: {
          class: {
            teacherId: user.userId,
          },
        },
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
      });
    } else {
      // Admins and department heads can see all enrollments
      enrollments = await prisma.enrollment.findMany({
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
      });
    }
    
    return NextResponse.json(enrollments);
  } catch (error) {
    console.error('Get enrollments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/enrollments - Create enrollment (admin, department_head, teacher)
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
    const validatedData = createEnrollmentSchema.parse(body);

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: validatedData.studentId },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Verify class exists
    const classData = await prisma.classModel.findUnique({
      where: { id: validatedData.classId },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_classId: {
          studentId: validatedData.studentId,
          classId: validatedData.classId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Student already enrolled in this class' }, { status: 400 });
    }

    // Check class capacity
    const currentEnrollments = await prisma.enrollment.count({
      where: { classId: validatedData.classId },
    });

    if (currentEnrollments >= classData.capacity) {
      return NextResponse.json({ error: 'Class is at full capacity' }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.create({
      data: validatedData,
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
    });
    
    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create enrollment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
