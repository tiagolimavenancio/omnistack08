const axios = require('axios');
const Dev = require('../models/Dev');

/** 
 *  --- Boas Práticas ---
 * Os 5 métodos fundamentais no Controller. Só podem ter esse métodos. 
 * INDEX: Uma lista daquele recurso.
 * SHOW: Retornar um único daquele recurso.
 * STORE: Criar um recurso.
 * UPDATE: Atualizar um recurso.
 * DELETE: Excluir um recurso.
*/

module.exports = {

    async index(req, res) {
        const { user } = req.headers;

        const loggedDev = await Dev.findById(user);

        const users = await Dev.find({
            $and: [ // $and: vai aplicar os fitros de uma só vez.
                { _id: { $ne: user }}, // $ne: not equal. Me traz todos os usuários que o id não seja o meu.
                { _id: { $nin: loggedDev.likes }}, // Me traga todos os usuários que o id não esteja na lista de likes.
                { _id: { $nin: loggedDev.dislikes }} // Me traga todos os usuários que o id não esteja na lista de dislikes.
            ],
        });

        return res.json(users)
    },

    async store(req, res) {
        const { username } = req.body;

        const userExists = await Dev.findOne({ user: username }); 

        if(userExists) {
            return res.json(userExists);
        }

        const response = await axios.get(`https://api.github.com/users/${username}`);

        const { name, bio, avatar_url: avatar } = response.data;

        const dev = await Dev.create({
            name,
            user: username,
            bio,
            avatar
        });
        
        return res.json(dev);
    }
};