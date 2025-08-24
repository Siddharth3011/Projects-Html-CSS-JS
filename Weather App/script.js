const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const travelTipsBox = document.getElementById("travelTipsBox");
const suggestionsBox = document.getElementById("suggestions");

let debounceTimeout;

// 🌤️ Fetch Weather Data
weatherForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    getWeatherData(city);
  }
});

async function getWeatherData(city) {
  try {
    const response = await fetch(
      `/.netlify/functions/getWeather?city=${encodeURIComponent(city + ",IN")}`
    );
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    displayWeatherData(data);
  } catch (error) {
    document.getElementById("cityTitle").innerText = "Error: " + error.message;
    clearFields();
  }
}

function displayWeatherData(data) {
  const city = data.name;
  const temp = data.main.temp;
  const feelsLike = data.main.feels_like;
  const min = data.main.temp_min;
  const max = data.main.temp_max;
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;
  const windDeg = data.wind.deg;
  const pressure = data.main.pressure;
  const visibility = data.visibility / 1000;
  const weatherDesc = data.weather[0].description;
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString("en-IN");
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString("en-IN");

  document.getElementById("cityTitle").innerText = `Current Weather - ${city}`;
  document.getElementById("temp").innerText = `${temp}°C`;
  document.getElementById("minmax").innerText = `Min: ${min}°C | Max: ${max}°C`;
  document.getElementById("humidity").innerText = `${humidity}%`;
  document.getElementById("feels").innerText = `Feels Like: ${feelsLike}°C | Wind Degree: ${windDeg}°`;
  document.getElementById("wind").innerText = `${windSpeed} Km/h`;
  document.getElementById("sun").innerText = `Sunrise: ${sunrise} | Sunset: ${sunset}`;
  document.getElementById("weather").innerText = weatherDesc;
  document.getElementById("pressure").innerText = `${pressure} hPa`;
  document.getElementById("visibility").innerText = `${visibility.toFixed(1)} km`;

  showTravelTips(temp, weatherDesc, city);
}

function clearFields() {
  document.getElementById("temp").innerText = "--°C";
  document.getElementById("minmax").innerText = "Min: --°C | Max: --°C";
  document.getElementById("humidity").innerText = "--%";
  document.getElementById("feels").innerText = "Feels Like: --°C | Wind Degree: --°";
  document.getElementById("wind").innerText = "-- Km/h";
  document.getElementById("sun").innerText = "Sunrise: -- | Sunset: --";
  document.getElementById("weather").innerText = "--";
  document.getElementById("pressure").innerText = "--";
  document.getElementById("visibility").innerText = "--";
}

// 🚀 Travel Tips
function showTravelTips(temp, weather, city) {
  const tips = [];
  const lowerWeather = weather.toLowerCase();

  // 🌡️ General Temperature Tips
  if (temp >= 40) tips.push("⚠️ It's extremely hot. Avoid traveling during midday and stay hydrated.");
  else if (temp >= 30) tips.push("🌞 Wear light cotton clothes and drink plenty of water.");
  else if (temp >= 20 && temp < 30) tips.push("😊 Perfect weather for sightseeing and outdoor activities.");
  else if (temp >= 10 && temp < 20) tips.push("🧥 It might get chilly. Carry a light jacket.");
  else if (temp < 10) tips.push("❄️ It's cold. Wear warm clothes and avoid early morning or late-night travel.");

  // 🌦️ General Weather Tips
  if (lowerWeather.includes("rain")) tips.push("☔ It's raining. Don't forget your umbrella or raincoat.");
  else if (lowerWeather.includes("clear")) tips.push("😎 Sunny and clear. Use sunscreen and stay hydrated.");
  else if (lowerWeather.includes("cloud")) tips.push("🌥️ Cloudy weather. Good for long walks and less sunburn risk.");
  else if (lowerWeather.includes("snow")) tips.push("❄️ Snowy conditions. Drive safely and wear insulated boots.");
  else if (lowerWeather.includes("storm") || lowerWeather.includes("thunder")) tips.push("⚡ Storm expected. Avoid travel if possible and stay indoors.");

  // 🏞️ Region-specific Tips
  const citySpecific = getCitySpecificTips(city, weather, temp);

  travelTipsBox.classList.remove("d-none");
  travelTipsBox.innerHTML = `
    <h5>🚀 Travel Tips:</h5>
    <ul>
      ${[...tips, ...citySpecific].map(tip => `<li>${tip}</li>`).join("")}
    </ul>
  `;
}

function getCitySpecificTips(city, weather, temp) {
  const cityTips = [];
  const lowerWeather = weather.toLowerCase();
  const cityLower = city.toLowerCase();

  if (cityLower === "ladakh") {
    cityTips.push("🏔️ Altitude is high — stay hydrated and avoid overexertion.");
    if (temp < 15) cityTips.push("🧤 Pack thermal wear and gloves for cold mornings and nights.");
  } else if (cityLower === "goa") {
    cityTips.push("🏖️ Perfect for beach holidays! Carry sunscreen and swimwear.");
    if (lowerWeather.includes("rain")) cityTips.push("🌧️ It may be humid or rainy — pack a waterproof bag.");
  } else if (cityLower === "delhi") {
    if (temp > 38) cityTips.push("🔥 Avoid outdoor travel during peak afternoon in Delhi’s summer.");
    else if (temp < 10) cityTips.push("🧣 Wear layers — Delhi winters can be bone-chilling at night.");
  } else if (cityLower === "mumbai") {
    cityTips.push("🌊 Coastal city — humidity is high, dress light.");
    if (lowerWeather.includes("rain")) cityTips.push("🌧️ Heavy monsoons possible — use waterproof shoes.");
  } else if (cityLower === "kolkata") {
    if (temp > 32) cityTips.push("💦 Kolkata can get sticky hot — use wet wipes and stay cool.");
  } else if (cityLower === "jaipur") {
    cityTips.push("🏜️ Carry a hat and water — Jaipur sun can be intense.");
  }

  return cityTips;
}

// 🔍 City Suggestions with Debounce
cityInput.addEventListener("input", () => {
  clearTimeout(debounceTimeout);
  const query = cityInput.value.trim();

  if (!query) {
    suggestionsBox.innerHTML = "";
    return;
  }

  debounceTimeout = setTimeout(() => {
    fetchCitySuggestions(query);
  }, 300); // delay to prevent too many requests
});

async function fetchCitySuggestions(query) {
  try {
    const response = await fetch(
      `/.netlify/functions/getCities?query=${encodeURIComponent(query)}`
    );
    const cities = await response.json();

    suggestionsBox.innerHTML = "";

    cities.forEach(city => {
      const li = document.createElement("li");
      li.classList.add("list-group-item", "list-group-item-action");
      li.textContent = `${city.name}, ${city.state || ""} ${city.country}`;
      li.addEventListener("click", () => {
        cityInput.value = city.name;
        suggestionsBox.innerHTML = "";
      });
      suggestionsBox.appendChild(li);
    });

    if (cities.length === 0) {
      suggestionsBox.innerHTML = "<li class='list-group-item text-muted'>No results found</li>";
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    suggestionsBox.innerHTML = "<li class='list-group-item text-danger'>Error fetching data</li>";
  }
}

document.addEventListener("click", (e) => {
  if (!cityInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
    suggestionsBox.innerHTML = "";
  }
});
