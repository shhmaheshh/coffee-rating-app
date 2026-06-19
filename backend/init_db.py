import sqlite3

conn = sqlite3.connect("database.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS coffees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    votes INTEGER DEFAULT 0
)
""")

# Clear existing data (optional for development)
cursor.execute("DELETE FROM coffees")

sample_data = [
    (
        "Ethiopian Yirgacheffe",
        "Bright and floral coffee with citrus notes",
        125
    ),
    (
        "Sumatra Mandheling",
        "Rich earthy flavor with low acidity",
        150
    ),
    (
        "Cold Brew Nitro",
        "Smooth cold brew infused with nitrogen",
        120
    ),
    (
        "Vanilla Latte",
        "Espresso with steamed milk and vanilla",
        125
    )
]
cursor.executemany(
    """
    INSERT INTO coffees
    (name, description, votes)
    VALUES (?, ?, ?)
    """,
    sample_data
)
conn.commit()
conn.close()

print("Database initialized successfully!")