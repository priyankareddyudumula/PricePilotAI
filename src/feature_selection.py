import logging
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder
from sklearn.feature_selection import mutual_info_regression, RFE
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from src.config import FEATURE_IMPORTANCE_DIR, RANDOM_STATE, TARGET_COLUMN

logger = logging.getLogger(__name__)

def preprocess_and_select_features(df):
    """
    Applies encoding, scaling, and feature selection algorithms on the engineered dataset.
    """
    try:
        logger.info("Starting feature selection pipeline...")
        df_ml = df.copy()
        
        # 1. Handle Categorical Columns Encoding
        logger.info("Encoding categorical variables...")
        
        # One-Hot Encoding for payment_type
        if "payment_type" in df_ml.columns:
            df_ml = pd.get_dummies(df_ml, columns=["payment_type"], prefix="pay", drop_first=True)
            
        # Label Encoding for customer_state
        if "customer_state" in df_ml.columns:
            le_state = LabelEncoder()
            df_ml["customer_state_encoded"] = le_state.fit_transform(df_ml["customer_state"])
            
        # Frequency Encoding for product_category_name_english
        if "product_category_name_english" in df_ml.columns:
            freq_map = df_ml["product_category_name_english"].value_counts(normalize=True).to_dict()
            df_ml["category_freq_encoded"] = df_ml["product_category_name_english"].map(freq_map)
            
        # 2. Select Features for ML
        # Exclude IDs, raw categoricals, target, and columns that might lead to extreme leakage
        exclude_cols = [
            "order_id", "customer_id", "order_status", "order_purchase_timestamp",
            "order_approved_at", "order_delivered_carrier_date", "order_delivered_customer_date",
            "order_estimated_delivery_date", "customer_unique_id", "customer_city",
            "customer_state", "product_id", "seller_id", "product_category_name",
            "product_category_name_english", "seller_city", "seller_state",
            "total_payment_value", "total_price",  # Target and total price (leakage)
            "customer_lifetime_value", "revenue_per_customer", "avg_product_price",
            "total_freight_cost", "revenue_per_seller",
            TARGET_COLUMN
        ]
        
        feature_cols = [col for col in df_ml.columns if col not in exclude_cols]
        logger.info(f"Features list ({len(feature_cols)} features): {feature_cols}")
        
        X = df_ml[feature_cols].copy()
        y = df_ml[TARGET_COLUMN].copy()
        
        # Fill any remaining NaNs in X
        X = X.fillna(X.median())
        
        # 3. Scaling numerical features
        logger.info("Scaling features...")
        # Columns to scale with MinMaxScaler
        minmax_cols = ["customer_lat", "customer_lng", "seller_lat", "seller_lng"]
        minmax_cols = [c for c in minmax_cols if c in X.columns]
        
        # All other numerical features scale with StandardScaler
        std_cols = [c for c in X.columns if c not in minmax_cols]
        
        # Fit scaling
        X_scaled = X.copy()
        if std_cols:
            scaler_std = StandardScaler()
            X_scaled[std_cols] = scaler_std.fit_transform(X[std_cols])
        if minmax_cols:
            scaler_minmax = MinMaxScaler()
            X_scaled[minmax_cols] = scaler_minmax.fit_transform(X[minmax_cols])
            
        # 4. Feature Selection using a representative sample (5,000 rows)
        sample_size = min(5000, len(df_ml))
        logger.info(f"Subsampling {sample_size} rows for feature selection algorithms...")
        X_sample = X_scaled.sample(sample_size, random_state=RANDOM_STATE)
        y_sample = y.loc[X_sample.index]
        
        # Convert bool to int for estimators
        for col in X_sample.columns:
            if X_sample[col].dtype == bool:
                X_sample[col] = X_sample[col].astype(int)
                X_scaled[col] = X_scaled[col].astype(int)
                X[col] = X[col].astype(int)
                
        # A. Mutual Information
        logger.info("Performing Mutual Information regression...")
        mi_scores = mutual_info_regression(X_sample, y_sample, random_state=RANDOM_STATE)
        mi_df = pd.DataFrame({"Feature": X.columns, "MI_Score": mi_scores})
        
        # B. Random Forest Feature Importance
        logger.info("Performing Random Forest Feature Importance...")
        rf = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=RANDOM_STATE, n_jobs=-1)
        rf.fit(X_sample, y_sample)
        rf_df = pd.DataFrame({"Feature": X.columns, "RF_Importance": rf.feature_importances_})
        
        # C. Recursive Feature Elimination (RFE) using Ridge
        logger.info("Performing Recursive Feature Elimination...")
        ridge = Ridge(alpha=1.0)
        rfe = RFE(estimator=ridge, n_features_to_select=min(15, len(X.columns)))
        rfe.fit(X_sample, y_sample)
        rfe_df = pd.DataFrame({"Feature": X.columns, "RFE_Ranking": rfe.ranking_, "RFE_Selected": rfe.support_})
        
        # Combine results into a single table
        importance_df = pd.merge(mi_df, rf_df, on="Feature")
        importance_df = pd.merge(importance_df, rfe_df, on="Feature")
        
        # Normalize and compute a combined score
        importance_df["MI_Normalized"] = importance_df["MI_Score"] / importance_df["MI_Score"].max()
        importance_df["RF_Normalized"] = importance_df["RF_Importance"] / importance_df["RF_Importance"].max()
        importance_df["RFE_Score"] = importance_df["RFE_Selected"].astype(int)
        importance_df["Combined_Score"] = (importance_df["MI_Normalized"] + importance_df["RF_Normalized"] + importance_df["RFE_Score"]) / 3
        
        importance_df.sort_values(by="Combined_Score", ascending=False, inplace=True)
        
        # Ensure directories exist and write report
        FEATURE_IMPORTANCE_DIR.mkdir(parents=True, exist_ok=True)
        importance_df.to_csv(FEATURE_IMPORTANCE_DIR / "feature_selection_results.csv", index=False)
        logger.info(f"Feature selection report saved to {FEATURE_IMPORTANCE_DIR / 'feature_selection_results.csv'}")
        
        # Select top features
        top_features = importance_df["Feature"].head(15).tolist()
        logger.info(f"Top 15 selected features: {top_features}")
        
        return X_scaled, X, y, top_features, importance_df
    except Exception as e:
        logger.error(f"Error in feature selection pipeline: {str(e)}")
        raise e

if __name__ == "__main__":
    from src.data_loader import load_datasets
    from src.preprocessor import preprocess_timestamps, clean_datasets, merge_datasets
    from src.feature_engineering import engineer_features
    
    logging.basicConfig(level=logging.INFO)
    dfs = load_datasets()
    dfs_pre = preprocess_timestamps(dfs)
    dfs_clean = clean_datasets(dfs_pre)
    m_df = merge_datasets(dfs_clean)
    f_df = engineer_features(m_df)
    X_scaled, X, y, top_feats, imp_df = preprocess_and_select_features(f_df)
    print("Top features:")
    print(imp_df.head(10))
