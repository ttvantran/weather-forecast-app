console.log("hello main.js");

// API Configuration
const API_KEY = "09f372b1be5c40f1a3903958261702"; // Your API key

// DOM Elements
const citySelect = document.getElementById('city-select');
const getForecastBtn = document.getElementById('get-forecast-btn');
const weatherPlaceholder = document.getElementById('weather-info-placeholder');

// Event listener for button click
getForecastBtn.addEventListener('click', handleForecastRequest);

// Generate dynamic forecast API URL (using forecast endpoint, not current)
function generateWeatherApiUrl(city, apiKey) {
    // Using forecast.json endpoint with 3 days forecast
    return `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=no&alerts=no`;
}

// Main function to handle forecast request
async function handleForecastRequest() {
    const selectedCity = citySelect.value;
    
    // Validate city selection
    if (!selectedCity) {
        weatherPlaceholder.innerHTML = '<p class="placeholder-text" style="color: #e74c3c;">⚠️ Please select a city first!</p>';
        return;
    }

    // Show loading state
    weatherPlaceholder.innerHTML = '<p class="placeholder-text">Loading weather data... ⏳</p>';

    try {
        // Generate URL and fetch data
        const url = generateWeatherApiUrl(selectedCity, API_KEY);
        await getWeatherDetails(url);
    } catch (error) {
        weatherPlaceholder.innerHTML = '<p class="placeholder-text" style="color: #e74c3c;">❌ Failed to load weather data. Please try again.</p>';
        console.error('Error:', error);
    }
}

// Function to get weather details from the forecast API
async function getWeatherDetails(url) {
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('API request failed');
    }
    
    const jsonResponse = await response.json();

    // Extract values from API response
    const { name, country } = jsonResponse.location;
    const { temp_c, condition, humidity, wind_kph, feelslike_c, uv } = jsonResponse.current;
    const { icon, text } = condition;
    const forecastDays = jsonResponse.forecast.forecastday;

    // Display weather information
    displayWeatherInfo(name, country, temp_c, icon, text, humidity, wind_kph, feelslike_c, uv, forecastDays);
}

// Display complete weather information (current + forecast)
function displayWeatherInfo(name, country, temp_c, icon, text, humidity, wind_kph, feelslike_c, uv, forecastDays) {
    // Build current weather HTML
    let htmlContent = `
        <div class="current-weather">
            <h2>Current Weather</h2>
            <div class="location-info">📍 ${name}, ${country}</div>
            
            <div class="weather-main">
                <div class="weather-icon">
                    <img src="https:${icon}" alt="${text}">
                </div>
                <div class="weather-temp">
                    <div class="temp-large">${Math.round(temp_c)}°C</div>
                    <div class="condition-text">${text}</div>
                </div>
            </div>

            <div class="weather-details">
                <div class="detail-item">
                    <div class="detail-label">Feels Like</div>
                    <div class="detail-value">${Math.round(feelslike_c)}°C</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Humidity</div>
                    <div class="detail-value">${humidity}%</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Wind</div>
                    <div class="detail-value">${wind_kph} km/h</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">UV Index</div>
                    <div class="detail-value">${uv}</div>
                </div>
            </div>
        </div>
    `;

    // Build forecast section header
    htmlContent += `
        <div class="forecast-section">
            <h3>3-Day Forecast</h3>
            <div class="forecast-cards">
    `;

    // Loop through forecast days and create cards
    forecastDays.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        
        htmlContent += `
            <article class="forecast-card">
                <div class="forecast-date">${dayName}</div>
                <div class="weather-icon">
                    <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                </div>
                <div class="forecast-temps">
                    ${Math.round(day.day.maxtemp_c)}° / ${Math.round(day.day.mintemp_c)}°
                </div>
                <div class="forecast-condition">${day.day.condition.text}</div>
            </article>
        `;
    });

    // Close forecast section
    htmlContent += `
            </div>
        </div>
    `;

    // Update the placeholder with complete HTML
    weatherPlaceholder.innerHTML = htmlContent;
}
