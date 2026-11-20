from flask import Flask, jsonify
import sqlite3

app = Flask(__name__)


@app.route("/api/stats")
def stats():

    conn = sqlite3.connect("database.db")

    cursor = conn.cursor()

    cursor.execute("""
    SELECT
        total_visitors,
        cv_downloads,
        project_views
    FROM portfolio_stats
    LIMIT 1
    """)

    row = cursor.fetchone()

    conn.close()

    return jsonify({
        "total_visitors": row[0],
        "cv_downloads": row[1],
        "project_views": row[2]
    })


if __name__ == "__main__":
    app.run(debug=True)