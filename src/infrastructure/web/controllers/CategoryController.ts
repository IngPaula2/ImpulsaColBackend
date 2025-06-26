import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { TypeORMCategoryRepository } from '../../persistence/repositories/TypeORMCategoryRepository';
import { CategoryResponseDTO } from '../../../application/dto/CategoryDTO';

export class CategoryController {
  private categoryRepository: TypeORMCategoryRepository;

  constructor(dataSource: DataSource) {
    this.categoryRepository = new TypeORMCategoryRepository(dataSource);
  }

  getCategoriesByType = async (req: Request, res: Response) => {
    try {
      const { type } = req.query;
      if (!type || typeof type !== 'string') {
        return res.status(400).json({ message: 'Type is required as a query parameter.' });
      }
      const categories = await this.categoryRepository.findByType(type);
      const response: CategoryResponseDTO[] = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        type: cat.type,
        created_at: cat.created_at,
        image_url: cat.image_url,
      }));
      return res.json(response);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching categories', error });
    }
  };
} 