import express from "express";
import ClienteController from "../controllers/ClienteController.js";

const router = express.Router();

// GET /clientes - Lista todos os clientes
router.get("/", ClienteController.listarTodos);

// GET /clientes/:id - Busca cliente por ID
router.get("/:id", ClienteController.buscarPorId);

// POST /clientes - Cria um novo cliente
router.post("/", ClienteController.criar);

// PUT /clientes/:id - Atualiza um cliente
router.put("/:id", ClienteController.atualizar);

// DELETE /clientes - Desativa um cliente
router.delete("/", ClienteController.desativar);

export default router;
