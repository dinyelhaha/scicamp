from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
import numpy as np
import random

app = FastAPI()

class BarangayData(BaseModel):
    name: str
    lat: float
    lng: float

# ==== Train a Dummy ML Model on Startup ====

def generate_training_data(n=500):
    X = []
    y = []
    for _ in range(n):
        lat = random.uniform(14.55, 14.65)
        lng = random.uniform(120.95, 121.02)
        hour = random.randint(6, 18)  # daytime
        month = random.randint(1, 12)
        temp = 28 + 8 * (1 - abs(hour - 14) / 8) + random.uniform(-1.5, 1.5)  # hottest at 2 PM
        temp += (month in [3, 4, 5]) * 2  # hotter in dry season
        X.append([lat, lng, hour, month])
        y.append(round(temp, 2))
    return np.array(X), np.array(y)

X_train, y_train = generate_training_data()
model = RandomForestRegressor().fit(X_train, y_train)

# ==== Predict Endpoint ====

@app.post("/predict")
def predict(data: BarangayData):
    now = datetime.now()
    features = np.array([[data.lat, data.lng, now.hour, now.month]])
    prediction = model.predict(features)[0]
    return {
        "barangay": data.name,
        "temperature": round(prediction, 2)
    }
