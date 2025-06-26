import { Router } from "express";
import { DepartmentController } from "../controllers/DepartmentController";

const router = Router();

// Obtener todos los departamentos
router.get("/", DepartmentController.getAllDepartments);

// Obtener ciudades por departamento
router.get("/:id/cities", DepartmentController.getCitiesByDepartment);

export default router; 