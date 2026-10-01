import sqlite3

conn = sqlite3.connect("database.db")
cursor = conn.cursor()


# ==========================================
# Remove old tables
# ==========================================

cursor.execute("DROP TABLE IF EXISTS ratings")
cursor.execute("DROP TABLE IF EXISTS items")
cursor.execute("DROP TABLE IF EXISTS cafes")


# ==========================================
# Create cafes table
# ==========================================

cursor.execute("""
CREATE TABLE cafes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT
)
""")


# ==========================================
# Create items table
# ==========================================

cursor.execute("""
CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cafe_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    rating REAL DEFAULT 0,
    FOREIGN KEY (cafe_id) REFERENCES cafes(id)
)
""")


# ==========================================
# Create ratings table
# ==========================================

cursor.execute("""
CREATE TABLE ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    rating REAL NOT NULL,
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id)
)
""")


# ==========================================
# Sample cafes
# ==========================================

cafes = [
    ("Brew & Bean", "Hyderabad"),
    ("Third Wave Coffee", "Hyderabad"),
    ("Roastery Coffee House", "Hyderabad"),
    ("Café Aroma", "Hyderabad")
]

cursor.executemany(
    """
    INSERT INTO cafes (name, location)
    VALUES (?, ?)
    """,
    cafes
)


# ==========================================
# Sample food and coffee items
# ==========================================

items = [
    (1, "Cappuccino", "Creamy espresso with steamed milk", "Coffee", 4.8),
    (1, "Latte", "Smooth espresso with steamed milk", "Coffee", 4.5),
    (1, "Brownie", "Chocolate brownie", "Food", 4.6),

    (2, "Cappuccino", "Rich espresso with steamed milk", "Coffee", 4.7),
    (2, "Cold Coffee", "Chilled creamy coffee", "Coffee", 4.6),
    (2, "Cheesecake", "Classic creamy cheesecake", "Food", 4.8),

    (3, "Espresso", "Strong concentrated coffee", "Coffee", 4.6),
    (3, "Latte", "Smooth milk coffee", "Coffee", 4.4),
    (3, "Croissant", "Fresh buttery croissant", "Food", 4.5),

    (4, "Cold Coffee", "Cold blended coffee", "Coffee", 4.3),
    (4, "Sandwich", "Fresh vegetable sandwich", "Food", 4.2)
]

cursor.executemany(
    """
    INSERT INTO items
    (cafe_id, name, description, category, rating)
    VALUES (?, ?, ?, ?, ?)
    """,
    items
)


# ==========================================
# Save changes
# ==========================================

conn.commit()
conn.close()

print("Database initialized successfully!")

