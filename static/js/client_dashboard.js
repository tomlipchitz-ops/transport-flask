'use strict';

document.addEventListener("DOMContentLoaded", function () {

    console.log("JS WORKING ✅");

    /* ═══════════════════════════════════════
       STATE (UI only)
    ═══════════════════════════════════════ */
    const state = {
        solde: 45,
        trajets: 12
    };

    /* ═══════════════════════════════════════
       DOM HELPERS
    ═══════════════════════════════════════ */
    const $ = id => document.getElementById(id);

    /* Elements */
    const form            = document.querySelector("form");
    const dateDisplay     = $('date-display');
    const soldeDisplay    = $('solde-display');
    const trajetsDisplay  = $('trajets-display');
    const historyList     = $('history-list');

    const inputDepart     = $('input-depart');
    const inputArrivee    = $('input-arrivee');
    const inputTel        = $('input-tel');
    const inputHoraire    = $('input-horaire');

    const bookingMsg      = $('booking-msg');

    /* ═══════════════════════════════════════
       DATE SYSTEM
    ═══════════════════════════════════════ */
    function updateDate() {
        const now = new Date();

        const str = now.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        if (dateDisplay) {
            dateDisplay.textContent =
                str.charAt(0).toUpperCase() + str.slice(1) + " — Bonjour 👋";
        }
    }

    updateDate();
    setInterval(updateDate, 60000);

    /* ═══════════════════════════════════════
       STATS DISPLAY
    ═══════════════════════════════════════ */
    function refreshStats() {
        if (soldeDisplay)   soldeDisplay.textContent = state.solde + " MRU";
        if (trajetsDisplay) trajetsDisplay.textContent = state.trajets;
    }

    refreshStats();

    /* ═══════════════════════════════════════
       MESSAGE SYSTEM
    ═══════════════════════════════════════ */
    function showMessage(text, type = "error") {
        if (!bookingMsg) return;

        bookingMsg.textContent = text;
        bookingMsg.className = "booking-msg " + type;
        bookingMsg.classList.remove("hidden");

        setTimeout(() => {
            bookingMsg.classList.add("hidden");
        }, 4000);
    }

    /* ═══════════════════════════════════════
       VALIDATION
    ═══════════════════════════════════════ */
    function validateForm() {

        if (!inputDepart || !inputArrivee || !inputTel || !inputHoraire) {
            console.error("Inputs not found ❌");
            return false;
        }

        const dep  = inputDepart.value.trim();
        const arr  = inputArrivee.value.trim();
        const tel  = inputTel.value.trim();
        const hor  = inputHoraire.value;

        if (!dep || !arr || !tel || !hor) {
            showMessage("Veuillez remplir tous les champs ❌");
            return false;
        }

        if (dep === arr) {
            showMessage("Départ et arrivée doivent être différents ❌");
            return false;
        }

        if (!/^\d+$/.test(tel)) {
            showMessage("Numéro invalide ❌");
            return false;
        }

        if (tel.length !== 8) {
            showMessage("Le numéro doit contenir 8 chiffres ❌");
            return false;
        }

        if (!['2','3','4'].includes(tel[0])) {
            showMessage("Numéro invalide ❌ (2,3 ou 4)");
            return false;
        }

        return true;
    }

    /* ═══════════════════════════════════════
       FORM SUBMIT (FLASK)
    ═══════════════════════════════════════ */
    if (form) {
        form.addEventListener("submit", function(e){

            if (!validateForm()) {
                e.preventDefault();
                return;
            }

            showMessage("Traitement en cours...", "success");

        });
    }

    /* ═══════════════════════════════════════
       LIVE PHONE VALIDATION
    ═══════════════════════════════════════ */
    if (inputTel) {
        inputTel.addEventListener("input", () => {

            let value = inputTel.value.replace(/\D/g, '');

            if (value.length > 8) value = value.slice(0, 8);

            inputTel.value = value;
        });
    }

    /* ═══════════════════════════════════════
       SIDEBAR ACTIVE
    ═══════════════════════════════════════ */
    document.querySelectorAll('.nav-icon').forEach(el => {
        el.addEventListener('click', function () {

            document.querySelectorAll('.nav-icon')
                .forEach(i => i.classList.remove('active'));

            this.classList.add('active');
        });
    });

    /* ═══════════════════════════════════════
       SAFE HTML
    ═══════════════════════════════════════ */
    function escapeHTML(str) {
        return str
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;');
    }
    const btnOpen = $('btn-open-payment');

if (btnOpen) {
    btnOpen.addEventListener("click", function () {

        console.log("CLICK DETECTED ✅");

        if (!validateForm()) return;

        showMessage("Paiement lancé 💳", "success");

        // 👉 OPTION: redirect to Flask
        window.location.href = "/paiement";
    });
}

});