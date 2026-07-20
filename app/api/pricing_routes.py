import json
from flask import Blueprint, request, jsonify
from app.services.ml_service import ml_service
from app.models import db, Prediction, AuditLog
from app.auth import jwt_required, role_required

pricing_bp = Blueprint('pricing_bp', __name__)

@pricing_bp.route('/predict-price', methods=['POST'])
@jwt_required
def predict_price():
    data = request.get_json() or {}
    
    # Run ML Inference
    result = ml_service.predict_price(data)
    
    # Save Prediction log to DB
    user = getattr(request, 'current_user', None)
    pred_entry = Prediction(
        product_id=data.get('product_id', 'UNKNOWN'),
        input_features=json.dumps(data),
        predicted_price=result['predicted_price'],
        confidence_score=result['confidence_score'],
        model_name=result['model_used']
    )
    db.session.add(pred_entry)
    
    if user:
        audit = AuditLog(user_id=user.id, action='PREDICT_PRICE', endpoint='/api/pricing/predict-price', ip_address=request.remote_addr)
        db.session.add(audit)
        
    db.session.commit()

    return jsonify(result), 200

@pricing_bp.route('/forecast-demand', methods=['POST'])
@jwt_required
def forecast_demand():
    data = request.get_json() or {}
    product_id = data.get('product_id', 'PROD_DEFAULT_101')
    days = int(data.get('days', 30))

    result = ml_service.forecast_demand(product_id, days)
    return jsonify(result), 200

@pricing_bp.route('/optimize-price', methods=['POST'])
@jwt_required
@role_required(['Admin', 'Pricing Manager'])
def optimize_price():
    data = request.get_json() or {}
    current_price = float(data.get('current_price', 100.0))
    cost = float(data.get('cost', 50.0))

    result = ml_service.optimize_price(current_price, cost)
    return jsonify(result), 200
