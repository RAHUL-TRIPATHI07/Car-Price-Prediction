# Used Car Price Predictor

A machine learning project that predicts the selling price of used cars using Multiple Linear Regression and vehicle-related features.

## Problem Statement

Used car prices depend on several factors such as vehicle age, mileage, brand, model, engine characteristics, fuel type, transmission, and seller type.

The goal of this project is to build an interpretable regression model that estimates the selling price of a used car from these features.

## Dataset

The project uses the Vehicle Dataset from CarDekho.

After preprocessing:
- 15,242 records
- 12 original features
- No missing values
- Duplicate records removed
- Invalid zero-seat records removed

## Methodology

### 1. Data Cleaning
- Removed the unnecessary index column.
- Removed redundant `car_name` because `brand + model` uniquely identifies the vehicle.
- Removed duplicate records.
- Removed invalid records with zero seats.

### 2. Exploratory Data Analysis
Analyzed:
- Numerical feature distributions
- Correlations
- Categorical variables
- Model-level price differences
- Outliers

### 3. Feature Engineering
Created an interaction feature:

`age_mileage = vehicle_age × km_driven`

Brand and model were retained because they provide important information about vehicle pricing.

### 4. Target Transformation

The original selling price was highly right-skewed:

- Original skewness: 10.11
- Log-transformed skewness: 0.57

Therefore, `log1p(selling_price)` was used as the regression target.

### 5. Model

Multiple Linear Regression was used with:
- One-hot encoded categorical features
- Numerical vehicle features
- Age × mileage interaction

### 6. Multicollinearity

VIF analysis was performed.

`engine` and `max_power` initially showed substantial multicollinearity.

A controlled comparison was performed by removing `engine`. The resulting model achieved slightly better performance and substantially reduced the VIF of `max_power`.

### 7. Assumption Checks

Regression assumptions were examined using:
- Residual vs predicted plot
- Q-Q plot
- Residual mean
- Residual skewness

The residuals were reasonably centered and symmetric, although the Q-Q plot showed deviations in the extreme tails.

## Results

| Metric | Score |
|---|---:|
| MAE | ₹115,046 |
| RMSE | ₹445,858 |
| R² | 0.7550 |
| Adjusted R² | 0.7414 |

The final model explains approximately 75.5% of the variance in log-transformed selling price on the held-out test set.

## Technologies

- Python
- Pandas
- NumPy
- Matplotlib
- Seaborn
- Scikit-learn
- Statsmodels
- Jupyter Notebook

## Future Improvements

- Compare with regularized regression such as Ridge/Lasso
- Build a web interface
- Add confidence/uncertainty estimates
- Handle unseen vehicle models more robustly