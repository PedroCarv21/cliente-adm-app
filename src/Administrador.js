import Usuario from "./usuario.js";
import express from "express";

const router = express.Router();

class Administrador extends Usuario {
  constructor(id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao) {
    super(id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil);
    this.departamento = departamento;
    this.dataAdmissao = dataAdmissao;
  }

  // Métodos específicos de Administrador (CRUD)
  static async consultarTodos() {
    const [rows] = await db.query("SELECT * FROM administrador");
    return rows;
  }

  static async consultarPorId(id) {
    const [rows] = await db.query("SELECT * FROM administrador WHERE id = ?", [id]);
    return rows[0];
  }

  static async cadastrar(nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao) {
    const id = uuidv4();
    await db.query(
      "INSERT INTO administrador (id, nome, email, senha, cpf, endereco, data_nascimento, foto_perfil, departamento, data_admissao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao]
    );
    return { id, nome, email };
  }

  static async atualizar(id, nome, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao) {
    await db.query(
      "UPDATE administrador SET nome=?, senha=?, cpf=?, endereco=?, data_nascimento=?, foto_perfil=?, departamento=?, data_admissao=? WHERE id=?",
      [nome, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao, id]
    );
    return { message: "Administrador atualizado com sucesso" };
  }

  static async excluir(email, senha) {
    await db.query("DELETE FROM administrador WHERE email=? AND senha=?", [email, senha]);
    return { message: "Administrador removido com sucesso" };
  }
}

// Rotas da API
router.get("/", async (req, res) => {
  const adms = await Administrador.consultarTodos();
  res.json(adms);
});

router.get("/:id", async (req, res) => {
  const adm = await Administrador.consultarPorId(req.params.id);
  res.json(adm);
});

router.post("/", async (req, res) => {
  const { nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao } = req.body;
  const novoAdm = await Administrador.cadastrar(nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao);
  res.json(novoAdm);
});

router.put("/:id", async (req, res) => {
  const { nome, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao } = req.body;
  const result = await Administrador.atualizar(req.params.id, nome, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao);
  res.json(result);
});

router.delete("/", async (req, res) => {
  const { email, senha } = req.query;
  if (!email || !senha) {
    return res.status(400).json({ error: "Informe email e senha nos parâmetros da URL" });
  }
  const result = await Administrador.excluir(email, senha);
  res.json(result);
});

export { Administrador, router as administradorRoutes };
