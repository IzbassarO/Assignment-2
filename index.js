const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const axios = require('axios');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const SearchLog = require('./models/SearchLog');
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
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
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

app.get('/', async (req, res) => {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    try {
      const apiKey = 'eb487c460284448691cbd0930d6d45c8';
      let city = 'Astana';

      if (req.session.user.lastSearchedCity) {
        city = req.session.user.lastSearchedCity;
      }

      const apiUrl = `https://api.weatherbit.io/v2.0/current?city=${city}&key=${apiKey}&units=metric`;
      const isAdmin = req.session.user.isAdmin || false;
      const response = await axios.get(apiUrl);
      const weatherData = response.data;

      res.render('index', { data: weatherData, isAdmin: isAdmin });
    } catch (error) {
      console.error('Error fetching weather data:', error);
      res.status(500).send('Error fetching weather data');
    }
  }
});

app.get('/about', (req, res) => {
  const isAdmin = req.session.user.isAdmin || false;
  
  res.render('about', { isAdmin: isAdmin });
})

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
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).render('login', { message: 'Server error' });
  }
});

app.post('/', async (req, res) => {
    try {
        const cityName = req.body.cityName;
        const apiKey = 'https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric'

        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await axios.get(apiUrl);
        const weatherData = response.data;

        res.render('index', { data: weatherData });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).send('Error fetching weather data');
    }
});

app.get('/climacell/:lat/:lon', async (req, res) => {
    const { lat, lon } = req.params;
    const climacellApiKey = "eAug0eZBRrEu5tfx54VMicw8gb6B1KyB";
    try {
      const response = await axios.get(`https://api.tomorrow.io/v4/timelines`, {
        params: {
          location: `${lat},${lon}`,
          fields: ['temperature', 'weatherCode', 'precipitationIntensity'],
          timesteps: ['1h'],
          units: 'metric',
          apikey: climacellApiKey,
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching Tomorrow.io data:", error);
      res.status(500).json({ error: error.message });
    }
  });

app.get('/weatherbit/:city', async (req, res) => {
    const city = req.params.city;
    const weatherbitApiKey = "eb487c460284448691cbd0930d6d45c8";
    try {
      const response = await axios.get(`https://api.weatherbit.io/v2.0/current?city=${city}&key=${weatherbitApiKey}`);
      console.log(response.data);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching Weatherbit data:", error);
      res.status(500).json({ error: error.message });
    }
  });

app.get('/weatherbit/forecast/:city', async (req, res) => {
    const city = req.params.city;
    const weatherbitApiKey = "eb487c460284448691cbd0930d6d45c8";
    try {
        const response = await axios.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${weatherbitApiKey}&days=16`);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching Weatherbit forecast data:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/search-weather', async (req, res) => {
  if (!req.session.user) {
    res.redirect('/login');
    return;
  }

  try {
    const cityName = req.body.cityName;
    const apiKey = 'eb487c460284448691cbd0930d6d45c8';
    const apiUrl = `https://api.weatherbit.io/v2.0/current?city=${cityName}&key=${apiKey}&units=metric`;
    
    const response = await axios.get(apiUrl);
    const weatherData = response.data;

    console.log('City Name:', cityName);

    const user = await User.findOne({ username: req.session.user.username });

    const newLog = new SearchLog({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        citySearched: cityName,
        searchTime: new Date(),
        weatherData
      });
      
      await newLog.save();
      res.render('index', { data: weatherData });
  } catch (error) {
    console.error('Error in search weather:', error);
    res.status(500).send('Error processing your request');
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
  const { username, password } = req.body;
  try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.status(400).send('Username already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });
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
