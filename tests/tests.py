from fastapi.testclient import TestClient

from src.app import app

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Прогноз погоды" in response.text


def test_get_weather_api():
    response = client.post("/weather", json={"city": "Москва"})
    assert response.status_code == 200
    assert "city" in response.json()
    assert "current" in response.json()
    assert "hourly" in response.json()


def test_invalid_city():
    response = client.post("/weather", json={"city": ""})
    assert response.status_code == 400
    assert response.json() == {"detail": "Не заполнен город"}
