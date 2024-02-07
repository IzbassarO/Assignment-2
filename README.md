# Weather App

## Overview
Weather App is a web application that provides users with current weather information, forecasts, and weather history logs. The application integrates with multiple weather service APIs such as OpenWeatherAPI, Weatherbit, and Tomorrow.io to provide comprehensive weather data.

## Features
- Real-time weather updates.
- 14-day weather forecast.
- User authentication (Login and Registration).
- Admin panel for managing users.
- Search history logs for registered users.
- Responsive design, compatible with desktop and mobile browsers.

## Technologies Used
- Node.js: Runtime environment for the backend.
- Express.js: Web application framework for Node.js.
- MongoDB: NoSQL database for storing user and search data.
- Mongoose: MongoDB object modeling for Node.js.
- EJS: Templating language to generate HTML with plain JavaScript.
- Leaflet.js: Interactive maps for displaying geographic information.
- Bootstrap: Front-end framework for developing responsive and mobile-first websites.
- Axios: Promise-based HTTP client for the browser and Node.js.
- Bcrypt: Library for hashing passwords.

## Admin 
- `/admin`: Displays admin page where displays every user's username where admin can change their username and delete the account
- `/searhlogs`: When admin opens this page, there is an unique finder of each user's data about their searched data
- admin can create a new user


## File Structure
- `models/`: Contains Mongoose schemas and models.
  - `User.js`: Schema for user data.
  - `SearchLog.js`: Schema for search history logs.
- `public/`: Static files like scripts, stylesheets, images, and fonts.
- `views/`: EJS templates for the application views.
- `index.js`: Main server file with route definitions and application logic.
- `package.json`: Lists the project dependencies and other metadata.

## Installation
1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Run `npm install` to install the dependencies.
4. Set up your environment variables for the database and API keys.
5. Run `npm start` to start the server.
6. Access the application through `localhost:3000` in your web browser.

## Usage
- Visit the main page to see the default weather information.
- Register for a new account to save search history.
- Log in to access the search history and admin panel (for admin users).
- Search for weather information by city.
- View detailed weather forecasts and historical data.

## Possible Issues
The error itself won't be present in the code, but rather it would be output to the console when you try to start your server and the port is already occupied.
- lsof -i :PORT
- kill -9 PID
- Restart the project by typing node index.js or nodemon index.js

## Configuration
- Update the MongoDB URI to point to your database.
- Set up your API keys for OpenWeatherAPI, Weatherbit, and Tomorrow.io.

## Author
Izbassar Orynbassar, a student at Astana IT University, SE-2202.
