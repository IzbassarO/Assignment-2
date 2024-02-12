const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const axios = require('axios');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const SearchLog = require('./models/SearchLog');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const app = express();

const uri = "mongodb+srv://boy:0000@cluster0.0quzlca.mongodb.net/BackEnd?retryWrites=true&w=majority";

// Database connection
mongoose
  .connect(uri)
  .then(() => {
    console.info("Connected to the DB");
  })
  .catch((e) => {
    console.log("Error: ", e);
  });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'your secret key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: !true }
}));
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, username, password } = req.body;
    if (!firstName || !lastName || !username || !password) {
      return res.status(400).send('All fields are required');
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }

    const user = new User({
      firstName,
      lastName,
      username,
      password
    });

    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

process.on('SIGINT', () => {
  client.close(() => {
      console.log('MongoDB disconnected on app termination');
      process.exit(0);
  });
});

app.get('/', checkAuthenticated, async (req, res) => {
  try {
    const isAdmin = req.session.user?.isAdmin || false;

    res.render('index', {isAdmin: isAdmin});
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
});


app.get('/about', (req, res) => {
  const isAdmin = req.session?.user?.isAdmin || false;
  res.render('about', { isAdmin: isAdmin });
});

app.get('/searchlogs', async (req, res) => {
  if (!req.session.user) {
    res.redirect('/login', );
    return;
  }
  const isAdmin = req.session.user.isAdmin || false;

  const usernameQuery = req.query.username || req.session.user.username;

  try {
    const searchLogs = await SearchLog.find({ username: usernameQuery });

    res.render('searchlogs', { searchLogs: searchLogs, queryUsername: usernameQuery, isAdmin: isAdmin });
  } catch (error) {
    console.error('Error fetching search logs:', error);
    res.status(500).send('Error fetching search logs');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  console.log("Login attempt for user:", req.body.username);
  try {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      req.session.user = { username, isAdmin: true };
      return res.redirect('/admin');
    }
    if (!username || !password) {
      res.render('login', { message: 'Both fields are required' });
      return;
    }

    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.render('login', { message: 'Invalid username or password' });
      return;
    }
    req.session.user = user;
    req.session.save(err => {
      if (err) throw err;
      res.redirect('/');
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).render('login', { message: 'Server error' });
  }
});

app.post('/', async (req, res) => {
    try {
        const city = req.body.cityName;
        const apiKey = '9b1c5b4d3e84daa2bc0243525697b68a'
        console.log("City received:", city);
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await axios.get(apiUrl);
        const weatherData = response.data;
        const isAdmin = req.session.user.isAdmin;

        const user = await User.findOne({ username: req.session.user.username });
        const newLog = new SearchLog({
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          citySearched: city,
          searchTime: new Date(),
          weatherData
        });

      console.log("New Log:", newLog);
      
      await newLog.save();
      res.render('index', { data: weatherData, isAdmin: isAdmin });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).send('Error fetching weather data');
    }
});

app.get('/aqi/:latitude/:longitude', async (req, res) => {
  const { latitude, longitude } = req.params;
  const apiKey = 'bdf8ead6-a40a-459e-a3a9-6440e3c8d5f5';

  try {
    const response = await axios.get(`http://api.example.com/aqi?lat=${latitude}&lon=${longitude}&key=${apiKey}`);
    const aqiData = response.data;
    res.json(aqiData);
  } catch (error) {
    console.error("Error fetching AQI data:", error);
    res.status(500).send("Error fetching AQI data");
  }
});


app.get('/forecast/:latitude/:longitude', async (req, res) => {
  const { latitude, longitude } = req.params;
  try {
      const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
          params: {
              latitude: latitude,
              longitude: longitude,
              daily: ['temperature_2m_max', 'temperature_2m_min', 'weathercode'],
              timezone: 'auto'
          }
      });
      res.json(response.data);
  } catch (error) {
      console.error("Error fetching 14-day forecast data:", error);
      res.status(500).send("Error fetching forecast data");
  }
});

app.get('/searchlogs', async (req, res) => {
  if (!req.session.user) {
    res.redirect('/login');
    return;
  }
  
  try {
    const searchLogs = await SearchLog.find({ username: req.session.user.username });

    res.render('searchlogs', { searchLogs: searchLogs });
  } catch (error) {
    console.error('Error fetching search logs:', error);
    res.status(500).send('Error fetching search logs');
  }
});

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
      return next();
  } else {
      return res.status(403).send('Access Denied');
  }
}

app.get('/admin', isAdmin, async (req, res) => {
  try {
      const users = await User.find();
      res.render('admin', { users: users });
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send('Error loading admin page');
  }
});

app.post('/admin/adduser', isAdmin, async (req, res) => {
  const { username, password, firstName, lastName } = req.body;
  try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.status(400).send('Username already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword, firstName, lastName });
      await newUser.save();

      res.redirect('/admin');
  } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).send('Server error');
  }
});

app.post('/admin/edituser/:userId', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { username /* other fields */ } = req.body;

    await User.findByIdAndUpdate(userId, { username /* other fields */ });

    res.redirect('/admin');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Error updating user');
  }
});


app.post('/admin/deleteuser/:userId', isAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.userId);
  res.redirect('/admin');
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error while logging out:', err);
      res.status(500).send('Error logging out');
    } else {
      res.redirect('/login');
    }
  });
});

app.get('/download-search-logs', async (req, res) => {
  if (!req.session.user) {
      return res.redirect('/login');
  }
  
  const searchLogs = await SearchLog.find({ username: req.session.user.username });

  const doc = new PDFDocument();
  res.setHeader('Content-disposition', 'attachment; filename="SearchLogs.pdf"');
  res.setHeader('Content-type', 'application/pdf');
  doc.pipe(res);

  searchLogs.forEach(log => {
    const searchTime = log.searchTime ? new Date(log.searchTime).toLocaleString() : 'N/A';

    doc.fontSize(14).text(`User: ${log.firstName} ${log.lastName} (${log.username})`, { underline: true });
    doc.fontSize(10).text(`Search Time: ${searchTime}`);

    if (log.weatherData && log.weatherData.weather && log.weatherData.weather.length > 0) {
        const data = log.weatherData;
        const temp = data.main.temp;
        const clouds = data.clouds.all;
        const lat = data.coord.lat;
        const lon = data.coord.lon;

        doc.fontSize(10).text(`City Searched: ${data.name}`);
        doc.fontSize(10).text(`Approximate Temperature: ${temp}°C`);
        doc.fontSize(10).text(`Clouds: ${clouds}%`);
        doc.fontSize(10).text(`Latitude: ${lat}`);
        doc.fontSize(10).text(`Longitude: ${lon}`);
        // ... add more fields as necessary ...
    } else {
        doc.fontSize(10).text('No weather data available.');
    }

    doc.text('-----------------------');
  });

  doc.end();
});
function checkAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}
