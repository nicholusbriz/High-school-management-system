import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';
import { z } from 'zod';

const createClassSchema = z.object({
  courseId: z.number(),
  teacherId: z.number(),
  section: z.string(),
  roomNumber: z.string().optional(),
  schedule: z.string().optional(),
  capacity: z.number().min(1).default(30),
  academicYear: z.string(),
  semester: z.string(),
});

const updateClassSchema = z.object({
  section: z.string().optional(),
  roomNumber: z.string().optional(),
  schedule: z.string().optional(),
  capacity: z.number().min(1).optional(),
  academicYear: z.string().optional(),
  semester: z.string().optional(),
});

// GET /api/classes - Get all classes (all authenticated users)
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classes = await prisma.classModel.findMany({
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
        enrollments: {
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
          },
        },
        assignments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/classes - Create class (admin, department_head only)
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'department_head'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createClassSchema.parse(body);

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: validatedData.courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Verify teacher exists
    const teacher = await prisma.user.findUnique({
      where: { id: validatedData.teacherId },
      include: { role: true },
    });

    if (!teacher || teacher.role.name !== 'teacher') {
      return NextResponse.json({ error: 'Invalid teacher' }, { status: 400 });
    }

    const newClass = await prisma.classModel.create({
      data: validatedData,
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
    });
    
    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create class error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
