const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        minlength: 1,
        unique: true
    },
    description: {
        type: String,
        required: true,
        minlength: 1
    }
});

const Role = mongoose.model('Role', RoleSchema);

module.exports = { Role };