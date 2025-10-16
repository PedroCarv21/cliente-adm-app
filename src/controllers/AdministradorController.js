import AdministradorModel from "../models/AdministradorModel.js";
import ValidationUtils from "../utils/ValidationUtils.js";

class AdministradorController {
  /**
   * Lista todos os administradores
   */
  static async listarTodos(req, res) {
    try {
      const administradores = await AdministradorModel.buscarTodos();
      res.json(administradores);
    } catch (error) {
      console.error("Erro ao consultar administradores:", error);
      res.status(500).json({ erro: "Erro interno do servidor." });
    }
  }

  /**
   * Busca administrador por ID
   */
  static async buscarPorId(req, res) {
    const { id } = req.params;

    if (!ValidationUtils.validarUUID(id)) {
      return res.status(400).json({
        erro: "O ID fornecido é inválido. O formato deve ser um UUID.",
      });
    }

    try {
      const administrador = await AdministradorModel.buscarPorId(id);
      res.json(administrador);
    } catch (error) {
      if (error.message.includes("não encontrado")) {
        return res.status(404).json({ erro: "Administrador não encontrado." });
      }
      console.error(`Erro ao consultar administrador com ID ${id}:`, error);
      res.status(500).json({ erro: "Erro interno do servidor." });
    }
  }

  /**
   * Cria um novo administrador
   */
  static async criar(req, res) {
    try {
      const novoAdministrador = await AdministradorModel.criar(req.body);
      res.status(201).json(novoAdministrador);
    } catch (error) {
      if (error.message.includes("Campos obrigatórios")) {
        return res.status(400).json({ erro: error.message });
      }
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          erro: "Conflito: Email ou CPF já cadastrado.",
        });
      }
      console.error("Erro ao cadastrar administrador:", error);
      res.status(500).json({ erro: "Erro interno do servidor." });
    }
  }

  /**
   * Atualiza um administrador
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
      const result = await AdministradorModel.atualizar(id, req.body);
      res.json(result);
    } catch (error) {
      if (error.message === "Administrador não encontrado") {
        return res.status(404).json({ erro: error.message });
      }
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          erro: "Conflito: Email ou CPF informado já está em uso.",
        });
      }
      console.error("Erro ao atualizar administrador:", error);
      res.status(500).json({ erro: "Erro interno do servidor." });
    }
  }

  /**
   * Desativa um administrador
   */
  static async desativar(req, res) {
    const { email, senha } = req.query;

    if (!email || !senha) {
      return res.status(400).json({
        erro: "Informe email e senha nos parâmetros da URL.",
      });
    }

    try {
      const result = await AdministradorModel.desativar(email, senha);
      res.json(result);
    } catch (error) {
      if (error.message.includes("credenciais inválidas")) {
        return res.status(404).json({ erro: error.message });
      }
      console.error("Erro ao desativar administrador:", error);
      res.status(500).json({ erro: "Erro interno do servidor." });
    }
  }
}

export default AdministradorController;
