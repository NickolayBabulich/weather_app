let temperatureChart = null;
let selectedCity = '';
let lastSearchedCity = '';
const maxHistoryLength = 10;

async function getWeather(city) {
    if (!city) {
        city = selectedCity || document.getElementById('city-input').value;
    }
    const response = await fetch('/weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({city: city}),
    });
    const data = await response.json();
    if (data.error) {
        displayError(data.error);
    } else {
        data.city = selectedCity || data.city;
        displayWeather(data);
        updatePreviousCity(lastSearchedCity);
        lastSearchedCity = data.city;
        saveToLocalStorage(data.city);
        addCityToHistory(data.city);
        displayCityHistory();
    }
    document.getElementById('city-input').value = '';
    selectedCity = '';
}

function displayWeather(data) {
    const weatherDiv = document.getElementById('weather-data');
    weatherDiv.innerHTML = `
                <h5 class="mb-3">Текущая погода в городе ${data.city}</h5>
                <ul class="list-group list-group-flush">
                <li class="list-group-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-thermometer-sun ms-1 me-1" viewBox="0 0 16 16">
                  <path d="M5 12.5a1.5 1.5 0 1 1-2-1.415V2.5a.5.5 0 0 1 1 0v8.585A1.5 1.5 0 0 1 5 12.5"/>
                  <path d="M1 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0zM3.5 1A1.5 1.5 0 0 0 2 2.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0L5 10.486V2.5A1.5 1.5 0 0 0 3.5 1m5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5m4.243 1.757a.5.5 0 0 1 0 .707l-.707.708a.5.5 0 1 1-.708-.708l.708-.707a.5.5 0 0 1 .707 0M8 5.5a.5.5 0 0 1 .5-.5 3 3 0 1 1 0 6 .5.5 0 0 1 0-1 2 2 0 0 0 0-4 .5.5 0 0 1-.5-.5M12.5 8a.5.5 0 0 1 .5-.5h1a.5.5 0 1 1 0 1h-1a.5.5 0 0 1-.5-.5m-1.172 2.828a.5.5 0 0 1 .708 0l.707.708a.5.5 0 0 1-.707.707l-.708-.707a.5.5 0 0 1 0-.708M8.5 12a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5"/>
                </svg>
                Температура: ${data.current.temperature}°C</li>
                <li class="list-group-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-patch-exclamation-fill me-2" viewBox="0 0 16 16">
                  <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                </svg>
                По ощущению: ${data.current.feels_like}°C</li>
                <li class="list-group-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-droplet-half me-2" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M7.21.8C7.69.295 8 0 8 0q.164.544.371 1.038c.812 1.946 2.073 3.35 3.197 4.6C12.878 7.096 14 8.345 14 10a6 6 0 0 1-12 0C2 6.668 5.58 2.517 7.21.8m.413 1.021A31 31 0 0 0 5.794 3.99c-.726.95-1.436 2.008-1.96 3.07C3.304 8.133 3 9.138 3 10c0 0 2.5 1.5 5 .5s5-.5 5-.5c0-1.201-.796-2.157-2.181-3.7l-.03-.032C9.75 5.11 8.5 3.72 7.623 1.82z"/>
                  <path fill-rule="evenodd" d="M4.553 7.776c.82-1.641 1.717-2.753 2.093-3.13l.708.708c-.29.29-1.128 1.311-1.907 2.87z"/>
                </svg>
                Влажность: ${data.current.humidity}%</li>
                <li class="list-group-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-umbrella me-2" viewBox="0 0 16 16">
                  <path d="M8 0a.5.5 0 0 1 .5.5v.514C12.625 1.238 16 4.22 16 8c0 0 0 .5-.5.5-.149 0-.352-.145-.352-.145l-.004-.004-.025-.023a3.5 3.5 0 0 0-.555-.394A3.17 3.17 0 0 0 13 7.5c-.638 0-1.178.213-1.564.434a3.5 3.5 0 0 0-.555.394l-.025.023-.003.003s-.204.146-.353.146-.352-.145-.352-.145l-.004-.004-.025-.023a3.5 3.5 0 0 0-.555-.394 3.3 3.3 0 0 0-1.064-.39V13.5H8h.5v.039l-.005.083a3 3 0 0 1-.298 1.102 2.26 2.26 0 0 1-.763.88C7.06 15.851 6.587 16 6 16s-1.061-.148-1.434-.396a2.26 2.26 0 0 1-.763-.88 3 3 0 0 1-.302-1.185v-.025l-.001-.009v-.003s0-.002.5-.002h-.5V13a.5.5 0 0 1 1 0v.506l.003.044a2 2 0 0 0 .195.726c.095.191.23.367.423.495.19.127.466.229.879.229s.689-.102.879-.229c.193-.128.328-.304.424-.495a2 2 0 0 0 .197-.77V7.544a3.3 3.3 0 0 0-1.064.39 3.5 3.5 0 0 0-.58.417l-.004.004S5.65 8.5 5.5 8.5s-.352-.145-.352-.145l-.004-.004a3.5 3.5 0 0 0-.58-.417A3.17 3.17 0 0 0 3 7.5c-.638 0-1.177.213-1.564.434a3.5 3.5 0 0 0-.58.417l-.004.004S.65 8.5.5 8.5C0 8.5 0 8 0 8c0-3.78 3.375-6.762 7.5-6.986V.5A.5.5 0 0 1 8 0M6.577 2.123c-2.833.5-4.99 2.458-5.474 4.854A4.1 4.1 0 0 1 3 6.5c.806 0 1.48.25 1.962.511a9.7 9.7 0 0 1 .344-2.358c.242-.868.64-1.765 1.271-2.53m-.615 4.93A4.16 4.16 0 0 1 8 6.5a4.16 4.16 0 0 1 2.038.553 8.7 8.7 0 0 0-.307-2.13C9.434 3.858 8.898 2.83 8 2.117c-.898.712-1.434 1.74-1.731 2.804a8.7 8.7 0 0 0-.307 2.131zm3.46-4.93c.631.765 1.03 1.662 1.272 2.53.233.833.328 1.66.344 2.358A4.14 4.14 0 0 1 13 6.5c.77 0 1.42.23 1.897.477-.484-2.396-2.641-4.355-5.474-4.854z"/>
                </svg>
                Осадки: ${data.current.precipitation} мм</li>
                <li class="list-group-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-wind me-2" viewBox="0 0 16 16">
                  <path d="M12.5 2A2.5 2.5 0 0 0 10 4.5a.5.5 0 0 1-1 0A3.5 3.5 0 1 1 12.5 8H.5a.5.5 0 0 1 0-1h12a2.5 2.5 0 0 0 0-5m-7 1a1 1 0 0 0-1 1 .5.5 0 0 1-1 0 2 2 0 1 1 2 2h-5a.5.5 0 0 1 0-1h5a1 1 0 0 0 0-2M0 9.5A.5.5 0 0 1 .5 9h10.042a3 3 0 1 1-3 3 .5.5 0 0 1 1 0 2 2 0 1 0 2-2H.5a.5.5 0 0 1-.5-.5"/>
                </svg>
                Скорость ветра: ${data.current.wind_speed} м/с</li>
                </ul>
            `;
    updateTemperatureChart(data);
}

