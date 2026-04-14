from flask import Flask, render_template, request, redirect, url_for, session
from flask_mysqldb import MySQL
from chauffeur import chauffeur_bp, init_chauffeur
from bus import bus_bp, init_bus
from ligne import ligne_bp, init_ligne
from reservation import reservation_bp, init_reservation

app = Flask(__name__)
app.secret_key = 'secret123'

# =========================
# DATABASE CONFIG
# =========================
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'dbtest'

mysql = MySQL(app)

init_chauffeur(mysql)
init_bus(mysql)
init_ligne(mysql)
init_reservation(mysql)

app.register_blueprint(chauffeur_bp, url_prefix='/chauffeur')
app.register_blueprint(bus_bp, url_prefix='/bus')
app.register_blueprint(ligne_bp, url_prefix='/ligne')
app.register_blueprint(reservation_bp, url_prefix='/reservation')


# =========================
# HOME
# =========================
@app.route('/')
def home():
    return render_template('home.html')


# =========================
# LOGIN CLIENT
# =========================
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        telephone = request.form['telephone']
        password = request.form['password']

        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM users WHERE telephone=%s AND role='client'", (telephone,))
        user = cursor.fetchone()

        # 👉 NO HASH
        if user and user[3] == password:
            session['user_id'] = user[0]
            session['role'] = 'client'
            return redirect('/client')

        return "Login client incorrect ❌"

    return render_template('login.html')


# =========================
# SIGNUP
# =========================
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        role = 'client'

        if role == 'chauffeur':
            return redirect('/chauffeur-login')

        if role == 'admin':
            return redirect('/admin-login')

        nom = request.form['nom']
        telephone = request.form.get('telephone')
        password = request.form['password']

        cursor = mysql.connection.cursor()

        cursor.execute("SELECT * FROM users WHERE telephone=%s", (telephone,))
        if cursor.fetchone():
            return "Email déjà utilisé ❌"

        # 👉 NO HASH
        cursor.execute(
            "INSERT INTO users (nom, telephone, password, role) VALUES (%s, %s, %s, %s)",
            (nom, telephone, password, 'client')
        )
        mysql.connection.commit()

        return redirect('/login')


# =========================
# LOGIN CHAUFFEUR
# =========================
@app.route('/chauffeur-login', methods=['GET', 'POST'])
def chauffeur_login():
    if request.method == 'POST':
        id_chauffeur = request.form['id_chauffeur']
        password = request.form['password']

        cursor = mysql.connection.cursor()
        cursor.execute(
            "SELECT * FROM chauffeur WHERE id_chauffeur=%s",
            (id_chauffeur,)
        )
        chauffeur = cursor.fetchone()

        # 👉 NO HASH
        if chauffeur and chauffeur[5] == password:
            session['role'] = 'chauffeur'
            session['chauffeur_id'] = chauffeur[0]
            return redirect('/driver')

        return "ID ou mot de passe incorrect ❌"

    return render_template('chauffeur_login.html')


# =========================
# LOGIN ADMIN
# =========================
@app.route('/admin-login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        admin_id = request.form.get('id')
        password = request.form['password']

        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM users WHERE id=%s AND role='admin'", (admin_id,))
        admin = cursor.fetchone()

        # 👉 NO HASH
        if admin and admin[3] == password:
            session['role'] = 'admin'
            session['admin_id'] = admin[0]
            return redirect('/admin')

        return "Login admin incorrect ❌"

    return render_template('admin_login.html')


# =========================
# DASHBOARDS
# =========================
@app.route('/client')
def client_dashboard():
    if session.get('role') != 'client':
        return redirect('/login')

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT nom, telephone FROM users WHERE id = %s", (session.get('user_id'),))
    user_info = cursor.fetchone()
    client_name = user_info[0] if user_info else ""
    client_phone = str(user_info[1]) if user_info and user_info[1] else ""

    return render_template('client_dashboard.html', client_name=client_name, client_phone=client_phone)


@app.route('/driver')
def driver_dashboard():
    if session.get('role') != 'chauffeur':
        return redirect('/chauffeur-login')

    # Query reservations
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM reservation WHERE statut != 'Annulée' ORDER BY horaire ASC")
    reservations = cursor.fetchall()

    chauffeur_id = session.get('chauffeur_id')
    cursor.execute("SELECT * FROM bus WHERE id_chauffeur = %s", (chauffeur_id,))
    buses = cursor.fetchall()

    return render_template('driver_dashboard.html', reservations=reservations, buses=buses)

@app.route('/driver/update_bus', methods=['POST'])
def update_bus_driver():
    if session.get('role') != 'chauffeur':
        return redirect('/chauffeur-login')

    id_bus = request.form.get('id_bus')
    status = request.form.get('status')

    cursor = mysql.connection.cursor()
    cursor.execute("UPDATE bus SET status=%s WHERE id_bus=%s", (status, id_bus))
    mysql.connection.commit()

    return redirect('/driver')


@app.route('/admin')
def admin_dashboard():
    if session.get('role') != 'admin':
        return redirect('/admin-login')
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM reservation ORDER BY horaire ASC, id DESC")
    reservations = cursor.fetchall()

    cursor.execute("select * from chauffeur order by id_chauffeur")
    chauffeur = cursor.fetchall()

    cursor.execute("SELECT * FROM bus ORDER BY id_bus")
    buses = cursor.fetchall()
    
    cursor.execute("SELECT SUM(places) FROM reservation WHERE statut != 'Annulée'")
    total_places = cursor.fetchone()[0] or 0
    revenus = total_places * 20

    return render_template('admin_dashboard.html', reservations=reservations, chauffeurs=chauffeur, buses=buses, revenus=revenus)


# =========================
# LOGOUT
# =========================
@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')


# =========================
# PAIEMENT
# =========================
@app.route('/paiement', methods=['GET', 'POST'])
def paiement():
    prix = request.form.get('prix')
    return render_template('client_paiement.html', prix=prix)


# =========================
# ADD CHAUFFEUR
# =========================
@app.route('/add_chauffeur', methods=['GET', 'POST'])
def add_chauffeur():
    if request.method == 'POST':
        nom = request.form.get('nom')
        prenom = request.form.get('prenom')
        telephone = request.form.get('telephone')
        id_chauffeur = request.form.get('id_chauffeur')
        password = request.form.get('password')
        num_permis = request.form.get('num_permis')

        cursor = mysql.connection.cursor()

        # 👉 NO HASH
        cursor.execute(
            "INSERT INTO chauffeur (id_chauffeur, nom, prenom, telephone, num_permis, password) VALUES (%s, %s, %s, %s, %s, %s)",
            (id_chauffeur, nom, prenom, telephone, num_permis, password)
        )

        mysql.connection.commit()
        cursor.close()

        return redirect('/admin')

    return render_template('add_chauffeur.html')


# =========================
# DELETE CHAUFFEUR
# =========================
@app.route('/delete_chauffeur/<id_chauffeur>', methods=['GET', 'POST'])
def delete_chauffeur(id_chauffeur):
    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM chauffeur WHERE id_chauffeur = %s", (id_chauffeur,))
    mysql.connection.commit()
    return redirect('/admin')



# =========================
# RUN
# =========================
if __name__ == "__main__":
    app.run(debug=True)