import { Request, Response, NextFunction } from 'express';
import { Department, DepartmentStatistics } from '../models';
import { AppError } from '../middleware/errorHandler';

/**
 * Get all departments
 */
export const getAllDepartments = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const departments = await Department.findAll({
      include: [{ model: DepartmentStatistics, as: 'statistics' }],
      order: [['name', 'ASC']],
    });

    res.json({ departments });
  } catch (error) {
    next(error);
  }
};

/**
 * Get department by ID
 */
export const getDepartmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id as string, {
      include: [{ model: DepartmentStatistics, as: 'statistics' }],
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    res.json({ department });
  } catch (error) {
    next(error);
  }
};