function displayError(error) {
    const weatherDiv = document.getElementById('weather-data');
    weatherDiv.innerHTML = `<p class="error">${error}</p>`;
    // Clear the chart
    if (temperatureChart) {
        temperatureChart.destroy();
        temperatureChart = null;
    }
}

function updateTemperatureChart(data) {
    const labels = data.hourly.map(item => item.time.slice(11, 16));
    const temperatures = data.hourly.map(item => item.temperature);
    const ctx = document.getElementById('temperature-chart').getContext('2d');

    if (temperatureChart) {
        temperatureChart.destroy();
    }

    const colors = temperatures.map(temp => getColorForTemperature(temp));

    temperatureChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Температура (°C)',
                data: temperatures,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1,
                color: 'rgb(255, 255, 255)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Температура (°C)',
                        color: 'rgb(255, 255, 255)'
                    },
                    grid: {
                        color: 'rgb(74,77,91)'
                    },
                    ticks: {
                        color: 'rgb(255, 255, 255)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Время',
                        color: 'rgb(255, 255, 255)'
                    },
                    grid: {
                        color: 'rgb(74,77,91)'
                    },
                    ticks: {
                        color: 'rgb(255, 255, 255)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Прогноз температуры по каждому часу:',
                    font: {
                        size: 18
                    },
                    color: 'rgb(255, 255, 255)'
                },
                legend: {
                    display: false
                }
            }
        }
    });
}

