const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const weatherCondition = document.getElementById("weatherCondition");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const visibility = document.getElementById("visibility");
const pressure = document.getElementById("pressure");
const description = document.getElementById("description");
const dateElement = document.getElementById("date");


// WEATHER CONDITION FUNCTION
function getWeatherInfo(code, isDay) {

    const weatherTypes = {
        0: ["Clear Sky", isDay ? "☀️" : "🌙"],
        1: ["Mainly Clear", "🌤️"],
        2: ["Partly Cloudy", "🌤️"],
        3: ["Overcast", "☁️"],
        45: ["Foggy", "🌫️"],
        48: ["Foggy", "🌫️"],
        51: ["Light Drizzle", "🌦️"],
        53: ["Drizzle", "🌦️"],
        55: ["Heavy Drizzle", "🌧️"],
        61: ["Light Rain", "🌧️"],
        63: ["Rain", "🌧️"],
        65: ["Heavy Rain", "🌧️"],
        71: ["Light Snow", "🌨️"],
        73: ["Snow", "🌨️"],
        75: ["Heavy Snow", "❄️"],
        80: ["Rain Showers", "🌦️"],
        81: ["Rain Showers", "🌧️"],
        82: ["Heavy Rain Showers", "⛈️"],
        95: ["Thunderstorm", "⛈️"],
        96: ["Thunderstorm", "⛈️"],
        99: ["Heavy Thunderstorm", "⛈️"]
    };

    return weatherTypes[code] || ["Unknown Weather", "🌡️"];
}


// SEARCH FOR A CITY
async function getWeather(city) {

    if (city.trim() === "") {
        alert("Please enter a city name");
        return;
    }

    try {

        searchBtn.textContent = "Loading...";
        searchBtn.disabled = true;

        // GET CITY COORDINATES
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error("Unable to search for city");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Try another name.");
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // GET WEATHER DATA
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,surface_pressure,visibility&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
        );

        if (!weatherResponse.ok) {
            throw new Error("Unable to get weather data");
        }

        const data = await weatherResponse.json();

        // UPDATE CURRENT WEATHER
        const current = data.current;

        const weather = getWeatherInfo(
            current.weather_code,
            current.is_day
        );

        cityName.textContent =
            `${location.name}, ${location.country}`;

        temperature.textContent =
            `${Math.round(current.temperature_2m)}°`;

        weatherCondition.textContent = weather[0];

        feelsLike.textContent =
            `${Math.round(current.apparent_temperature)}°`;

        humidity.textContent =
            `${current.relative_humidity_2m}%`;

        windSpeed.textContent =
            `${current.wind_speed_10m} km/h`;

        visibility.textContent =
            `${(current.visibility / 1000).toFixed(1)} km`;

        pressure.textContent =
            `${Math.round(current.surface_pressure)} hPa`;

        description.textContent =
            `Currently experiencing ${weather[0].toLowerCase()} in ${location.name}.`;

        document.querySelector(".weather-icon span").textContent =
            weather[1];

        // UPDATE DATE
        dateElement.textContent = new Date(
            current.time
        ).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
        });

        // UPDATE HOURLY FORECAST
        const hourlyContainer =
            document.querySelector(".hourly-forecast");

        const currentHourIndex = data.hourly.time.findIndex(
            time => time >= current.time
        );

        hourlyContainer.innerHTML = "";

        for (
            let i = currentHourIndex;
            i < currentHourIndex + 5 &&
            i < data.hourly.time.length;
            i++
        ) {

            const hour = new Date(data.hourly.time[i]);

            const hourLabel = i === currentHourIndex
                ? "Now"
                : hour.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    hour12: true
                });

            const hourlyWeather = getWeatherInfo(
                data.hourly.weather_code[i],
                1
            );

            hourlyContainer.innerHTML += `
                <div class="forecast-card">
                    <p>${hourLabel}</p>
                    <span>${hourlyWeather[1]}</span>
                    <h4>${Math.round(data.hourly.temperature_2m[i])}°</h4>
                </div>
            `;
        }

        // UPDATE 5-DAY FORECAST
        const dailyContainer =
            document.querySelector(".daily-forecast");

        dailyContainer.innerHTML = "";

        for (let i = 0; i < data.daily.time.length; i++) {

            const day = new Date(data.daily.time[i] + "T12:00:00");

            const dayName = day.toLocaleDateString("en-US", {
                weekday: "long"
            });

            const dailyWeather = getWeatherInfo(
                data.daily.weather_code[i],
                1
            );

            dailyContainer.innerHTML += `
                <div class="daily-card">
                    <p>${dayName}</p>
                    <span>${dailyWeather[1]}</span>
                    <h4>
                        ${Math.round(data.daily.temperature_2m_max[i])}° /
                        ${Math.round(data.daily.temperature_2m_min[i])}°
                    </h4>
                </div>
            `;
        }

    } catch (error) {

        alert(error.message);
        console.log(error);

    } finally {

        searchBtn.textContent = "Search";
        searchBtn.disabled = false;

    }
}


// SEARCH BUTTON CLICK
searchBtn.addEventListener("click", () => {
    getWeather(cityInput.value);
});


// PRESS ENTER TO SEARCH
cityInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        getWeather(cityInput.value);
    }

});


// LOAD DEFAULT CITY
getWeather("Jos");









// SELECT THEME BUTTON
const themeToggle = document.getElementById("themeToggle");

// SELECT BODY
const body = document.body;

// LOAD SAVED THEME
const savedTheme = localStorage.getItem("weatherTheme");

// APPLY SAVED THEME
if (savedTheme === "light") {
    body.classList.add("light-theme");
}

// UPDATE BUTTON
function updateTheme() {

    if (body.classList.contains("light-theme")) {

        themeToggle.innerHTML = `
            <i class="bi bi-sun-fill"></i>
            
        `;

    } else {

        themeToggle.innerHTML = `
            <i class="bi bi-moon-stars-fill"></i>
            
        `;

    }
}

// INITIAL THEME
updateTheme();

// CHANGE THEME
themeToggle.addEventListener("click", () => {

    body.classList.toggle("light-theme");

    if (body.classList.contains("light-theme")) {

        localStorage.setItem("weatherTheme", "light");

    } else {

        localStorage.setItem("weatherTheme", "dark");

    }

    updateTheme();

});