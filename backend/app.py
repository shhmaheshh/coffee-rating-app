from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

DB_NAME = "database.db"


def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/coffees", methods=["GET"])
def get_coffees():

    conn = get_db_connection()

    coffees = conn.execute(
        "SELECT * FROM coffees"
    ).fetchall()

    conn.close()

    return jsonify([
        dict(row) for row in coffees
    ])

@app.route("/vote/<int:coffee_id>", methods=["POST"])
def vote(coffee_id):

    conn = get_db_connection()

    conn.execute(
        """
        UPDATE coffees
        SET votes = votes + 1
        WHERE id = ?
        """,
        (coffee_id,)
    )

    conn.commit()

    updated = conn.execute(
        "SELECT * FROM coffees WHERE id = ?",
        (coffee_id,)
    ).fetchone()

    conn.close()

    return jsonify(dict(updated))
if __name__ == "__main__":
    app.run(debug=True)