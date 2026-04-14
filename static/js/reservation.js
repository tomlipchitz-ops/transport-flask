// ================= LOAD =================
async function loadReservations() {
    try {
        const res = await fetch('/api/reservations');

        if (!res.ok) throw new Error("Erreur chargement");

        const data = await res.json();

        const tbody = document.getElementById('reservationBody');

        if (!tbody) {
            console.error("tbody introuvable ❌");
            return;
        }

        tbody.innerHTML = data.data.map(r => `
            <tr data-id="${r.id}">
                <td>${r.id}</td>
                <td>${r.nom}</td>
                <td>${r.telephone}</td>
                <td>${r.ligne}</td>
                <td>${r.arret}</td>
                <td>${r.horaire}</td>
                <td>${r.places}</td>
                <td>${r.paiement}</td>
                <td>${r.statut ?? 'En attente'}</td>
                <td>
                    <button onclick="editReservation(${r.id})">✏️</button>
                    <button onclick="deleteReservation(${r.id})">🗑️</button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error(err);
        alert("Erreur chargement des réservations ❌");
    }
}


// ================= ADD =================
document.getElementById('formReservation').addEventListener('submit', async function(e) {
    e.preventDefault();

    const form = e.target;

    const data = {
        nom: form.nom.value,
        telephone: form.telephone.value,
        ligne: form.ligne.value,
        arret: form.arret.value,
        horaire: form.horaire.value,
        places: form.places.value,
        paiement: form.paiement.value
    };

    try {
        const res = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error("Erreur ajout");

        form.reset();
        loadReservations();

        alert("Réservation ajoutée ✅");

    } catch (err) {
        console.error(err);
        alert("Erreur ajout ❌");
    }
});


// ================= DELETE =================
async function deleteReservation(id) {

    if (!id) {
        console.error("ID undefined ❌");
        return;
    }

    if (!confirm("Supprimer cette réservation ?")) return;

    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) row.style.opacity = "0.5";

    try {
        const res = await fetch(`/api/reservations/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error("Erreur suppression");

        // animation suppression
        if (row) {
            row.style.transition = "0.3s";
            row.style.transform = "scale(0.9)";
            setTimeout(() => row.remove(), 300);
        }

        // reload sécurité
        setTimeout(loadReservations, 300);

    } catch (err) {
        console.error(err);
        alert("Erreur suppression ❌");

        if (row) row.style.opacity = "1";
    }
}


// ================= EDIT =================
function editReservation(id) {
    if (!id) return;

    const row = document.querySelector(`tr[data-id="${id}"]`);
    const cells = row.querySelectorAll('td');

    const nom       = cells[1].textContent;
    const telephone = cells[2].textContent;
    const ligne     = cells[3].textContent;
    const arret     = cells[4].textContent;
    const horaire   = cells[5].textContent;
    const places    = cells[6].textContent;
    const paiement  = cells[7].textContent;
    const statut    = cells[8].textContent;

    const newNom = prompt('Nom:', nom);
    if (newNom === null) return;
    const newTel     = prompt('Téléphone:', telephone);
    const newLigne   = prompt('Ligne (L1/L2/L3/L4):', ligne);
    const newArret   = prompt('Arrêt:', arret);
    const newHoraire = prompt('Horaire (HH:MM):', horaire);
    const newPlaces  = prompt('Places:', places);
    const newPaiement = prompt('Paiement (Espèces/Mobile/Carte):', paiement);
    const newStatut  = prompt('Statut (En attente/Confirmée/Annulée):', statut);

    fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nom: newNom, telephone: newTel, ligne: newLigne,
            arret: newArret, horaire: newHoraire, places: newPlaces,
            paiement: newPaiement, statut: newStatut
        })
    })
    .then(res => {
        if (!res.ok) throw new Error('Erreur');
        loadReservations();
    })
    .catch(() => alert('Erreur modification ❌'));
}
}


// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
    loadReservations();
});