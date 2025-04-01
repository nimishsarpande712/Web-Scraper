// Chart.js Global Configuration
Chart.defaults.color = '#fff';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

async function initializeCharts() {
    showLoadingState();

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const url = urlParams.get('url');

        if (!url) {
            renderFallbackData();
            return;
        }

        const storedData = localStorage.getItem('currentAnalysis');
        if (storedData) {
            const data = JSON.parse(storedData);
            const metrics = {
                impressions: parseInt(data.metrics.impressions.replace(/,/g, '')),
                ctr: parseFloat(data.metrics.ctr),
                conversions: parseInt(data.metrics.conversions.replace(/,/g, ''))
            };

            hideLoadingStates();
            renderAllCharts(metrics, {});
            updateMetaInfo(metrics);
            return;
        }

        const response = await fetch(`http://localhost:3000/scrape?url=${encodeURIComponent(url)}`);
        const result = await response.json();

        if (!result.status) {
            throw new Error('Failed to fetch data');
        }

        hideLoadingStates();
        renderAllCharts(result.metrics || {}, result.analytics || {});
        updateMetaInfo(result.metrics || {});

    } catch (error) {
        console.error('Chart initialization error:', error);
        renderFallbackData();
    }
}

function hideLoadingStates() {
    document.querySelectorAll('.chart-loading').forEach(loader => loader.style.display = 'none');
    document.querySelectorAll('canvas').forEach(canvas => canvas.style.display = 'block');
}

function renderAllCharts(metrics, analytics) {
    const engagementData = {
        impressions: metrics.impressions || 5000,
        clicks: Math.floor((metrics.impressions || 5000) * ((metrics.ctr || 2.5) / 100)),
        engagement: Math.floor((metrics.impressions || 5000) * 0.03),
        shares: Math.floor((metrics.impressions || 5000) * 0.01),
        comments: Math.floor((metrics.impressions || 5000) * 0.005)
    };

    renderEngagementChart(engagementData);
    renderConversionFunnel(metrics);
    renderTimelineChart(generateTimelineData(metrics.impressions || 5000));
    renderDeviceChart(getDeviceDistribution());
    renderDemographicsChart({
        '18-24': 25,
        '25-34': 35,
        '35-44': 20,
        '45-54': 12,
        '55+': 8
    });
    renderSocialMetricsChart(analytics?.socialMetrics || {});
}

function updateMetaInfo(metrics) {
    document.querySelector('.analytics-meta').innerHTML = `
        <div class="meta-item">
            <i class="fas fa-clock"></i>
            Last Updated: ${new Date().toLocaleString()}
        </div>
        <div class="meta-item">
            <i class="fas fa-chart-line"></i>
            CTR: ${metrics.ctr}%
        </div>
        <div class="meta-item">
            <i class="fas fa-users"></i>
            Conv. Rate: ${(metrics.conversions / metrics.impressions * 100).toFixed(2)}%
        </div>
    `;
}

function getSocialMediaType(url) {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('youtube.com')) return 'youtube';
    return 'general';
}

function getSiteName(url) {
    try {
        const domain = new URL(url).hostname;
        return domain.replace('www.', '').split('.')[0].charAt(0).toUpperCase() + 
               domain.replace('www.', '').split('.')[0].slice(1);
    } catch {
        return 'Website';
    }
}

function updateAnalyticsMeta(data) {
    const meta = document.querySelector('.analytics-meta');
    meta.innerHTML = `
        <div class="meta-item">
            <i class="fas fa-clock"></i>
            Last Updated: ${data.lastUpdated.toLocaleString()}
        </div>
        <div class="meta-item">
            <i class="fas fa-chart-line"></i>
            Platform: ${data.type === 'instagram' ? 'Instagram' : 
                       data.type === 'youtube' ? 'YouTube' : 'Website'}
        </div>
        <div class="meta-item">
            <i class="fas fa-eye"></i>
            Total Impressions: ${data.metrics.impressions.toLocaleString()}
        </div>
    `;
}

