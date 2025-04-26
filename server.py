import requests
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# OpenWeather API Key
API_KEY = '9064c78348e84c3ee7c637affb5a7917'

class BarangayData(BaseModel):
    name: str
    lat: float
    lng: float

@app.post("/predict")
def predict(data: BarangayData):
    url = f'http://api.openweathermap.org/data/2.5/weather?lat={data.lat}&lon={data.lng}&appid={API_KEY}&units=metric'
    response = requests.get(url)
    
    if response.status_code == 200:
        weather_data = response.json()
        temperature = weather_data['main']['temp']  # Get temperature in Celsius
        return {
            "barangay": data.name,
            "temperature": round(temperature, 2)
        }
    else:
        return {"error": "Unable to retrieve weather data"}
