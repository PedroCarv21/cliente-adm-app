import Usuario from "./usuario.js";
import express from "express";

const router = express.Router();

const StatusCliente = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  BLOQUEADO: "Bloqueado",
  SUSPENSO: "Suspenso",
};

class Cliente extends Usuario {
  constructor(id, nome, email, senha, cpf, endereco, dataNascimento, statusCliente, fotoPerfil) {
    super(id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil);
    this.statusCliente = statusCliente;
  }
}

// Rotas da API baseadas nos métodos de Usuario

// Consultar todos
router.get("/", async (req, res) => {
  const clientes = await Cliente.consultarTodos();
  res.json(clientes);
});

// Consultar por id
router.get("/:id", async (req, res) => {
  const cliente = await Cliente.consultarPorId(req.params.id);
  res.json(cliente);
});

// Cadastrar
router.post("/", async (req, res) => {
  const { nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil } = req.body;

  const novoCliente = await Cliente.cadastrar(
    nome,
    email,
    senha,
    cpf,
    endereco,
    dataNascimento,
    fotoPerfil
  );

  res.json({ ...novoCliente, statusCliente: StatusCliente.ATIVO });
});

// Atualizar
router.put("/:id", async (req, res) => {
  const { nome, senha, cpf, endereco, dataNascimento, fotoPerfil } = req.body;
  const result = await Cliente.atualizar(
    req.params.id,
    nome,
    senha,
    cpf,
    endereco,
    dataNascimento,
    fotoPerfil
  );
  res.json(result);
});

// Excluir
router.delete("/", async (req, res) => {
  const { email, senha } = req.body;
  const result = await Cliente.excluir(email, senha);
  res.json(result);
});

export { Cliente, StatusCliente, router as clienteRoutes };
