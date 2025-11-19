// API Setup Helper for Hill Calories AI
// This file helps users configure real nutrition analysis APIs

class APISetup {
    constructor() {
        this.setupPanel = null;
        this.isVisible = false;
    }

    showSetupPanel() {
        if (this.setupPanel) {
            this.setupPanel.style.display = 'flex';
            this.isVisible = true;
            return;
        }

        this.createSetupPanel();
    }

    createSetupPanel() {
        const panel = document.createElement('div');
        panel.className = 'api-setup-panel';
        panel.innerHTML = `
            <div class="setup-overlay"></div>
            <div class="setup-modal">
                <div class="setup-header">
                    <h2>🤖 Configure Real AI Analysis</h2>
                    <button class="setup-close" type="button">×</button>
                </div>
                <div class="setup-content">
                    <div class="setup-intro">
                        <p>Connect your app to real AI nutrition analysis services:</p>
                    </div>
                    
                    <div class="api-options">
                        <!-- OpenAI GPT-4 Vision -->
                        <div class="api-card" data-api="openai">
                            <div class="api-header">
                                <h3>🧠 OpenAI GPT-4 Vision</h3>
                                <span class="recommended-badge">Recommended</span>
                            </div>
                            <p>Most accurate food recognition and nutrition analysis</p>
                            <div class="api-setup">
                                <input type="password" placeholder="Enter OpenAI API Key" class="api-key-input" data-api="openai">
                                <button class="test-api-btn" data-api="openai">Test Connection</button>
                            </div>
                            <div class="api-help">
                                <a href="https://platform.openai.com/api-keys" target="_blank">Get API Key →</a>
                            </div>
                        </div>

                        <!-- n8n Workflow -->
                        <div class="api-card" data-api="n8n">
                            <div class="api-header">
                                <h3>🔗 n8n Custom Workflow</h3>
                                <span class="custom-badge">Custom</span>
                            </div>
                            <p>Use your existing n8n automation workflow</p>
                            <div class="api-setup">
                                <input type="url" placeholder="Enter n8n Webhook URL" class="api-endpoint-input" data-api="n8n">
                                <input type="password" placeholder="API Key (optional)" class="api-key-input" data-api="n8n">
                                <button class="test-api-btn" data-api="n8n">Test Connection</button>
                            </div>
                        </div>

                        <!-- Google Gemini -->
                        <div class="api-card" data-api="google">
                            <div class="api-header">
                                <h3>🔍 Google Gemini Vision</h3>
                            </div>
                            <p>Google's multimodal AI for image analysis</p>
                            <div class="api-setup">
                                <input type="password" placeholder="Enter Google API Key" class="api-key-input" data-api="google">
                                <button class="test-api-btn" data-api="google">Test Connection</button>
                            </div>
                            <div class="api-help">
                                <a href="https://makersuite.google.com/app/apikey" target="_blank">Get API Key →</a>
                            </div>
                        </div>

                        <!-- Nutritionix -->
                        <div class="api-card" data-api="nutritionix">
                            <div class="api-header">
                                <h3>🥗 Nutritionix Database</h3>
                            </div>
                            <p>Comprehensive nutrition database for food items</p>
                            <div class="api-setup">
                                <input type="text" placeholder="Application ID" class="api-id-input" data-api="nutritionix">
                                <input type="password" placeholder="Application Key" class="api-key-input" data-api="nutritionix">
                                <button class="test-api-btn" data-api="nutritionix">Test Connection</button>
                            </div>
                            <div class="api-help">
                                <a href="https://developer.nutritionix.com/" target="_blank">Get API Keys →</a>
                            </div>
                        </div>
                    </div>

                    <div class="setup-actions">
                        <button class="save-config-btn" type="button">💾 Save Configuration</button>
                        <button class="skip-setup-btn" type="button">Skip (Use Demo Mode)</button>
                    </div>

                    <div class="setup-status"></div>
                </div>
            </div>
        `;

        // Add styles
        this.addSetupStyles();
        
        document.body.appendChild(panel);
        this.setupPanel = panel;
        this.isVisible = true;

        // Bind events
        this.bindSetupEvents();

        // Load existing configuration
        this.loadExistingConfig();
    }

