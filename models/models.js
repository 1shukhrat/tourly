const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum : ['ADMIN', 'SALES_MANAGER', 'CONTENT_MANAGER', 'USER'],
        required: true
    },
    wallet: {
        type: Schema.ObjectId,
        ref: 'Wallet'
    }
});

const touristSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    midlleName: {
        type: String,
        required: false
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender : {
        type: String,
        enum : ['МУЖ', 'ЖЕН'],
        required: true
    },
    passport: {
        type: Schema.ObjectId,
        ref: 'Passport',
        required: true
    },
    internationalPassport: {
        type: Schema.ObjectId,
        ref: 'InternationalPassport',
        required: false    
    }
});

const passportSchema = new Schema({
    series: {
        type: String,
        required: true,
        validator: (v) => /^\d{4} \d{6}$/.test(v)
    },
    dateOfIssue: {
        type: Date,
        required: true
    },
    issuedBy: {
        type: String,
        required: true
    }
});

const internationalPassportSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        validator: (v) => /^[A-Z]$/.test(v)
    },
    lastName: {
        type: String,
        required: true,
        validator: (v) => /^[A-Z]$/.test(v)
    },
    dateOfIssue: {
        type: Date,
        required: true
    },
    issuedBy: {
        type: String,
        required: true
    },
    dateOfExpiry: {
        type: Date,
        required: true
    },
    series: {
        type: String,
        required: true,
        validator: (value) => /^\d{2} \d{7}$/.test(value)
    }

});

const hotelSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Отель', 'Апартаменты', 'Гостевой дом', 'Хостел', 'Вилла'],
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    nutrition: [{
        type: String,
        enum: ['Завтрак', 'Обед', 'Ужин'],
        required: true
    }],
    services : [{
        type: Schema.ObjectId,
        ref: 'Service'
    }],
    image: {
        type: String,
        required: false
    }
});

const ServiceSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

const tourSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dayDuration: {
        type: Number,
        required: true
    },
    nightDuration: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    hotel: {
        type: Schema.ObjectId,
        ref: 'Hotel',
        required: true
    },
    image: {
        type: String,
        required: false
    },
    departureFlight: {
        type: Schema.ObjectId,
        ref: 'Flight',
        required: true
    },
    returnFlight: {
        type: Schema.ObjectId,
        ref: 'Flight',
        required: true
    },
    type: {
        type: String,
        enum: ['Внутренний', 'Международный'],
        required: true
    },
    visa: {
        type: Boolean,
        required: true
    },
    places : {
        type: Number,
        required: true
    }
})

const countrySchema = new  Schema({
    country_code: String,
    country_name: String,
})

const citySchema = new  Schema({
    name: String,
    country: String,
})


const flightSchema = new Schema({
    departurePlace: {
        type: Schema.ObjectId,
        ref: 'City',
        required: true
    },
    arrivalPlace: {
        type: Schema.ObjectId,
        ref: 'City',
        required: true
    },
    departureTime: {
        type: Date,
        required: true
    }
});

const requestSchema = new Schema({
    user : {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    tourists : [{
        type: Schema.ObjectId,
        ref: 'Tourist',
        required: true
    }],
    date: {
        type: Date,
        required: true
    },
    tour : {
        type: Schema.ObjectId,
        ref: 'Tour',
        required: true
    },
    status : {
        type: String,
        enum: ['Подано', 'Оплата', 'Приглашение в офис', 'Готово'],
        required: true
    },
    price : {
        type: Number,
        required: true
    }
});

const packageSchema = new Schema({
    user : {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    request : {
        type: Schema.ObjectId,
       ref: 'Request',
       required: true
    },
    documents : [{
        type: String,
        required: true
    }]
});

const walletSchema = new Schema({
    balance : {
        type: Number,
        required: true
    }
});

const ApplicationSchema = new Schema({
    data : Schema.Types.Mixed
})


module.exports = {
    Wallet: mongoose.model('Wallet', walletSchema),
    User: mongoose.model('User', userSchema),
    Tourist: mongoose.model('Tourist', touristSchema),
    Passport: mongoose.model('Passport', passportSchema),
    InternationalPassport: mongoose.model('InternationalPassport', internationalPassportSchema),
    Service: mongoose.model('Service', ServiceSchema),
    Hotel: mongoose.model('Hotel', hotelSchema),
    Tour: mongoose.model('Tour', tourSchema),
    Country: mongoose.model('Country', countrySchema),
    City: mongoose.model('City', citySchema),
    Flight: mongoose.model('Flight', flightSchema),
    Request: mongoose.model('Request', requestSchema),
    Package: mongoose.model('Package', packageSchema),
    Application: mongoose.model('Application', ApplicationSchema)
}









