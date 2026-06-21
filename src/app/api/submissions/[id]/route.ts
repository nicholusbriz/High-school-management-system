import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';
import { z } from 'zod';

const updateSubmissionSchema = z.object({
  content: z.string().optional(),
  filePath: z.string().optional(),
  grade: z.number().optional(),
  feedback: z.string().optional(),
});

// GET /api/submissions/[id] - Get single submission
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
    const submissionId = parseInt(resolvedParams.id);
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
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
          },
        },
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
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Check access permissions
    if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (!student || student.id !== submission.studentId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (user.role === 'teacher') {
      if (submission.assignment.class.teacherId !== user.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    
    return NextResponse.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/submissions/[id] - Update submission
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const submissionId = parseInt(resolvedParams.id);
    const body = await request.json();
    const validatedData = updateSubmissionSchema.parse(body);

    // Check if submission exists
    const existingSubmission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Students can only update their own submissions (content, filePath)
    if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (!student || student.id !== existingSubmission.studentId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      // Students cannot update grade or feedback
      if (validatedData.grade !== undefined || validatedData.feedback !== undefined) {
        return NextResponse.json({ error: 'Cannot update grade or feedback' }, { status: 403 });
      }
    } else if (user.role === 'teacher') {
      // Teachers can only update submissions for their classes
      if (existingSubmission.assignment.class.teacherId !== user.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      // Teachers can only update grade and feedback
      if (validatedData.content !== undefined || validatedData.filePath !== undefined) {
        return NextResponse.json({ error: 'Cannot update submission content' }, { status: 403 });
      }
    } else {
      // Admins and department heads can update everything
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: validatedData,
      include: {
        assignment: {
          include: {
            class: {
              include: {
                course: true,
              },
            },
          },
        },
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
    });
    
    return NextResponse.json(updatedSubmission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/submissions/[id] - Delete submission (admin, student for own submissions)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const submissionId = parseInt(resolvedParams.id);

    // Check if submission exists
    const existingSubmission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Students can only delete their own submissions
    if (user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (!student || student.id !== existingSubmission.studentId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (!['admin', 'department_head'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete submission
    await prisma.submission.delete({
      where: { id: submissionId },
    });
    
    return NextResponse.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Delete submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
