const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const clientRoutes = require('./routes/clientRoutes');
const entrepriseRoutes = require('./routes/entrepriseRoutes');
const transactionRoutes = require('./routes/transactionRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - ordre important !
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/clients', clientRoutes);
app.use('/api/entreprises', entrepriseRoutes);
app.use('/api/transactions', transactionRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: '🚀 API Fidélisation opérationnelle !' });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});