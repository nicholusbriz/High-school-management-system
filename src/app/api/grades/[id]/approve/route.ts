import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';

// POST /api/grades/[id]/approve - Approve grade (admin, department_head)
export async function POST(
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
    const gradeId = parseInt(resolvedParams.id);

    // Check if grade exists
    const existingGrade = await prisma.grade.findUnique({
      where: { id: gradeId },
    });

    if (!existingGrade) {
      return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
    }

    // Approve grade
    const approvedGrade = await prisma.grade.update({
      where: { id: gradeId },
      data: {
        approvedBy: user.userId,
        approvedAt: new Date(),
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
    
    return NextResponse.json(approvedGrade);
  } catch (error) {
    console.error('Approve grade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
