from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np
import pandas as pd
import json
import os

app = Flask(__name__)

# Load trained model and encoder
MODEL_DIR = os.path.join(app.root_path, "model")

model = joblib.load(
    os.path.join(MODEL_DIR, "linear_regression_model.pkl")
)

encoder = joblib.load(
    os.path.join(MODEL_DIR, "car_encoder.pkl")
)
with open("brand_model_mapping.json", "r") as f:
    brand_model_mapping = json.load(f)





def validate_categorical_values(data):

    for feature in categorical_features:

        value = data.get(feature)

        if value not in encoder.categories_[
            categorical_features.index(feature)
        ]:

            return False, feature

    return True, None





# Features used by the final Model B
numerical_features = [
    "vehicle_age",
    "km_driven",
    "mileage",
    "max_power",
    "seats",
    "age_mileage"
]

categorical_features = [
    "brand",
    "model",
    "seller_type",
    "fuel_type",
    "transmission_type"
]


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/car-options")
def car_options():
    return jsonify(brand_model_mapping)

@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No input data provided."
            }), 400


        valid_categories, invalid_field = validate_categorical_values(data)

        if not valid_categories:
            return jsonify({
                "error": f"Invalid value for {invalid_field}."
            }), 400
        
        # Required fields
        required_fields = [
            "brand",
            "model",
            "vehicle_age",
            "km_driven",
            "seller_type",
            "fuel_type",
            "transmission_type",
            "mileage",
            "max_power",
            "seats"
        ]

        # Check missing fields
        missing_fields = [
            field for field in required_fields
            if field not in data
        ]

        if missing_fields:
            return jsonify({
                "error": "Missing required fields.",
                "fields": missing_fields
            }), 400

        # Convert numerical inputs
        vehicle_age = float(data["vehicle_age"])
        km_driven = float(data["km_driven"])
        mileage = float(data["mileage"])
        max_power = float(data["max_power"])
        seats = float(data["seats"])

        # Basic validation
        VALIDATION_RANGES = {
            "vehicle_age": (0, 29),
            "km_driven": (100, 3_800_000),
            "mileage": (4.0, 33.54),
            "max_power": (38.4, 626.0),
            "seats": (2, 9)
        }


        # Validate numerical features against training-data ranges
        numerical_values = {
            "vehicle_age": vehicle_age,
            "km_driven": km_driven,
            "mileage": mileage,
            "max_power": max_power,
            "seats": seats
        }

        for feature, value in numerical_values.items():

            minimum, maximum = VALIDATION_RANGES[feature]

            if not minimum <= value <= maximum:

                return jsonify({
                    "error": "Input is outside the supported training range.",
                    "field": feature,
                    "minimum": minimum,
                    "maximum": maximum
                }), 400

        # Create feature dictionary
        input_data = {
            "brand": data["brand"],
            "model": data["model"],
            "seller_type": data["seller_type"],
            "fuel_type": data["fuel_type"],
            "transmission_type": data["transmission_type"],
            "vehicle_age": vehicle_age,
            "km_driven": km_driven,
            "mileage": mileage,
            "max_power": max_power,
            "seats": seats
        }

        # Feature engineering
        input_data["age_mileage"] = vehicle_age * km_driven

        # Convert to DataFrame
        input_df = pd.DataFrame([input_data])

        # Encode categorical features
        encoded_data = encoder.transform(
            input_df[categorical_features]
        )

        # Numerical features
        numerical_data = input_df[numerical_features].values

        # Combine numerical + categorical features
        final_features = np.hstack([
            numerical_data,
            encoded_data
        ])

        # Predict log(price)
        log_prediction = model.predict(final_features)[0]

        # Convert back to original price
        predicted_price = np.expm1(log_prediction)

        return jsonify({
            "predicted_price": round(float(predicted_price), 2)
        })

    except ValueError:
        return jsonify({
            "error": "Invalid numerical input."
        }), 400

    except Exception as e:
        return jsonify({
            "error": "Prediction failed.",
            "details": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)