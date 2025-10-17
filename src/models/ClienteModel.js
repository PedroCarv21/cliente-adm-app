import BaseModel from "./BaseModel.js";
import db from "../db/database.js";
import bcrypt from "bcrypt";

export const StatusCliente = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  BLOQUEADO: "Bloqueado",
  SUSPENSO: "Suspenso",
};

class ClienteModel extends BaseModel {
  static tabela = "cliente";
  static SALT_ROUNDS = 10;

  constructor(
    id,
    nome,
    email,
    senha,
    cpf,
    endereco,
    dataNascimento,
    fotoPerfil,
    statusCliente
  ) {
    super(id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil);
    this.statusCliente = statusCliente;
  }

  static async criar(dados) {
    const { nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil } =
      dados;

    // Validação de campos obrigatórios
    this.validarCamposObrigatorios(dados, ["nome", "email", "senha", "cpf"]);

    const id = this.gerarId();
    const statusPadrao = StatusCliente.ATIVO;
    const senhaHash = await bcrypt.hash(senha, this.SALT_ROUNDS);

    const sql = `
      INSERT INTO ${this.tabela} 
        (id, nome, email, senha, cpf, endereco, data_nascimento, foto_perfil, status_cliente) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      id,
      nome,
      email,
      senhaHash,
      cpf,
      endereco,
      dataNascimento,
      fotoPerfil,
      statusPadrao,
    ];

    await db.query(sql, values);

    return {
      id,
      nome,
      email,
      cpf,
      endereco,
      dataNascimento,
      fotoPerfil,
      statusCliente: statusPadrao,
    };
  }

  static async atualizar(id, dadosParaAtualizar) {
    // Criptografa a senha se ela estiver sendo atualizada
    if (dadosParaAtualizar.senha) {
      dadosParaAtualizar.senha = await bcrypt.hash(
        dadosParaAtualizar.senha,
        this.SALT_ROUNDS
      );
    }

    const campos = Object.keys(dadosParaAtualizar);

    if (campos.length === 0) {
      throw new Error("Nenhum dado fornecido para atualização.");
    }

    const setClause = campos
      .map((campo) => {
        const nomeColuna = this.converterCampoParaColuna(campo);
        return `${nomeColuna}=?`;
      })
      .join(", ");

    const values = Object.values(dadosParaAtualizar);
    values.push(id);

    const sql = `UPDATE ${this.tabela} SET ${setClause} WHERE id=?`;

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      throw new Error("Cliente não encontrado");
    }

    return await this.buscarPorId(id);
  }

  static async desativar(email, senha) {
    // Buscar o cliente no banco de dados usando apenas o email
    const sqlBusca = `SELECT * FROM ${this.tabela} WHERE email = ?`;
    const [rows] = await db.query(sqlBusca, [email]);

    if (rows.length === 0) {
      throw new Error("Cliente não encontrado ou credenciais inválidas");
    }

    const cliente = rows[0];
    const senhaHashDoBanco = cliente.senha;

    // Comparar a senha fornecida com o hash do banco
    const senhaCorreta = await bcrypt.compare(senha, senhaHashDoBanco);

    if (!senhaCorreta) {
      throw new Error("Cliente não encontrado ou credenciais inválidas");
    }

    // Desativar o cliente
    const statusInativo = StatusCliente.INATIVO;
    const sqlUpdate = `UPDATE ${this.tabela} SET status_cliente = ? WHERE email = ?`;

    await db.query(sqlUpdate, [statusInativo, email]);

    return { message: "Cliente desativado com sucesso" };
  }

  static async buscarPorEmail(email) {
    return await db.query(`SELECT * FROM ${this.tabela} WHERE email = ?`, [
      email,
    ]);
  }
}

export default ClienteModel;
