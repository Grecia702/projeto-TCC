const userModel = require("../models/userModel");
const bcrypt = require('bcrypt')

const deleteAccount = async (req, res) => {
    try {
        const { userId } = req.user.decoded;
        const { senha } = req.body
        const usuario = await userModel.ListUser(userId);
        const { senha: senhaHash } = usuario.firstResult
        const senhaValida = await bcrypt.compare(senha, senhaHash)
        if (usuario.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado" })
        }
        if (senhaValida) {
            await userModel.DeleteUser(userId);
            return res.status(204).json({ message: "Conta excluida com sucesso!" })
        }
        else {
            return res.status(401).json({ message: "Senha Invalida!" })
        }

    }
    catch (err) {
        console.log("Erro ao excluir a conta", err)
        return res.status(500).json({ message: "Erro ao excluir a conta, tente novamente mais tarde", error: err.message })
    }
}


module.exports = { deleteAccount };