function fetchWeather(city) {
    const apiKey = "9b1c5b4d3e84daa2bc0243525697b68a";
    axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => {
            const data = response.data;
            displayWeatherData(data);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
}

document.getElementById('weatherForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const city = document.getElementById('cityName').value;
    fetchWeather(city);
});

function displayWeatherData(data) {
    document.getElementById('weatherCity').textContent = `Weather in ${data.name}`;
    document.getElementById('weatherDescription').textContent = `${data.weather[0].description}`;
    document.getElementById('weatherTemperature').textContent = `Temperature: ${data.main.temp}°C`;
    document.getElementById('weatherWind').textContent = `Wind Speed: ${data.wind.speed} m/s`;
    document.getElementById('weatherHumidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('weatherPressure').textContent = `Pressure: ${data.main.pressure} hPa`;
    document.getElementById('weatherPressure').textContent = `Pressure: ${data.main.pressure} hPa`;
    document.getElementById('weatherClouds').textContent = `Cloudiness: ${data.clouds.all}%`;
    document.getElementById('weatherSunrise').textContent = `Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}`;
    document.getElementById('weatherSunset').textContent = `Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}`;

    fetchWeatherbitData(data.name);

    fetchAQIData(data.coord.lat, data.coord.lon);

    fetchTomorrowIoData(data.coord.lat, data.coord.lon);

    initMap(data.coord.lat, data.coord.lon);
}

function displayWeatherbitData(data) {
  document.getElementById('weatherbitTemperature').textContent = `Temperature (Weatherbit): ${data.data[0].temp}°C`;
  document.getElementById('weatherbitDescription').textContent = `Description (Weatherbit): ${data.data[0].weather.description}`;

  const iconCode = data.data[0].weather.icon;
  const iconUrl = `https://www.weatherbit.io/static/img/icons/${iconCode}.png`;

  document.getElementById('weatherbitIcon').src = iconUrl;
  document.getElementById('weatherbitIcon').alt = data.data[0].weather.description;

}


function displayAQIData(data) {

}

function fetchWeatherbitData(city) {
  axios.get(`/weatherbit/${city}`)
    .then(response => {
      const weatherbitData = response.data;
      displayWeatherbitData(weatherbitData);
    })
    .catch(error => {
      console.error("Error fetching Weatherbit data:", error);
    });
}

function fetchAQIData(lat, lon) {
  axios.get(`/aqi/${lat}/${lon}`)
    .then(response => {
      const aqiData = response.data;
      displayAQIData(aqiData);
    })
    .catch(error => {
      console.error("Error fetching AQI data:", error);
    });
}

function fetchTomorrowIoData(lat, lon) {
  axios.get(`/climacell/${lat}/${lon}`)
  .then(response => {
    console.log(response.data);
    displayTomorrowIoData(response.data);
  })
    .catch(error => {
      console.error("Error fetching Tomorrow.io data:", error);
    });
}

function fetch14DayWeatherForecast(city) {
  axios.get(`/weatherbit/forecast/${city}`)
      .then(response => {
          const forecastData = response.data;
          display14DayWeatherForecast(forecastData);
      })
      .catch(error => {
          console.error("Error fetching 14-day forecast data:", error);
      });
}


function displayTomorrowIoData(data) {
  console.log(data);
  const temp = data.data.timelines[0].intervals[0].values.temperature;
  
  document.getElementById('tomorrowIoTemperature').textContent = `Temperature (Tomorrow.io): ${temp}°C`;
}


function display14DayWeatherForecast(data) {
  const forecastTableBody = document.getElementById('forecastTableBody');
  forecastTableBody.innerHTML = '';

  data.data.forEach((dayData, index) => {
    if (index === 0 || index === 1) {
      return;
    }

    const date = dayData.valid_date;
    const highTemp = dayData.max_temp;
    const lowTemp = dayData.min_temp;
    const windSpeed = dayData.wind_spd;
    const humidity = dayData.rh;
    const weatherConditionCode = dayData.weather.code;

    const row = document.createElement('tr');

    const dateCell = document.createElement('td');
    dateCell.textContent = date;

    const tempCell = document.createElement('td');
    tempCell.textContent = `${highTemp}°C / ${lowTemp}°C`;

    const windCell = document.createElement('td');
    windCell.textContent = `${windSpeed} m/s`;

    const humidityCell = document.createElement('td');
    humidityCell.textContent = `${humidity}%`;

    const weatherIconCell = document.createElement('td');
    const weatherIcon = document.createElement('img');
    const iconBaseUrl = 'https://www.weatherbit.io/static/img/icons/';
    const iconUrl = `${iconBaseUrl}${dayData.weather.icon}.png`;

    weatherIcon.src = iconUrl;
    weatherIcon.alt = 'Weather Icon';
    weatherIcon.className = 'weather-icon';
    
    weatherIconCell.appendChild(weatherIcon);

    row.appendChild(dateCell);
    row.appendChild(tempCell);
    row.appendChild(windCell);
    row.appendChild(humidityCell);
    row.appendChild(weatherIconCell);

    forecastTableBody.appendChild(row);
  });
}

function initMap(lat, lon) {
  const map = L.map('map').setView([lat, lon], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  L.marker([lat, lon]).addTo(map)
    .bindPopup('Location of the searched city')
    .openPopup();
}

function displayWeatherIcons(forecastData) {
  forecastData.forEach(day => {
      const weatherConditionCode = day.weatherConditionCode;
      const iconBaseUrl = 'https://www.weatherbit.io/static/img/icons/';
      const iconUrl = `${iconBaseUrl}${weatherConditionCode}.png`;

      document.getElementById(`weatherIcon${day.id}`).src = iconUrl;
  });
}

document.getElementById('weatherForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const city = document.getElementById('cityName').value;
  axios.post('/search-weather', { cityName: city })
    .then(response => {
      // Update your UI based on the response
    })
    .catch(error => {
      console.error("Error submitting weather search:", error);
    });
});