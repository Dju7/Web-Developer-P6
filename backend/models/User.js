const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongodbErros = require('mongoose-mongodb-errors');

mongoose.plugin(mongodbErros);

// modèle de donnée uilisateur: email + password 
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);