var ctx_421 = document.getElementById("chart-bars-4-21").getContext("2d");
var ctx_423 = document.getElementById("chart-bars-4-23").getContext("2d");
var ctx_424 = document.getElementById("chart-bars-4-24").getContext("2d");

new Chart(ctx_421, {
type: "bar",
data: {
labels: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"],
datasets: [{
  label: "دما",
  tension: 0.4,
  borderWidth: 0,
  borderRadius: 4,
  borderSkipped: false,
  backgroundColor: "#fff",
  data: [21.8, 22, 21.9, 22.4, 25.3, 24.5, 24, 22],
  maxBarThickness: 6
}, ],
},
options: {
responsive: true,
maintainAspectRatio: false,
plugins: {
  legend: {
    display: false,
  }
},
interaction: {
  intersect: false,
  mode: 'index',
},
scales: {
  y: {
    grid: {
      drawBorder: false,
      display: false,
      drawOnChartArea: false,
      drawTicks: false,
    },
    ticks: {
      suggestedMin: 0,
      suggestedMax: 30,
      beginAtZero: true,
      padding: 15,
      font: {
        size: 14,
        family: "Open Sans",
        style: 'normal',
        lineHeight: 2
      },
      color: "#fff"
    },
  },
  x: {
    grid: {
      drawBorder: false,
      display: false,
      drawOnChartArea: false,
      drawTicks: false
    },
    ticks: {
      display: false
    },
  },
},
},
});
new Chart(ctx_423, {
type: "bar",
data: {
labels: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"],
datasets: [{
  label: "دما",
  tension: 0.4,
  borderWidth: 0,
  borderRadius: 4,
  borderSkipped: false,
  backgroundColor: "#fff",
  data: [21.4, 22.3, 21.9, 22.4, 25.3, 24.5, 24, 22],
  maxBarThickness: 6
}, ],
},
options: {
responsive: true,
maintainAspectRatio: false,
plugins: {
  legend: {
    display: false,
  }
},
interaction: {
  intersect: false,
  mode: 'index',
},
scales: {
  y: {
    grid: {
      drawBorder: false,
      display: false,
      drawOnChartArea: false,
      drawTicks: false,
    },
    ticks: {
      suggestedMin: 0,
      suggestedMax: 30,
      beginAtZero: true,
      padding: 15,
      font: {
        size: 14,
        family: "Open Sans",
        style: 'normal',
        lineHeight: 2
      },
      color: "#fff"
    },
  },
  x: {
    grid: {
      drawBorder: false,
      display: false,
      drawOnChartArea: false,
      drawTicks: false
    },
    ticks: {
      display: false
    },
  },
},
},
});
new Chart(ctx_424, {
type: "bar",
data: {
labels: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"],
datasets: [{
  label: "دما",
  tension: 0.4,
  borderWidth: 0,
  borderRadius: 4,
  borderSkipped: false,
  backgroundColor: "#fff",
  data: [21, 22.1, 21.7, 22.4, 25.6, 24.1, 24.4, 22.9],
  maxBarThickness: 6
}, ],
},
options: {
responsive: true,
maintainAspectRatio: false,
plugins: {
  legend: {
    display: false,
  }
},
interaction: {
  intersect: false,
  mode: 'index',
},
scales: {
  y: {
    grid: {
      drawBorder: false,
      display: false,
      drawOnChartArea: false,
      drawTicks: false,
    },
    ticks: {
      suggestedMin: 0,
      suggestedMax: 30,
      beginAtZero: true,
      padding: 15,
      font: {
        size: 14,
        family: "Open Sans",
        style: 'normal',
        lineHeight: 2
      },
      color: "#fff"
    },
  },
  x: {
    grid: {
      drawBorder: false,
      display: false,
      drawOnChartArea: false,
      drawTicks: false
    },
    ticks: {
      display: false
    },
  },
},
},
});
