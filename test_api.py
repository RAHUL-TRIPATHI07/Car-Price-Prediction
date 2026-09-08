import requests

data = {
    "brand": "Maruti",
    "model": "Swift",
    "vehicle_age": 5,
    "km_driven": 50000,
    "seller_type": "Individual",
    "fuel_type": "Petrol",
    "transmission_type": "Manual",
    "mileage": 20.4,
    "max_power": 82.0,
    "seats": 5
}

response = requests.post(
    "http://127.0.0.1:5000/predict",
    json=data
)

print(response.status_code)
print(response.json())