function renderFallbackData() {
    // Hide loading state first
    document.querySelectorAll('.chart-loading').forEach(loader => {
        loader.style.display = 'none';
    });

    // Show canvases
    document.querySelectorAll('canvas').forEach(canvas => {
        canvas.style.display = 'block';
    });

    const baseImpressions = 5000;
    const sampleData = {
        engagement: {
            impressions: baseImpressions,
            clicks: Math.floor(baseImpressions * 0.068),    // 6.8% CTR
            engagement: Math.floor(baseImpressions * 0.045), // 4.5% engagement
            shares: Math.floor(baseImpressions * 0.012),    // 1.2% shares
            comments: Math.floor(baseImpressions * 0.008)   // 0.8% comments
        },
        timeline: {
            daily: [12000, 14000, 11000, 16000, 13000, 15000, 14000]
        },
        demographics: {
            '18-24': 25,
            '25-34': 35,
            '35-44': 20,
            '45-54': 12,
            '55+': 8
        },
        devices: {
            android: 40,
            ios: 35,
            windows: 15,
            mac: 5,
            tablet: 3,
            other: 2
        }
    };

    renderEngagementChart(sampleData.engagement);
    renderTimelineChart(sampleData.timeline);
    renderDemographicsChart(sampleData.demographics);
    renderDeviceChart(sampleData.devices);

    document.querySelector('.analytics-meta').innerHTML = `
        <div class="meta-item">
            <i class="fas fa-clock"></i>
            Last Updated: ${new Date().toLocaleString()}
        </div>
        <div class="meta-item">
            <i class="fas fa-info-circle"></i>
            Showing Sample Data
        </div>
    `;
}

function showLoadingState() {
    // Hide all canvases first
    document.querySelectorAll('canvas').forEach(canvas => {
        canvas.style.display = 'none';
    });
    
    // Show loading animation
    document.querySelectorAll('.chart-loading').forEach(loader => {
        loader.style.display = 'flex';
    });
}

function showErrorState() {
    document.querySelectorAll('.chart-card').forEach(card => {
        card.innerHTML = `
            <div class="error-state">
                <h3>Error Loading Data</h3>
                <p>Please return to the main page and try again.</p>
            </div>
        `;
    });
}

