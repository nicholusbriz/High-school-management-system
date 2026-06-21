import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';
import { z } from 'zod';

const updateClassSchema = z.object({
  section: z.string().optional(),
  roomNumber: z.string().optional(),
  schedule: z.string().optional(),
  capacity: z.number().min(1).optional(),
  academicYear: z.string().optional(),
  semester: z.string().optional(),
});

// GET /api/classes/[id] - Get single class (all authenticated users)
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
    const classId = parseInt(resolvedParams.id);
    const classData = await prisma.classModel.findUnique({
      where: { id: classId },
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
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }
    
    return NextResponse.json(classData);
  } catch (error) {
    console.error('Get class error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/classes/[id] - Update class (admin, department_head only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'department_head'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const classId = parseInt(resolvedParams.id);
    const body = await request.json();
    const validatedData = updateClassSchema.parse(body);

    // Check if class exists
    const existingClass = await prisma.classModel.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const updatedClass = await prisma.classModel.update({
      where: { id: classId },
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
    
    return NextResponse.json(updatedClass);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update class error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/classes/[id] - Delete class (admin only)
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
    const classId = parseInt(resolvedParams.id);

    // Check if class exists
    const existingClass = await prisma.classModel.findUnique({
      where: { id: classId },
      include: {
        enrollments: true,
        assignments: true,
      },
    });

    if (!existingClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check if class has enrollments or assignments
    if (existingClass.enrollments.length > 0 || existingClass.assignments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete class with existing enrollments or assignments' },
        { status: 400 }
      );
    }

    // Delete class
    await prisma.classModel.delete({
      where: { id: classId },
    });
    
    return NextResponse.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
