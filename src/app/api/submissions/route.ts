import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';
import { z } from 'zod';

const createSubmissionSchema = z.object({
  assignmentId: z.number(),
  studentId: z.number(),
  content: z.string().optional(),
  filePath: z.string().optional(),
});

const updateSubmissionSchema = z.object({
  content: z.string().optional(),
  filePath: z.string().optional(),
  grade: z.number().optional(),
  feedback: z.string().optional(),
});

// GET /api/submissions - Get all submissions
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let submissions;
    if (user.role === 'student') {
      // Students can only see their own submissions
      const student = await prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (!student) {
        return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
      }
      submissions = await prisma.submission.findMany({
        where: { studentId: student.id },
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
        orderBy: { submittedAt: 'desc' },
      });
    } else if (user.role === 'teacher') {
      // Teachers can see submissions for their classes
      submissions = await prisma.submission.findMany({
        where: {
          assignment: {
            class: {
              teacherId: user.userId,
            },
          },
        },
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
        orderBy: { submittedAt: 'desc' },
      });
    } else {
      // Admins and department heads can see all submissions
      submissions = await prisma.submission.findMany({
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
        orderBy: { submittedAt: 'desc' },
      });
    }
    
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/submissions - Create submission (students only)
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createSubmissionSchema.parse(body);

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: validatedData.studentId },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Verify student is the authenticated user
    if (student.userId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: validatedData.assignmentId },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Check if submission already exists
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: validatedData.assignmentId,
          studentId: validatedData.studentId,
        },
      },
    });

    if (existingSubmission) {
      return NextResponse.json({ error: 'Submission already exists' }, { status: 400 });
    }

    const submission = await prisma.submission.create({
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
      },
    });
    
    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
