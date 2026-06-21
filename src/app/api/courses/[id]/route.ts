import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';
import { z } from 'zod';

const updateCourseSchema = z.object({
  code: z.string().min(2).optional(),
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  departmentId: z.number().optional(),
  credits: z.number().min(1).optional(),
  gradeLevel: z.string().optional(),
});

// GET /api/courses/[id] - Get single course (all authenticated users)
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
    const courseId = parseInt(resolvedParams.id);
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        department: true,
        classes: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    return NextResponse.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/courses/[id] - Update course (admin, department_head only)
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
    const courseId = parseInt(resolvedParams.id);
    const body = await request.json();
    const validatedData = updateCourseSchema.parse(body);

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if new code conflicts with existing course
    if (validatedData.code && validatedData.code !== existingCourse.code) {
      const codeConflict = await prisma.course.findUnique({
        where: { code: validatedData.code },
      });
      if (codeConflict) {
        return NextResponse.json({ error: 'Course code already exists' }, { status: 400 });
      }
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: validatedData,
      include: {
        department: true,
      },
    });
    
    return NextResponse.json(updatedCourse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update course error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/courses/[id] - Delete course (admin only)
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
    const courseId = parseInt(resolvedParams.id);

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        classes: true,
      },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if course has classes
    if (existingCourse.classes.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with existing classes' },
        { status: 400 }
      );
    }

    // Delete course
    await prisma.course.delete({
      where: { id: courseId },
    });
    
    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
