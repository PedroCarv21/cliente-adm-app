import BaseModel from "./BaseModel.js";
import db from "../db/database.js";
import bcrypt from "bcrypt";

export const StatusAdministrador = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  BLOQUEADO: "Bloqueado",
  SUSPENSO: "Suspenso",
};

class AdministradorModel extends BaseModel {
  static tabela = "administrador";
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
    departamento,
    dataAdmissao,
    statusAdm
  ) {
    super(id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil);
    this.departamento = departamento;
    this.dataAdmissao = dataAdmissao;
    this.statusAdm = statusAdm || StatusAdministrador.ATIVO;
  }

  static async criar(dados) {
    const {
      nome,
      email,
      senha,
      cpf,
      endereco,
      dataNascimento,
      fotoPerfil,
      departamento,
      dataAdmissao,
    } = dados;

    // Validação de campos obrigatórios
    this.validarCamposObrigatorios(dados, ["nome", "email", "senha", "cpf"]);

    const id = this.gerarId();
    const statusPadrao = StatusAdministrador.ATIVO;
    const senhaHash = await bcrypt.hash(senha, this.SALT_ROUNDS);

    const sql = `
        INSERT INTO ${this.tabela} 
        (id, nome, email, senha, cpf, endereco, data_nascimento, foto_perfil, departamento, data_admissao, statusAdm) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      id,
      nome,
      email,
      senhaHash,
      cpf,
      endereco,
      dataNascimento,
      fotoPerfil || null,
      departamento,
      dataAdmissao,
      statusPadrao,
    ];

    await db.query(sql, values);

    return {
      id,
      nome,
      email,
      cpf,
      departamento,
      dataAdmissao,
      statusAdm: statusPadrao,
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
      throw new Error("Administrador não encontrado");
    }

    return { message: "Administrador atualizado com sucesso" };
  }

  static async desativar(email, senha) {
    // Buscar o administrador pelo email
    const sqlBusca = `SELECT * FROM ${this.tabela} WHERE email = ?`;
    const [rows] = await db.query(sqlBusca, [email]);

    if (rows.length === 0) {
      throw new Error("Administrador não encontrado ou credenciais inválidas");
    }

    const administrador = rows[0];
    const senhaHashDoBanco = administrador.senha;

    // Comparar a senha fornecida com o hash do banco
    const senhaCorreta = await bcrypt.compare(senha, senhaHashDoBanco);

    if (!senhaCorreta) {
      throw new Error("Administrador não encontrado ou credenciais inválidas");
    }

    // Desativar o administrador
    const statusInativo = StatusAdministrador.INATIVO;
    const sqlUpdate = `UPDATE ${this.tabela} SET statusAdm = ? WHERE email = ?`;

    await db.query(sqlUpdate, [statusInativo, email]);

    return { message: "Administrador desativado com sucesso" };
  }
}

export default AdministradorModel;
