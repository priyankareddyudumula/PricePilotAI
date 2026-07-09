import logging
import pandas as pd
import numpy as np
from tqdm import tqdm
from src.config import TARGET_COLUMN

logger = logging.getLogger(__name__)

def engineer_features(master_df):
    """
    Engineers useful date features, target variables, and client/seller metrics.
    """
    try:
        logger.info("Starting feature engineering pipeline...")
        df = master_df.copy()
        
        # 1. Total Order Value (Revenue)
        df[TARGET_COLUMN] = df["total_price"] + df["total_freight_cost"]
        logger.info(f"Target variable '{TARGET_COLUMN}' created.")
        
        # 2. Date features from order_purchase_timestamp
        logger.info("Extracting date features...")
        dt_col = df["order_purchase_timestamp"]
        df["order_purchase_year"] = dt_col.dt.year
        df["order_purchase_month"] = dt_col.dt.month
        # Use ISO week since dt.week is deprecated in pandas
        df["order_purchase_week"] = dt_col.dt.isocalendar().week.astype(int)
        df["order_purchase_day"] = dt_col.dt.day
        df["order_purchase_quarter"] = dt_col.dt.quarter
        df["order_purchase_weekday"] = dt_col.dt.weekday
        
        # 3. Delivery Time and Delivery Delay (in days)
        logger.info("Calculating delivery features...")
        # For rows with null delivery date, we will drop them or handle them later
        df["delivery_time"] = (df["order_delivered_customer_date"] - df["order_purchase_timestamp"]).dt.total_seconds() / (24 * 3600)
        df["delivery_delay"] = (df["order_delivered_customer_date"] - df["order_estimated_delivery_date"]).dt.total_seconds() / (24 * 3600)
        
        # Clip negative delivery times to 0 (data entry errors)
        df["delivery_time"] = df["delivery_time"].clip(lower=0)
        
        # 4. Customer-level features
        logger.info("Calculating customer-level features...")
        cust_stats = df.groupby("customer_unique_id").agg(
            customer_lifetime_value=(TARGET_COLUMN, "sum"),
            number_of_orders=("order_id", "nunique")
        ).reset_index()
        cust_stats["revenue_per_customer"] = cust_stats["customer_lifetime_value"] / cust_stats["number_of_orders"]
        
        df = pd.merge(df, cust_stats, on="customer_unique_id", how="left")
        
        # 5. Seller-level features
        logger.info("Calculating seller-level features...")
        seller_stats = df.groupby("seller_id").agg(
            revenue_per_seller=("total_price", "sum")
        ).reset_index()
        df = pd.merge(df, seller_stats, on="seller_id", how="left")
        
        # 6. Product popularity
        logger.info("Calculating product popularity...")
        prod_stats = df.groupby("product_id").agg(
            product_popularity=("order_id", "count")
        ).reset_index()
        df = pd.merge(df, prod_stats, on="product_id", how="left")
        
        # 7. Monthly and Weekly Revenue (historical aggregations)
        logger.info("Calculating monthly and weekly revenue aggregations...")
        
        # Group by Year-Month to get monthly revenue
        df["year_month"] = df["order_purchase_timestamp"].dt.to_period("M")
        monthly_rev = df.groupby("year_month")[TARGET_COLUMN].sum().reset_index()
        monthly_rev.rename(columns={TARGET_COLUMN: "monthly_revenue"}, inplace=True)
        df = pd.merge(df, monthly_rev, on="year_month", how="left")
        df.drop(columns=["year_month"], inplace=True)
        
        # Group by Year-Week to get weekly revenue
        df["year_week"] = df["order_purchase_timestamp"].dt.to_period("W")
        weekly_rev = df.groupby("year_week")[TARGET_COLUMN].sum().reset_index()
        weekly_rev.rename(columns={TARGET_COLUMN: "weekly_revenue"}, inplace=True)
        df = pd.merge(df, weekly_rev, on="year_week", how="left")
        df.drop(columns=["year_week"], inplace=True)
        
        # 8. Clean up missing values generated during calculations (e.g. delivery time is null for non-delivered orders)
        # We will drop rows where order_delivered_customer_date is null for regression models
        # and fill other nulls with median/mean
        initial_count = len(df)
        df = df.dropna(subset=["order_delivered_customer_date", "delivery_time", "delivery_delay"])
        logger.info(f"Dropped {initial_count - len(df)} orders that were not delivered (remaining: {len(df)}).")
        
        logger.info(f"Feature engineering completed! DataFrame shape: {df.shape}")
        return df
    except Exception as e:
        logger.error(f"Error during feature engineering: {str(e)}")
        raise e

if __name__ == "__main__":
    from src.data_loader import load_datasets
    from src.preprocessor import preprocess_timestamps, clean_datasets, merge_datasets
    logging.basicConfig(level=logging.INFO)
    dfs = load_datasets()
    dfs = preprocess_timestamps(dfs)
    dfs = clean_datasets(dfs)
    m_df = merge_datasets(dfs)
    f_df = engineer_features(m_df)
    print("Engineered features preview:")
    print(f_df[["total_order_value", "delivery_time", "delivery_delay", "customer_lifetime_value", "revenue_per_seller"]].head())
