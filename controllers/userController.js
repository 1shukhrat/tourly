const bcrypt = require('bcrypt');;
const { User, Wallet, Application } = require('../models/models');

const {generateToken} = require('../utils.js');

class userController {

    async getUsers(req, res) {
        const users = await User.find({role : {$ne : 'ADMIN'}},{__v: 0});
        return res.status(200).json(users);
    }

    async me(req, res) {
        const user = await User.findById(req.userData.id).populate('wallet');
        return res.status(200).json(user);        
    }

    async updateUser(req, res) {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({message: 'Пользователь не найден'});
        }
        if (user._id != req.userData.id && req.userData.role!==  'ADMIN')  {
            return res.status(403).json({message: 'Вы не можете изменять других пользователей'});
        }
        const login = await User.findOne({username : req.body.username, _id : {$ne : user._id}});
        const email = await User.findOne({email : req.body.email, _id : {$ne : user._id}});
        const phone = await User.findOne({phone : req.body.phone, _id : {$ne : user._id}});
        if (login || email || phone) {
            return res.status(400).json({
                message: 'Пользователь уже зарегистрирован'
            })
        }
        if (req.body.username) {
            user.username = req.body.username;
        }
        user.firstName  = req.body.firstName;
        user.lastName  = req.body.lastName;
        user.email  = req.body.email;
        user.phone   = req.body.phone;
        user.save();
        return res.status(200).json(user);
    }

    async createUser(req, res) {
        if (req.body.role !== 'ADMIN' && req.body.role !== 'USER') {
            await Application.create({
                data : req.body
            });
            return res.status(201).json({
                message: 'Заявка успешно отправлена'
            });
        }
        const login = await User.findOne({username : req.body.username});
        const email = await User.findOne({email : req.body.email});
        const phone = await User.findOne({phone : req.body.phone});
        if (login || email || phone) {
            return res.status(400).json({
                message: 'Пользователь уже зарегистрирован'
            })
        }
        const wallet = await Wallet.create({balance : 0});
        const newUser = await User.create({
            username: req.body.username,
            password: await bcrypt.hash(req.body.password, 5),
            email: req.body.email,
            phone: req.body.phone,
            role: req.body.role,
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            wallet : wallet._id,
        });
        
        return res.status(201).json({
            message: 'Пользователь успешно создан',
            token: generateToken(newUser._id.toString(), newUser.email, newUser.role, newUser.phone),
            user: {
                id: newUser._id.toString(),
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role
            }
        });
    }

    async login(req, res) {
        const user = await User.findOne({username : req.body.username});
        if (!user) {
            return res.status(401).json({message: 'Пользователь не найден'});
        }
        if (!bcrypt.compare(req.body.password, user.password)) {
            return res.status(401).json({message: 'Неверный пароль'});
        }
        return res.status(200).json({
            message: 'Вы успешно авторизованы',
            token: generateToken(user._id.toString(), user.email, user.role, user.phone),
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                phone: user.phone,
                role:  user.role
            }
        });
    }

    async createEmployee(req, res) {
        const application = await Application.findById(req.params.id);
        if (!application) {
            res.status(404).json({message: 'Заявка не найдена'});
        };
        const login = await User.find({username : application.data.username});
        const email = await User.find({email : application.data.email});
        const phone = await User.find({phone : application.data.phone});
        if (login || email || phone) {
            return res.status(400).json({
                message: 'Пользователь уже зарегистрирован'
            })
        }
        await User.create({
            username: application.data.username,
            password: await bcrypt.hash(application.data.password, 5),
            email: application.data.email,
            phone: application.data.phone,
            role: application.data.role,
            firstName : application.data.firstName,
            lastName : application.data.lastName
        }).then(async () => {
            await Application.findByIdAndDelete(req.params.id);
        });
        return res.status(201).json({
            message: 'Сотрудник успешно создан'
        });
    }

    async removeApplication(req, res) {
        const application = await Application.findById(req.params.id);
        if (!application) {
            res.status(404).json({message: 'Заявка не найдена'});
        };
        await Application.deleteOne({_id: req.params.id });
        return res.status(200).json({
            message: 'Заявка успешно удалена'
        });
    }

    async removeUser(req, res) {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({message: 'Пользователь не найден'});
        };
        if (user.role == 'USER') {
            await Wallet.findOneAndDelete({user: user._id});
        }
        
        await User.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            message: 'Пользователь успешно удален'
        });
    }

    async getApplications(req, res) {
        const users = await Application.find({},{__v: 0});
        return res.status(200).json(users);
    }
}

module.exports = new userController();

