L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);
 
L.marker([defaultCity.lat, defaultCity.lon]).addTo(map)
    .bindPopup(defaultCity.name);