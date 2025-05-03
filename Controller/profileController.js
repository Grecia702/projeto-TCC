const userModel = require("../models/userModel");

const SearchUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const usuario = await userModel.ListUser(userId);
        if (usuario.length > 0) {
            res.status(200).json(usuario);
        }
        else {
            res.status(404).json({ message: "Usuário não encontrado" })
        }
    }
    catch (err) {
        console.log("Erro na consulta: ", err)
        res.status(500).json({ error: "Erro interno do servidor" });
    }
}

module.exports = { SearchUser };