document.addEventListener('DOMContentLoaded', () => {
    const dataContainer = document.getElementById('data-container');
    const refreshBtn = document.getElementById('refresh-btn');
    const analyticCards = document.querySelectorAll('.analytic-card');
    const impressionsElement = document.getElementById('impressions');
    const ctrElement = document.getElementById('ctr');
    const conversionsElement = document.getElementById('conversions');
    const urlInput = document.getElementById('url-input');
    const scrapeBtn = document.getElementById('scrape-btn');
    const serverIndicator = document.getElementById('server-indicator');
    const geminiIndicator = document.getElementById('gemini-indicator');

    // Staggered Animation for Analytics Cards
    gsap.fromTo(analyticCards, 
        { opacity: 0, y: 30 },
        { 
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            stagger: 0.15,
            ease: "power2.out"
        }
    );

    // GSAP Animation for Button (Modernized Glow Effect)
    gsap.to(refreshBtn, {
        boxShadow: "0 8px 30px rgba(0, 221, 235, 0.6)",
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    // Enhanced Framer Motion for Hover Effects
    const animateButton = () => {
        const { animate } = window.framer;
        animate(refreshBtn, { scale: 1.05, y: -5 }, { duration: 0.3, type: "spring", stiffness: 400 });
    };

    const resetButton = () => {
        const { animate } = window.framer;
        animate(refreshBtn, { scale: 1, y: 0 }, { duration: 0.3, type: "spring", stiffness: 400 });
    };

    refreshBtn.addEventListener('mouseover', animateButton);
    refreshBtn.addEventListener('mouseout', resetButton);

    // Enhanced API Status Check
    async function checkAPIStatus() {
        try {
            const response = await fetch('http://localhost:3000/status');
            const data = await response.json();
            
            // Update server status indicators
            serverIndicator.textContent = `Server: ${data.status}`;
            serverIndicator.className = `status-indicator online`;
            
            // Update Gemini status
            geminiIndicator.textContent = `Gemini API: ${data.geminiAPI ? 'Connected' : 'Disconnected'}`;
            geminiIndicator.className = `status-indicator ${data.geminiAPI ? 'online' : 'offline'}`;
            
            // Update server status in data container with suggestions
            if (!urlInput.value.trim()) {
                dataContainer.innerHTML = `
                    <div class="server-status-message">
                        <p class="status online">Server Status: Online</p>
                        <p>Enter a URL and click Scrape Data to begin...</p>
                        ${generateUrlSuggestions()}
                    </div>
                `;
            }

            return true; // Server is online
        } catch (error) {
            console.error('Server connection failed:', error);
            serverIndicator.textContent = 'Server: Offline';
            serverIndicator.className = 'status-indicator offline';
            
            // Show offline status in data container
            dataContainer.innerHTML = `
                <div class="server-status-message">
                    <p class="status offline">Server Status: Offline</p>
                    <p>Please make sure the server is running...</p>
                </div>
            `;
            return false; // Server is offline
        }
    }

    // Add helper function to generate URL suggestions
    function generateUrlSuggestions() {
        return `
            <div class="suggestions-container" style="margin-top: 20px;">
                <h4 style="color: #00ddeb; margin-bottom: 15px;">Try these sample URLs:</h4>
                <ul class="suggestion-list" style="list-style: none; padding: 0;">
                    <li onclick="document.getElementById('url-input').value='https://www.amazon.com/dp/B08N5KWB9H'">
                        Amazon Product Page
                    </li>
                    <li onclick="document.getElementById('url-input').value='https://www.instagram.com/nike'">
                        Instagram Business Page
                    </li>
                    <li onclick="document.getElementById('url-input').value='https://medium.com/topic/technology'">
                        Blog Article
                    </li>
                </ul>
            </div>
        `;
    }

    // Add these styles to handle server status messages
    const style = document.createElement('style');
    style.textContent = `
        .server-status-message {
            text-align: center;
            padding: 20px;
        }
        .server-status-message .status {
            font-size: 1.2rem;
            margin-bottom: 10px;
            font-weight: 500;
        }
        .server-status-message .status.online {
            color: #2ed573;
        }
        .server-status-message .status.offline {
            color: #ff4757;
        }
    `;
    document.head.appendChild(style);

    // Reset analytics to zero initially
    function resetAnalytics() {
        impressionsElement.textContent = '0';
        ctrElement.textContent = '0%';
        conversionsElement.textContent = '0';
    }

    // Update analytics based on scraped data
    function updateAnalyticsFromContent(content, url) {
        // Calculate metrics based on content and URL type
        const wordCount = content.split(' ').length;
        const qualityScore = Math.min(1, wordCount / 400); // Cap at 400 words

        // Determine URL type for accurate metrics
        const urlType = url.includes('product') || url.includes('shop') ? 'ecommerce' : 
                       url.includes('blog') ? 'content' : 'general';
        
        const metrics = {
            ecommerce: { ctr: 6.8, conv: 3.5 },
            content: { ctr: 4.2, conv: 2.5 },
            general: { ctr: 3.5, conv: 1.8 }
        }[urlType];

        // Calculate base metrics
        const impressions = Math.floor(5000 + (qualityScore * 15000));
        const clicks = Math.floor(impressions * (metrics.ctr / 100));
        const conversions = Math.floor(clicks * (metrics.conv / 100));

        // Update display
        impressionsElement.textContent = impressions.toLocaleString();
        ctrElement.textContent = `${metrics.ctr}%`;
        conversionsElement.textContent = conversions.toLocaleString();

        // Animate update
        gsap.from(analyticCards, {
            scale: 0.95,
            duration: 0.5,
            opacity: 0.5,
            stagger: 0.1,
            ease: "back.out"
        });

        return { impressions, ctr: metrics.ctr, conversions };
    }

    // Add URL suggestions
    const urlSuggestions = [
        {
            type: "E-commerce",
            urls: [
                "amazon.com/product-page",
                "shopify.com/store-name",
                "etsy.com/shop"
            ],
            tip: "E-commerce sites often have high conversion rates"
        },
        {
            type: "Social Media",
            urls: [
                "instagram.com/business",
                "facebook.com/business",
                "linkedin.com/company"
            ],
            tip: "Social media ads typically have good engagement"
        },
        {
            type: "Blog/Content",
            urls: [
                "medium.com/article",
                "wordpress.com/blog",
                "blogger.com/post"
            ],
            tip: "Content sites are great for long-term engagement"
        }
    ];

    function showSuggestions() {
        const suggestionHTML = `
            <div class="suggestions-container">
                <h3 class="section-title">Try These Sample URLs</h3>
                ${urlSuggestions.map(category => `
                    <div class="suggestion-category">
                        <h4>${category.type}</h4>
                        <ul class="suggestion-list">
                            ${category.urls.map(url => `
                                <li onclick="document.getElementById('url-input').value='${url}'">${url}</li>
                            `).join('')}
                        </ul>
                        <p class="suggestion-tip">${category.tip}</p>
                    </div>
                `).join('')}
                <div class="suggestion-help">
                    <p>Click any URL to autofill the input field</p>
                    <p>Enter your URL above and click "Scrape Ads" to begin analysis</p>
                </div>
            </div>
        `;

        dataContainer.innerHTML = suggestionHTML;
    }

    // Replace fetchScrapedData function
    async function fetchScrapedData() {
        const url = urlInput.value.trim();
        
        if (!url) {
            showSuggestions();
            resetAnalytics();
            return;
        }

        // Clear old cache if it's been more than 1 hour
        const cachedData = localStorage.getItem(`metrics_${url}`);
        if (cachedData) {
            const data = JSON.parse(cachedData);
            if (Date.now() - data.timestamp > 3600000) {
                localStorage.removeItem(`metrics_${url}`);
            }
        }

        dataContainer.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Processing URL...</p>
            </div>
        `;
        scrapeBtn.disabled = true;

        try {
            const response = await fetch(`http://localhost:3000/scrape?url=${encodeURIComponent(url)}`);
            const result = await response.json();

            if (result.metrics) {
                const metrics = {
                    impressions: parseInt(result.metrics.impressions) || 0,
                    clicks: parseInt(result.metrics.clicks) || 0,
                    conversions: parseInt(result.metrics.conversions) || 0
                };

                // Use the server's CTR if available; otherwise calculate
                const serverCtr = parseFloat(result.metrics.ctr);
                const ctr = !isNaN(serverCtr)
                    ? serverCtr.toFixed(2)
                    : (metrics.impressions > 0
                        ? ((metrics.clicks / metrics.impressions) * 100).toFixed(2)
                        : "0.00");

                impressionsElement.textContent = metrics.impressions.toLocaleString();
                ctrElement.textContent = `${ctr}%`;
                conversionsElement.textContent = metrics.conversions.toLocaleString();

                updatePerformanceCharts({
                    impressions: metrics.impressions,
                    clicks: metrics.clicks,
                    conversions: metrics.conversions,
                    ctr: parseFloat(ctr)
                });
            }

            let analysisContent = '';
            if (result.data && result.data.length > 0) {
                analysisContent = result.data.map(item => `<p>${item}</p>`).join('');
            } else {
                analysisContent = '<p>Analysis data not available.</p>';
            }

            dataContainer.innerHTML = `
                <div class="analysis-result">
                    <h3 class="section-title">Content Analysis</h3>
                    ${analysisContent}
                </div>
            `;

        } catch (error) {
            console.warn('Error fetching data:', error);
            resetAnalytics(); // Reset to zero on error
            dataContainer.innerHTML = `
                <div class="analysis-result">
                    <h3 class="section-title">Error</h3>
                    <p>Unable to fetch data. Please try again.</p>
                </div>
            `;
        } finally {
            scrapeBtn.disabled = false;
        }
    }

    // Add helper function for metric validation
    function validateMetric(value, fallback = 0) {
        const num = parseFloat(value);
        return !isNaN(num) && isFinite(num) ? num : fallback;
    }

    // Add styles for suggestions
    const suggestionStyles = `
        .suggestions-container {
            padding: 20px;
            text-align: left;
        }
        .suggestion-category {
            margin: 20px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            transition: all 0.3s ease;
        }
        .suggestion-category:hover {
            background: rgba(0, 221, 235, 0.1);
            transform: translateX(5px);
        }
        .suggestion-category h4 {
            color: #00ddeb;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        .suggestion-list {
            list-style: none;
            margin: 10px 0;
        }
        .suggestion-list li {
            color: #fff;
            padding: 8px 0;
            cursor: pointer;
            transition: color 0.3s ease;
        }
        .suggestion-list li:hover {
            color: #00ddeb;
        }
        .suggestion-tip {
            color: #aaa;
            font-size: 0.9rem;
            margin-top: 10px;
            font-style: italic;
        }
        .suggestion-help {
            margin-top: 20px;
            text-align: center;
            color: #888;
            font-size: 0.9rem;
        }
    `;

    // Add the styles to the existing style element
    style.textContent += suggestionStyles;

    // Add these styles for better error presentation
    const additionalStyles = `
        .suggestion-list {
            margin: 15px 0;
            padding-left: 20px;
        }
        .suggestion-list li {
            color: #aaa;
            margin: 8px 0;
        }
        .ad-images-section {
            margin-bottom: 30px;
        }
    `;

    style.textContent += additionalStyles;

    // Show suggestions on initial load
    showSuggestions();

    // Initial Fetch
    fetchScrapedData();

    // Refresh Button Event
    refreshBtn.addEventListener('click', fetchScrapedData);

    // Initialize with zero values
    resetAnalytics();

    // Chart Button Toggles
    const chartBtns = document.querySelectorAll('.chart-btn');
    chartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chartBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Update event listeners
    scrapeBtn.addEventListener('click', fetchScrapedData);
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchScrapedData();
    });

    // Initialize with API status check
    checkAPIStatus();
    const statusCheckInterval = setInterval(checkAPIStatus, 5000); // Check every 5 seconds

    // Cleanup on page unload
    window.addEventListener('unload', () => {
        clearInterval(statusCheckInterval);
    });

    initializeMiniCharts();

    document.querySelector('.view-details-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        const url = urlInput.value.trim();
        
        if (!url) {
            alert('Please enter and analyze a URL first');
            return;
        }

        // Store the current metrics and analytics data
        const currentData = {
            url: url,
            metrics: {
                impressions: impressionsElement.textContent,
                ctr: ctrElement.textContent,
                conversions: conversionsElement.textContent
            },
            lastUpdated: new Date().toISOString()
        };

        // Store data in localStorage instead of sessionStorage for better persistence
        localStorage.setItem('currentAnalysis', JSON.stringify(currentData));
        window.location.href = `analytics.html?url=${encodeURIComponent(url)}`;
    });

    // Display original metrics on page load
    document.getElementById('original-impressions').textContent = '10000';
    document.getElementById('original-ctr').textContent = '2.5%';
    document.getElementById('original-conversions').textContent = '250';
});

