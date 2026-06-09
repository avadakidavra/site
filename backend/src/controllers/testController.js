import prisma from '../models/prismaClient.js';

export async function createTest(req, res, next) {
  try {
    const { question, answer, courseId, questions } = req.body;
    const parsedCourseId = Number(courseId);
    const items = Array.isArray(questions)
      ? questions
      : [{ question, answer }];
    const normalizedItems = items
      .map((item) => ({
        question: String(item.question || '').trim(),
        answer: String(item.answer || '').trim()
      }))
      .filter((item) => item.question && item.answer);

    if (!Number.isInteger(parsedCourseId) || normalizedItems.length === 0) {
      return res.status(400).json({ message: 'CourseId and at least one question with answer are required' });
    }

    const course = await prisma.course.findUnique({ where: { id: parsedCourseId } });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const tests = await prisma.$transaction(
      normalizedItems.map((item) => prisma.test.create({
        data: {
          question: item.question,
          answer: item.answer,
          courseId: parsedCourseId
        }
      }))
    );

    return res.status(201).json({ count: tests.length, tests });
  } catch (error) {
    return next(error);
  }
}

export async function submitTest(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { answer } = req.body;

    if (!Number.isInteger(id) || !answer) {
      return res.status(400).json({ message: 'Test id and answer are required' });
    }

    const test = await prisma.test.findUnique({ where: { id } });
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const correct = test.answer.trim().toLowerCase() === String(answer).trim().toLowerCase();
    return res.json({ correct });
  } catch (error) {
    return next(error);
  }
}
