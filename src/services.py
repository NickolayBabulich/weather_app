import json
from typing import Any, Dict

import httpx
from fastapi import HTTPException


async def get_city(city: str) -> Dict[str, Any]:
    if not city:
        raise HTTPException(status_code=400, detail="Не заполнен город")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=ru&format=json")
        response.raise_for_status()
        geocoding = response.json()

    if not geocoding.get('results'):
        raise HTTPException(status_code=404, detail="Город не найден")

    return geocoding


async def get_weather(city: str) -> Dict[str, Any]:
    try:
        current_city = await get_city(city)
        lat = current_city['results'][0]['latitude']
        lon = current_city['results'][0]['longitude']

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,"
                f"relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&hourly=temperature_2m,"
                f"precipitation_probability,wind_speed_10m&&timezone=auto")
            response.raise_for_status()
            weather_response = response.json()

        current_weather = weather_response['current']
        hourly_weather = weather_response['hourly']

        weather_data = {
            'city': city,
            'current': {
                'temperature': current_weather['temperature_2m'],
                'humidity': current_weather['relative_humidity_2m'],
                'feels_like': current_weather['apparent_temperature'],
                'precipitation': current_weather['precipitation'],
                'wind_speed': int(current_weather['wind_speed_10m'] * 5 / 18),
            },
            'hourly': [
                {
                    'time': hourly_weather['time'][i],
                    'temperature': hourly_weather['temperature_2m'][i],
                }
                for i in range(24)
            ]
        }
        formated_city = city.split(",")
        city_counter(formated_city[0])
        return weather_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Произошла ошибка: {str(e)}") from e


def load_history():
    try:
        with open("history.json", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def save_history(history):
    with open("history.json", "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=4)


def city_counter(city: str):
    history = load_history()
    history[city] = history.get(city, 0) + 1
    save_history(history)


def get_history():
    return load_history()
