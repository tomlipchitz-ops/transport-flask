from flask import Blueprint, render_template, request, redirect

reservation_bp = Blueprint('reservation', __name__)

def init_reservation(mysql):

    @reservation_bp.route('/reservation')
    def reservation():
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM reservation ORDER BY id DESC")
        reservations = cursor.fetchall()
        return render_template('reservation.html', reservations=reservations)

    @reservation_bp.route('/edit_reservation/<int:id>' )
    def edit_reservation(id):
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM reservation WHERE id = %s", (id,))
        reservation = cursor.fetchone()
        return render_template('edit_reservation.html', reservation=reservation)

    @reservation_bp.route('/update_reservation/<int:id>', methods=['POST'])
    def update_reservation(id):
        cursor = mysql.connection.cursor()
        cursor.execute("""
            UPDATE reservation
            SET ligne=%s, arret=%s, horaire=%s, nom=%s, places=%s,
                telephone=%s, paiement=%s, statut=%s
            WHERE id=%s
        """, (
            request.form['ligne'], request.form['arret'],
            request.form['horaire'], request.form['nom'],
            request.form['places'], request.form['telephone'],
            request.form['paiement'], request.form['statut'], id
        ))
        mysql.connection.commit()
        return redirect('/admin')

    @reservation_bp.route('/add_reservation', methods=['POST'])
    def add_reservation():
        cursor = mysql.connection.cursor()
        cursor.execute("""
            INSERT INTO reservation (ligne, arret, horaire, nom, places, telephone, paiement, statut)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """, (request.form.get('ligne'), request.form.get('arret'), 
              request.form.get('horaire'), request.form.get('nom'),
              request.form.get('places'), request.form.get('telephone'), 
              request.form.get('paiement'), 'confirmé'))
        mysql.connection.commit()
        return redirect('/admin')

    @reservation_bp.route('/api/client_reserve', methods=['POST'])
    def client_reserve():
        from flask import jsonify
        data = request.json
        ligne = data.get('ligne', 'Ligne Principale')
        arret = data.get('arret')
        horaire = data.get('horaire')
        places = data.get('places', 1)
        telephone = data.get('telephone')
        paiement = data.get('paiement')
        nom = data.get('nom', 'Réservation App') 

        cursor = mysql.connection.cursor()
        cursor.execute("""
            INSERT INTO reservation (ligne, arret, horaire, nom, places, telephone, paiement, statut)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """, (ligne, arret, horaire, nom, places, telephone, paiement, 'Confirmée'))
        mysql.connection.commit()
        return jsonify({"success": True})

    @reservation_bp.route('/delete_reservation/<int:id>', methods=['POST', 'GET'])
    def delete_reservation(id):
        cursor = mysql.connection.cursor()
        cursor.execute("DELETE FROM reservation WHERE id = %s", (id,))
        mysql.connection.commit()
        return redirect('/admin')