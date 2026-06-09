import prisma from '../models/prismaClient.js';

export async function getCourses(req, res, next) {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { id: 'desc' },
      include: {
        _count: {
          select: { lessons: true, tests: true }
        }
      }
    });

    return res.json(courses);
  } catch (error) {
    return next(error);
  }
}

export async function createCourse(req, res, next) {
  try {
    const { title, description } = req.body;

    if (!title || title.trim().length < 2) {
      return res.status(400).json({ message: 'Course title is required' });
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        description: description?.trim() || ''
      }
    });

    return res.status(201).json(course);
  } catch (error) {
    return next(error);
  }
}

export async function getCourseById(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'Invalid course id' });
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { id: 'asc' } },
        tests: {
          orderBy: { id: 'asc' },
          select: { id: true, question: true, courseId: true }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    return res.json(course);
  } catch (error) {
    return next(error);
  }
}
