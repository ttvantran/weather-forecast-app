console.log("Weather Forecast App Initialized");

// API Configuration
const API_KEY = "09f372b1be5c40f1a3903958261702";

// DOM Elements
const city_select = document.getElementById("city-select");
const get_btn = document.getElementById("get-forecast-btn");
const weather_placeholder = document.getElementById("weather-info-placeholder");
const status_message = document.getElementById("status-message");

// Generate forecast API URL (forecast endpoint)
function generate_weather_api_url(city, api_key) {
  const encoded_city = encodeURIComponent(city);
  return `https://api.weatherapi.com/v1/forecast.json?key=${api_key}&q=${encoded_city}&days=3&aqi=no&alerts=no`;
}

// Handle click
get_btn.addEventListener("click", async () => {
  const selected_city = city_select.value.trim();

  if (!selected_city) {
    status_message.textContent = "⚠️ Please select a city first.";
    weather_placeholder.innerHTML = `<p class="message error">⚠️ Please select a city above.</p>`;
    return;
  }

  status_message.textContent = "Loading weather data... ⏳";
  weather_placeholder.innerHTML = `<p class="message loading">Loading weather data... ⏳</p>`;

  try {
    const url = generate_weather_api_url(selected_city, API_KEY);
    const data = await get_weather_details(url);
    display_weather_info(data);
    status_message.textContent = "✅ Weather updated.";
  } catch (error) {
    console.error(error);
    status_message.textContent = "❌ Failed to load weather data.";
    weather_placeholder.innerHTML = `<p class="message error">❌ Failed to load weather data. Please try again.</p>`;
  }
});

// Fetch data
async function get_weather_details(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`request failed (${response.status})`);
  }

  const json = await response.json();

  if (json.error) {
    throw new Error(json.error.message);
  }

  return json;
}

// Render UI (Fix B: current left, forecast right with horizontal scroll)
function display_weather_info(json) {
  const { name, country, localtime } = json.location;

  const current = json.current;
  const { temp_c, condition, humidity, wind_kph, feelslike_c, uv, pressure_mb, vis_km, wind_dir } = current;

  const icon_url = condition.icon.startsWith("//") ? `https:${condition.icon}` : `https:${condition.icon}`;
  const forecast_days = json.forecast.forecastday;

  let html = `
    <div class="weather-layout">
      <div class="current-weather">
        <h2>Current Weather</h2>
        <div class="location-info">📍 ${name}, ${country}</div>
        <div class="localtime">Local time: ${localtime}</div>

        <div class="weather-main">
          <div class="weather-icon">
            <img src="${icon_url}" alt="${condition.text}">
          </div>

          <div class="weather-temp">
            <div class="temp-large">${Math.round(temp_c)}°C</div>
            <div class="condition-text">${condition.text}</div>
          </div>
        </div>

        <div class="weather-details">
          <div class="detail-item">
            <div class="detail-label">Feels like</div>
            <div class="detail-value">${Math.round(feelslike_c)}°C</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Humidity</div>
            <div class="detail-value">${humidity}%</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Wind</div>
            <div class="detail-value">${wind_kph} kph ${wind_dir}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">UV Index</div>
            <div class="detail-value">${uv}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Pressure</div>
            <div class="detail-value">${pressure_mb} mb</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Visibility</div>
            <div class="detail-value">${vis_km} km</div>
          </div>
        </div>
      </div>

      <aside class="forecast-panel">
        <h3>📅 3-Day Forecast</h3>
        <div class="forecast-cards">
  `;

  forecast_days.forEach((day) => {
    const date = new Date(day.date);
    const day_name = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    const day_icon = day.day.condition.icon.startsWith("//")
      ? `https:${day.day.condition.icon}`
      : `https:${day.day.condition.icon}`;

    html += `
      <article class="forecast-card">
        <div class="forecast-date">${day_name}</div>
        <div class="weather-icon">
          <img src="${day_icon}" alt="${day.day.condition.text}">
        </div>
        <div class="forecast-temps">
          <span class="max-temp">${Math.round(day.day.maxtemp_c)}°</span> /
          <span class="min-temp">${Math.round(day.day.mintemp_c)}°</span>
        </div>
        <div class="forecast-condition">${day.day.condition.text}</div>
      </article>
    `;
  });

  html += `
        </div>
      </aside>
    </div>
  `;

  weather_placeholder.innerHTML = html;
}