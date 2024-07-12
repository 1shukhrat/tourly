const {City, Country} = require('../models/models')

class CityController {

    async getAll(req, res){
        let cities;
        if (req.query.country) {
            const country = await Country.findById(req.query.country);
            cities = await City.find({country : country.country_code}).sort({name: 1});
        } else {
            cities = await City.find().sort({name:  1});
        }
        return res.status(200).json(cities);
    }
}

module.exports = new CityController();