import Usuario from "./usuario.js";
import express from "express";
import db from "./database.js";
import { v4 as uuidv4 } from "uuid";

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
    const statusPadrao = StatusCliente.ATIVO; // Define o status padrão aqui

    const sql = `
      INSERT INTO ${this.tabela} 
        (id, nome, email, senha, cpf, endereco, data_nascimento, foto_perfil, status_cliente) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, statusPadrao];

    await db.query(sql, values);

    // Retorna o objeto completo para a resposta da API
    return { id, nome, email, cpf, endereco, dataNascimento, fotoPerfil, statusCliente: statusPadrao };
  }

  static async atualizar(id, nome, senha, cpf, endereco, dataNascimento, fotoPerfil) {
    // A query de atualização continua a mesma
    const sql = `
      UPDATE ${this.tabela} SET 
        nome=?, senha=?, cpf=?, endereco=?, data_nascimento=?, foto_perfil=? 
      WHERE id=?`;
    
    const values = [nome, senha, cpf, endereco, dataNascimento, fotoPerfil, id];

    // Usamos 'db.query' que já foi importado no arquivo
    const [result] = await db.query(sql, values);

    // VERIFICAÇÃO CRUCIAL: 'affectedRows' diz quantas linhas foram alteradas.
    // Se for 0, significa que nenhum cliente com aquele ID foi encontrado.
    if (result.affectedRows === 0) {
      // Lançamos um erro que será capturado pelo 'catch' da rota
      throw new Error('Cliente não encontrado');
    }

    return { message: "Cliente atualizado com sucesso" };
  }

  static async excluir(email, senha) {
    const statusInativo = StatusCliente.INATIVO; // Usando o enum definido no arquivo

    const sql = `
      UPDATE ${this.tabela} 
      SET status_cliente=? 
      WHERE email=? AND senha=?`;
    
    const values = [statusInativo, email, senha];

    // Captura o resultado da query
    const [result] = await db.query(sql, values);

    // Se nenhuma linha foi afetada, o email/senha não correspondem a nenhum cliente
    if (result.affectedRows === 0) {
      // Lança um erro que será capturado pelo 'catch' da rota
      throw new Error('Cliente não encontrado ou credenciais inválidas');
    }

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
    // 👇 3. A CHAMADA AGORA É MAIS SIMPLES, SEM O PARÂMETRO DE STATUS
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
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, senha, cpf, endereco, dataNascimento, fotoPerfil } = req.body;

  // 1. VALIDAÇÃO DE FORMATO DO ID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ erro: "O ID fornecido é inválido. O formato deve ser um UUID." });
  }

  try {
    const result = await Cliente.atualizar(
      id,
      nome,
      senha,
      cpf,
      endereco,
      dataNascimento,
      fotoPerfil
    );

    // 2. SUCESSO: Se tudo correu bem, retorna 200 OK
    res.json(result);

  } catch (error) {
    // 3. TRATAMENTO DE ERROS

    // 3a. NÃO ENCONTRADO: Captura o erro que lançamos no nosso método 'atualizar'
    if (error.message === 'Cliente não encontrado') {
      return res.status(404).json({ erro: error.message });
    }

    // 3b. CONFLITO: Verifica se o erro é de CPF duplicado
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: "Conflito: O CPF informado já está em uso por outro cliente." });
    }
    
    // 3c. ERRO GENÉRICO: Para todos os outros casos
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
