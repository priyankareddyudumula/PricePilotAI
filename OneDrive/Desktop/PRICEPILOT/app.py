from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from config import Config
from db import mysql

app = Flask(__name__)
app.config.from_object(Config)

mysql.init_app(app)

bcrypt = Bcrypt(app)

@app.route("/")
def home():
    return "Welcome to PricePilot AI!"

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data["name"]
    email = data["email"]
    password = data["password"]
    role = data["role"]

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    cur = mysql.connection.cursor()

    cur.execute(
        """
        INSERT INTO users(name, email, password_hash, role)
        VALUES(%s,%s,%s,%s)
        """,
        (name, email, password_hash, role)
    )

    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "User Registered Successfully"})

if __name__ == "__main__":
    app.run(debug=True)