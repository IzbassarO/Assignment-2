let map;
let marker;

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initMap();
});

function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13); // Default location
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    marker = L.marker([51.505, -0.09]).addTo(map); // Default marker
}

function updateMap(latitude, longitude) {
    map.setView([latitude, longitude], 13);
    marker.setLatLng([latitude, longitude]);
}

function fetchWeather(city) {
  const apiKey = "9b1c5b4d3e84daa2bc0243525697b68a";
  axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
  .then(response => {
    const data = response.data;
    updateMap(data.coord.lat, data.coord.lon);
    displayWeatherData({
        name: data.name,
        main: data.main,
        weather: data.weather[0],
        wind: data.wind,
        sys: data.sys,
        clouds: data.clouds
    });
    
    document.getElementById('latitude').textContent = `Latitude: ${data.coord.lat}`;
    document.getElementById('longitude').textContent = `Longitude: ${data.coord.lon}`;


    fetchAQIData(data.coord.lat, data.coord.lon);
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
  document.getElementById('weatherDescription').textContent = `${data.weather.description}`;
  document.getElementById('weatherTemperature').textContent = `Temperature: ${data.main.temp}°C`;
  document.getElementById('weatherWind').textContent = `Wind Speed: ${data.wind.speed} kph`;
  document.getElementById('weatherHumidity').textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById('weatherPressure').textContent = `Pressure: ${data.main.pressure} hPa`;
  document.getElementById('weatherClouds').textContent = `Cloudiness: ${data.clouds.all}%`;

  document.getElementById('weatherSunrise').textContent = `Sunrise: ${data.forecast.forecastday[0].astro.sunrise}`;
  document.getElementById('weatherSunset').textContent = `Sunset: ${data.forecast.forecastday[0].astro.sunset}`;

  const iconUrl = `http://openweathermap.org/img/wn/${data.weather.icon}.png`;
  document.getElementById('weatherIcon').src = iconUrl;
  document.getElementById('weatherIcon').alt = data.weather.description;

    fetchAQIData(data.coord.lat, data.coord.lon);

    fetch14DayWeatherForecast(data.coord.lat, data.coord.lon);
}

function fetchAQIData(latitude, longitude) {
  const apiKey = "9b1c5b4d3e84daa2bc0243525697b68a";
  const aqiUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

  axios.get(aqiUrl)
    .then(response => {
      const aqiData = response.data.list[0].main.aqi;
      displayAQIData(aqiData);
    })
    .catch(error => {
      console.error("Error fetching AQI data:", error);
    });
}

function displayAQIData(aqiLevel) {
  let aqiDescription = '';
  switch(aqiLevel) {
    case 1: aqiDescription = 'Good'; break;
    case 2: aqiDescription = 'Fair'; break;
    case 3: aqiDescription = 'Moderate'; break;
    case 4: aqiDescription = 'Poor'; break;
    case 5: aqiDescription = 'Very Poor'; break;
    default: aqiDescription = 'Unknown';
  }
  document.getElementById('aqiValue').textContent = `Air Quality Index: ${aqiDescription} (${aqiLevel})`;
}

function display14DayWeatherForecast(forecastData) {
  const ctx = document.getElementById('humidityForecastChart').getContext('2d');
  const labels = forecastData.map(day => day.date);
  const temps = forecastData.map(day => day.day.maxtemp_c); // Example: Plotting max temperature

  const tempChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: labels,
          datasets: [{
              label: 'Max Temperature (°C)',
              data: temps,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
          }
      }
  });
}

function fetch14DayWeatherForecast(city) {
  const apiKey = "64d69de230ba4cf5aa1123531241202";
  const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=14&aqi=no&alerts=no`;
  
  axios.get(url)
  .then(response => {
      display14DayWeatherForecast(response.data.forecast.forecastday);
  })
  .catch(error => {
      console.error("Error fetching 14-day forecast data:", error);
  });
}

function plotHumidityGraph(tomorrowIoHumidityData, weatherApiHumidityData) {
  const ctx = document.getElementById('humidityChart').getContext('2d');
  const chart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: Array.from({length: 14}, (_, i) => `Day ${i+1}`), // Day 1 to Day 14
          datasets: [{
              label: 'Tomorrow.io Humidity',
              data: tomorrowIoHumidityData,
              borderColor: 'blue',
              fill: false,
          }, {
              label: 'WeatherAPI Humidity',
              data: weatherApiHumidityData,
              borderColor: 'red',
              fill: false,
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true,
                  title: {
                      display: true,
                      text: 'Humidity (%)'
                  }
              }
          }
      }
  });
}