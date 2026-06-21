import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';
import { z } from 'zod';

const createGradeSchema = z.object({
  enrollmentId: z.number(),
  gradeType: z.string(),
  score: z.number(),
  maxScore: z.number(),
  comments: z.string().optional(),
});

const updateGradeSchema = z.object({
  gradeType: z.string().optional(),
  score: z.number().optional(),
  maxScore: z.number().optional(),
  comments: z.string().optional(),
});

// GET /api/grades - Get all grades
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let grades;
    if (user.role === 'student') {
      // Students can only see their own grades
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
      grades = await prisma.grade.findMany({
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
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.role === 'teacher') {
      // Teachers can see grades for their classes
      grades = await prisma.grade.findMany({
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
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.role === 'parent') {
      // Parents can see their children's grades
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
      grades = await prisma.grade.findMany({
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
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Admins and department heads can see all grades
      grades = await prisma.grade.findMany({
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
        orderBy: { createdAt: 'desc' },
      });
    }
    
    return NextResponse.json(grades);
  } catch (error) {
    console.error('Get grades error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/grades - Create grade (admin, department_head, teacher)
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
    const validatedData = createGradeSchema.parse(body);

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

    // Teachers can only create grades for their classes
    if (user.role === 'teacher' && enrollment.class.teacherId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const grade = await prisma.grade.create({
      data: {
        ...validatedData,
        gradedBy: user.userId,
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
      },
    });
    
    return NextResponse.json(grade, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create grade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