function initializeMiniCharts() {
    // Engagement Chart
    new Chart(document.getElementById('engagementChart'), {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            datasets: [{
                label: 'Engagement Rate',
                data: [4.5, 5.2, 4.8, 5.5, 5.9],
                borderColor: '#00ddeb',
                tension: 0.4
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            }
        }
    });

    // Conversion Chart
    new Chart(document.getElementById('conversionChart'), {
        type: 'doughnut',
        data: {
            labels: ['Converted', 'Pending', 'Lost'],
            datasets: [{
                data: [65, 20, 15],
                backgroundColor: [
                    '#00ddeb',
                    '#b347ea',
                    'rgba(255, 255, 255, 0.1)'
                ]
            }]
        },
        options: {
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateAnalyticsDisplay(result) {
    if (result.data && result.data.length > 0) {
        const images = result.images || [];
        dataContainer.innerHTML = `
            <div class="analysis-result">
                <h3 class="section-title">Advertisement Images</h3>
                <div class="ad-images-grid">
                    ${images.map(img => `
                        <div class="ad-image-card">
                            <img src="${img.url}" alt="${img.alt}" onerror="this.src='placeholder.png'">
                            <p class="image-caption">${img.alt}</p>
                        </div>
                    `).join('')}
                </div>
                <h3 class="section-title">Analysis Results</h3>
                ${result.data.map(item => `<p>${item}</p>`).join('')}
            </div>
        `;
    }
}

// Add chart update function
function updatePerformanceCharts(metrics, period = 'weekly') {
    const dates = period === 'weekly' 
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    const baseValue = metrics.impressions || 1000;
    const variance = 0.2; // 20% variance

    // Generate realistic data based on actual metrics
    const generateData = (base) => {
        return dates.map(() => base * (1 + (Math.random() * variance - variance/2)));
    };

    const engagementChart = Chart.getChart('engagementChart');
    if (engagementChart) {
        engagementChart.data.labels = dates;
        engagementChart.data.datasets[0].data = generateData(metrics.ctr);
        engagementChart.update();
    }

    const conversionChart = Chart.getChart('conversionChart');
    if (conversionChart) {
        conversionChart.data.datasets[0].data = [
            metrics.impressions * 0.65,
            metrics.impressions * 0.25,
            metrics.impressions * 0.1
        ];
        conversionChart.update();
    }
}

// Update the chart period handler
document.querySelectorAll('.chart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const period = btn.dataset.period;
        const currentMetrics = getCurrentMetrics(); // Get current metrics from the page
        updatePerformanceCharts(currentMetrics, period);
    });
});

// Update getCurrentMetrics function
function getCurrentMetrics() {
    return {
        impressions: parseInt(impressionsElement.textContent.replace(/,/g, '')) || 0,
        clicks: parseInt(ctrElement.textContent) || 0,
        conversions: parseInt(conversionsElement.textContent.replace(/,/g, '')) || 0,
        ctr: parseFloat(ctrElement.textContent) || 0
    };
}

// Add back URL suggestions with realistic examples
const urlSuggestions = [
    {
        type: "E-commerce", 
        urls: [
            "https://www.amazon.com/dp/B08N5KWB9H",
            "https://www.shopify.com/example-store",
            "https://www.etsy.com/shop/CraftsAndDesigns"
        ],
        tip: "E-commerce sites typically have 2-3% conversion rates"
    },
    {
        type: "Social Media",
        urls: [
            "https://www.instagram.com/nike",
            "https://www.facebook.com/cocacola",
            "https://www.linkedin.com/company/microsoft"
        ],
        tip: "Social media pages average 1.5-2.5% engagement rates"
    },
    {
        type: "Content",
        urls: [
            "https://medium.com/topic/technology",
            "https://wordpress.com/blog/marketing",
            "https://blog.hubspot.com"
        ],
        tip: "Content sites average 3-5% click-through rates"
    }
];

// Update metrics cache clearing
function clearMetricsCache() {
    localStorage.removeItem('metricsCache');
}

// Add cache cleanup on window close
window.addEventListener('beforeunload', clearMetricsCache);

// Modify fetchScrapedData to use URL-specific caching
async function fetchScrapedData() {
    const url = urlInput.value.trim();
    
    if (!url) {
        showSuggestions();
        resetAnalytics();
        return;
    }

    // Clear old cache if it's been more than 1 hour
    const cachedData = localStorage.getItem(`metrics_${url}`);
    if (cachedData) {
        const data = JSON.parse(cachedData);
        if (Date.now() - data.timestamp > 3600000) {
            localStorage.removeItem(`metrics_${url}`);
        }
    }

    dataContainer.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Processing URL...</p>
        </div>
    `;
    scrapeBtn.disabled = true;

    try {
        const response = await fetch(`http://localhost:3000/scrape?url=${encodeURIComponent(url)}`);
        const result = await response.json();

        if (result.metrics) {
            const metrics = {
                impressions: parseInt(result.metrics.impressions) || 0,
                clicks: parseInt(result.metrics.clicks) || 0,
                conversions: parseInt(result.metrics.conversions) || 0
            };

            // Use the server's CTR if available; otherwise calculate
            const serverCtr = parseFloat(result.metrics.ctr);
            const ctr = !isNaN(serverCtr)
                ? serverCtr.toFixed(2)
                : (metrics.impressions > 0
                    ? ((metrics.clicks / metrics.impressions) * 100).toFixed(2)
                    : "0.00");

            impressionsElement.textContent = metrics.impressions.toLocaleString();
            ctrElement.textContent = `${ctr}%`;
            conversionsElement.textContent = metrics.conversions.toLocaleString();

            updatePerformanceCharts({
                impressions: metrics.impressions,
                clicks: metrics.clicks,
                conversions: metrics.conversions,
                ctr: parseFloat(ctr)
            });
        }

        let analysisContent = '';
        if (result.data && result.data.length > 0) {
            analysisContent = result.data.map(item => `<p>${item}</p>`).join('');
        } else {
            analysisContent = '<p>Analysis data not available.</p>';
        }

        dataContainer.innerHTML = `
            <div class="analysis-result">
                <h3 class="section-title">Content Analysis</h3>
                ${analysisContent}
            </div>
        `;

    } catch (error) {
        console.warn('Error fetching data:', error);
        resetAnalytics(); // Reset to zero on error
        dataContainer.innerHTML = `
            <div class="analysis-result">
                <h3 class="section-title">Error</h3>
                <p>Unable to fetch data. Please try again.</p>
            </div>
        `;
    } finally {
        scrapeBtn.disabled = false;
    }
}