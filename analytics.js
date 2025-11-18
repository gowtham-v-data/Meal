// Production Analytics & Monitoring
class HillCaloriesAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.events = [];
        this.init();
    }

    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    init() {
        // Track page load performance
        window.addEventListener('load', () => {
            const loadTime = typeof performance !== 'undefined' && performance.now ?
                Math.round(performance.now()) :
                Date.now() - this.startTime;
            this.trackEvent('page_load', {
                loadTime: loadTime,
                url: window.location.href,
                userAgent: navigator.userAgent.substring(0, 100),
                timestamp: new Date().toISOString()
            });
        });

        // Track user interactions
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                this.trackEvent('button_click', {
                    buttonText: e.target.textContent?.substring(0, 50) || 'unknown',
                    buttonId: e.target.id || 'unknown'
                });
            }
        });

        // Track errors
        window.addEventListener('error', (e) => {
            this.trackEvent('javascript_error', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno
            });
        });

        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
            this.trackEvent('visibility_change', {
                hidden: document.hidden,
                sessionDuration: Date.now() - this.startTime
            });
        });

        // Report analytics every 30 seconds
        setInterval(() => this.reportAnalytics(), 30000);
    }

    trackEvent(eventName, data = {}) {
        const event = {
            name: eventName,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            data: data
        };

        this.events.push(event);

        // Keep only last 100 events to prevent memory issues
        if (this.events.length > 100) {
            this.events.shift();
        }

        console.log('📊 Analytics Event:', eventName, data);
    }

    reportAnalytics() {
        const report = {
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.startTime,
            eventCount: this.events.length,
            url: window.location.href,
            platform: this.detectPlatform(),
            timestamp: new Date().toISOString()
        };

        console.log('📈 Analytics Report:', report);

        // In production, you could send this to your analytics service
        // fetch('/analytics', { method: 'POST', body: JSON.stringify(report) });
    }

    detectPlatform() {
        const ua = navigator.userAgent;
        if (/Android/i.test(ua)) return 'Android';
        if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
        if (/Windows/i.test(ua)) return 'Windows';
        if (/Macintosh/i.test(ua)) return 'macOS';
        if (/Linux/i.test(ua)) return 'Linux';
        return 'Unknown';
    }

    // Public methods for manual tracking
    trackImageUpload(fileSize, fileType) {
        this.trackEvent('image_upload', { fileSize, fileType });
    }

    trackAnalysisRequest(analysisType = 'unknown') {
        this.trackEvent('analysis_request', { analysisType });
    }

    trackAnalysisResult(resultType, nutritionData = null) {
        this.trackEvent('analysis_result', {
            resultType,
            hasNutritionData: !!nutritionData
        });
    }
}

// Initialize analytics for production
if (typeof window !== 'undefined') {
    window.hillCaloriesAnalytics = new HillCaloriesAnalytics();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HillCaloriesAnalytics;
}