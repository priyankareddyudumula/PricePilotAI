# Price Pilot AI: Brazilian E-Commerce Exploratory Data Analysis & Machine Learning Pipeline

Price Pilot AI is a production-grade machine learning and data science pipeline built for the **Brazilian E-Commerce Public Dataset by Olist**. The pipeline automatically loads, cleans, merges, profiles, and feature-engineers the dataset to predict **Total Order Value (Revenue)** using 10 regression algorithms. It outputs high-resolution visualisations, interactive Plotly dashboards, model explanation reports (using SHAP), and serialized ML models.

---

## 📂 Project Directory Structure
```
Price-Pilot-AI/
├── data/                       # Local raw Olist dataset directory
├── notebooks/                  # Notebooks for playground analyses
├── outputs/                    # All visual and serialized deliverables
│   ├── plots/                  # Visualisations (PNG, 300 DPI & HTML Plotly)
│   ├── reports/                # Profiling reports & markdown tables
│   ├── models/                 # Pickled best performing regression model
│   ├── shap/                   # SHAP explainability summaries & plots
│   └── feature_importance/     # Feature selection ranking CSV reports
├── logs/                       # Comprehensive execution logs
├── src/                        # Modular Python source packages
│   ├── config.py               # Settings, directories, and seeds
│   ├── data_loader.py          # Automatic CSV scanner and loader
│   ├── preprocessor.py         # Type conversions, duplicates, merging
│   ├── feature_engineering.py   # Date extraction & advanced aggregations
│   ├── eda.py                  # Seaborn, Plotly, ydata-profiling
│   ├── feature_selection.py    # Encoders, Scalers, MI/RF/RFE selectors
│   ├── models.py               # Regression wrappers & tuning logic
│   ├── evaluation.py           # Evaluation plotting routines
│   └── pipeline.py             # Main pipeline orchestrator script
└── .gitignore                  # Git tracking rules
```

---

## ⚙️ Step-by-Step Milestones

### 1. Data Preprocessing & Merging
- **Auto-Detection**: Automatically searches candidate folders for Olist CSV datasets.
- **Datetime Conversion**: Standardizes 8 timestamp columns across files into Pandas `datetime64[ns]`.
- **Data Cleaning**: Drops duplicate entries and handles missing product attributes, categoricals, and ratings.
- **Master Joining**: Merges customers, orders, items, payments, sellers, reviews, and product category translations into a master DataFrame at the order level.
- **Spatial Aggregation**: Aggregates 1M+ geolocation lat/lng points by zip code prefix to calculate mean coordinates for customers and sellers without bloating memory.

### 2. Advanced Feature Engineering
Engineers dynamic variables to capture customer lifetime patterns, seasonality, and delivery dynamics:
- **Seasonality/Time**: Purchase Year, Month, Week, Day, Quarter, Weekday.
- **Target Variable**: `total_order_value` (sum of product price and freight value).
- **Client Metrics**: Customer Lifetime Value (CLV), Number of Orders, Revenue per Customer.
- **Seller Metrics**: Revenue per Seller.
- **Delivery**: Actual Delivery Time (in days), Delivery Delay (relative to estimated delivery date).
- **Products**: Product Category Popularity.
- **Aggregated Revenue**: Weekly and Monthly historical revenue.

### 3. Exploratory Data Analysis
Generates 12+ professional, high-resolution visual reports:
- Missing value distributions using `missingno`.
- Dynamic and interactive dashboards using `Plotly` (Monthly revenue, payment method pie charts, delivery delay scatterplot).
- Key distribution plots (histograms, KDE, violin plots, boxplots).
- Correlation matrices and bar-rankings of top sellers, categories, and states.
- Pre-compiles an HTML dataset profiling report using `ydata-profiling`.

### 4. Encoding, Scaling & Feature Selection
- **Encoding**: Applies One-Hot Encoding to payment methods, Label Encoding to states, and Frequency Encoding to product categories.
- **Scaling**: Standardizes numerical fields with `StandardScaler` and maps spatial coordinates with `MinMaxScaler`.
- **Selection**: Computes feature ranking by aggregating **Mutual Information Regression**, **Random Forest Feature Importance**, and **Recursive Feature Elimination (RFE)** using a Ridge estimator.

---

## 📊 Regression Model Comparison & Rankings

The pipeline trains 10 regressor algorithms using a train/test split, performs 5-fold cross-validation, and ranks them:

| Rank | Model Name | R² Score | CV Score (R²) | RMSE (BRL) | MAE (BRL) |
|---|---|---|---|---|---|
| **1** | **Extra Trees Regressor** | **0.9904** | **0.9610** | **20.46** | **4.76** |
| 2 | Gradient Boosting Regressor | 0.9893 | 0.9335 | 21.58 | 5.56 |
| 3 | Lasso Regression | 0.9874 | 0.9927 | 23.35 | 5.86 |
| 4 | Linear Regression | 0.9874 | 0.9927 | 23.37 | 5.87 |
| 5 | Ridge Regression | 0.9874 | 0.9927 | 23.37 | 5.87 |
| 6 | Random Forest Regressor | 0.9855 | 0.9507 | 25.09 | 6.55 |
| 7 | Decision Tree Regressor | 0.9840 | 0.8150 | 26.32 | 6.42 |
| 8 | XGBoost Regressor | 0.9709 | 0.8628 | 35.55 | 11.23 |
| 9 | LightGBM Regressor | 0.9703 | 0.8696 | 35.89 | 11.66 |
| 10 | CatBoost Regressor | 0.9679 | 0.8871 | 37.29 | 12.04 |

*Note: Models are trained on the top 15 selected features to maintain generalization and avoid direct leakage.*

---

## 🧠 Model Explainability (SHAP)
Integrates SHAP (SHapley Additive exPlanations) on the best-tuned model:
- **Summary Plot**: Displays overall feature influence on e-commerce order revenue.
- **Beeswarm Plot**: Visualizes the density of high/low feature values and their directional impact on predictions.
- **Waterfall Plot**: Traces individual prediction pathways step-by-step for a single transaction.

---

## 🚀 Execution Instructions

### Installation
Ensure you have Python installed, then install the dependencies:
```bash
pip install pandas numpy scikit-learn matplotlib seaborn plotly missingno yellowbrick xgboost lightgbm catboost shap tqdm ydata-profiling setuptools==69.5.1
```

### Run the Pipeline
Run the orchestrator from the project root directory:
```bash
python -m src.pipeline
```

Monitor live console updates or check execution details in `logs/pipeline.log`.
All generated visuals, CSV importance logs, and the serialized model (`best_model.pkl`) will be exported to `outputs/`.
