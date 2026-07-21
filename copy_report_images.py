import os
import glob
import shutil

brain_dir = os.path.join(os.environ['USERPROFILE'], '.gemini', 'antigravity-ide', 'brain', '4ef29e9b-0aba-4a2f-a11d-8c27f2e354f8')
out_dir = os.path.join(os.getcwd(), 'outputs', 'report_screenshots')
os.makedirs(out_dir, exist_ok=True)

targets = {
    'overview_dashboard': 'overview_dashboard.png',
    'login_modal': 'login_modal.png',
    'ai_price_engine': 'ai_price_engine.png',
    'product_catalog': 'product_catalog.png',
    'model_leaderboard': 'model_leaderboard.png',
    'demand_forecast': 'demand_forecast.png',
    'audit_trail': 'audit_trail.png'
}

for name, dest in targets.items():
    pattern = os.path.join(brain_dir, f"{name}_*.png")
    matches = glob.glob(pattern)
    if matches:
        latest = max(matches, key=os.path.getmtime)
        dest_path = os.path.join(out_dir, dest)
        shutil.copy(latest, dest_path)
        print(f"Copied {os.path.basename(latest)} -> {dest_path}")
    else:
        print(f"No match found for {name}")

print("Done copying screenshots!")
