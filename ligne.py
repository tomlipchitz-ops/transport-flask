from flask import Blueprint, render_template, request, redirect, url_for

ligne_bp = Blueprint('ligne', __name__)

def init_ligne(mysql):

    # LISTE
    @ligne_bp.route('/ligne')
    def ligne():
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM ligne")
        data = cursor.fetchall()
        return render_template('ligne.html', ligne=data)

    # PAGE AJOUT
    @ligne_bp.route('/add_ligne_page')
    def add_ligne_page():
        return render_template('add_ligne.html')

    # AJOUT
    @ligne_bp.route('/add_ligne', methods=['POST'])
    def add_ligne():
        nom = request.form['nom']
        depart = request.form['depart']
        arrive = request.form['arrive']

        cursor = mysql.connection.cursor()
        cursor.execute(
            "INSERT INTO ligne (nom_ligne, depart, arrive) VALUES (%s,%s,%s)",
            (nom, depart, arrive)
        )
        mysql.connection.commit()

        return redirect(url_for('ligne.ligne'))

    # EDIT PAGE
    @ligne_bp.route('/edit_ligne/<int:id>')
    def edit_ligne(id):
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM ligne WHERE id_ligne=%s", (id,))
        data = cursor.fetchone()
        return render_template('edit_ligne.html', ligne=data)

    # UPDATE
    @ligne_bp.route('/update_ligne/<int:id>', methods=['POST'])
    def update_ligne(id):
        nom = request.form['nom']
        depart = request.form['depart']
        arrive = request.form['arrive']

        cursor = mysql.connection.cursor()
        cursor.execute("""
            UPDATE ligne
            SET nom_ligne=%s,
                depart=%s,
                arrive=%s
            WHERE id_ligne=%s
        """, (nom, depart, arrive, id))

        mysql.connection.commit()

        return redirect(url_for('ligne.ligne'))

    # DELETE
    @ligne_bp.route('/delete_ligne/<int:id>')
    def delete_ligne(id):
        cursor = mysql.connection.cursor()
        cursor.execute("DELETE FROM ligne WHERE id_ligne=%s", (id,))
        mysql.connection.commit()

        return redirect(url_for('ligne.ligne'))