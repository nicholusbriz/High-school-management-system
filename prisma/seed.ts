import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for Elite High School, Kampala Uganda...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Full system access',
    },
  });

  const teacherRole = await prisma.role.upsert({
    where: { name: 'teacher' },
    update: {},
    create: {
      name: 'teacher',
      description: 'Teacher access',
    },
  });

  const studentRole = await prisma.role.upsert({
    where: { name: 'student' },
    update: {},
    create: {
      name: 'student',
      description: 'Student access',
    },
  });

  const parentRole = await prisma.role.upsert({
    where: { name: 'parent' },
    update: {},
    create: {
      name: 'parent',
      description: 'Parent access',
    },
  });

  const departmentHeadRole = await prisma.role.upsert({
    where: { name: 'department_head' },
    update: {},
    create: {
      name: 'department_head',
      description: 'Department head access',
    },
  });

  console.log('✅ Roles created');

  // Hash password
  const hashedPassword = await bcrypt.hash('password', 12);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@elitehighschool.ug' },
    update: {},
    create: {
      email: 'admin@elitehighschool.ug',
      firstName: 'System',
      lastName: 'Administrator',
      password: hashedPassword,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  // Create department head user
  const deptHead = await prisma.user.upsert({
    where: { email: 'departhead@elitehighschool.ug' },
    update: {},
    create: {
      email: 'departhead@elitehighschool.ug',
      firstName: 'Grace',
      lastName: 'Nambi',
      password: hashedPassword,
      roleId: departmentHeadRole.id,
      isActive: true,
    },
  });

  // Create multiple teachers
  const teacher1 = await prisma.user.upsert({
    where: { email: 'teacher1@elitehighschool.ug' },
    update: {},
    create: {
      email: 'teacher1@elitehighschool.ug',
      firstName: 'John',
      lastName: 'Musoke',
      password: hashedPassword,
      roleId: teacherRole.id,
      isActive: true,
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: 'teacher2@elitehighschool.ug' },
    update: {},
    create: {
      email: 'teacher2@elitehighschool.ug',
      firstName: 'Mary',
      lastName: 'Nakamya',
      password: hashedPassword,
      roleId: teacherRole.id,
      isActive: true,
    },
  });

  const teacher3 = await prisma.user.upsert({
    where: { email: 'teacher3@elitehighschool.ug' },
    update: {},
    create: {
      email: 'teacher3@elitehighschool.ug',
      firstName: 'David',
      lastName: 'Kizza',
      password: hashedPassword,
      roleId: teacherRole.id,
      isActive: true,
    },
  });

  // Create multiple students
  const student1 = await prisma.user.upsert({
    where: { email: 'student1@elitehighschool.ug' },
    update: {},
    create: {
      email: 'student1@elitehighschool.ug',
      firstName: 'Sarah',
      lastName: 'Nakitto',
      password: hashedPassword,
      roleId: studentRole.id,
      isActive: true,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@elitehighschool.ug' },
    update: {},
    create: {
      email: 'student2@elitehighschool.ug',
      firstName: 'James',
      lastName: 'Ssempala',
      password: hashedPassword,
      roleId: studentRole.id,
      isActive: true,
    },
  });

  const student3 = await prisma.user.upsert({
    where: { email: 'student3@elitehighschool.ug' },
    update: {},
    create: {
      email: 'student3@elitehighschool.ug',
      firstName: 'Esther',
      lastName: 'Nansubuga',
      password: hashedPassword,
      roleId: studentRole.id,
      isActive: true,
    },
  });

  const student4 = await prisma.user.upsert({
    where: { email: 'student4@elitehighschool.ug' },
    update: {},
    create: {
      email: 'student4@elitehighschool.ug',
      firstName: 'Peter',
      lastName: 'Okello',
      password: hashedPassword,
      roleId: studentRole.id,
      isActive: true,
    },
  });

  // Create student records
  const studentRecord1 = await prisma.student.upsert({
    where: { userId: student1.id },
    update: {},
    create: {
      userId: student1.id,
      studentId: 'STU2024001',
      gradeLevel: 'S1',
      enrollmentDate: new Date('2024-01-15'),
    },
  });

  const studentRecord2 = await prisma.student.upsert({
    where: { userId: student2.id },
    update: {},
    create: {
      userId: student2.id,
      studentId: 'STU2024002',
      gradeLevel: 'S1',
      enrollmentDate: new Date('2024-01-15'),
    },
  });

  const studentRecord3 = await prisma.student.upsert({
    where: { userId: student3.id },
    update: {},
    create: {
      userId: student3.id,
      studentId: 'STU2024003',
      gradeLevel: 'S2',
      enrollmentDate: new Date('2024-01-15'),
    },
  });

  const studentRecord4 = await prisma.student.upsert({
    where: { userId: student4.id },
    update: {},
    create: {
      userId: student4.id,
      studentId: 'STU2024004',
      gradeLevel: 'S2',
      enrollmentDate: new Date('2024-01-15'),
    },
  });

  // Create parent users
  const parent1 = await prisma.user.upsert({
    where: { email: 'parent1@elitehighschool.ug' },
    update: {},
    create: {
      email: 'parent1@elitehighschool.ug',
      firstName: 'Robert',
      lastName: 'Nakitto',
      password: hashedPassword,
      roleId: parentRole.id,
      isActive: true,
    },
  });

  const parent2 = await prisma.user.upsert({
    where: { email: 'parent2@elitehighschool.ug' },
    update: {},
    create: {
      email: 'parent2@elitehighschool.ug',
      firstName: 'Joseph',
      lastName: 'Ssempala',
      password: hashedPassword,
      roleId: parentRole.id,
      isActive: true,
    },
  });

  // Update students with parents
  await prisma.student.update({
    where: { id: studentRecord1.id },
    data: { parentId: parent1.id },
  });

  await prisma.student.update({
    where: { id: studentRecord2.id },
    data: { parentId: parent2.id },
  });

  // Create departments
  const scienceDept = await prisma.department.upsert({
    where: { name: 'Science' },
    update: {},
    create: {
      name: 'Science',
      description: 'Science Department - Physics, Chemistry, Biology',
    },
  });

  const mathDept = await prisma.department.upsert({
    where: { name: 'Mathematics' },
    update: {},
    create: {
      name: 'Mathematics',
      description: 'Mathematics Department',
    },
  });

  const humanitiesDept = await prisma.department.upsert({
    where: { name: 'Humanities' },
    update: {},
    create: {
      name: 'Humanities',
      description: 'Humanities Department - English, History, Geography',
    },
  });

  // Create courses
  const mathCourse = await prisma.course.upsert({
    where: { code: 'MATH101' },
    update: {},
    create: {
      code: 'MATH101',
      name: 'Mathematics',
      description: 'Secondary Mathematics S1',
      departmentId: mathDept.id,
      credits: 3,
      gradeLevel: 'S1',
    },
  });

  const physicsCourse = await prisma.course.upsert({
    where: { code: 'PHY101' },
    update: {},
    create: {
      code: 'PHY101',
      name: 'Physics',
      description: 'Secondary Physics S1',
      departmentId: scienceDept.id,
      credits: 3,
      gradeLevel: 'S1',
    },
  });

  const englishCourse = await prisma.course.upsert({
    where: { code: 'ENG101' },
    update: {},
    create: {
      code: 'ENG101',
      name: 'English',
      description: 'Secondary English S1',
      departmentId: humanitiesDept.id,
      credits: 2,
      gradeLevel: 'S1',
    },
  });

  const chemistryCourse = await prisma.course.upsert({
    where: { code: 'CHEM101' },
    update: {},
    create: {
      code: 'CHEM101',
      name: 'Chemistry',
      description: 'Secondary Chemistry S2',
      departmentId: scienceDept.id,
      credits: 3,
      gradeLevel: 'S2',
    },
  });

  // Create classes
  const mathClass = await prisma.classModel.create({
    data: {
      section: 'A',
      roomNumber: '101',
      schedule: 'Mon-Wed-Fri 8:00-9:00',
      capacity: 30,
      courseId: mathCourse.id,
      teacherId: teacher1.id,
      academicYear: '2024',
      semester: '1',
    },
  });

  const physicsClass = await prisma.classModel.create({
    data: {
      section: 'A',
      roomNumber: '102',
      schedule: 'Tue-Thu 10:00-11:00',
      capacity: 30,
      courseId: physicsCourse.id,
      teacherId: teacher1.id,
      academicYear: '2024',
      semester: '1',
    },
  });

  const englishClass = await prisma.classModel.create({
    data: {
      section: 'B',
      roomNumber: '103',
      schedule: 'Mon-Wed-Fri 9:00-10:00',
      capacity: 30,
      courseId: englishCourse.id,
      teacherId: teacher2.id,
      academicYear: '2024',
      semester: '1',
    },
  });

  const chemistryClass = await prisma.classModel.create({
    data: {
      section: 'A',
      roomNumber: '104',
      schedule: 'Tue-Thu 11:00-12:00',
      capacity: 30,
      courseId: chemistryCourse.id,
      teacherId: teacher3.id,
      academicYear: '2024',
      semester: '1',
    },
  });

  // Create enrollments
  const enrollment1 = await prisma.enrollment.create({
    data: {
      studentId: studentRecord1.id,
      classId: mathClass.id,
      enrollmentDate: new Date('2024-01-15'),
    },
  });

  const enrollment2 = await prisma.enrollment.create({
    data: {
      studentId: studentRecord1.id,
      classId: physicsClass.id,
      enrollmentDate: new Date('2024-01-15'),
    },
  });

  const enrollment3 = await prisma.enrollment.create({
    data: {
      studentId: studentRecord1.id,
      classId: englishClass.id,
      enrollmentDate: new Date('2024-01-15'),
    },
  });

  const enrollment4 = await prisma.enrollment.create({
    data: {
      studentId: studentRecord2.id,
      classId: mathClass.id,
      enrollmentDate: new Date('2024-01-15'),
    },
  });

  const enrollment5 = await prisma.enrollment.create({
    data: {
      studentId: studentRecord2.id,
      classId: physicsClass.id,
      enrollmentDate: new Date('2024-01-15'),
    },
  });

  const enrollment6 = await prisma.enrollment.create({
    data: {
      studentId: studentRecord3.id,
      classId: chemistryClass.id,
      enrollmentDate: new Date('2024-01-15'),
    },
  });

  const enrollment7 = await prisma.enrollment.create({
    data: {
      studentId: studentRecord4.id,
      classId: chemistryClass.id,
      enrollmentDate: new Date('2024-01-15'),
    },
  });

  // Create assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Algebra Quiz 1',
      description: 'First quiz on algebra concepts',
      dueDate: new Date('2024-02-15'),
      maxScore: 100,
      classId: mathClass.id,
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'Physics Lab Report',
      description: 'Complete lab report on motion',
      dueDate: new Date('2024-02-20'),
      maxScore: 50,
      classId: physicsClass.id,
    },
  });

  const assignment3 = await prisma.assignment.create({
    data: {
      title: 'Essay Writing',
      description: 'Write a 500-word essay on leadership',
      dueDate: new Date('2024-02-18'),
      maxScore: 100,
      classId: englishClass.id,
    },
  });

  const assignment4 = await prisma.assignment.create({
    data: {
      title: 'Chemistry Practical',
      description: 'Complete chemical reactions experiment',
      dueDate: new Date('2024-02-25'),
      maxScore: 75,
      classId: chemistryClass.id,
    },
  });

  // Create submissions
  const submission1 = await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: studentRecord1.id,
      content: 'Quiz answers submitted',
      submittedAt: new Date('2024-02-14'),
    },
  });

  const submission2 = await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: studentRecord2.id,
      content: 'Quiz answers submitted',
      submittedAt: new Date('2024-02-14'),
    },
  });

  const submission3 = await prisma.submission.create({
    data: {
      assignmentId: assignment2.id,
      studentId: studentRecord1.id,
      content: 'Lab report submitted',
      submittedAt: new Date('2024-02-19'),
    },
  });

  // Create grades
  await prisma.grade.create({
    data: {
      enrollmentId: enrollment1.id,
      gradeType: 'quiz',
      score: 85,
      maxScore: 100,
      comments: 'Good performance',
      gradedBy: teacher1.id,
    },
  });

  await prisma.grade.create({
    data: {
      enrollmentId: enrollment4.id,
      gradeType: 'quiz',
      score: 92,
      maxScore: 100,
      comments: 'Excellent work',
      gradedBy: teacher1.id,
    },
  });

  await prisma.grade.create({
    data: {
      enrollmentId: enrollment2.id,
      gradeType: 'lab',
      score: 45,
      maxScore: 50,
      comments: 'Well done',
      gradedBy: teacher1.id,
    },
  });

  // Create attendance records
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.attendance.create({
    data: {
      enrollmentId: enrollment1.id,
      date: today,
      status: 'present',
      markedBy: teacher1.id,
    },
  });

  await prisma.attendance.create({
    data: {
      enrollmentId: enrollment4.id,
      date: today,
      status: 'present',
      markedBy: teacher1.id,
    },
  });

  await prisma.attendance.create({
    data: {
      enrollmentId: enrollment2.id,
      date: today,
      status: 'absent',
      notes: 'Sick leave',
      markedBy: teacher1.id,
    },
  });

  await prisma.attendance.create({
    data: {
      enrollmentId: enrollment1.id,
      date: yesterday,
      status: 'present',
      markedBy: teacher1.id,
    },
  });

  await prisma.attendance.create({
    data: {
      enrollmentId: enrollment4.id,
      date: yesterday,
      status: 'present',
      markedBy: teacher1.id,
    },
  });

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: student1.id,
      title: 'New Assignment Posted',
      message: 'Algebra Quiz 1 has been posted. Due date: Feb 15, 2024',
      type: 'assignment',
    },
  });

  await prisma.notification.create({
    data: {
      userId: student1.id,
      title: 'Grade Posted',
      message: 'Your grade for Algebra Quiz 1 has been posted: 85/100',
      type: 'grade',
    },
  });

  await prisma.notification.create({
    data: {
      userId: parent1.id,
      title: 'Attendance Alert',
      message: 'Sarah Nakitto was absent today',
      type: 'attendance',
    },
  });

  await prisma.notification.create({
    data: {
      userId: teacher1.id,
      title: 'New Enrollment',
      message: 'James Ssempala has been enrolled in your Mathematics class',
      type: 'enrollment',
    },
  });

  console.log('✅ Comprehensive test data created');
  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('📋 Test Credentials:');
  console.log('Admin: admin@elitehighschool.ug / password');
  console.log('Department Head: departhead@elitehighschool.ug / password');
  console.log('Teachers: teacher1@elitehighschool.ug / password');
  console.log('         teacher2@elitehighschool.ug / password');
  console.log('         teacher3@elitehighschool.ug / password');
  console.log('Students: student1@elitehighschool.ug / password');
  console.log('         student2@elitehighschool.ug / password');
  console.log('         student3@elitehighschool.ug / password');
  console.log('         student4@elitehighschool.ug / password');
  console.log('Parents: parent1@elitehighschool.ug / password');
  console.log('        parent2@elitehighschool.ug / password');
  console.log('');
  console.log('📊 Test Data Summary:');
  console.log('- 5 Roles (admin, teacher, student, parent, department_head)');
  console.log('- 8 Users (1 admin, 1 dept head, 3 teachers, 4 students, 2 parents)');
  console.log('- 4 Student records');
  console.log('- 3 Departments (Science, Mathematics, Humanities)');
  console.log('- 4 Courses (Mathematics, Physics, English, Chemistry)');
  console.log('- 4 Classes');
  console.log('- 7 Enrollments');
  console.log('- 4 Assignments');
  console.log('- 3 Submissions');
  console.log('- 3 Grades');
  console.log('- 5 Attendance records');
  console.log('- 4 Notifications');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
