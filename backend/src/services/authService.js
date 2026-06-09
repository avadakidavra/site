import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../models/prismaClient.js';

const SALT_ROUNDS = 10;

export function normalizeRole(role) {
  return String(role || 'USER').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
}

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function registerUser({ email, password, role }) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: normalizeRole(role)
    },
    select: { id: true, email: true, role: true }
  });

  return { user, token: signToken(user) };
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const safeUser = { id: user.id, email: user.email, role: user.role };
  return { user: safeUser, token: signToken(safeUser) };
}
