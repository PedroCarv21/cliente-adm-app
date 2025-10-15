import Usuario from "./usuario.js";
import express from "express";
import db from "./database.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from 'bcrypt';

const router = express.Router();

const StatusCliente = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  BLOQUEADO: "Bloqueado",
  SUSPENSO: "Suspenso",
};

class Cliente extends Usuario {
  static tabela = "cliente";

  constructor(id, nome, email, senha, cpf, endereco, dataNascimento, statusCliente, fotoPerfil) {
    super(id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil);
    this.statusCliente = statusCliente;
  }

  static async cadastrar(nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil) {
    const id = uuidv4();
    const statusPadrao = StatusCliente.ATIVO;

    // --- INÍCIO DA ALTERAÇÃO ---

    // 1. Definir o "custo" do hash. 10 é um valor padrão e seguro.
    const saltRounds = 10;

    // 2. Gerar o hash da senha. É uma operação assíncrona.
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // --- FIM DA ALTERAÇÃO ---

    const sql = `
      INSERT INTO ${this.tabela} 
        (id, nome, email, senha, cpf, endereco, data_nascimento, foto_perfil, status_cliente) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // 3. Usar a senhaHash no lugar da senha original
    const values = [id, nome, email, senhaHash, cpf, endereco, dataNascimento, fotoPerfil, statusPadrao];

    await db.query(sql, values);

    // MUITO IMPORTANTE: Nunca retorne a senha ou o hash na resposta da API.
    // O seu código já faz isso corretamente.
    return { id, nome, email, cpf, endereco, dataNascimento, fotoPerfil, statusCliente: statusPadrao };
  }

  // DENTRO DA CLASSE Cliente

  // DENTRO DA CLASSE Cliente

  static async atualizar(id, dadosParaAtualizar) {
    // --- INÍCIO DA ALTERAÇÃO ---

    // Verifica se o campo 'senha' está presente nos dados para atualizar
    if (dadosParaAtualizar.senha) {
      const saltRounds = 10;
      // Se estiver, gera o hash para a nova senha
      dadosParaAtualizar.senha = await bcrypt.hash(dadosParaAtualizar.senha, saltRounds);
    }

    // --- FIM DA ALTERAÇÃO ---

    const campos = Object.keys(dadosParaAtualizar);

    if (campos.length === 0) {
      throw new Error('Nenhum dado fornecido para atualização.');
    }

    const setClause = campos.map(campo => {
      const nomeColuna = campo.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      return `${nomeColuna}=?`;
    }).join(', ');

    const values = Object.values(dadosParaAtualizar);
    values.push(id);

    const sql = `UPDATE ${this.tabela} SET ${setClause} WHERE id=?`;

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      throw new Error('Cliente não encontrado');
    }

    return { message: "Cliente atualizado com sucesso" };
  }

  // DENTRO DA CLASSE Cliente

  static async excluir(email, senha) {
    // 1. Buscar o cliente no banco de dados usando APENAS o email.
    const sqlBusca = `SELECT * FROM ${this.tabela} WHERE email = ?`;
    const [rows] = await db.query(sqlBusca, [email]);

    // 2. Verificar se o cliente existe. Se não existir, rows será um array vazio.
    // Lançamos um erro genérico para não informar ao atacante se o email ou a senha estão errados.
    if (rows.length === 0) {
      throw new Error('Cliente não encontrado ou credenciais inválidas');
    }

    const cliente = rows[0];
    const senhaHashDoBanco = cliente.senha; // O hash que está salvo no DB

    // 3. Comparar a senha fornecida na requisição com o hash do banco.
    const senhaCorreta = await bcrypt.compare(senha, senhaHashDoBanco);

    // 4. Se a senha estiver incorreta, lançamos o mesmo erro genérico.
    if (!senhaCorreta) {
      throw new Error('Cliente não encontrado ou credenciais inválidas');
    }

    // 5. Se a senha estiver CORRETA, aí sim fazemos a atualização.
    const statusInativo = StatusCliente.INATIVO;
    const sqlUpdate = `UPDATE ${this.tabela} SET status_cliente = ? WHERE email = ?`;

    await db.query(sqlUpdate, [statusInativo, email]);

    return { message: "Cliente desativado com sucesso" };
  }
}


// Rotas da API baseadas nos métodos de Usuario

// Consultar todos
router.get("/", async (req, res) => {
  const clientes = await Cliente.consultarTodos();
  res.json(clientes);
});

// Consultar por id
// cliente.js

// ... (resto do seu código)

// Consultar por id (versão aprimorada)
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // 1. Validação robusta para o formato UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ erro: "O ID fornecido é inválido. O formato deve ser um UUID." });
  }

  try {
    const cliente = await Cliente.consultarPorId(id);

    // Este bloco agora pode ser alcançado se 'consultarPorId' retornar null
    // em vez de lançar um erro. Mas a lógica principal está no catch.
    if (!cliente) {
      return res.status(404).json({ erro: "Cliente não encontrado." });
    }

    res.json(cliente);

  } catch (error) {
    // 2. Lógica inteligente no CATCH para diferenciar os erros

    // **Adapte esta condição para o seu ORM/biblioteca!**
    // Muitos ORMs adicionam um 'name' ou 'code' específico ao erro.
    // Exemplos: error.name === 'RecordNotFound', error.code === 'P2025' (Prisma)
    // Se o erro indicar "não encontrado", retorne 404.
    if (error.name === 'RecordNotFound' || error.message.includes("não encontrado")) { // Exemplo
      return res.status(404).json({ erro: "Cliente não encontrado." });
    }

    // Para todos os outros tipos de erro, retorne 500
    console.error(`Erro ao consultar cliente com ID ${id}:`, error); // Log para depuração
    res.status(500).json({ erro: "Ocorreu um erro interno ao processar a solicitação." });
  }


});

// Cadastrar
// cliente.js

// ... (resto do seu código)

// src/cliente.js

// ... (importações e código anterior)

router.post("/", async (req, res) => {
  const { nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil } = req.body;

  if (!nome || !email || !senha || !cpf) {
    return res.status(400).json({
      erro: "Requisição inválida. É necessário informar nome, email, senha e cpf."
    });
  }

  try {
    // 3. A CHAMADA AGORA É MAIS SIMPLES, SEM O PARÂMETRO DE STATUS
    const novoCliente = await Cliente.cadastrar(
      nome,
      email,
      senha,
      cpf,
      endereco,
      dataNascimento,
      fotoPerfil
    );

    res.status(201).json(novoCliente);

  } catch (error) {
    // 3. TRATAMENTO DE ERROS: O 'catch' captura qualquer falha que ocorra no 'try'

    // 3a. CONFLITO: Verifica se o erro é de email/CPF duplicado (comum em MySQL)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: "Conflito: Já existe um cliente com o email ou CPF informado." });
    }

    // 3b. ERRO GENÉRICO: Para todos os outros tipos de erro
    console.error("Erro ao cadastrar novo cliente:", error); // Loga o erro no console para depuração
    res.status(500).json({ erro: "Ocorreu um erro interno no servidor ao tentar cadastrar o cliente." });
  }
});

// Atualizar
// DENTRO DO ARQUIVO cliente.js

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const dadosParaAtualizar = req.body; // Pega o corpo inteiro da requisição

  // Validação de formato do ID (continua a mesma)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ erro: "O ID fornecido é inválido. O formato deve ser um UUID." });
  }

  // Validação para garantir que o corpo não está vazio
  if (Object.keys(dadosParaAtualizar).length === 0) {
    return res.status(400).json({ erro: "Corpo da requisição não pode estar vazio." });
  }

  try {
    // 👇 A CHAMADA AGORA É MAIS SIMPLES E PODEROSA
    const result = await Cliente.atualizar(id, dadosParaAtualizar);

    res.json(result);

  } catch (error) {
    if (error.message === 'Cliente não encontrado') {
      return res.status(404).json({ erro: error.message });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: "Conflito: O CPF ou email informado já está em uso por outro cliente." });
    }
    console.error("Erro ao atualizar cliente:", error);
    res.status(500).json({ erro: "Ocorreu um erro interno no servidor." });
  }
});

// Excluir
// Cliente.js
router.delete("/", async (req, res) => {
  const { email, senha } = req.query;

  // 1. VALIDAÇÃO: Continua a mesma
  if (!email || !senha) {
    return res.status(400).json({ erro: "Informe email e senha nos parâmetros da URL" });
  }

  try {
    const result = await Cliente.excluir(email, senha);

    // 2. SUCESSO: Se a exclusão (desativação) funcionou
    res.json(result);

  } catch (error) {
    // 3. TRATAMENTO DE ERROS

    // 3a. NÃO ENCONTRADO: Captura o erro que lançamos no nosso método 'excluir'
    if (error.message === 'Cliente não encontrado ou credenciais inválidas') {
      return res.status(404).json({ erro: error.message });
    }

    // 3b. ERRO GENÉRICO: Para qualquer outro erro do servidor
    console.error("Erro ao desativar cliente:", error);
    res.status(500).json({ erro: "Ocorreu um erro interno no servidor." });
  }
});


export { Cliente, StatusCliente, router as clienteRoutes };
