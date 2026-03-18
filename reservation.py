from flask import Blueprint, render_template, request, redirect, url_for

reservation_bp = Blueprint('reservation', __name__)

def init_reservation(mysql):

    # PAGE CLIENT (comme ton image)
    @reservation_bp.route('/reservation')
    def reservation():
        return render_template('reservation.html')

    # CREATE réservation
    @reservation_bp.route('/add_reservation', methods=['POST'])
    def add_reservation():

        ligne = request.form['ligne']
        arret = request.form['arret']
        horaire = request.form['horaire']
        nom = request.form['nom']
        places = request.form['places']
        telephone = request.form['telephone']
        paiement = request.form['paiement']

        cursor = mysql.connection.cursor()

        cursor.execute("""
            INSERT INTO reservation 
            (ligne, arret, horaire, nom, places, telephone, paiement)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
        """, (ligne, arret, horaire, nom, places, telephone, paiement))

        mysql.connection.commit()

        return "Réservation confirmée ✅"