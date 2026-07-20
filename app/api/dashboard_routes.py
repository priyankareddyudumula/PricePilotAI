from flask import Blueprint, jsonify
from app.services.data_service import data_service
from app.auth import jwt_required

dashboard_bp = Blueprint('dashboard_bp', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
def get_summary():
    return jsonify(data_service.get_dashboard_summary()), 200

@dashboard_bp.route('/top-products', methods=['GET'])
def get_top_products():
    return jsonify(data_service.get_top_products()), 200

@dashboard_bp.route('/top-sellers', methods=['GET'])
def get_top_sellers():
    return jsonify(data_service.get_top_sellers()), 200

@dashboard_bp.route('/monthly-revenue', methods=['GET'])
def get_monthly_revenue():
    return jsonify(data_service.get_monthly_revenue()), 200

@dashboard_bp.route('/weekly-revenue', methods=['GET'])
def get_weekly_revenue():
    return jsonify(data_service.get_weekly_revenue()), 200

@dashboard_bp.route('/customer-insights', methods=['GET'])
def get_customer_insights():
    return jsonify(data_service.get_customer_insights()), 200
