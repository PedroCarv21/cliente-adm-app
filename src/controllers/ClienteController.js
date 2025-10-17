import ClienteModel from "../models/ClienteModel.js";
import ValidationUtils from "../utils/ValidationUtils.js";

class ClienteController {
  /**
   * Lista todos os clientes
   */
  static async listarTodos(req, res) {
    try {
      const clientes = await ClienteModel.buscarTodos();
      res.json(clientes);
    } catch (error) {
      console.error("Erro ao consultar clientes:", error);
      res.status(500).json({ erro: "Erro interno do servidor." });
    }
  }

  /**
   * Busca cliente por ID
   */
  static async buscarPorId(req, res) {
    const { id } = req.params;

    if (!ValidationUtils.validarUUID(id)) {
      return res.status(400).json({
        erro: "O ID fornecido é inválido. O formato deve ser um UUID.",
      });
    }

    try {
      const cliente = await ClienteModel.buscarPorId(id);
      res.json(cliente);
    } catch (error) {
      if (error.message.includes("não encontrado")) {
        return res.status(404).json({ erro: "Cliente não encontrado." });
      }
      console.error(`Erro ao consultar cliente com ID ${id}:`, error);
      res.status(500).json({ erro: "Erro interno do servidor." });
    }
  }

  /**
   * Cria um novo cliente
   */
  static async criar(req, res) {
    try {
      const novoCliente = await ClienteModel.criar(req.body);
      res.status(201).json(novoCliente);
    } catch (error) {
      if (error.message.includes("Campos obrigatórios")) {
        return res.status(400).json({ erro: error.message });
      }
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          erro: "Conflito: Já existe um cliente com o email ou CPF informado.",
        });
      }
      console.error("Erro ao cadastrar cliente:", error);
      res.status(500).json({ erro: "Erro interno do servidor." });
    }
  }

  /**
   * Atualiza um cliente
   */
  static async atualizar(req, res) {
    const { id } = req.params;

    if (!ValidationUtils.validarUUID(id)) {
      return res.status(400).json({
        erro: "O ID fornecido é inválido. O formato deve ser um UUID.",
      });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        erro: "Corpo da requisição não pode estar vazio.",
      });
    }

    try {
      const result = await ClienteModel.atualizar(id, req.body);
      res.json(result);
    } catch (error) {
      if (error.message === "Cliente não encontrado") {
        return res.status(404).json({ erro: error.message });
      }
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          erro: "Conflito: O CPF ou email informado já está em uso.",
        });
      }
      console.error("Erro ao atualizar cliente:", error);
      res.status(500).json({ erro: "Erro interno do servidor." });
    }
  }

  /**
   * Desativa um cliente
   */
  static async desativar(req, res) {
    const { email, senha } = req.query;

    if (!email || !senha) {
      return res.status(400).json({
        erro: "Informe email e senha nos parâmetros da URL",
      });
    }

    try {
      const result = await ClienteModel.desativar(email, senha);
      res.json(result);
    } catch (error) {
      if (error.message.includes("credenciais inválidas")) {
        return res.status(404).json({ erro: error.message });
      }
      console.error("Erro ao desativar cliente:", error);
      res.status(500).json({ erro: "Erro interno do servidor." });
    }
  }
}

export default ClienteController;
