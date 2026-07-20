def test_predict_price_api(client, admin_token):
    payload = {
        'product_id': 'TEST_PROD_100',
        'price': 150.0,
        'freight_value': 25.0,
        'product_weight_g': 1200.0,
        'product_length_cm': 30.0,
        'product_height_cm': 20.0,
        'product_width_cm': 20.0
    }
    res = client.post('/api/pricing/predict-price', json=payload, headers={'Authorization': f'Bearer {admin_token}'})
    assert res.status_code == 200
    data = res.get_json()
    assert 'predicted_price' in data
    assert data['predicted_price'] > 0
    assert 'confidence_score' in data

def test_demand_forecast(client, admin_token):
    payload = {'product_id': 'TEST_PROD_100', 'days': 15}
    res = client.post('/api/pricing/forecast-demand', json=payload, headers={'Authorization': f'Bearer {admin_token}'})
    assert res.status_code == 200
    data = res.get_json()
    assert data['total_forecasted_units'] > 0

def test_optimize_price(client, admin_token):
    payload = {'current_price': 120.0, 'cost': 60.0}
    res = client.post('/api/pricing/optimize-price', json=payload, headers={'Authorization': f'Bearer {admin_token}'})
    assert res.status_code == 200
    data = res.get_json()
    assert 'optimal_price' in data
