// ================= GLOBAL STATE =================
let chauffeurs = [];
let currentFilter = "";



// ================= SIDEBAR =================
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    document.body.classList.toggle('sidebar-collapsed');
});

// ================= NAVIGATION =================
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const pageTitle = document.getElementById('pageTitle');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();

        const target = this.dataset.section;

        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');

        sections.forEach(sec => sec.classList.remove('active'));
        document.getElementById('section-' + target).classList.add('active');

        pageTitle.textContent = this.innerText;
    });
});

// ================= MODAL =================
function openModal(id) {
    document.getElementById(id).classList.add('open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('open');
    });
});

// ================= RENDER =================
function renderChauffeurs(list = null) {
    const tbody = document.getElementById('chauffeurBody');
    const data = list || chauffeurs;

    tbody.innerHTML = data.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>${c.nom}</td>
            <td>${c.prenom}</td>
            <td>${c.telephone || '-'}</td>
            <td>${c.permis || '-'}</td>
            <td><span class="badge confirmed">${c.statut}</span></td>
            <td class="actions-cell">
                <button class="icon-btn edit" onclick="editChauffeur('${c.id}')">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="icon-btn delete" onclick="deleteChauffeur('${c.id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ================= FILTER =================
function applyFilter() {
    if (!currentFilter) {
        renderChauffeurs();
        return;
    }

    const filtered = chauffeurs.filter(c =>
        c.nom.toLowerCase().includes(currentFilter) ||
        c.prenom.toLowerCase().includes(currentFilter) ||
        c.id.toLowerCase().includes(currentFilter)
    );

    renderChauffeurs(filtered);
}

document.getElementById('filterChauffeurs').addEventListener('input', function() {
    currentFilter = this.value.toLowerCase();
    applyFilter();
});

// ================= ADD / UPDATE =================
let editMode = false;
let editId = null;

function submitAddChauffeur() {
    const form = document.getElementById('formAddChauffeur');

    const chauffeur = {
        id: form.id_chauffeur.value.trim(),
        nom: form.nom.value.trim(),
        prenom: form.prenom.value.trim(),
        telephone: form.telephone.value.trim(),
        permis: form.num_permis.value.trim(),
        statut: 'Actif'
    };

    if (!chauffeur.id || !chauffeur.nom || !chauffeur.prenom) {
        alert("Veuillez remplir les champs !");
        return;
    }

    // UPDATE MODE
    if (editMode) {
        chauffeurs = chauffeurs.map(c =>
            c.id === editId ? chauffeur : c
        );

        editMode = false;
        editId = null;
    }
    // ADD MODE
    else {
        if (chauffeurs.find(c => c.id === chauffeur.id)) {
            alert("ID déjà existe !");
            return;
        }
        chauffeurs.push(chauffeur);
    }

    form.reset();
    closeModal('modal-add-chauffeur');
    applyFilter();
}

// ================= DELETE =================
function deleteChauffeur(id) {
    if (!confirm("Supprimer ce chauffeur ?")) return;

    chauffeurs = chauffeurs.filter(c => c.id !== id);
    applyFilter();
}

// ================= EDIT =================
function editChauffeur(id) {
    const c = chauffeurs.find(x => x.id === id);
    if (!c) return;

    const form = document.getElementById('formAddChauffeur');

    form.id_chauffeur.value = c.id;
    form.nom.value = c.nom;
    form.prenom.value = c.prenom;
    form.telephone.value = c.telephone;
    form.num_permis.value = c.permis;

    editMode = true;
    editId = id;

    openModal('modal-add-chauffeur');
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
    renderChauffeurs();
});

// ================= DELETE RESERVATION =================
function deleteReservation(id) {

    console.log("DELETE CLICKED:", id);

    if (!confirm("Supprimer cette réservation ?")) return;

    fetch(`/api/reservations/${id}`, {
        method: "DELETE"
    })
    .then(res => {
        if (!res.ok) throw new Error("Erreur");

        console.log("Deleted OK ✅");

        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) row.remove();
    })
    .catch(err => {
        console.error(err);
        alert("Erreur suppression ❌");
    });
}

// ================= RAPPORTS & CSV =================
function exportCSV() {
    let csv = [];
    // We target the reservations table inside section-reservations
    const rows = document.querySelectorAll("#section-reservations table tr");
    if(!rows || rows.length === 0) {
        alert("Aucune donnée à exporter");
        return;
    }
    
    for (let i = 0; i < rows.length; i++) {
        let row = [], cols = rows[i].querySelectorAll("td, th");
        // Skip the "Actions" column which is the last one
        for (let j = 0; j < cols.length - 1; j++) {
            row.push('"' + cols[j].innerText.replace(/"/g, '""').trim() + '"');
        }
        csv.push(row.join(","));
    }
    
    const csvFile = new Blob(["\ufeff" + csv.join("\n")], {type: "text/csv;charset=utf-8;"});
    const downloadLink = document.createElement("a");
    downloadLink.download = "rapport_reservations.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// ================= CHART JS INIT =================
document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('activityChart');
    if(ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [{
                    label: 'Réservations de la semaine',
                    data: [12, 19, 3, 17, 28, 24, 15],
                    borderColor: '#1dd1a1',
                    backgroundColor: 'rgba(29, 209, 161, 0.2)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { borderDash: [5, 5], color: '#eef2f7' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }
});