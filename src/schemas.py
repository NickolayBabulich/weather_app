from pydantic import BaseModel


class WeatherRequest(BaseModel):
    city: str
