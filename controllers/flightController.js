const { Flight, City } = require('../models/models');

class FlightController {

    async getAllFlights(req, res) {
        const currentDate = new Date();
        if (req.query.available == 'true') {
            const flights = await Flight.find({
                departureTime: {
                    $gte: currentDate,
                }
            }).populate('departurePlace').populate('arrivalPlace');
            return res.status(200).json(flights);
        }
        if (req.query.id) {
            const flight = await Flight.findById(req.query.id)
                .populate('departurePlace').populate('arrivalPlace');
            if (!flight) {
                return res.status(404).json({
                    message: 'Flight not found'
                })
            }
            const flights = await Flight.find({
                $and: [
                    { departurePlace: flight.arrivalPlace._id },
                    { arrivalPlace: flight.departurePlace._id },
                    {
                        departureTime: {
                            $gte: flight.departureTime,
                        }
                    }
                ]
            }).populate('departurePlace').populate('arrivalPlace');
            console.log(flights);
            return res.status(200).json(flights);
        }
        const flights = await Flight.find().populate('departurePlace').populate('arrivalPlace');
        return res.status(200).json(flights);
    }

    async getFlightById(req, res) {
        const flight = await Flight.findById(req.params.id)
            .populate('departurePlace').populate('arrivalPlace');
        return res.status(200).json(flight);
    }

    async createFlight(req, res) {
        const departure = await City.findById(req.body.departurePlace);
        const arrival = await City.findById(req.body.arrivalPlace);
        if (!departure || !arrival) {
            return res.status(404).json({
                message: 'City not found'
            })
        }
        await Flight.create({
            departurePlace: departure._id,
            arrivalPlace: arrival._id,
            departureTime: req.body.departureTime
        });
        return res.status(201).json({
            message: 'Flight created successfully',
        });
    }

    async deleteFlight(req, res) {
        const flight = await Flight.findById(req.params.id);
        if (!flight) {
            return res.status(404).json({
                message: 'Flight not found'
            })
        } else {
            await Flight.deleteOne({ _id: flight._id });
            return res.status(200).json({
                message: 'Flight deleted successfully'
            });
        }
    }

    async updateFlight(req, res) {
        const flight = await Flight.findById(req.params.id);
        if (!flight) {
            return res.status(404).json({
                message: 'Flight not found'
            })
        } else {
            const departure = await City.findById(req.body.departurePlace);
            const arrival = await City.findById(req.body.arrivalPlace);
            if (!departure || !arrival) {
                return res.status(404).json({
                    message: 'City not found'
                })
            }
            const updatedFlight = await Flight.findByIdAndUpdate({ _id: flight._id }, {
                $set: {
                    departurePlace: departure._id,
                    arrivalPlace: arrival._id,
                    departureTime: req.body.departureTime,
                }
            }, { returnDocument: 'after' });
            return res.status(200).json({
                message: 'Flight updated successfully',
                flight: updatedFlight
            })
        }
    }

}

module.exports = new FlightController();