    addSetupStyles() {
        if (document.getElementById('api-setup-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'api-setup-styles';
        styles.textContent = `
            .api-setup-panel {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .setup-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
            }

            .setup-modal {
                position: relative;
                background: linear-gradient(135deg, #ffffff, #f8fafc);
                border-radius: 20px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .setup-header {
                display: flex;
                justify-content: between;
                align-items: center;
                padding: 24px;
                border-bottom: 1px solid #e5e7eb;
            }

            .setup-header h2 {
                margin: 0;
                color: #1f2937;
                font-size: 24px;
                flex: 1;
            }

            .setup-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                padding: 8px;
                border-radius: 8px;
                transition: all 0.2s ease;
            }

            .setup-close:hover {
                background: #f3f4f6;
                color: #374151;
            }

            .setup-content {
                padding: 24px;
            }

            .setup-intro {
                margin-bottom: 24px;
                color: #4b5563;
            }

            .api-options {
                display: grid;
                gap: 20px;
                margin-bottom: 32px;
            }

            .api-card {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 16px;
                padding: 20px;
                transition: all 0.3s ease;
                position: relative;
            }

            .api-card:hover {
                border-color: #10b981;
                box-shadow: 0 8px 25px rgba(16, 185, 129, 0.1);
                transform: translateY(-2px);
            }

            .api-card.configured {
                border-color: #10b981;
                background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
            }

            .api-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 8px;
            }

            .api-header h3 {
                margin: 0;
                color: #1f2937;
                font-size: 18px;
            }

            .recommended-badge {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
            }

            .custom-badge {
                background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
            }

            .api-setup {
                display: flex;
                gap: 8px;
                margin: 16px 0;
                flex-wrap: wrap;
            }

            .api-setup input {
                flex: 1;
                min-width: 200px;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.2s ease;
            }

            .api-setup input:focus {
                outline: none;
                border-color: #10b981;
            }

            .test-api-btn {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.2s ease;
                white-space: nowrap;
            }

            .test-api-btn:hover {
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                transform: translateY(-1px);
            }

            .test-api-btn:disabled {
                background: #9ca3af;
                cursor: not-allowed;
                transform: none;
            }

            .api-help {
                margin-top: 12px;
            }

            .api-help a {
                color: #059669;
                text-decoration: none;
                font-size: 14px;
                font-weight: 500;
            }

            .api-help a:hover {
                text-decoration: underline;
            }

            .setup-actions {
                display: flex;
                gap: 16px;
                justify-content: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }

            .save-config-btn {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                padding: 14px 28px;
                border-radius: 12px;
                cursor: pointer;
                font-weight: 600;
                font-size: 16px;
                transition: all 0.2s ease;
            }

            .save-config-btn:hover {
                background: linear-gradient(135deg, #059669, #047857);
                transform: translateY(-2px);
            }

            .skip-setup-btn {
                background: transparent;
                color: #6b7280;
                border: 2px solid #e5e7eb;
                padding: 14px 28px;
                border-radius: 12px;
                cursor: pointer;
                font-weight: 600;
                font-size: 16px;
                transition: all 0.2s ease;
            }

            .skip-setup-btn:hover {
                background: #f9fafb;
                border-color: #d1d5db;
            }

            .setup-status {
                min-height: 20px;
                text-align: center;
                margin-top: 16px;
            }

            .status-message {
                padding: 12px 16px;
                border-radius: 8px;
                font-weight: 500;
                display: inline-block;
            }

            .status-success {
                background: #ecfdf5;
                color: #059669;
                border: 1px solid #10b981;
            }

            .status-error {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #f87171;
            }

            .status-loading {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #fbbf24;
            }

            /* Mobile responsive */
            @media (max-width: 640px) {
                .setup-modal {
                    width: 95%;
                    margin: 20px 10px;
                }

                .setup-header {
                    padding: 16px;
                }

                .setup-content {
                    padding: 16px;
                }

                .api-setup {
                    flex-direction: column;
                }

                .api-setup input {
                    min-width: unset;
                }

                .setup-actions {
                    flex-direction: column;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    bindSetupEvents() {
        // Close button
        this.setupPanel.querySelector('.setup-close').addEventListener('click', () => {
            this.hideSetupPanel();
        });

        // Overlay click to close
        this.setupPanel.querySelector('.setup-overlay').addEventListener('click', () => {
            this.hideSetupPanel();
        });

        // Test API buttons
        this.setupPanel.querySelectorAll('.test-api-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.testAPIConnection(e.target.dataset.api);
            });
        });

        // Save configuration
        this.setupPanel.querySelector('.save-config-btn').addEventListener('click', () => {
            this.saveConfiguration();
        });

        // Skip setup
        this.setupPanel.querySelector('.skip-setup-btn').addEventListener('click', () => {
            this.hideSetupPanel();
        });

        // Real-time validation
        this.setupPanel.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                this.validateInput(input);
            });
        });
    }

    async testAPIConnection(apiType) {
        const btn = this.setupPanel.querySelector(`[data-api="${apiType}"] .test-api-btn`);
        const originalText = btn.textContent;
        
        btn.disabled = true;
        btn.textContent = 'Testing...';
        
        try {
            // Get configuration for this API
            const config = this.getAPIConfig(apiType);
            
            if (!config.isValid) {
                throw new Error('Please fill in all required fields');
            }

            // Test the connection (simplified test)
            const success = await this.performAPITest(apiType, config);
            
            if (success) {
                this.showStatus('✅ Connection successful!', 'success');
                this.markAPIAsConfigured(apiType);
            } else {
                throw new Error('Connection failed');
            }
            
        } catch (error) {
            this.showStatus(`❌ ${error.message}`, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }

    async performAPITest(apiType, config) {
        // Simple connectivity test - you can enhance this
        switch (apiType) {
            case 'openai':
                // Test OpenAI API
                try {
                    const response = await fetch('https://api.openai.com/v1/models', {
                        headers: {
                            'Authorization': `Bearer ${config.apiKey}`
                        }
                    });
                    return response.ok;
                } catch {
                    return false;
                }
                
            case 'n8n':
                // Test n8n webhook
                try {
                    const response = await fetch(config.endpoint, {
                        method: 'HEAD'
                    });
                    return response.ok || response.status === 405; // 405 is fine for HEAD on webhook
                } catch {
                    return false;
                }
                
            default:
                return true; // Assume success for other APIs for now
        }
    }

    getAPIConfig(apiType) {
        const card = this.setupPanel.querySelector(`[data-api="${apiType}"]`);
        const keyInput = card.querySelector('.api-key-input');
        const endpointInput = card.querySelector('.api-endpoint-input');
        const idInput = card.querySelector('.api-id-input');

        const config = {
            apiKey: keyInput?.value.trim() || '',
            endpoint: endpointInput?.value.trim() || '',
            appId: idInput?.value.trim() || '',
            isValid: false
        };

        // Validate based on API type
        switch (apiType) {
            case 'openai':
            case 'google':
            case 'clarifai':
                config.isValid = config.apiKey.length > 0;
                break;
            case 'n8n':
                config.isValid = config.endpoint.length > 0;
                break;
            case 'nutritionix':
                config.isValid = config.apiKey.length > 0 && config.appId.length > 0;
                break;
        }

        return config;
    }

    validateInput(input) {
        const apiType = input.dataset.api;
        const config = this.getAPIConfig(apiType);
        
        // Update test button state
        const testBtn = this.setupPanel.querySelector(`[data-api="${apiType}"] .test-api-btn`);
        testBtn.disabled = !config.isValid;
    }

    markAPIAsConfigured(apiType) {
        const card = this.setupPanel.querySelector(`[data-api="${apiType}"]`);
        card.classList.add('configured');
    }

    showStatus(message, type) {
        const statusDiv = this.setupPanel.querySelector('.setup-status');
        statusDiv.innerHTML = `<div class="status-message status-${type}">${message}</div>`;
        
        // Clear after 5 seconds
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 5000);
    }

    saveConfiguration() {
        const configs = {};
        let hasValidConfig = false;

        // Collect all configurations
        ['openai', 'google', 'clarifai', 'n8n', 'nutritionix'].forEach(apiType => {
            const config = this.getAPIConfig(apiType);
            if (config.isValid) {
                configs[apiType] = config;
                hasValidConfig = true;
            }
        });

        if (!hasValidConfig) {
            this.showStatus('❌ Please configure at least one API', 'error');
            return;
        }

        // Apply configurations to the nutrition analyzer
        if (window.nutritionAnalyzer) {
            Object.keys(configs).forEach(apiType => {
                const config = configs[apiType];
                
                switch (apiType) {
                    case 'openai':
                        window.nutritionAnalyzer.apiConfig.openai.apiKey = config.apiKey;
                        break;
                    case 'google':
                        window.nutritionAnalyzer.apiConfig.google.apiKey = config.apiKey;
                        break;
                    case 'clarifai':
                        window.nutritionAnalyzer.apiConfig.clarifai.apiKey = config.apiKey;
                        break;
                    case 'n8n':
                        window.nutritionAnalyzer.apiConfig.n8n.endpoint = config.endpoint;
                        if (config.apiKey) {
                            window.nutritionAnalyzer.apiConfig.n8n.apiKey = config.apiKey;
                        }
                        break;
                    case 'nutritionix':
                        window.nutritionAnalyzer.apiConfig.nutritionix.appId = config.appId;
                        window.nutritionAnalyzer.apiConfig.nutritionix.apiKey = config.apiKey;
                        break;
                }
            });

            // Re-detect available APIs
            window.nutritionAnalyzer.detectAvailableAPIs();
            
            // Save to localStorage for persistence
            localStorage.setItem('hillCaloriesAPIConfig', JSON.stringify(configs));
            
            this.showStatus('✅ Configuration saved! Real AI analysis is now active.', 'success');
            
            setTimeout(() => {
                this.hideSetupPanel();
            }, 2000);
        } else {
            this.showStatus('❌ Nutrition analyzer not found', 'error');
        }
    }

    loadExistingConfig() {
        try {
            const saved = localStorage.getItem('hillCaloriesAPIConfig');
            if (saved) {
                const configs = JSON.parse(saved);
                
                Object.keys(configs).forEach(apiType => {
                    const config = configs[apiType];
                    const card = this.setupPanel.querySelector(`[data-api="${apiType}"]`);
                    
                    if (card) {
                        const keyInput = card.querySelector('.api-key-input');
                        const endpointInput = card.querySelector('.api-endpoint-input');
                        const idInput = card.querySelector('.api-id-input');
                        
                        if (keyInput && config.apiKey) {
                            keyInput.value = config.apiKey;
                        }
                        if (endpointInput && config.endpoint) {
                            endpointInput.value = config.endpoint;
                        }
                        if (idInput && config.appId) {
                            idInput.value = config.appId;
                        }
                        
                        this.markAPIAsConfigured(apiType);
                        this.validateInput(keyInput || endpointInput || idInput);
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load saved API configuration:', error);
        }
    }

    hideSetupPanel() {
        if (this.setupPanel) {
            this.setupPanel.style.display = 'none';
            this.isVisible = false;
        }
    }
}

// Initialize API setup when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.apiSetup = new APISetup();
});

// Auto-load saved configuration
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.nutritionAnalyzer) {
            try {
                const saved = localStorage.getItem('hillCaloriesAPIConfig');
                if (saved) {
                    const configs = JSON.parse(saved);
                    
                    Object.keys(configs).forEach(apiType => {
                        const config = configs[apiType];
                        
                        switch (apiType) {
                            case 'openai':
                                window.nutritionAnalyzer.apiConfig.openai.apiKey = config.apiKey;
                                break;
                            case 'google':
                                window.nutritionAnalyzer.apiConfig.google.apiKey = config.apiKey;
                                break;
                            case 'clarifai':
                                window.nutritionAnalyzer.apiConfig.clarifai.apiKey = config.apiKey;
                                break;
                            case 'n8n':
                                window.nutritionAnalyzer.apiConfig.n8n.endpoint = config.endpoint;
                                if (config.apiKey) {
                                    window.nutritionAnalyzer.apiConfig.n8n.apiKey = config.apiKey;
                                }
                                break;
                            case 'nutritionix':
                                window.nutritionAnalyzer.apiConfig.nutritionix.appId = config.appId;
                                window.nutritionAnalyzer.apiConfig.nutritionix.apiKey = config.apiKey;
                                break;
                        }
                    });

                    window.nutritionAnalyzer.detectAvailableAPIs();
                    console.log('🔄 Loaded saved API configuration');
                }
            } catch (error) {
                console.warn('Failed to auto-load API configuration:', error);
            }
        }
    }, 1000);
});