function renderEngagementChart(data) {
    // Use actual metrics rather than recalculating
    const metrics = {
        impressions: data.impressions,
        clicks: data.clicks,
        engagement: data.engagement,
        shares: data.shares,
        comments: data.comments
    };

    new Chart(document.getElementById('mainEngagementChart'), {
        type: 'radar',
        data: {
            labels: ['Impressions', 'Clicks', 'Engagement', 'Shares', 'Comments'],
            datasets: [{
                label: 'Current Period',
                data: [
                    metrics.impressions,
                    metrics.clicks,
                    metrics.engagement,
                    metrics.shares,
                    metrics.comments
                ],
                fill: true,
                backgroundColor: 'rgba(0, 221, 235, 0.2)',
                borderColor: '#00ddeb',
                pointBackgroundColor: '#00ddeb'
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: { 
                        backdropColor: 'transparent',
                        stepSize: Math.ceil(metrics.impressions / 5)
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const value = context.raw;
                            return `${value.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });
}

function renderTimelineChart(data) {
    const dailyData = Array.isArray(data.daily) ? data.daily : generateTimelineData(data.impressions || 1500, 7);
    
    new Chart(document.getElementById('timelineChart'), {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Impressions',
                data: dailyData,
                borderColor: '#00ddeb',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(0, 221, 235, 0.1)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function renderConversionFunnel(data) {
    const impressions = data.impressions || 5000;
    const clicks = Math.floor(impressions * 0.068);  // Industry standard 6.8% CTR
    const signups = Math.floor(clicks * 0.25);      // 25% of clicks convert to signups
    const purchases = Math.floor(signups * 0.30);   // 30% of signups convert to purchases

    const conversions = [
        impressions,
        clicks,      
        signups,     
        purchases    
    ];

    new Chart(document.getElementById('funnelChart'), {
        type: 'bar',
        data: {
            labels: ['Views', 'Clicks', 'Sign-ups', 'Purchases'],
            datasets: [{
                data: conversions,
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
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const value = context.raw;
                            const percent = ((value / impressions) * 100).toFixed(1);
                            return `${value.toLocaleString()} (${percent}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function renderDemographicsChart(data) {
    new Chart(document.getElementById('demographicsChart'), {
        type: 'polarArea',
        data: {
            labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
            datasets: [{
                data: [
                    data['18-24'] || 30,
                    data['25-34'] || 35,
                    data['35-44'] || 20,
                    data['45-54'] || 10,
                    data['55+'] || 5
                ],
                backgroundColor: [
                    'rgba(0, 221, 235, 0.7)',
                    'rgba(179, 71, 234, 0.7)',
                    'rgba(0, 123, 255, 0.7)',
                    'rgba(255, 87, 51, 0.7)',
                    'rgba(46, 213, 115, 0.7)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function renderDeviceChart(data) {
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
                data: [
                    data.android || 0,
                    data.ios || 0,
                    data.windows || 0,
                    data.mac || 0,
                    data.tablet || 0,
                    data.other || 0
                ],
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

function renderSocialMetricsChart(data) {
    const youtube = data?.youtube || {};
    const instagram = data?.instagram || {};
    
    // Generate realistic data if none provided
    const defaultData = {
        youtube: {
            views: 1200,
            likes: 300,
            comments: 50,
            engagement: 4.5
        },
        instagram: {
            likes: 450,
            comments: 85,
            engagement: 5.2
        }
    };

    new Chart(document.getElementById('socialMetricsChart'), {
        type: 'bar',
        data: {
            labels: ['Views', 'Likes', 'Comments', 'Engagement Rate (%)'],
            datasets: [
                {
                    label: 'YouTube',
                    data: [
                        youtube.views || defaultData.youtube.views,
                        youtube.likes || defaultData.youtube.likes,
                        youtube.comments || defaultData.youtube.comments,
                        youtube.engagement || defaultData.youtube.engagement
                    ],
                    backgroundColor: 'rgba(255, 0, 0, 0.6)'
                },
                {
                    label: 'Instagram',
                    data: [
                        0,  // Instagram doesn't show views
                        instagram.likes || defaultData.instagram.likes,
                        instagram.comments || defaultData.instagram.comments,
                        instagram.engagement || defaultData.instagram.engagement
                    ],
                    backgroundColor: 'rgba(188, 42, 141, 0.6)'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

function addExportButtons() {
    const nav = document.querySelector('.analytics-nav');
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'export-buttons';
    buttonContainer.innerHTML = `
        <button onclick="exportCSV()" class="export-btn">
            <i class="fas fa-file-csv"></i> Export CSV
        </button>
        <button onclick="generateReport()" class="export-btn">
            <i class="fas fa-file-pdf"></i> Generate Report
        </button>
    `;
    nav.appendChild(buttonContainer);
}

async function exportCSV() {
    const url = new URLSearchParams(window.location.search).get('url');
    if (!url) return;
    
    try {
        const response = await fetch(`http://localhost:3000/export-csv?url=${encodeURIComponent(url)}`);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `analytics_${new Date().getTime()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('Failed to export CSV:', error);
        alert('Failed to export CSV file');
    }
}

async function generateReport() {
    const url = new URLSearchParams(window.location.search).get('url');
    if (!url) return;
    
    try {
        const response = await fetch(`http://localhost:3000/generate-report?url=${encodeURIComponent(url)}`);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `report_${new Date().getTime()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('Failed to generate report:', error);
        alert('Failed to generate PDF report');
    }
}

function generateTimelineData(baseValue, days = 7) {
    const data = [];
    for (let i = 0; i < days; i++) {
        const variance = 0.2;
        const value = baseValue * (1 + (Math.random() * variance - variance/2));
        data.push(Math.floor(value));
    }
    return { daily: data };
}

function getDeviceDistribution() {
    return {
        android: 35,
        ios: 30,
        windows: 20,
        mac: 10,
        tablet: 3,
        other: 2
    };
}

// Add to DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    showLoadingState();
    addExportButtons();
    initializeCharts();
});
