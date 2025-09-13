import { Router, Request, Response } from 'express';
import { TransactionService } from '../services/transactionService';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody, validateParams, validateQuery, sanitizeInput, validateContentType } from '../middleware/validation';
import { 
  transactionCreateSchema, 
  uuidParamSchema,
  paginationSchema 
} from '../validators/schemas';

const router = Router();

// Rate limiting for transaction endpoints
const transactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many transaction requests, please try again later.',
});

// Create transaction endpoint
router.post('/', 
  transactionLimiter,
  validateContentType(),
  sanitizeInput,
  validateBody(transactionCreateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const {
      company_id,
      employee_id,
      amount,
      transaction_type,
      blockchain_tx_hash,
      description,
    } = req.body;

    if (!company_id || !employee_id || !amount || !transaction_type) {
      res.status(400).json({
        error: 'Company ID, employee ID, amount, and transaction type are required',
      });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({
        error: 'Amount must be greater than 0',
      });
      return;
    }

    const transaction = await TransactionService.createTransaction({
      company_id,
      employee_id,
      amount,
      transaction_type,
      blockchain_tx_hash,
      description,
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
    });
  })
);

// Get transaction by ID
router.get('/:id', 
  validateParams(uuidParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const transaction = await TransactionService.getTransactionById(id);

    res.json({ transaction });
  })
);

// Get transactions by company
router.get('/company/:companyId', 
  validateParams(uuidParamSchema),
  validateQuery(paginationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { companyId } = req.params;
    const { limit, offset, status, transaction_type } = req.query;

    const options = {
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      status: status as 'pending' | 'confirmed' | 'failed' | undefined,
      transaction_type: transaction_type as 'stream_create' | 'withdraw' | 'fund' | 'cancel' | undefined,
    };

    const transactions = await TransactionService.getTransactionsByCompany(
      companyId,
      options
    );

    res.json({ transactions });
  })
);

// Get transactions by employee
router.get('/employee/:employeeId', 
  validateParams(uuidParamSchema),
  validateQuery(paginationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const { limit, offset, status } = req.query;

    const options = {
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      status: status as 'pending' | 'confirmed' | 'failed' | undefined,
    };

    const transactions = await TransactionService.getTransactionsByEmployee(
      employeeId,
      options
    );

    res.json({ transactions });
  })
);

// Update transaction status
router.put('/:id/status', 
  validateParams(uuidParamSchema),
  validateContentType(),
  sanitizeInput,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, blockchain_tx_hash } = req.body;

    if (!status || !['pending', 'confirmed', 'failed'].includes(status)) {
      res.status(400).json({
        error: 'Valid status is required (pending, confirmed, failed)',
      });
      return;
    }

    const transaction = await TransactionService.updateTransactionStatus(
      id,
      status,
      blockchain_tx_hash
    );

    res.json({
      message: 'Transaction status updated successfully',
      transaction,
    });
  })
);

// Sync blockchain transaction
router.post('/sync', 
  transactionLimiter, 
  asyncHandler(async (req: Request, res: Response) => {
    const {
      blockchain_tx_hash,
      company_id,
      employee_id,
      amount,
      transaction_type,
    } = req.body;

    if (!blockchain_tx_hash || !company_id || !employee_id || !amount || !transaction_type) {
      res.status(400).json({
        error: 'Blockchain transaction hash, company ID, employee ID, amount, and transaction type are required',
      });
      return;
    }

    const transaction = await TransactionService.syncBlockchainTransaction({
      blockchain_tx_hash,
      company_id,
      employee_id,
      amount,
      transaction_type,
    });

    res.json({
      message: 'Blockchain transaction synced successfully',
      transaction,
    });
  })
);

// Get company transaction statistics
router.get('/company/:companyId/stats', 
  validateParams(uuidParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { companyId } = req.params;
    const stats = await TransactionService.getCompanyTransactionStats(companyId);

    res.json({ stats });
  })
);

export default router;