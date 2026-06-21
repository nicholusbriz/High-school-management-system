import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';
import { z } from 'zod';

const updateGradeSchema = z.object({
  gradeType: z.string().optional(),
  score: z.number().optional(),
  maxScore: z.number().optional(),
  comments: z.string().optional(),
});

// GET /api/grades/[id] - Get single grade
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
    const gradeId = parseInt(resolvedParams.id);
    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
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
        gradedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approvedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!grade) {
      return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
    }

    // Check access permissions
    if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (!student || student.id !== grade.enrollment.studentId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (user.role === 'teacher') {
      if (grade.enrollment.class.teacherId !== user.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (user.role === 'parent') {
      const student = await prisma.student.findUnique({
        where: { id: grade.enrollment.studentId },
      });
      if (!student || student.parentId !== user.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    
    return NextResponse.json(grade);
  } catch (error) {
    console.error('Get grade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/grades/[id] - Update grade
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
    const gradeId = parseInt(resolvedParams.id);
    const body = await request.json();
    const validatedData = updateGradeSchema.parse(body);

    // Check if grade exists
    const existingGrade = await prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        enrollment: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!existingGrade) {
      return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
    }

    // Teachers can only update grades for their classes
    if (user.role === 'teacher' && existingGrade.enrollment.class.teacherId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If grade is already approved, only admins can modify it
    if (existingGrade.approvedAt && user.role !== 'admin') {
      return NextResponse.json({ error: 'Cannot modify approved grade' }, { status: 403 });
    }

    const updatedGrade = await prisma.grade.update({
      where: { id: gradeId },
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
        gradedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedGrade);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update grade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/grades/[id] - Delete grade (admin only)
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
    const gradeId = parseInt(resolvedParams.id);

    // Check if grade exists
    const existingGrade = await prisma.grade.findUnique({
      where: { id: gradeId },
    });

    if (!existingGrade) {
      return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
    }

    // Delete grade
    await prisma.grade.delete({
      where: { id: gradeId },
    });
    
    return NextResponse.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Delete grade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
