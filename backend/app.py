from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

DB_NAME = "database.db"


def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


# ==========================================
# Get all cafes
# ==========================================

@app.route("/cafes", methods=["GET"])
def get_cafes():

    conn = get_db_connection()

    cafes = conn.execute(
        "SELECT * FROM cafes"
    ).fetchall()

    conn.close()

    return jsonify([
        dict(row) for row in cafes
    ])


# ==========================================
# Get one cafe and all its items
# ==========================================

@app.route("/cafes/<int:cafe_id>", methods=["GET"])
def get_cafe(cafe_id):

    conn = get_db_connection()

    cafe = conn.execute(
        "SELECT * FROM cafes WHERE id = ?",
        (cafe_id,)
    ).fetchone()

    items = conn.execute(
        "SELECT * FROM items WHERE cafe_id = ?",
        (cafe_id,)
    ).fetchall()

    conn.close()

    if cafe is None:
        return jsonify({
            "error": "Cafe not found"
        }), 404

    return jsonify({
        "cafe": dict(cafe),
        "items": [dict(item) for item in items]
    })


# ==========================================
# Get all items
# ==========================================

@app.route("/items", methods=["GET"])
def get_items():

    conn = get_db_connection()

    items = conn.execute(
        "SELECT * FROM items"
    ).fetchall()

    conn.close()

    return jsonify([
        dict(item) for item in items
    ])


# ==========================================
# Get one item
# ==========================================

@app.route("/items/<int:item_id>", methods=["GET"])
def get_item(item_id):

    conn = get_db_connection()

    item = conn.execute(
        "SELECT * FROM items WHERE id = ?",
        (item_id,)
    ).fetchone()

    conn.close()

    if item is None:
        return jsonify({
            "error": "Item not found"
        }), 404

    return jsonify(dict(item))


# ==========================================
# Get ratings and reviews for an item
# ==========================================

@app.route("/items/<int:item_id>/ratings", methods=["GET"])
def get_ratings(item_id):

    conn = get_db_connection()

    # Check whether item exists
    item = conn.execute(
        "SELECT * FROM items WHERE id = ?",
        (item_id,)
    ).fetchone()

    if item is None:

        conn.close()

        return jsonify({
            "error": "Item not found"
        }), 404

    # Get all ratings for this item
    ratings = conn.execute(
        """
        SELECT *
        FROM ratings
        WHERE item_id = ?
        ORDER BY created_at DESC
        """,
        (item_id,)
    ).fetchall()

    conn.close()

    return jsonify([
        dict(rating) for rating in ratings
    ])


# ==========================================
# Add rating and review for an item
# ==========================================

@app.route("/items/<int:item_id>/ratings", methods=["POST"])
def add_rating(item_id):

    data = request.get_json()

    # Check whether request contains data
    if data is None:

        return jsonify({
            "error": "Request data is required"
        }), 400

    conn = get_db_connection()

    # Check whether item exists
    item = conn.execute(
        "SELECT * FROM items WHERE id = ?",
        (item_id,)
    ).fetchone()

    if item is None:

        conn.close()

        return jsonify({
            "error": "Item not found"
        }), 404

    # Get rating and review
    rating = data.get("rating")
    review = data.get("review", "")

    # Check whether rating exists
    if rating is None:

        conn.close()

        return jsonify({
            "error": "Rating is required"
        }), 400

    # Convert rating to number
    try:

        rating = float(rating)

    except (TypeError, ValueError):

        conn.close()

        return jsonify({
            "error": "Rating must be a number"
        }), 400

    # Validate rating
    if rating < 1 or rating > 5:

        conn.close()

        return jsonify({
            "error": "Rating must be between 1 and 5"
        }), 400

    # ==========================================
    # Insert new rating
    # ==========================================

    conn.execute(
        """
        INSERT INTO ratings
        (item_id, rating, review)
        VALUES (?, ?, ?)
        """,
        (item_id, rating, review)
    )

    # ==========================================
    # Calculate average rating
    # ==========================================

    result = conn.execute(
        """
        SELECT AVG(rating) AS average_rating
        FROM ratings
        WHERE item_id = ?
        """,
        (item_id,)
    ).fetchone()

    average_rating = result["average_rating"]

    # ==========================================
    # Update item rating
    # ==========================================

    conn.execute(
        """
        UPDATE items
        SET rating = ?
        WHERE id = ?
        """,
        (average_rating, item_id)
    )

    conn.commit()

    conn.close()

    return jsonify({
        "message": "Rating submitted successfully",
        "average_rating": round(average_rating, 2)
    }), 201


