import os
from flask import Flask, render_template, jsonify
from flask_cors import CORS
from app.config import Config
from app.models import db, User
from app.auth import bcrypt, hash_password

def create_app(config_class=Config):
    app = Flask(__name__, static_folder='static', template_folder='templates')
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    CORS(app)

    # Register API Blueprints
    from app.api.auth_routes import auth_bp
    from app.api.pricing_routes import pricing_bp
    from app.api.dashboard_routes import dashboard_bp
    from app.api.product_routes import product_bp
    from app.api.order_routes import order_bp
    from app.api.analytics_routes import analytics_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(pricing_bp, url_prefix='/api/pricing')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(product_bp, url_prefix='/api/products')
    app.register_blueprint(order_bp, url_prefix='/api/orders')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

    # Main SPA Route
    @app.route('/')
    def index():
        return render_template('index.html')

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'Internal server error'}), 500

    # Auto-initialize database tables and seed default users
    with app.app_context():
        os.makedirs(app.config['SQLITE_PATH'].parent, exist_ok=True)
        db.create_all()

        # Seed default users for testing if DB is empty
        if User.query.count() == 0:
            seed_users = [
                User(name='System Admin', email='admin@pricepilot.ai', password_hash=hash_password('admin123'), role='Admin'),
                User(name='Pricing Lead', email='pricing@pricepilot.ai', password_hash=hash_password('pricing123'), role='Pricing Manager'),
                User(name='Business Analyst', email='analyst@pricepilot.ai', password_hash=hash_password('analyst123'), role='Business Analyst')
            ]
            db.session.add_all(seed_users)
            db.session.commit()

    return app
