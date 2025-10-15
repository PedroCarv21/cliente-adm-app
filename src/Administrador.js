// Administrador.js
import Usuario from "./usuario.js";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import db from "./database.js";
import bcrypt from 'bcrypt';


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
  static async cadastrar(nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao) {
    const id = uuidv4();
    const statusPadrao = StatusAdministrador.ATIVO;

    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // A coluna "statusAdm" está correta, como você mostrou.
    const sql = `
        INSERT INTO ${this.tabela} 
        (id, nome, email, senha, cpf, endereco, data_nascimento, foto_perfil, departamento, data_admissao, statusAdm) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Se fotoPerfil for undefined, ele será convertido para null.
    const values = [id, nome, email, senhaHash, cpf, endereco, dataNascimento, fotoPerfil || null, departamento, dataAdmissao, statusPadrao];

    await db.query(sql, values);

    // Retornar o objeto sem a senha
    return { id, nome, email, cpf, departamento, dataAdmissao, statusAdm: statusPadrao };
  }
  // Sobrescrevendo o método 'atualizar' para incluir statusAdm
  // DENTRO DA CLASSE Administrador

  static async atualizar(id, dadosParaAtualizar) {
    // Criptografa a senha se ela estiver sendo atualizada
    if (dadosParaAtualizar.senha) {
      const saltRounds = 10;
      dadosParaAtualizar.senha = await bcrypt.hash(dadosParaAtualizar.senha, saltRounds);
    }

    const campos = Object.keys(dadosParaAtualizar);

    if (campos.length === 0) {
      throw new Error('Nenhum dado fornecido para atualização.');
    }

    // --- INÍCIO DA CORREÇÃO ---
    // Esta parte converte as chaves para o formato do banco de dados
    const setClause = campos.map(campo => {
      // Converte "dataNascimento" para "data_nascimento", "dataAdmissao" para "data_admissao", etc.
      const nomeColuna = campo.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      return `${nomeColuna}=?`;
    }).join(', ');
    // --- FIM DA CORREÇÃO ---

    const values = Object.values(dadosParaAtualizar);
    values.push(id); // Adiciona o ID no final para a cláusula WHERE

    const sql = `UPDATE ${this.tabela} SET ${setClause} WHERE id=?`;

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      throw new Error('Administrador não encontrado');
    }

    return { message: "Administrador atualizado com sucesso" };
  }

  // Sobrescrevendo o método 'excluir' para desativar (soft delete)
  static async excluir(email, senha) {
    // 1. Buscar o administrador pelo email
    const sqlBusca = `SELECT * FROM ${this.tabela} WHERE email = ?`;
    const [rows] = await db.query(sqlBusca, [email]);

    // 2. Se não existir, lançar erro genérico
    if (rows.length === 0) {
      throw new Error('Administrador não encontrado ou credenciais inválidas');
    }

    const adm = rows[0];
    const senhaHashDoBanco = adm.senha;

    // 3. Comparar a senha fornecida com o hash do banco
    const senhaCorreta = await bcrypt.compare(senha, senhaHashDoBanco);

    // 4. Se a senha estiver incorreta, lançar o mesmo erro
    if (!senhaCorreta) {
      throw new Error('Administrador não encontrado ou credenciais inválidas');
    }

    // 5. Se tudo estiver certo, desativar o administrador
    const statusInativo = StatusAdministrador.INATIVO;
    const sqlUpdate = `UPDATE ${this.tabela} SET statusAdm = ? WHERE email = ?`;

    await db.query(sqlUpdate, [statusInativo, email]);

    return { message: "Administrador desativado com sucesso" };
  }
}

// Consultar todos
router.get("/", async (req, res) => {
  try {
    const adms = await Administrador.consultarTodos();
    res.json(adms);
  } catch (error) {
    // Se algo der errado com o banco, logamos o erro e retornamos um erro 500
    console.error("Erro ao consultar administradores:", error);
    res.status(500).json({ erro: "Ocorreu um erro interno no servidor." });
  }
});

// Consultar por id
// Consultar por id (versão aprimorada com validação de UUID)
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // --- INÍCIO DA VALIDAÇÃO ---

  // 1. Define a Expressão Regular para o formato UUID.
  // Ela verifica a estrutura 8-4-4-4-12 com caracteres hexadecimais.
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // 2. Testa o ID contra a Regex. Se não for válido...
  if (!uuidRegex.test(id)) {
    // ...retorna um erro 400 Bad Request e encerra a execução.
    return res.status(400).json({ erro: "O ID fornecido é inválido. O formato deve ser um UUID." });
  }

  // --- FIM DA VALIDAÇÃO ---

  // 3. Se o formato for válido, o código prossegue para o try...catch.
  try {
    const adm = await Administrador.consultarPorId(id);
    res.json(adm);
  } catch (error) {
    // A lógica aqui continua a mesma, tratando o caso de "não encontrado".
    if (error.message.includes("não encontrado")) {
      return res.status(404).json({ erro: error.message });
    }

    console.error(`Erro ao consultar administrador com ID ${id}:`, error);
    res.status(500).json({ erro: "Ocorreu um erro interno no servidor." });
  }
});

// Cadastrar (já estava bom, mas mantendo o padrão)
router.post("/", async (req, res) => {
  try {
    const { nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao } = req.body;

    if (!nome || !email || !senha || !cpf) {
      return res.status(400).json({ erro: "Campos nome, email, senha e cpf são obrigatórios." });
    }

    const novoAdm = await Administrador.cadastrar(
      nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, departamento, dataAdmissao
    );
    res.status(201).json(novoAdm);
  } catch (error) {
    // Erro de entrada duplicada (ex: email ou CPF já existem)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: "Conflito: Email ou CPF já cadastrado." });
    }

    console.error("Erro ao cadastrar administrador:", error);
    res.status(500).json({ erro: "Ocorreu um erro interno no servidor." });
  }
});

// PUT - atualizar (já estava bom, mas mantendo o padrão)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const dadosParaAtualizar = req.body;

    if (Object.keys(dadosParaAtualizar).length === 0) {
      return res.status(400).json({ erro: "Corpo da requisição não pode estar vazio." });
    }

    const result = await Administrador.atualizar(id, dadosParaAtualizar);
    res.json(result);
  } catch (error) {
    if (error.message === 'Administrador não encontrado') {
      return res.status(404).json({ erro: error.message });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: "Conflito: Email ou CPF informado já está em uso." });
    }

    console.error(`Erro ao atualizar administrador com ID ${req.params.id}:`, error);
    res.status(500).json({ erro: "Ocorreu um erro interno no servidor." });
  }
});

// Excluir (desativar)
router.delete("/", async (req, res) => {
  try {
    const { email, senha } = req.query;
    if (!email || !senha) {
      return res.status(400).json({ erro: "Informe email e senha nos parâmetros da URL." });
    }

    const result = await Administrador.excluir(email, senha);
    res.json(result);
  } catch (error) {
    // Captura o erro "não encontrado ou credenciais inválidas" lançado pelo nosso método
    if (error.message.includes('credenciais inválidas')) {
      return res.status(404).json({ erro: error.message });
    }

    console.error("Erro ao desativar administrador:", error);
    res.status(500).json({ erro: "Ocorreu um erro interno no servidor." });
  }
});


export { Administrador, router as administradorRoutes };

