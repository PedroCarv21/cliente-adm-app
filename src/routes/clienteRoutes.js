import express from "express";
import ClienteController from "../controllers/ClienteController.js";
import {
  autenticar,
  verificarProprietario,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /clientes - Lista todos os clientes
router.get("/", autenticar, ClienteController.listarTodos);

// GET /clientes/:id - Busca cliente por ID (próprio cliente)
router.get(
  "/:id",
  autenticar,
  verificarProprietario,
  ClienteController.buscarPorId
);

// POST /clientes - Cria um novo cliente (público para registro)
router.post("/", ClienteController.criar);

// PUT /clientes/:id - Atualiza um cliente (próprio cliente)
router.put(
  "/:id",
  autenticar,
  verificarProprietario,
  ClienteController.atualizar
);

// DELETE /clientes - Desativa um cliente (próprio cliente apenas)
router.delete("/", autenticar, ClienteController.desativar);

export default router;
