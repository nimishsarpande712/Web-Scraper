// Chart.js Global Configuration
Chart.defaults.color = '#fff';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

function initializeCharts() {
    // Engagement Overview Chart
    new Chart(document.getElementById('mainEngagementChart'), {
        type: 'radar',
        data: {
            labels: ['Impressions', 'Clicks', 'Engagement', 'Shares', 'Comments'],
            datasets: [{
                label: 'Current Period',
                data: [85, 65, 75, 55, 60],
                fill: true,
                backgroundColor: 'rgba(0, 221, 235, 0.2)',
                borderColor: '#00ddeb',
                pointBackgroundColor: '#00ddeb'
            }]
        },
        options: {
            scales: {
                r: {
                    ticks: { backdropColor: 'transparent' }
                }
            }
        }
    });

    // Conversion Funnel Chart
    new Chart(document.getElementById('funnelChart'), {
        type: 'bar',
        data: {
            labels: ['Views', 'Clicks', 'Sign-ups', 'Purchases'],
            datasets: [{
                data: [1000, 400, 150, 50],
                backgroundColor: [
                    'rgba(0, 221, 235, 0.8)',
                    'rgba(0, 221, 235, 0.6)',
                    'rgba(0, 221, 235, 0.4)',
                    'rgba(0, 221, 235, 0.2)'
                ]
            }]
        },
        options: {
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Timeline Chart
    new Chart(document.getElementById('timelineChart'), {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Impressions',
                data: [1200, 1900, 1500, 2200, 1800, 2500, 2000],
                borderColor: '#00ddeb'
            }, {
                label: 'Conversions',
                data: [50, 90, 70, 110, 85, 120, 95],
                borderColor: '#b347ea'
            }]
        },
        options: {
            tension: 0.4
        }
    });

    // Add Demographics Chart
    new Chart(document.getElementById('demographicsChart'), {
        type: 'polarArea',
        data: {
            labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
            datasets: [{
                data: [30, 45, 25, 15, 10],
                backgroundColor: [
                    'rgba(0, 221, 235, 0.7)',
                    'rgba(179, 71, 234, 0.7)',
                    'rgba(0, 123, 255, 0.7)',
                    'rgba(255, 87, 51, 0.7)',
                    'rgba(46, 213, 115, 0.7)'
                ],
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.1)'
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `Age ${context.label}: ${context.raw}%`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });

    // Add Device Distribution Chart with detailed breakdown
    new Chart(document.getElementById('deviceChart'), {
        type: 'doughnut',
        data: {
            labels: [
                'Mobile (Android)',
                'Mobile (iOS)',
                'Desktop (Windows)',
                'Desktop (Mac)',
                'Tablet',
                'Other'
            ],
            datasets: [{
                data: [35, 25, 20, 12, 6, 2],
                backgroundColor: [
                    'rgba(0, 221, 235, 0.8)',
                    'rgba(179, 71, 234, 0.8)',
                    'rgba(0, 123, 255, 0.8)',
                    'rgba(255, 87, 51, 0.8)',
                    'rgba(46, 213, 115, 0.8)',
                    'rgba(255, 255, 255, 0.2)'
                ],
                borderColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 2
            }]
        },
        options: {
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeCharts);
