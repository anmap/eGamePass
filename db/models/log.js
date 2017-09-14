const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const { GAMES } = require('./../../config/games');

// Setup UserSchema
const UserSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    _user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        required: true,
        default: 'unassigned'
    },
    game: {
        type: String
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

// Override built-in methods
UserSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();

    return _.pick(userObject, ['_id', 'username', 'name', 'role']);
};

// Define custom instance methods
UserSchema.methods.toJSONWithTokens = function() {
    let user = this;
    let userObject = user.toObject();

    let returnedObj = _.pick(userObject, ['_id', 'username', 'name', 'tokens', 'role']);
    if (user.game) {
        returnedObj.game = GAMES[user.game];
    }

    return returnedObj;
};

UserSchema.methods.generateAuthToken = function() {
    let user = this;
    let access = 'auth';
    let token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, process.env.JWT_SECRET).toString();

    user.tokens.push({ access, token });

    return user.save().then(() => token);
};

UserSchema.methods.removeToken = function(token) {
    // use $pull to remove item from an array which matches certain criteria
    let user = this;

    return user.update({
        $pull: {
            tokens: { token }
        }
    })
}

// Define custom model methods (static methods)
UserSchema.statics.findByToken = function(token) {
    let User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.statics.findByCredentials = function(username, password) {
    let User = this;

    return User.findOne({ username }).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        
        return new Promise((resolve, reject) => {
           bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject();
                }
           });
        });
    });  
};

// Define mongoose middleware
UserSchema.pre('save', function(next) {
    let user = this;

    // If user password is modified
    if (user.isModified('password')) {
        //let hashedPassword;
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

// Create User model
const User = mongoose.model('User', UserSchema);

module.exports = { User };