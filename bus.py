from flask import Blueprint, render_template, request, redirect, url_for

bus_bp = Blueprint('bus', __name__)

def init_bus(mysql):

    # LISTE
    @bus_bp.route('/bus')
    def bus():
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM bus")
        data = cursor.fetchall()
        return render_template('bus.html', bus=data)

    # PAGE AJOUT
    @bus_bp.route('/add_page')
    def add_page():
        return render_template('add_bus.html')

    # AJOUT
    @bus_bp.route('/add_bus', methods=['POST'])
    def add_bus():
        immatriculation = request.form['immatriculation']
        capacite = request.form['capacite']
        status = request.form['status']

        cursor = mysql.connection.cursor()
        cursor.execute(
            "INSERT INTO bus (immatriculation, capacite, status) VALUES (%s,%s,%s)",
            (immatriculation, capacite, status)
        )
        mysql.connection.commit()

        return redirect(url_for('bus.bus'))

    # EDIT PAGE
    @bus_bp.route('/edit_bus/<int:id>')
    def edit_bus(id):
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM bus WHERE id_bus=%s", (id,))
        data = cursor.fetchone()
        return render_template('edit_bus.html', bus=data)

    # UPDATE
    @bus_bp.route('/update_bus/<int:id>', methods=['POST'])
    def update_bus(id):
        immatriculation = request.form['immatriculation']
        capacite = request.form['capacite']
        status = request.form['status']

        cursor = mysql.connection.cursor()
        cursor.execute("""
            UPDATE bus
            SET immatriculation=%s,
                capacite=%s,
                status=%s
            WHERE id_bus=%s
        """, (immatriculation, capacite, status, id))

        mysql.connection.commit()

        return redirect(url_for('bus.bus'))

    # DELETE
    @bus_bp.route('/delete_bus/<int:id>')
    def delete_bus(id):
        cursor = mysql.connection.cursor()
        cursor.execute("DELETE FROM bus WHERE id_bus=%s", (id,))
        mysql.connection.commit()

        return redirect(url_for('bus.bus'))