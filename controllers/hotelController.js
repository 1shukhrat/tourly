const { Hotel, Service } = require('../models/models');
const { saveFile, removeFile } = require('../utils.js');


function getServicesId(services) {
    const servicesId = []
    services.forEach(async (service) => {
        const serviceData = await Service.findOne({ name: service });
        if (serviceData) {
            servicesId.push(serviceData._id);
        } else {
            const newService = await Service.create({ name: service });
            servicesId.push(newService._id);
        }
    });
    return servicesId;
}

class hotelController {

    async getHotels(req, res) {
        const hotels = await Hotel.find({}, { __v: 0 }).populate('services');
        return res.status(200).json(hotels);
    }

    async createHotel(req, res) {
        try {
            const newHotel = await Hotel.create({
                name: req.body.name,
                address: req.body.address,
                services: req.body.services,
                type: req.body.type,
                rating: req.body.rating,
                nutrition: req.body.nutrition,
            });
            if (req.body.image) {
                newHotel.image = saveFile(req.body.image.fileName, req.body.image.fileContent);
                await newHotel.save();
            }
            return res.status(201).json(newHotel);
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: error.message });
        }
    }

    async updateHotel(req, res) {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: 'Отель не найден' });
        } else {
            hotel.name = req.body.name;
            hotel.address = req.body.address;
            hotel.type = req.body.type;
            hotel.rating = req.body.rating;
            hotel.nutrition = req.body.nutrition;
            hotel.services = req.body.services;
            if (req.body.image) {
                removeFile(hotel.image);
                hotel.image = saveFile(req.body.image.fileName, req.body.image.fileContent);
            }
            const updatedHotel = await hotel.save();
            return res.status(200).json(updatedHotel);
        }
    }

    async deleteHotel(req, res) {
       const hotel = await Hotel.findById(req.params.id);
       if (!hotel) {
           return res.status(404).json({ message: 'Отель не найден' });
       } else {
           await Hotel.deleteOne({ _id: hotel._id });
           removeFile(hotel.image);
           return res.status(200).json({ message: 'Отель удален' });
       }
    }
}

module.exports = new hotelController();

