from flask import Blueprint, render_template, request, redirect, url_for

chauffeur_bp = Blueprint('chauffeur', __name__)

def init_chauffeur(mysql):

    # LISTE
    @chauffeur_bp.route('/chauffeur')
    def chauffeur():
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM chauffeur")
        data = cursor.fetchall()
        return render_template('chauffeur.html', chauffeur=data)

    # AJOUT
    @chauffeur_bp.route('/add_chauffeur', methods=['POST'])
    def add_chauffeur():
        nom = request.form['nom']
        prenom = request.form['prenom']

        cursor = mysql.connection.cursor()
        cursor.execute(
            "INSERT INTO chauffeur (nom, prenom) VALUES (%s,%s)",
            (nom, prenom)
        )
        mysql.connection.commit()

        return redirect(url_for('chauffeur.chauffeur'))

    # EDIT PAGE
    @chauffeur_bp.route('/edit_chauffeur/<int:id>')
    def edit_chauffeur(id):
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM chauffeur WHERE id_chauffeur=%s", (id,))
        data = cursor.fetchone()
        return render_template('edit_chauffeur.html', chauffeur=data)

    # UPDATE
    @chauffeur_bp.route('/update_chauffeur/<int:id>', methods=['POST'])
    def update_chauffeur(id):
        nom = request.form['nom']
        prenom = request.form['prenom']

        cursor = mysql.connection.cursor()
        cursor.execute("""
            UPDATE chauffeur
            SET nom=%s,
                prenom=%s
            WHERE id_chauffeur=%s
        """, (nom, prenom, id))

        mysql.connection.commit()

        return redirect(url_for('chauffeur.chauffeur'))

    # DELETE
    @chauffeur_bp.route('/delete_chauffeur/<int:id>')
    def delete_chauffeur(id):
        cursor = mysql.connection.cursor()
        cursor.execute("DELETE FROM chauffeur WHERE id_chauffeur=%s", (id,))
        mysql.connection.commit()

        return redirect(url_for('chauffeur.chauffeur'))