import { Router, Request, Response } from 'express';
import { CompanyService } from '../services/companyService';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody, validateParams, validateQuery, sanitizeInput, validateContentType } from '../middleware/validation';
import { 
  companyCreateSchema, 
  companyUpdateSchema, 
  employeeCreateSchema, 
  employeeUpdateSchema,
  uuidParamSchema,
  paginationSchema 
} from '../validators/schemas';

const router = Router();

// Rate limiting for company endpoints
const companyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many requests, please try again later.',
});

// Create company endpoint
router.post('/', companyLimiter, 
  validateContentType(),
  sanitizeInput,
  validateBody(companyCreateSchema),
  asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, description, owner_id, wallet_address } = req.body;

    if (!name || !owner_id) {
      res.status(400).json({
        error: 'Company name and owner ID are required',
      });
      return;
    }

    const company = await CompanyService.createCompany({
      name,
      description,
      owner_id,
      wallet_address,
    });

    res.status(201).json({
      message: 'Company created successfully',
      company,
    });
  } catch (error: unknown) {
    console.error('Create company error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Company creation failed';
    res.status(400).json({
      error: errorMessage,
    });
  }
}));

// Get company by ID
router.get('/:id', 
  validateParams(uuidParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await CompanyService.getCompanyById(id);

    res.json({ company });
  } catch (error: unknown) {
    console.error('Get company error:', error);
    res.status(404).json({
      error: error instanceof Error ? error.message : 'Company not found',
    });
  }
}));

// Get companies by owner
router.get('/owner/:ownerId', 
  validateQuery(paginationSchema),
  asyncHandler(async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;
    const companies = await CompanyService.getCompaniesByOwner(ownerId);

    res.json({ companies });
  } catch (error: unknown) {
    console.error('Get companies by owner error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to fetch companies',
    });
  }
}));

// Update company
router.put('/:id', 
  validateParams(uuidParamSchema),
  validateContentType(),
  sanitizeInput,
  validateBody(companyUpdateSchema),
  asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const company = await CompanyService.updateCompany(id, updates);

    res.json({
      message: 'Company updated successfully',
      company,
    });
  } catch (error: unknown) {
    console.error('Update company error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Company update failed',
    });
  }
}));

// Add employee to company
router.post('/:id/employees', 
  validateParams(uuidParamSchema),
  validateContentType(),
  sanitizeInput,
  validateBody(employeeCreateSchema),
  asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id: company_id } = req.params;
    const { user_id, position, salary, wallet_address } = req.body;

    if (!user_id) {
      res.status(400).json({
        error: 'User ID is required',
      });
      return;
    }

    const employee = await CompanyService.addEmployee({
      company_id,
      user_id,
      position,
      salary,
      wallet_address,
    });

    res.status(201).json({
      message: 'Employee added successfully',
      employee,
    });
  } catch (error: unknown) {
    console.error('Add employee error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to add employee',
    });
  }
}));

// Get company employees
router.get('/:id/employees', 
  validateParams(uuidParamSchema),
  validateQuery(paginationSchema),
  asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employees = await CompanyService.getCompanyEmployees(id);

    res.json({ employees });
  } catch (error: unknown) {
    console.error('Get company employees error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to fetch employees',
    });
  }
}));

// Update employee
router.put('/employees/:employeeId', 
  validateParams(uuidParamSchema),
  validateContentType(),
  sanitizeInput,
  validateBody(employeeUpdateSchema),
  asyncHandler(async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const updates = req.body;

    const employee = await CompanyService.updateEmployee(employeeId, updates);

    res.json({
      message: 'Employee updated successfully',
      employee,
    });
  } catch (error: unknown) {
    console.error('Update employee error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Employee update failed',
    });
  }
}));

// Remove employee from company
router.delete('/employees/:employeeId', 
  validateParams(uuidParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const employee = await CompanyService.removeEmployee(employeeId);

    res.json({
      message: 'Employee removed successfully',
      employee,
    });
  } catch (error: unknown) {
    console.error('Remove employee error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to remove employee',
    });
  }
}));

// Get employee by user and company
router.get('/:companyId/employees/user/:userId', 
  validateParams(uuidParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
  try {
    const { companyId, userId } = req.params;
    const employee = await CompanyService.getEmployeeByUserAndCompany(userId, companyId);

    res.json({ employee });
  } catch (error: unknown) {
    console.error('Get employee by user and company error:', error);
    res.status(404).json({
      error: error instanceof Error ? error.message : 'Employee not found',
    });
  }
}));

export default router;