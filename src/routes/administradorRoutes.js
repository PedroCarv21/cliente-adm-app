import express from "express";
import AdministradorController from "../controllers/AdministradorController.js";

const router = express.Router();

// GET /administradores - Lista todos os administradores
router.get("/", AdministradorController.listarTodos);

// GET /administradores/:id - Busca administrador por ID
router.get("/:id", AdministradorController.buscarPorId);

// POST /administradores - Cria um novo administrador
router.post("/", AdministradorController.criar);

// PUT /administradores/:id - Atualiza um administrador
router.put("/:id", AdministradorController.atualizar);

// DELETE /administradores - Desativa um administrador
router.delete("/", AdministradorController.desativar);

export default router;
