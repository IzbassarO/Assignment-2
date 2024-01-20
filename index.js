const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', async (req, res) => {
    try {
        const apiKey = 'eb487c460284448691cbd0930d6d45c8';
        const city = 'Astana'; // Replace with the desired city name
        const apiUrl = `https://api.weatherbit.io/v2.0/current?city=${city}&key=${apiKey}&units=metric`;

        const response = await axios.get(apiUrl);
        const weatherData = response.data;

        res.render('index', { data: weatherData });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).send('Error fetching weather data');
    }
});

app.post('/', async (req, res) => {
    try {
        const apiKey = 'YOUR_API_KEY'; // Replace with your Weatherbit API key
        const cityName = req.body.cityName; // Get the city name from the form input

        // Make a request to the Weatherbit API to get current weather data for the specified city
        const apiUrl = `https://api.weatherbit.io/v2.0/current?city=${cityName}&key=${apiKey}&units=metric`;
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
