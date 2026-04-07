function payer() {
    let numero = document.getElementById("numero").value;
    let message = document.getElementById("message");

    // Vérification 8 chiffres
    if (!/^\d{8}$/.test(numero)) {
        message.style.color = "red";
        message.innerText = "❌ Numéro invalide (8 chiffres)";
        return;
    }

    // Simulation paiement
    message.style.color = "orange";
    message.innerText = "⏳ Paiement en cours...";

    setTimeout(() => {
        message.style.color = "lightgreen";
        message.innerText = "✅ Paiement réussi ! Réservation confirmée.";

        // redirection automatique
        setTimeout(() => {
            window.location.href = "/client";
        }, 2000);

    }, 2000);
}