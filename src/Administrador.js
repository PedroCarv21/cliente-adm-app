// Administrador.js
import Usuario from "./usuario.js";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import db from "./database.js";


const router = express.Router();

const StatusAdministrador = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  BLOQUEADO: "Bloqueado",
  SUSPENSO: "Suspenso",
};

class Administrador extends Usuario {
  static tabela = "administrador";

  constructor(id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao, statusAdm = StatusAdministrador.ATIVO) {
    super(id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil);
    this.departamento = departamento;
    this.dataAdmissao = dataAdmissao;
    this.statusAdm = statusAdm;
  }

  // POST - cadastrar novo administrador, incluindo statusAdm
  static async cadastrar(nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao, statusAdm) {
    const id = uuidv4();

    await db.query(
      `INSERT INTO ${this.tabela} (id, nome, email, senha, cpf, endereco, data_nascimento, foto_perfil, departamento, data_admissao, statusAdm) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao, statusAdm]
    );

    return new Administrador(id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao, statusAdm);
  }

  // Sobrescrevendo o método 'atualizar' para incluir statusAdm
  static async atualizar(id, nome, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao, statusAdm) {
    await db.query(
      `UPDATE ${this.tabela} SET nome=?, senha=?, cpf=?, endereco=?, data_nascimento=?, foto_perfil=?, departamento=?, data_admissao=?, statusAdm=? WHERE id=?`,
      [nome, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao, statusAdm, id]
    );
    return { message: "Administrador atualizado com sucesso" };
  }

  // Sobrescrevendo o método 'excluir' para desativar (soft delete)
  static async excluir(email, senha) {
    const statusAdm = StatusAdministrador.INATIVO; // marca como inativo
    const [result] = await db.query(
      `UPDATE ${this.tabela} SET statusAdm=? WHERE email=? AND senha=?`,
      [statusAdm, email, senha]
    );

    if (result.affectedRows === 0) {
      throw new Error("Administrador não encontrado ou credenciais inválidas.");
    }

    return { message: "Administrador marcado como inativo com sucesso" };
  }
}

// Consultar todos
router.get("/", async (req, res) => {
  const adms = await Administrador.consultarTodos();
  res.json(adms);
});

// Consultar por id
router.get("/:id", async (req, res) => {
  const adm = await Administrador.consultarPorId(req.params.id);
  res.json(adm);
});

// Cadastrar
router.post("/", async (req, res) => {
  const { nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao } = req.body;
  const statusAdm = StatusAdministrador.ATIVO; // Sempre ativo ao cadastrar

  const novoAdm = await Administrador.cadastrar(
    nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao, statusAdm
  );

  res.json(novoAdm);
});

// PUT - atualizar administrador existente
router.put("/:id", async (req, res) => {
  const { nome, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao, statusAdm } = req.body;

  const result = await Administrador.atualizar(
    req.params.id,
    nome, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao,
    statusAdm || StatusAdministrador.ATIVO // Garante que um status seja passado
  );

  res.json(result);
});


// Excluir (desativar) por email e senha
router.delete("/", async (req, res) => {
  const { email, senha } = req.query;
  if (!email || !senha) {
    return res.status(400).json({ error: "Informe email e senha nos parâmetros da URL" });
  }
  try {
    const result = await Administrador.excluir(email, senha);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});


export { Administrador, router as administradorRoutes };

