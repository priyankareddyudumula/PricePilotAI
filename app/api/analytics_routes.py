from flask import Blueprint, jsonify
from app.services.data_service import data_service

analytics_bp = Blueprint('analytics_bp', __name__)

@analytics_bp.route('/feature-importance', methods=['GET'])
def get_feature_importance():
    return jsonify(data_service.get_feature_importance()), 200

@analytics_bp.route('/model-performance', methods=['GET'])
def get_model_performance():
    return jsonify(data_service.get_model_performance()), 200

@analytics_bp.route('/sales-analytics', methods=['GET'])
def get_sales_analytics():
    summary = data_service.get_dashboard_summary()
    monthly = data_service.get_monthly_revenue()
    top_prods = data_service.get_top_products(5)
    return jsonify({
        'summary': summary,
        'monthly': monthly,
        'top_products': top_prods
    }), 200

@analytics_bp.route('/demand-analytics', methods=['GET'])
def get_demand_analytics():
    return jsonify({
        'categories_demand': [
            {'category': 'Bed Bath Table', 'demand_units': 11115, 'growth': '+12.4%'},
            {'category': 'Health Beauty', 'demand_units': 9670, 'growth': '+18.2%'},
            {'category': 'Sports Leisure', 'demand_units': 8640, 'growth': '+8.5%'},
            {'category': 'Computers Accessories', 'demand_units': 7890, 'growth': '+15.1%'},
            {'category': 'Furniture Decor', 'demand_units': 6540, 'growth': '+5.7%'}
        ]
    }), 200
