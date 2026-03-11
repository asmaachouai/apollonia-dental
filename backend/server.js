const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/departments',  require('./routes/departments'));
app.use('/api/employees',    require('./routes/employees'));
app.use('/api/patients',     require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/meetings',     require('./routes/meetings'));
app.use('/api/profile',      require('./routes/profile'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/', (req, res) => res.send('Apollonia API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));