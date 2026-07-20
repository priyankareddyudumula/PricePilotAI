from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='Business Analyst')  # Admin, Pricing Manager, Business Analyst
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    category_name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    category_name_english = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'category_name': self.category_name,
            'category_name_english': self.category_name_english or self.category_name
        }

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(64), unique=True, nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    product_name_length = db.Column(db.Integer, nullable=True)
    product_description_length = db.Column(db.Integer, nullable=True)
    product_photos_qty = db.Column(db.Integer, nullable=True)
    product_weight_g = db.Column(db.Float, nullable=True)
    product_length_cm = db.Column(db.Float, nullable=True)
    product_height_cm = db.Column(db.Float, nullable=True)
    product_width_cm = db.Column(db.Float, nullable=True)
    current_price = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    category = db.relationship('Category', backref='products')

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'category_id': self.category_id,
            'category_name': self.category.category_name if self.category else 'Unknown',
            'product_weight_g': self.product_weight_g,
            'product_length_cm': self.product_length_cm,
            'product_height_cm': self.product_height_cm,
            'product_width_cm': self.product_width_cm,
            'current_price': self.current_price,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Seller(db.Model):
    __tablename__ = 'sellers'
    
    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.String(64), unique=True, nullable=False, index=True)
    seller_zip_code_prefix = db.Column(db.String(10), nullable=True)
    seller_city = db.Column(db.String(100), nullable=True)
    seller_state = db.Column(db.String(10), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'seller_id': self.seller_id,
            'seller_city': self.seller_city,
            'seller_state': self.seller_state
        }

class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.String(64), unique=True, nullable=False, index=True)
    customer_unique_id = db.Column(db.String(64), nullable=True, index=True)
    customer_zip_code_prefix = db.Column(db.String(10), nullable=True)
    customer_city = db.Column(db.String(100), nullable=True)
    customer_state = db.Column(db.String(10), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'customer_unique_id': self.customer_unique_id,
            'customer_city': self.customer_city,
            'customer_state': self.customer_state
        }

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(64), unique=True, nullable=False, index=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=True)
    order_status = db.Column(db.String(50), nullable=False, default='delivered')
    order_purchase_timestamp = db.Column(db.DateTime, nullable=True)
    order_approved_at = db.Column(db.DateTime, nullable=True)
    order_delivered_carrier_date = db.Column(db.DateTime, nullable=True)
    order_delivered_customer_date = db.Column(db.DateTime, nullable=True)
    order_estimated_delivery_date = db.Column(db.DateTime, nullable=True)
    total_amount = db.Column(db.Float, nullable=False, default=0.0)

    customer = db.relationship('Customer', backref='orders')

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'customer_id': self.customer_id,
            'order_status': self.order_status,
            'order_purchase_timestamp': self.order_purchase_timestamp.isoformat() if self.order_purchase_timestamp else None,
            'total_amount': self.total_amount
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    order_item_id = db.Column(db.Integer, nullable=False, default=1)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey('sellers.id'), nullable=True)
    shipping_limit_date = db.Column(db.DateTime, nullable=True)
    price = db.Column(db.Float, nullable=False)
    freight_value = db.Column(db.Float, nullable=False, default=0.0)

    order = db.relationship('Order', backref='items')
    product = db.relationship('Product', backref='order_items')
    seller = db.relationship('Seller', backref='order_items')

class PricingHistory(db.Model):
    __tablename__ = 'pricing_history'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    old_price = db.Column(db.Float, nullable=False)
    new_price = db.Column(db.Float, nullable=False)
    changed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    change_reason = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'old_price': self.old_price,
            'new_price': self.new_price,
            'changed_by': self.changed_by,
            'change_reason': self.change_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Prediction(db.Model):
    __tablename__ = 'predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(64), nullable=True)
    input_features = db.Column(db.Text, nullable=False)  # JSON string
    predicted_price = db.Column(db.Float, nullable=False)
    confidence_score = db.Column(db.Float, nullable=True)
    model_name = db.Column(db.String(100), default='Extra Trees Regressor')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'predicted_price': self.predicted_price,
            'confidence_score': self.confidence_score,
            'model_name': self.model_name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class RevenueAnalytics(db.Model):
    __tablename__ = 'revenue_analytics'
    
    id = db.Column(db.Integer, primary_key=True)
    period_type = db.Column(db.String(20), nullable=False)  # monthly, weekly
    period_value = db.Column(db.String(20), nullable=False) # e.g. 2017-09, 2018-W32
    total_revenue = db.Column(db.Float, nullable=False)
    total_orders = db.Column(db.Integer, nullable=False)
    avg_order_value = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DemandForecast(db.Model):
    __tablename__ = 'demand_forecasts'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(64), nullable=False)
    forecast_date = db.Column(db.String(20), nullable=False)
    forecasted_demand = db.Column(db.Float, nullable=False)
    lower_bound = db.Column(db.Float, nullable=True)
    upper_bound = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    endpoint = db.Column(db.String(255), nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'endpoint': self.endpoint,
            'ip_address': self.ip_address,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
