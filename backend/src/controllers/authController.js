import { loginUser, registerUser } from '../services/authService.js';

function validateAuthInput(email, password) {
  if (!email || !email.includes('@')) {
    return 'Valid email is required';
  }

  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  return null;
}

export async function register(req, res, next) {
  try {
    const { email, password, role } = req.body;
    const validationError = validateAuthInput(email, password);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const result = await registerUser({ email, password, role });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const validationError = validateAuthInput(email, password);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const result = await loginUser({ email, password });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}
