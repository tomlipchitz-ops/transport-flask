// ACTIVE MENU
document.querySelectorAll(".sidebar li").forEach(item => {
    item.addEventListener("click", () => {
        document.querySelectorAll(".sidebar li").forEach(i => i.classList.remove("active"));
        item.classList.add("active");
    });
});

// COUNTER
document.querySelectorAll(".card p").forEach(counter => {
    let target = +counter.dataset.value;
    let count = 0;

    let interval = setInterval(() => {
        count += Math.ceil(target / 50);
        if (count >= target) {
            count = target;
            clearInterval(interval);
        }
        counter.innerText = count;
    }, 20);
});

// CHART
const ctx = document.getElementById("chart");

new Chart(ctx, {
    type: "line",
    data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
            data: [10, 30, 20, 40, 35, 50],
            borderColor: "#2d2dff",
            backgroundColor: "rgba(45,45,255,0.2)",
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        plugins: { legend: { display: false } }
    }
});