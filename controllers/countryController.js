const { Country } = require('../models/models');

class CountryController {
    async getAll(req, res) {
        let countries;
        if (req.query.search) {
            countries = await Country.find({
                 name: {
                     $regex: req.query.search, 
                     $options: 'i' 
                    } 
                }).sort({country_name: 1});
        } else {
            countries = await Country.find().sort({country_name: 1});
        }
        res.json(countries);
    }
}

module.exports = new CountryController();