# ==========================================
# ANALYTICS DASHBOARD
# ==========================================

@app.route("/analytics", methods=["GET"])
def get_analytics():

    conn = get_db_connection()

    # ==========================================
    # Total cafes
    # ==========================================

    total_cafes = conn.execute(
        """
        SELECT COUNT(*) AS count
        FROM cafes
        """
    ).fetchone()["count"]

    # ==========================================
    # Total items
    # ==========================================

    total_items = conn.execute(
        """
        SELECT COUNT(*) AS count
        FROM items
        """
    ).fetchone()["count"]

    # ==========================================
    # Total reviews
    # ==========================================

    total_reviews = conn.execute(
        """
        SELECT COUNT(*) AS count
        FROM ratings
        """
    ).fetchone()["count"]

    # ==========================================
    # Best item
    # ==========================================

    best_item = conn.execute(
        """
        SELECT
            name,
            category,
            rating
        FROM items
        ORDER BY rating DESC, name ASC
        LIMIT 1
        """
    ).fetchone()

    # ==========================================
    # Best coffee
    # ==========================================

    best_coffee = conn.execute(
        """
        SELECT
            name,
            category,
            rating
        FROM items
        WHERE category = 'Coffee'
        ORDER BY rating DESC, name ASC
        LIMIT 1
        """
    ).fetchone()

    # ==========================================
    # Best cafe
    # ==========================================

    best_cafe = conn.execute(
        """
        SELECT
            c.name,
            c.location,
            ROUND(AVG(i.rating), 2) AS average_rating
        FROM cafes c
        JOIN items i
            ON c.id = i.cafe_id
        GROUP BY c.id
        ORDER BY average_rating DESC, c.name ASC
        LIMIT 1
        """
    ).fetchone()

    # ==========================================
    # Rating of every cafe
    # ==========================================

    cafe_ratings = conn.execute(
        """
        SELECT
            c.name,
            c.location,
            ROUND(AVG(i.rating), 2) AS average_rating
        FROM cafes c
        LEFT JOIN items i
            ON c.id = i.cafe_id
        GROUP BY c.id
        ORDER BY average_rating DESC
        """
    ).fetchall()

    # ==========================================
    # Rating by category
    # ==========================================

    category_ratings = conn.execute(
        """
        SELECT
            category,
            ROUND(AVG(rating), 2) AS average_rating,
            COUNT(*) AS item_count
        FROM items
        GROUP BY category
        ORDER BY average_rating DESC
        """
    ).fetchall()

    # ==========================================
    # Rating distribution
    # ==========================================

    rating_rows = conn.execute(
        """
        SELECT
            CAST(ROUND(rating) AS INTEGER) AS rating,
            COUNT(*) AS count
        FROM ratings
        GROUP BY CAST(ROUND(rating) AS INTEGER)
        """
    ).fetchall()

    # Create 1-5 distribution
    rating_distribution = []

    for star in range(1, 6):

        count = 0

        for row in rating_rows:

            if row["rating"] == star:
                count = row["count"]
                break

        rating_distribution.append({
            "rating": star,
            "count": count
        })

    conn.close()

    # ==========================================
    # Return analytics
    # ==========================================

    return jsonify({

        "total_cafes": total_cafes,

        "total_items": total_items,

        "total_reviews": total_reviews,

        "best_item": (
            dict(best_item)
            if best_item
            else None
        ),

        "best_coffee": (
            dict(best_coffee)
            if best_coffee
            else None
        ),

        "best_cafe": (
            dict(best_cafe)
            if best_cafe
            else None
        ),

        "cafe_ratings": [
            dict(row)
            for row in cafe_ratings
        ],

        "category_ratings": [
            dict(row)
            for row in category_ratings
        ],

        "rating_distribution": rating_distribution

    })


# ==========================================
# Run Flask server
# ==========================================

if __name__ == "__main__":
    app.run(debug=True)



