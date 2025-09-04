import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  managerEmail: z.string().email().optional().or(z.literal('')),
  budget: z.number().positive().or(z.string().transform((val) => parseFloat(val)).pipe(z.number().positive())),
  location: z.string().min(1, 'Location is required'),
  status: z.enum(['ACTIVE', 'EXPANDING', 'RESTRUCTURING', 'INACTIVE']),
  establishedDate: z.string().optional().or(z.date().optional()),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const createEmployeeSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
    position: z.string().min(1, 'Position is required'),
    department: z.string().min(1, 'Department is required'),
    salary: z.number().positive(),
    hireDate: z.date(),
    emergencyContact: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const createAttendanceSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    date: z.date(),
    checkIn: z.date().optional(),
    checkOut: z.date().optional(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY']).optional(),
    notes: z.string().optional(),
});

export const updateAttendanceSchema = createAttendanceSchema.partial();

export const createPayrollSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    month: z.number().min(1).max(12).or(z.string().transform((val) => parseInt(val)).pipe(z.number().min(1).max(12))),
    year: z.number().min(2000).or(z.string().transform((val) => parseInt(val)).pipe(z.number().min(2000))),
    basicSalary: z.number().positive().or(z.string().transform((val) => parseFloat(val)).pipe(z.number().positive())),
    allowances: z.number().optional().or(z.string().transform((val) => parseFloat(val)).pipe(z.number()).optional()),
    deductions: z.number().optional().or(z.string().transform((val) => parseFloat(val)).pipe(z.number()).optional()),
    status: z.enum(['PENDING', 'APPROVED', 'PAID']).optional().default('PENDING'),
});

export const updatePayrollSchema = createPayrollSchema.partial();

export const createFinanceRecordSchema = z.object({
    type: z.enum(['INCOME', 'EXPENSE', 'INVESTMENT', 'LOAN']),
    amount: z.number().positive(),
    description: z.string().min(1, 'Description is required'),
    category: z.string().min(1, 'Category is required'),
    date: z.date(),
    status: z.string().optional(),
});

export const createMessageSchema = z.object({
    receiverId: z.string().min(1, 'Receiver ID is required'),
    subject: z.string().min(1, 'Subject is required'),
    content: z.string().min(1, 'Content is required'),
});

export const createNotificationSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    title: z.string().min(1, 'Title is required'),
    message: z.string().min(1, 'Message is required'),
    type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR']).optional(),
});

export const createReportSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(['FINANCIAL', 'HR', 'OPERATIONAL']),
    data: z.any(),
});

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assignedTo: z.string().optional(),
    departmentId: z.string().min(1, 'Department ID is required'),
    dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined).or(z.date().optional()),
});

export const updateTaskSchema = createTaskSchema.partial();
