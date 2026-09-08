# Used Car Price Predictor

A machine learning web application that predicts the expected listing price of a used car using Multiple Linear Regression.

The project covers the complete machine learning workflow — from data cleaning and exploratory analysis to feature engineering, model diagnostics, API development, and deployment.

## Live Demo

[Try the Used Car Price Predictor](https://car-price-prediction-u7ru.onrender.com/)

## Project Overview

Used car prices depend on multiple factors such as vehicle age, mileage, brand, model, engine characteristics, fuel type, transmission, and seller type.

The goal of this project is to build an interpretable regression model that estimates the expected selling/listing price of a used car from these characteristics.

The final model is deployed as a Flask web application.

> **Note:** The model predicts expected listing price based on the training dataset. It should not be interpreted as an exact real-world market valuation.

---

## Features

- Used car price prediction
- Multiple Linear Regression
- Log-transformed target variable
- One-hot encoding for categorical features
- Age × mileage interaction feature
- Multicollinearity analysis using VIF
- Residual and Q-Q diagnostics
- Input validation
- Dynamic brand → model selection
- Flask REST prediction endpoint
- Responsive web interface
- Cloud deployment using Gunicorn

---

## Dataset

The project uses the **Vehicle Dataset from CarDekho**.

After preprocessing:

- **15,242 records**
- **12 original features**
- No missing values
- Duplicate records removed
- Invalid zero-seat records removed

### Main Features

| Feature | Description |
|---|---|
| `brand` | Vehicle manufacturer |
| `model` | Vehicle model |
| `vehicle_age` | Age of the vehicle |
| `km_driven` | Kilometers driven |
| `seller_type` | Type of seller |
| `fuel_type` | Fuel type |
| `transmission_type` | Manual or automatic |
| `mileage` | Vehicle mileage |
| `engine` | Engine displacement |
| `max_power` | Maximum power |
| `seats` | Number of seats |
| `selling_price` | Target listing price |

---

## Machine Learning Pipeline

```text
Raw Dataset
     ↓
Data Cleaning
     ↓
Exploratory Data Analysis
     ↓
Feature Engineering
     ↓
Log Target Transformation
     ↓
Train / Test Split
     ↓
One-Hot Encoding
     ↓
Multiple Linear Regression
     ↓
VIF Analysis
     ↓
Regression Diagnostics
     ↓
Model Evaluation
     ↓
Model Serialization
     ↓
Flask API
     ↓
Web Application
     ↓
Deployment



## Data Cleaning

The following preprocessing steps were performed:

* Removed the unnecessary `Unnamed: 0` index column.
* Removed the redundant `car_name` feature because `brand + model` uniquely identifies the vehicle in this dataset.
* Removed duplicate records.
* Removed invalid records with zero seats.
* Retained legitimate high-value vehicles instead of blindly removing expensive outliers.

The final dataset contained **15,242 vehicles**.

---

## 2. Exploratory Data Analysis

The analysis examined:

* Numerical feature distributions
* Correlations between vehicle characteristics and price
* Categorical price differences
* Brand and model-level price variation
* Extreme values and potential outliers

Some important observations:

* `max_power` had a strong positive relationship with selling price.
* `engine` was also strongly related to selling price.
* Vehicle age had a negative relationship with price.
* Automatic vehicles generally had higher prices than manual vehicles.
* Brand and model had substantial influence on vehicle pricing.

---

## 3. Feature Engineering

An interaction feature was created:

```text
age_mileage = vehicle_age × km_driven
```

This represents the combined effect of vehicle age and usage.

Brand and model were retained because they contain important pricing information that cannot be captured by numerical specifications alone.

---

## 4. Target Transformation

The original selling price distribution was highly right-skewed.

```text
Original skewness        = 10.11
Log-transformed skewness = 0.57
```

Therefore, the target was transformed using:

```python
log1p(selling_price)
```

The model was trained on the transformed target.

Predictions were converted back to the original price scale using:

```python
expm1(prediction)
```

This allowed the final evaluation metrics to remain interpretable in Indian Rupees.

---

## 5. Model Development

Multiple Linear Regression was selected because the project emphasizes:

* Interpretability
* Explainable feature relationships
* A transparent mathematical model
* Understanding classical regression assumptions

The model uses:

### Numerical Features

```text
vehicle_age
km_driven
mileage
max_power
seats
age_mileage
```

### Categorical Features

```text
brand
model
seller_type
fuel_type
transmission_type
```

Categorical variables were converted using one-hot encoding.

---

## 6. Multicollinearity Analysis

Variance Inflation Factor (VIF) was used to investigate multicollinearity between numerical predictors.

The initial model showed substantial correlation between:

```text
engine ↔ max_power
```

with a correlation of approximately **0.81**.

A controlled model comparison was performed by removing `engine`.

This reduced the VIF associated with `max_power` and produced slightly better test-set performance.

The final model therefore excludes `engine`.

The interaction feature `age_mileage` naturally has a higher VIF because it is mathematically constructed from `vehicle_age` and `km_driven`. It was retained because the interaction captures a potentially useful combined effect.

---

## 7. Regression Diagnostics

The final model was examined using:

* Residual vs predicted plot
* Q-Q plot
* Residual mean
* Residual skewness

Final residual statistics:

```text
Residual mean     ≈ 0.0048
Residual skewness ≈ 0.36
```

The residuals were reasonably centered and approximately symmetric.

The Q-Q plot showed deviations in the extreme tails, which is consistent with the presence of high-value vehicles and extreme observations.

Therefore, the regression assumptions were considered reasonably satisfied, but not perfect.

---

## 8. Model Performance

The final model was evaluated on a held-out test set.

| Metric      |   Result |
| ----------- | -------: |
| MAE         | ₹115,046 |
| RMSE        | ₹445,858 |
| R²          |   0.7550 |
| Adjusted R² |   0.7414 |

### Interpretation

The model achieved an **R² of 0.755**, meaning it explains approximately **75.5% of the variation in the target on the original price scale** after converting predictions back from the logarithmic scale.

The MAE of approximately **₹1.15 lakh** means that the average absolute prediction error is around ₹1.15 lakh.

RMSE is considerably higher than MAE because large errors from expensive vehicles have a stronger effect on RMSE.

---

## 9. Web Application

The trained model was integrated into a Flask web application.

Users can provide:

* Brand
* Model
* Vehicle age
* Kilometers driven
* Mileage
* Maximum power
* Seats
* Fuel type
* Transmission
* Seller type

The application then processes the input through the following pipeline:

```text
User Input
    ↓
Input Validation
    ↓
Feature Engineering
    ↓
One-Hot Encoding
    ↓
Model Prediction
    ↓
Inverse Log Transformation
    ↓
Predicted Price
```

The model and encoder are stored as serialized artifacts using `joblib`.

---

## 10. API

The application exposes a prediction endpoint:

```http
POST /predict
```

The endpoint accepts vehicle information as JSON and returns the predicted price.

### Example Response

```json
{
    "predicted_price": 489392.37
}
```

The API also validates:

* Required fields
* Numerical ranges
* Categorical values
* Invalid numerical input

---

## 11. Project Structure

```text
Car-Price-Prediction/
│
├── app.py
├── requirements.txt
├── brand_model_mapping.json
│
├── model/
│   ├── car_encoder.pkl
│   └── linear_regression_model.pkl
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   └── script.js
│
├── Notebooks/
│   ├── data_analysis.ipynb
│   ├── data_cleaning.ipynb
│   ├── data_testing.ipynb
│   ├── feature_engineering.ipynb
│   └── modelBuilding.ipynb
│
├── README.md
└── .gitignore
```

---

## Technologies

### Machine Learning

* Python
* Pandas
* NumPy
* Scikit-learn
* Statsmodels

### Data Analysis

* Matplotlib
* Seaborn
* Jupyter Notebook

### Web Application

* Flask
* HTML
* CSS
* JavaScript

### Deployment

* Gunicorn
* Render

---

## Running Locally

### 1. Clone the Repository

```bash
git clone https://github.com/RAHUL-TRIPATHI07/Car-Price-Prediction.git
cd Car-Price-Prediction
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python app.py
```

Open the application at:

```text
http://127.0.0.1:5000
```

---

## Limitations

* The model predicts listing price rather than true market value.
* Only one train/test split was used for the final evaluation.
* Linear Regression may not capture complex nonlinear relationships.
* Extreme luxury vehicles contribute significantly to RMSE.
* The dataset represents a specific source and may not generalize to every used-car market.
* Prediction uncertainty is not currently provided.

---

## Future Improvements

* Compare Linear Regression with Ridge and Lasso regression.
* Evaluate nonlinear models such as Random Forest and Gradient Boosting.
* Use cross-validation for more robust performance estimates.
* Add prediction intervals or uncertainty estimates.
* Improve handling of rare vehicle models.
* Add model explainability using feature coefficients and SHAP.
* Add automated model retraining.

---

## Author

**Rahul Tripathi**

Computer Engineering Student
