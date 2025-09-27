import Usuario from "./usuario.js";
import express from "express";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

const StatusAdministrador = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

class Administrador extends Usuario {
  constructor(id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao) {
    super(id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil);
    this.departamento = departamento;
    this.dataAdmissao = dataAdmissao;
  }

  // Método estático para cadastrar um novo administrador
  static async cadastrar(nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao) {
    const id = uuidv4(); // Cria um id único
    const statusAdministrador = StatusAdministrador.ATIVO; // Status inicial

    await db.query(
      "INSERT INTO administrador (id, nome, email, senha, cpf, endereco, data_nascimento, status_administrador, foto_perfil, departamento, data_admissao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, nome, email, senha, cpf, endereco, dataNascimento, statusAdministrador, fotoPerfil, departamento, dataAdmissao]
    );
    return { id, nome, email, departamento, dataAdmissao };
  }

  // Método estático para consultar todos os administradores
  static async consultarTodos() {
    const [rows] = await db.query("SELECT * FROM administrador");

    // Converte a foto_perfil de cada administrador para Base64
    rows.forEach(admin => {
      if (admin.foto_perfil) {
        admin.foto_perfil = admin.foto_perfil.toString('base64');
      }
    });

    return rows;
  }

  // Método estático para consultar um administrador por ID
  static async consultarPorId(id) {
    const [rows] = await db.query("SELECT * FROM administrador WHERE id = ?", [id]);

    if (rows.length > 0) {
      let admin = rows[0];

      // Converte a foto_perfil para Base64
      if (admin.foto_perfil) {
        admin.foto_perfil = admin.foto_perfil.toString('base64');
      }

      return admin;
    } else {
      throw new Error('Administrador não encontrado');
    }
  }

  // Método estático para atualizar um administrador
  static async atualizar(id, nome, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao) {
    const statusAdministrador = StatusAdministrador.ATIVO; // ou outro valor

    await db.query(
      "UPDATE administrador SET nome=?, senha=?, cpf=?, endereco=?, data_nascimento=?, status_administrador=?, foto_perfil=?, departamento=?, data_admissao=? WHERE id=?",
      [nome, senha, cpf, endereco, dataNascimento, statusAdministrador, fotoPerfil, departamento, dataAdmissao, id]
    );

    return { message: "Administrador atualizado com sucesso" };
  }

  // Método estático para excluir um administrador
  static async excluir(email, senha) {
    const statusAdministrador = StatusAdministrador.INATIVO; // Marca como inativo

    await db.query(
      "UPDATE administrador SET status_administrador=? WHERE email=? AND senha=?",
      [statusAdministrador, email, senha]
    );

    return { message: "Administrador marcado como inativo com sucesso" };
  }
}

// Rotas da API baseadas nos métodos de Administrador

// Consultar todos
router.get("/", async (req, res) => {
  const administradores = await Administrador.consultarTodos();
  res.json(administradores);
});

// Consultar por id
router.get("/:id", async (req, res) => {
  const administrador = await Administrador.consultarPorId(req.params.id);
  res.json(administrador);
});

// Cadastrar
router.post("/", async (req, res) => {
  const { nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao } = req.body;

  const novoAdministrador = await Administrador.cadastrar(
    nome,
    email,
    senha,
    cpf,
    endereco,
    dataNascimento,
    fotoPerfil,
    departamento,
    dataAdmissao
  );

  res.json({ ...novoAdministrador, statusAdministrador: StatusAdministrador.ATIVO });
});

// Atualizar
router.put("/:id", async (req, res) => {
  const { nome, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao } = req.body;
  const result = await Administrador.atualizar(
    req.params.id,
    nome,
    senha,
    cpf,
    endereco,
    dataNascimento,
    fotoPerfil,
    departamento,
    dataAdmissao
  );
  res.json(result);
});

// Excluir
router.delete("/", async (req, res) => {
  const { email, senha } = req.body;
  const result = await Administrador.excluir(email, senha);
  res.json(result);
});

export { Administrador, StatusAdministrador, router as administradorRoutes };
