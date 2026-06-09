import prisma from '../models/prismaClient.js';

export async function createLesson(req, res, next) {
  try {
    const { title, content, courseId } = req.body;
    const parsedCourseId = Number(courseId);

    if (!title || !content || !Number.isInteger(parsedCourseId)) {
      return res.status(400).json({ message: 'Title, content and courseId are required' });
    }

    const course = await prisma.course.findUnique({ where: { id: parsedCourseId } });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        courseId: parsedCourseId
      }
    });

    return res.status(201).json(lesson);
  } catch (error) {
    return next(error);
  }
}
