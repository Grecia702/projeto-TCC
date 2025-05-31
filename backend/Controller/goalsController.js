const {
    createGoalService,
    getGoalService,
    getGoalByIdService,
    updateGoalService,
    deleteGoalService,
    updateSaldoService
} = require("../services/goalsServices")

const createGoal = async (req, res) => {
    try {
        const query = req.body
        const { userId } = req.user.decoded
        await createGoalService(userId, query)
        return res.status(201).json({ message: "Meta criada com sucesso" })
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor', error: error.message });
    }
}

const getGoals = async (req, res) => {
    try {
        const { userId } = req.user.decoded
        const query = req.query
        const goals = await getGoalService(userId, query)
        return res.status(200).json(goals)
    } catch (error) {
        if (error.message === 'Nenhuma meta encontrada') {
            return res.status(404).json({ message: error.message })
        }
        res.status(500).json({ message: 'Erro interno no servidor', error: error.message });
    }
}

const getGoalById = async (req, res) => {
    try {
        const { id } = req.params
        const { userId } = req.user.decoded
        const goals = await getGoalByIdService(userId, id)
        return res.status(200).json(goals)
    } catch (error) {
        if (error.message === 'Meta não encontrada') {
            return res.status(404).json({ message: error.message })
        }
        res.status(500).json({ message: 'Erro interno no servidor', error: error.message });
    }
}

const updateGoal = async (req, res) => {
    try {
        const query = req.body
        const { id } = req.params
        const { userId } = req.user.decoded
        await updateGoalService(userId, id, query)
        return res.status(200).json({ message: "Meta atualizada com sucesso" })
    } catch (error) {

        res.status(500).json({ message: 'Erro interno no servidor', error: error.message });
    }
}

const updateSaldo = async (req, res) => {
    try {
        const { saldo } = req.body
        const { id } = req.params
        const { userId } = req.user.decoded
        await updateSaldoService(saldo, userId, id)
        return res.status(200).json({ message: "Saldo adicionado com sucesso" })
    } catch (error) {

        res.status(500).json({ message: 'Erro interno no servidor', error: error.message });
    }
}

const deleteGoal = async (req, res) => {
    try {
        const { id } = req.params
        const { userId } = req.user.decoded
        await deleteGoalService(userId, id)
        return res.status(200).json({ message: "Meta deletada com sucesso" })
    } catch (error) {
        if (error.message === 'Meta não encontrada') {
            return res.status(404).json({ message: error.message })
        }
        res.status(500).json({ message: 'Erro interno no servidor', error: error.message });
    }
}

module.exports = { createGoal, getGoals, getGoalById, updateGoal, deleteGoal, updateSaldo }