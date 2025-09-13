import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody, sanitizeInput, validateContentType } from '../middleware/validation';
import { 
  userRegistrationSchema, 
  userSignInSchema, 
  userProfileUpdateSchema 
} from '../validators/schemas';

const router = Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
});

// Register endpoint
router.post('/register', 
  authLimiter,
  validateContentType(),
  sanitizeInput,
  validateBody(userRegistrationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, full_name, role } = req.body;

    // Validation
    if (!email || !password || !full_name) {
      res.status(400).json({
        error: 'Email, password, and full name are required',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        error: 'Password must be at least 6 characters long',
      });
      return;
    }

    const result = await AuthService.registerUser({
      email,
      password,
      full_name,
      role,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      profile: result.profile,
    });
  })
);

// Sign in endpoint
router.post('/signin', 
  authLimiter,
  validateContentType(),
  sanitizeInput,
  validateBody(userSignInSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: 'Email and password are required',
      });
      return;
    }

    const result = await AuthService.signIn(email, password);

    res.json({
      message: 'Sign in successful',
      user: result.user,
      profile: result.profile,
    });
  })
);

// Sign out endpoint
router.post('/signout', asyncHandler(async (req: Request, res: Response) => {
  await AuthService.signOut();
  res.json({ message: 'Sign out successful' });
}));

// Get current user endpoint
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.getCurrentUser();
  
  if (!result) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  res.json({
    user: result.user,
    profile: result.profile,
  });
}));

// Update profile endpoint
router.put('/profile', 
  validateContentType(),
  sanitizeInput,
  validateBody(userProfileUpdateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, ...updates } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const result = await AuthService.updateProfile(userId, updates);

    res.json({
      message: 'Profile updated successfully',
      profile: result,
    });
  })
);

export default router;