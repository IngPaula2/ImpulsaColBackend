import { Request, Response } from "express";
import { TypeORMDepartmentRepository } from "../../persistence/repositories/TypeORMDepartmentRepository";
import { TypeORMCityRepository } from "../../persistence/repositories/TypeORMCityRepository";

const departmentRepository = new TypeORMDepartmentRepository();
const cityRepository = new TypeORMCityRepository();

export class DepartmentController {
  static async getAllDepartments(req: Request, res: Response) {
    try {
      console.log('DepartmentController.getAllDepartments - Iniciando consulta');
      const departments = await departmentRepository.findAll();
      console.log('DepartmentController.getAllDepartments - Departamentos encontrados:', departments);
      res.json(departments);
    } catch (error) {
      console.error('DepartmentController.getAllDepartments - Error:', error);
      res.status(500).json({ message: "Error fetching departments", error: error instanceof Error ? error.message : error });
    }
  }

  static async getCitiesByDepartment(req: Request, res: Response) {
    try {
      const departmentId = Number(req.params.id);
      console.log('DepartmentController.getCitiesByDepartment - departmentId:', departmentId);
      if (isNaN(departmentId)) {
        console.log('DepartmentController.getCitiesByDepartment - ID inválido');
        return res.status(400).json({ message: "Invalid department id" });
      }
      const cities = await cityRepository.findByDepartment(departmentId);
      console.log('DepartmentController.getCitiesByDepartment - Ciudades encontradas:', cities);
      res.json(cities);
    } catch (error) {
      console.error('DepartmentController.getCitiesByDepartment - Error:', error);
      res.status(500).json({ message: "Error fetching cities", error: error instanceof Error ? error.message : error });
    }
  }
} 