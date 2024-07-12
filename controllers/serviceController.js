const {Service} = require('../models/models')

class ServiceController {

    async getAll(req, res) {
        const services = await Service.find();
        return res.status(200).json(services);
    }

    async create(req, res) {
        const newService = await Service.create({
            name: req.body.name
        })
        return res.status(201).json(newService);
    }

}

module.exports = new ServiceController();