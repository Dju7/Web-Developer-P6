const express = require ('express');
const mongoose = require ('mongoose');
const dotenv = require('dotenv');
const userRoutes = require ('./routes/user');
const sauceRoutes = require ('./routes/sauces');
const path = require('path');

dotenv.config();

mongoose.connect(process.env.MONGO_URI,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log(`Connexion à MongoDB échouée ! erreur: ${error.message}`));

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
  
});

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);
app.use('/public/images', express.static(path.join(__dirname, 'public', 'images')));

app.get('/', (req, res) => {
  res.json({ message: "Hello world"});
});

module.exports = app;