const { Request, Tour, Passport, InternationalPassport, Tourist, Wallet, Hotel, Package } = require('../models/models')
const mongoose = require('../db')
const { saveFile, removeFile } = require('../utils.js');

class RequestController {

    async getAll(req, res) {
        const requests = await Request.find()
            .populate({
                path: 'tourists',
                populate: ['passport', 'internationalPassport']
            }).populate({
                path: 'tour',
                populate: [{
                    path: 'departureFlight',
                    populate: ['departurePlace', 'arrivalPlace']
                },{
                    path : 'returnFlight',
                    populate: ['departurePlace',  'arrivalPlace']
                },
                {
                    path: 'hotel'
                }
            ]
            }).populate('user')
        
        return res.status(200).json(requests)
    }

    async getMy(req, res) {
        const requests = await Request.find({ user: req.userData.id })
        .populate({
            path: 'tourists',
            populate: ['passport', 'internationalPassport']
        }).populate({
            path: 'tour',
            populate: [{
                path: 'departureFlight',
                populate: ['departurePlace', 'arrivalPlace']
            },{
                path : 'returnFlight',
                populate: ['departurePlace',  'arrivalPlace']
            },
            {
                path: 'hotel'
            }
        ]
        }).populate('user')
        return res.status(200).json(requests)
    }

    async getPackage(req, res)  {
        const request = await Request.findOne({
            _id : req.params.id,
            user : req.userData.id
        })
        if (!request) {
            return res.status(404).json({
                message: 'Request not found'
            })
        }
        const packageItem = await Package.findOne({request : request._id})
        if (!packageItem) {
            return res.status(404).json({
                message: 'Package not found'
            })
        }
        return res.status(200).json(packageItem)
    }

