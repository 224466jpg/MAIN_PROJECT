
# app.py
from flask import Flask, render_template, request, redirect, url_for, session, flash
from db_config import get_connection
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import date, datetime
import mysql.connector

app = Flask(__name__)
app.secret_key = "12/12=1shals"

# --------------- Authentication ---------------
@app.route('/')
def welcome():
    return render_template('welcome.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username').strip()
        password = request.form.get('password')

        if not username or not password:
            flash("Provide username and password", "danger")
            return redirect(url_for('signup'))

        hashed = generate_password_hash(password)

        conn = get_connection()
        cur = conn.cursor()
        try:
            cur.execute(
                "INSERT INTO users (username, password) VALUES (%s, %s)",
                (username, hashed)
            )
            conn.commit()
            flash("Signup successful — please login", "success")
            return redirect(url_for('login'))
        except mysql.connector.IntegrityError:
            flash("Username already taken", "danger")
            return redirect(url_for('signup'))
        finally:
            cur.close()
            conn.close()

    return render_template('signup.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password']

        if not username or not password:
            flash("Username and password are required", "danger")
            return redirect(url_for('login'))

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            flash("Login successful!", "success")
            return redirect(url_for('dashboard'))
        else:
            flash("Invalid username or password", "danger")
            return redirect(url_for('login'))

    return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()
    flash("Logged out", "info")
    return redirect(url_for('welcome'))


@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        flash("Please login first", "warning")
        return redirect(url_for('login'))
    return render_template('dashboard.html', username=session['username'])


# --------------- Grocery routes ---------------
def _normalize_date_field(item):
    expiry = item.get('expiry_date')
    if isinstance(expiry, datetime):
        expiry = expiry.date()
    item['expiry_date'] = expiry
    return item


from datetime import date


@app.route('/expiry')
def expiry():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("""
        SELECT id, name, quantity, expiry_date
        FROM groceries
        WHERE user_id = %s
        ORDER BY expiry_date ASC
    """, (session['user_id'],))
    items = cur.fetchall() or []
    cur.close()
    conn.close()

    today = date.today()
    for item in items:
        e = item['expiry_date']
        if isinstance(e, str):  # normalize if MySQL returns a string
            e = date.fromisoformat(e)
        elif isinstance(e, datetime):  # if MySQL returns datetime
            e = e.date()

        # Assign status dynamically (not stored in DB)
        if e < today:
            item['status'] = "expired"
        elif (e - today).days <= 2:
            item['status'] = "expiring"
        else:
            item['status'] = "fresh"

        # replace normalized date back into dict
        item['expiry_date'] = e

    return render_template('expiry.html', items=items)



@app.route('/add_product', methods=['GET', 'POST'])
def add_product():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    if request.method == 'POST':
        name = request.form.get('name','').strip()
        quantity = request.form.get('quantity','').strip()
        expiry_date = request.form.get('expiry_date','').strip()

        if not (name and quantity and expiry_date):
            flash("All fields required", "danger")
            return redirect(url_for('add_product'))

        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO groceries (name, quantity, expiry_date, user_id) VALUES (%s,%s,%s,%s)",
            (name, quantity, expiry_date, session['user_id'])
        )
        conn.commit()
        cur.close()
        conn.close()

        flash("Product added", "success")
        return redirect(url_for('expiry'))

    return render_template('add_product.html')


@app.route('/delete/<int:item_id>')
def delete_product(item_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM groceries WHERE id = %s AND user_id = %s", (item_id, session['user_id']))
    conn.commit()
    cur.close()
    conn.close()

    flash("Product deleted", "info")
    return redirect(url_for('expiry'))


if __name__ == '__main__':
    app.run(debug=True)
