/* SWITCH LOGIN / SIGNUP */
function showLogin() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("signupForm").style.display = "none";

    document.getElementById("loginTab").classList.add("active");
    document.getElementById("signupTab").classList.remove("active");
}

function showSignup() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "block";

    document.getElementById("signupTab").classList.add("active");
    document.getElementById("loginTab").classList.remove("active");
}

/* VALIDATION EN TEMPS RÉEL */
function checkNumber(inputId, errorId) {
    let input = document.getElementById(inputId);
    let error = document.getElementById(errorId);

    input.addEventListener("input", function () {

        // bloquer lettres
        this.value = this.value.replace(/\D/g, '');

        let value = this.value;

        // règle : commence par 2/3/4 et 8 chiffres
        let regex = /^[234]\d{7}$/;

        if (!regex.test(value)) {
            error.innerText = "Numéro invalide";
            error.style.display = "block";
        } else {
            error.style.display = "none";
        }
    });
}

/* ACTIVER VALIDATION */
checkNumber("loginTel", "loginError");
checkNumber("signupTel", "signupError");
