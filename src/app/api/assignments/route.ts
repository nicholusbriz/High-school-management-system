import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';
import { z } from 'zod';

const createAssignmentSchema = z.object({
  classId: z.number(),
  title: z.string().min(2),
  description: z.string().optional(),
  dueDate: z.string(),
  maxScore: z.number().min(0),
  attachmentPath: z.string().optional(),
});

const updateAssignmentSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  maxScore: z.number().min(0).optional(),
  attachmentPath: z.string().optional(),
});

// GET /api/assignments - Get all assignments
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let assignments;
    if (user.role === 'student') {
      // Students can only see assignments for their enrolled classes
      const student = await prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (!student) {
        return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
      }
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: student.id },
        select: { classId: true },
      });
      const classIds = enrollments.map(e => e.classId);
      assignments = await prisma.assignment.findMany({
        where: { classId: { in: classIds } },
        include: {
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
          submissions: {
            where: { studentId: student.id },
          },
        },
        orderBy: { dueDate: 'asc' },
      });
    } else if (user.role === 'teacher') {
      // Teachers can see assignments for their classes
      assignments = await prisma.assignment.findMany({
        where: {
          class: {
            teacherId: user.userId,
          },
        },
        include: {
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
          submissions: true,
        },
        orderBy: { dueDate: 'asc' },
      });
    } else {
      // Admins and department heads can see all assignments
      assignments = await prisma.assignment.findMany({
        include: {
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
          submissions: true,
        },
        orderBy: { dueDate: 'asc' },
      });
    }
    
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/assignments - Create assignment (admin, department_head, teacher)
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
    const validatedData = createAssignmentSchema.parse(body);

    // Verify class exists
    const classData = await prisma.classModel.findUnique({
      where: { id: validatedData.classId },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Teachers can only create assignments for their classes
    if (user.role === 'teacher' && classData.teacherId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        ...validatedData,
        dueDate: new Date(validatedData.dueDate),
      },
      include: {
        class: {
          include: {
            course: true,
          },
        },
      },
    });
    
    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create assignment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
