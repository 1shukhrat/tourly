const { Tour, Flight, Hotel, Country , City} = require('../models/models');
const mongoose = require('../db');
const { saveFile, removeFile } = require('../utils.js');


class TourController {
    async getTours(req, res) {
        let tours;
        tours = await Tour.find()
            .populate({
                path: 'hotel',
                populate: 'services'
            })
            .populate({
                path : 'departureFlight',
                populate: [{
                    path: 'departurePlace'
                },
                {
                    path: 'arrivalPlace'
                }]
            }).populate({
                path : 'returnFlight',
                populate: [{
                    path: 'departurePlace'
                },
                {
                    path: 'arrivalPlace'
                }]
            })
        if (req.query.country) {
            const country = await Country.findOne({country_name : req.query.country  });
            if (!country){
                return res.status(404).json({message: 'Country not found'});
            }
            const cities = await City.find({country: country.country_code});
            tours = tours.filter((tour) => cities.map((city)  => city.name).includes(tour.departureFlight.arrivalPlace.name));
        }
        if (req.query.tourists) {
            tours = tours.filter((tour) => tour.places - req.query.tourists > -1)
        }
        if (req.query.departure) {
            const date = new Date(req.query.departure);
            tours = tours.filter((tour) => tour.departureFlight.departureTime.getDate() == date.getDate());
        }
        if (req.query.return)  {
            const date = new Date(req.query.return);
            tours = tours.filter((tour) => tour.returnFlight.departureTime.getDate() == date.getDate());
        }
        res.status(200).json(tours);
    }

    async getTour(req, res)  {
        const tour = await Tour.findById(req.params.id)
            .populate({
                path: 'hotel',
                populate: 'services'
            })
            .populate({
                path : 'departureFlight',
                populate: [{
                    path: 'departurePlace'
                },
                {
                    path: 'arrivalPlace'
                }]
            }).populate({
                path : 'returnFlight',
                populate: [{
                    path: 'departurePlace'
                },
                {
                    path: 'arrivalPlace'
                }]
            })
        if (!tour){
            return res.status(404).json({message: 'Tour not found'});
        }
        res.status(200).json(tour);
    }

    async createTour(req, res)  {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const tour = await Tour.create({
                name : req.body.name,
                description: req.body.description,
                price: req.body.price,
                hotel: req.body.hotel,
                departureFlight: req.body.departureFlight,
                returnFlight: req.body.returnFlight,
                type: req.body.type,
                visa: req.body.visa,
                dayDuration : req.body.dayDuration,
                nightDuration: req.body.nightDuration,
                places : req.body.places,
            });
            if (req.body.image) {
                tour.image = saveFile(req.body.image.fileName, req.body.image.fileContent);
                await tour.save();
            }
            await session.commitTransaction();
            return res.status(201).json(await Tour.findById(tour._id).populate({
                path: 'hotel',
                populate: 'services'
            }).populate({
                path : 'departureFlight',
                populate: [{
                    path: 'departurePlace'
                },
                {
                    path: 'arrivalPlace'
                }]
            }).populate({
                path : 'returnFlight',
                populate: [{
                    path: 'departurePlace'
                },
                {
                    path: 'arrivalPlace'
                }]
            }))
        } catch (error) {
            console.log(error)
            await session.abortTransaction();
            return res.status(500).json({ message: error.message });
        } finally  {
            await session.endSession();
        }
    }

    async updateTour(req, res) {
        const tour = await Tour.findById(req.params.id);
        if (!tour){
            return res.status(404).json({message: 'Tour not found'});
        }
        tour.name = req.body.name;
        tour.description = req.body.description;
        tour.price = req.body.price;
        tour.hotel = req.body.hotel;
        tour.departureFlight =req.body.departureFlight;
        tour.returnFlight = req.body.returnFlight;
        tour.type = req.body.type;
        tour.visa = req.body.visa;
        tour.dayDuration = req.body.dayDuration;
        tour.nightDuration =req.body.nightDuration;
        if (req.body.image) {
            removeFile(tour.image);
            tour.image = saveFile(req.body.image.fileName, req.body.image.fileContent);
        }
        await tour.save();
        return res.status(201).json(await Tour.findById(tour._id).populate({
            path: 'hotel',
            populate: 'services'
        })
        .populate({
            path : 'departureFlight',
            populate: [{
                path: 'departurePlace'
            },
            {
                path: 'arrivalPlace'
            }]
        }).populate({
            path : 'returnFlight',
            populate: [{
                path: 'departurePlace'
            },
            {
                path: 'arrivalPlace'
            }]
        }))
    }

    async deleteTour(req, res)  {
       const tour = await Tour.findById(req.params.id);
       if (!tour) {
           return res.status(404).json({ message: 'Тур не найден' });
       } else {
           await Tour.deleteOne({ _id: tour._id });
           removeFile(tour.image);
           return res.status(200).json({ message: 'Тур удален' });
       }
    }
}

module.exports = new TourController();