    async create(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const tour = await Tour.findById(req.params.id);
            let tourists = []
            let touristPromises = req.body.tourists.map(async (tourist) => {
                const passport = await Passport.create({
                    series: tourist.passport.series,
                    dateOfIssue: tourist.passport.issueDate,
                    issuedBy: tourist.passport.issuePlace
                });
    
                let internationalPassport = null;
                if (tourist.internationalPassport) {
                    internationalPassport = await InternationalPassport.create({
                        firstName: tourist.internationalPassport.name,
                        lastName: tourist.internationalPassport.surname,
                        dateOfIssue: tourist.internationalPassport.issueDate,
                        issuedBy: tourist.internationalPassport.issuePlace,
                        dateOfExpiry: tourist.internationalPassport.expiryDate,
                        series: tourist.internationalPassport.number
                    });
                }
    
                const newTourist = await Tourist.create({
                    firstName: tourist.name,
                    lastName: tourist.surname,
                    midlleName: tourist.patronymic,
                    dateOfBirth: tourist.birthdate,
                    gender: tourist.gender,
                    passport: passport._id,
                    internationalPassport: internationalPassport ? internationalPassport._id : null
                });
    
                tourists.push(newTourist._id);
            });
    
            // Ожидаем завершения всех операций создания туристов
            await Promise.all(touristPromises);
            tour.places -= tourists.length;
            await tour.save()
            await Request.create({
                user: req.userData.id,
                tourists: tourists,
                date: new Date(),
                status: 'Подано',
                tour: tour._id,
                price: tour.price * tourists.length
            });
            await session.commitTransaction();
            return res.status(200).json({
                message: 'Request created successfully'
            })
        } catch (e) {
            console.log(e)
            await session.abortTransaction();
            if (e.name === 'ValidationError') {
                return res.status(400).json({
                    message: 'Данные введены не корректно'
                })
            }
            return res.status(500).json({
                message: 'Internal server error'
            })
        } finally {
            await session.endSession();
        }

    }

    async updateStatus(req, res) {
        const request = await Request.findById(req.params.id)
        if (!request) {
            return res.status(404).json({
                message: 'Request not found'
            })
        }
        request.status = req.body.status;
        request.save();
        return res.status(200).json({
            message: 'Request updated successfully'
        })
    }

    async pay(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const request = await Request.findById(req.params.id).populate('user');
            if (!request) {
                return res.status(404).json({
                    message: 'Request not found'
                })
            }
            const wallet = await Wallet.findOne({ _id: request.user.wallet._id })
            if (!wallet) {
                return res.status(404).json({ message: 'Wallet not found' });
            }
            if (wallet.balance < request.price) {
                return res.status(400).json({
                    message: 'Not enough money'
                })
            }
            wallet.balance -= request.price;
            wallet.save();
            request.status = 'Приглашение в офис';
            request.save();
            await session.commitTransaction();
            return res.status(200).json({
                message: 'Request updated successfully'
            })
        } catch (e) {
            console.log(e);
            await session.abortTransaction();
            return res.status(500);
        } finally {
            await session.endSession();
        }
        
    }

    async delete(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const request = await Request.findById(req.params.id)
                .populate({
                    path: 'tourists'
                });
            if (!request) {
                return res.status(404).json({
                    message: 'Request not found'
                })
            }
            let touristPromises = request.tourists.map(async tourist => {
                await Passport.deleteOne({ _id: tourist.passport })
                if (tourist.internationalPassport) {
                    await InternationalPassport.deleteOne({ _id: tourist.internationalPassport })
                }
                await Tourist.deleteOne({ _id: tourist._id })
            })
            await Promise.all(touristPromises);
            const tour = await Tour.findById(request.tour)
            tour.places += request.tourists.length;
            await tour.save();
            await Request.deleteOne({ _id: request._id })
            await session.commitTransaction();
            return res.status(200).json({
                message : 'Request deleted successfully'
            })

        } catch (e) {
            console.log(e)
            await session.abortTransaction();
            return res.status(500).json({
                message: 'Internal server error'
            })
        } finally {
            await session.endSession();
        }
    }

    async finish(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const request  = await Request.findById(req.params.id)
            if (!request || request.status != 'Приглашение в офис')  {
                return res.status(404).json({
                    message : 'Request not found'
                })
            }
            request.status = 'Готово';
            await request.save();
            const files = req.body.files.map(file => saveFile(file.filename, file.fileContent));
            const packageItem = await Package.create({
                user : request.user._id,
                request : request._id, 
                documents : files
            });
            await session.commitTransaction();
            return res.status(200).json(packageItem);
            
        } catch (e) {
            console.log(e)
            await session.abortTransaction();
            return res.status(500).json({
                message: 'Internal server error'
            })
        } finally {
            await session.endSession();
        }
    }
}

module.exports = new RequestController();


// {
//     user : user,
//     tourists : [
//         {
//             firstName : firstName,
//             lastName  : lastName,
//             middleName : middleName,
//             dateOfBirth : dateOfBirth,
//             gender : gender,
//             passport : {
//                 series : series,
//                 dateOfIssue : dateOfIssue,
//                 issuedBy : issuedBy,
//             },
//             internationalPassport : {
//                 firstName : firstName,
//                 lastName : lastName,
//                 dateOfIssue : dateOfIssue,
//                 issuedBy  : issuedBy,
//                 dateOfExpiry : dateOfExpiry,
//                 series : series
//             }
//         },
//         {
//             firstName : firstName,
//             lastName  : lastName,
//             middleName : middleName,
//             dateOfBirth : dateOfBirth,
//             gender : gender,
//             passport : {
//                 series : series,
//                 dateOfIssue : dateOfIssue,
//                 issuedBy : issuedBy,
//             },
//             internationalPassport : {
//                 firstName : firstName,
//                 lastName : lastName,
//                 dateOfIssue : dateOfIssue,
//                 issuedBy  : issuedBy,
//                 dateOfExpiry : dateOfExpiry,
//                 series : series
//             }
//         },
//     ],
//     date : newDate
//     tour : tour
//     status : status
// }