function getColorForTemperature(temperature) {
    if (temperature <= 0) return 'rgb(0, 0, 255)';
    if (temperature <= 10) return 'rgb(0, 255, 255)';
    if (temperature <= 20) return 'rgb(0, 255, 0)';
    if (temperature <= 30) return 'rgb(255, 255, 0)';
    return 'rgb(255, 0, 0)';
}

function saveToLocalStorage(city) {
    localStorage.setItem('lastCity', city);
}

function updatePreviousCity(city) {
    if (city) {
        document.getElementById('previous-city').innerHTML =
            `<div class="alert alert-light d-flex align-items-center" role="alert">
                Ранее вы смотрели погоду в городе: ${city},
            <button class="btn btn-link" onclick="getWeather('${city}')">хотите повторить запрос?</button>
            </div>`;
    }
}

window.onload = function () {
    lastSearchedCity = localStorage.getItem('lastCity');
    if (lastSearchedCity) {
        updatePreviousCity(lastSearchedCity);
    }
    displayCityHistory();
}

$(function () {
    $("#city-input").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "https://geocoding-api.open-meteo.com/v1/search",
                dataType: "json",
                data: {
                    name: request.term,
                    count: 1,
                    language: "ru",
                    format: "json"
                },
                success: function (data) {
                    if (data.results) {
                        response($.map(data.results, function (item) {
                            return {
                                label: item.name + ", " + item.country,
                                value: item.name,
                                fullName: item.name + ", " + item.country
                            }
                        }));
                    } else {
                        response([{label: "Нет подходящего города", value: ""}]);
                    }
                }
            });
        },
        minLength: 3,
        select: function (event, ui) {
            if (ui.item.value) {
                selectedCity = ui.item.fullName;
                getWeather();
            }
        }
    });
});

function addCityToHistory(city) {
    let cityHistory = JSON.parse(localStorage.getItem('cityHistory')) || [];
    if (!cityHistory.includes(city)) {
        if (cityHistory.length >= maxHistoryLength) {
            cityHistory.shift();
        }
        cityHistory.push(city);
    }
    localStorage.setItem('cityHistory', JSON.stringify(cityHistory));
}

function displayCityHistory() {
    let cityHistory = JSON.parse(localStorage.getItem('cityHistory')) || [];
    const historyContainer = document.getElementById('city-history');

    if (cityHistory.length === 0) {
        historyContainer.innerHTML = ''; // Clear the container if there are no cities
    } else {
        historyContainer.innerHTML = '<h5>История запросов:</h5><ul class="list-group list-group-flush">';
        cityHistory.reverse().forEach(city => {
            historyContainer.innerHTML += `<li class="list-group-item">
                <button class="btn btn-link" onclick="getWeather('${city}')">${city}</button>
            </li>`;
        });
        historyContainer.innerHTML += '</ul>';
        cityHistory.reverse();
    }
}
