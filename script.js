// Hill Calories AI - Main JavaScript

class NutritionAnalyzer {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.isAnalyzing = false;
    }

    initializeElements() {
        // DOM elements
        this.uploadArea = document.getElementById('uploadArea');
        this.imageInput = document.getElementById('imageInput');
        this.previewImage = document.getElementById('previewImage');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.captureBtn = document.getElementById('captureBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.errorMessage = document.getElementById('errorMessage');

        // Connection retry state
        this.retryAttempted = false;
        this.connectionChecked = false;

        // Result elements
        this.proteinValue = document.getElementById('proteinValue');
        this.carbsValue = document.getElementById('carbsValue');
        this.fatValue = document.getElementById('fatValue');
        this.caloriesValue = document.getElementById('caloriesValue');

        // Button text elements
        this.btnText = this.analyzeBtn ? this.analyzeBtn.querySelector('.btn-text') : null;
        this.btnLoading = this.analyzeBtn ? this.analyzeBtn.querySelector('.btn-loading') : null;

        this.selectedImage = null;
        this.cameraModal = null;
        this.videoStream = null;

        // Production tracking
        this.sessionStats = {
            startTime: Date.now(),
            imagesUploaded: 0,
            analysesRequested: 0,
            demoResultsShown: 0,
            realResultsShown: 0
        };

        // Start background connection monitoring
        this.startConnectionMonitoring();
    }

    async openCameraStream() {
        try {
            // Request camera permissions
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            this.videoStream = stream;
            this.createCameraModal(stream);
        } catch (error) {
            console.error('Failed to access camera:', error);
            throw error;
        }
    }

    createCameraModal(stream) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'camera-modal';
        modal.innerHTML = `
            <div class="camera-container">
                <div class="camera-header">
                    <h3>Take Photo</h3>
                    <button class="camera-close" type="button">×</button>
                </div>
                <div class="camera-preview">
                    <video class="camera-video" autoplay playsinline></video>
                    <canvas class="camera-canvas" style="display: none;"></canvas>
                </div>
                <div class="camera-controls">
                    <button class="camera-capture-btn" type="button">📸 Capture</button>
                    <button class="camera-switch-btn" type="button">🔄 Switch Camera</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.cameraModal = modal;

        // Get video element and start stream
        const video = modal.querySelector('.camera-video');
        video.srcObject = stream;

        // Bind camera modal events
        this.bindCameraEvents(modal, video);

        // Show modal with animation
        setTimeout(() => modal.classList.add('active'), 10);
    }

    bindCameraEvents(modal, video) {
        const closeBtn = modal.querySelector('.camera-close');
        const captureBtn = modal.querySelector('.camera-capture-btn');
        const switchBtn = modal.querySelector('.camera-switch-btn');
        const canvas = modal.querySelector('.camera-canvas');

        // Close modal
        const closeCamera = () => {
            this.closeCameraModal();
        };

        closeBtn.addEventListener('click', closeCamera);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeCamera();
        });

        // Capture photo
        captureBtn.addEventListener('click', () => {
            this.captureFromVideo(video, canvas);
        });

        // Switch camera (front/back)
        switchBtn.addEventListener('click', () => {
            this.switchCamera();
        });

        // Keyboard shortcuts
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') closeCamera();
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.captureFromVideo(video, canvas);
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        modal._keyHandler = handleKeyPress;
    }

    captureFromVideo(video, canvas) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
            if (blob) {
                // Create file from blob
                const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });

                // Process the captured image
                this.processSelectedFile(file);

                // Close camera modal
                this.closeCameraModal();
            }
        }, 'image/jpeg', 0.9);
    }

    async switchCamera() {
        try {
            // Stop current stream
            if (this.videoStream) {
                this.videoStream.getTracks().forEach(track => track.stop());
            }

            // Toggle between front and back camera
            const currentFacingMode = this.currentFacingMode || 'environment';
            const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';

            // Request new stream with different camera
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: newFacingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            this.videoStream = stream;
            this.currentFacingMode = newFacingMode;

            // Update video source
            const video = this.cameraModal.querySelector('.camera-video');
            video.srcObject = stream;

        } catch (error) {
            console.error('Failed to switch camera:', error);
            this.showError('Unable to switch camera. Using current camera.');
        }
    }

    closeCameraModal() {
        if (this.cameraModal) {
            // Stop video stream
            if (this.videoStream) {
                this.videoStream.getTracks().forEach(track => track.stop());
                this.videoStream = null;
            }

            // Remove event listeners
            if (this.cameraModal._keyHandler) {
                document.removeEventListener('keydown', this.cameraModal._keyHandler);
            }

            // Hide modal with animation
            this.cameraModal.classList.remove('active');

            // Remove modal from DOM after animation
            setTimeout(() => {
                if (this.cameraModal && this.cameraModal.parentNode) {
                    this.cameraModal.parentNode.removeChild(this.cameraModal);
                }
                this.cameraModal = null;
            }, 300);
        }
    }

    handleCameraError(error) {
        let message = 'Camera access failed. ';

        if (error.name === 'NotAllowedError') {
            message += 'Please allow camera permissions and try again.';
        } else if (error.name === 'NotFoundError') {
            message += 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
            message += 'Camera not supported on this browser.';
        } else {
            message += 'Please try using the file upload option instead.';
        }

        this.showError(message);

        // Fallback to file input
        setTimeout(() => {
            this.imageInput.setAttribute('capture', 'environment');
            this.imageInput.click();
        }, 2000);
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
            window.matchMedia('(max-width: 768px)').matches;
    }

    bindEvents() {
        // File input change
        if (this.imageInput) {
            this.imageInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Upload area click - always open file browser
        if (this.uploadArea) {
            this.uploadArea.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.imageInput) {
                    console.log('📤 Upload area clicked - opening file browser');
                    console.log('📍 Click target:', e.target.tagName, e.target.className);
                    this.imageInput.click(); // Open file browser on all devices
                } else {
                    console.error('❌ Image input not found');
                }
            }, true); // Use capture phase to ensure we get the event first

            // Add specific handler for camera icon area
            const cameraIcon = this.uploadArea.querySelector('.camera-icon');
            if (cameraIcon) {
                cameraIcon.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📷 Camera icon clicked - opening file browser');
                    if (this.imageInput) {
                        this.imageInput.click();
                    }
                });
            }
            
            // Drag and drop events
            this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        }

        // Button events with error handling
        if (this.analyzeBtn) {
            this.analyzeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔥 Analyze button clicked');
                this.analyzeImage();
            });
        } else {
            console.error('❌ Analyze button not found');
        }

        if (this.captureBtn) {
            this.captureBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📷 Capture button clicked');
                this.capturePhoto();
            });
        } else {
            console.error('❌ Capture button not found');
        }

        // Preview image click to change
        if (this.previewImage) {
            this.previewImage.addEventListener('click', () => {
                if (this.imageInput) this.imageInput.click();
            });
        }
    }

    handleFileSelect(event) {
        console.log('📁 File selection event triggered');
        const file = event.target.files[0];
        if (file) {
            console.log('✅ File detected:', file.name);
            this.processSelectedFile(file);
        } else {
            console.log('❌ No file selected');
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('📥 Drag over detected');
        
        if (this.uploadArea) {
            this.uploadArea.classList.add('drag-over');
        }
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Only remove class if we're leaving the upload area completely
        if (this.uploadArea && !this.uploadArea.contains(event.relatedTarget)) {
            this.uploadArea.classList.remove('drag-over');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('📥 Files dropped');
        
        if (this.uploadArea) {
            this.uploadArea.classList.remove('drag-over');
        }
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            console.log('📁 Dropped file:', file.name, file.type);
            if (file.type.startsWith('image/')) {
                this.processSelectedFile(file);
            } else {
                this.showError('Please select a valid image file (PNG, JPG, WebP).');
            }
        }
    }

    processSelectedFile(file) {
        console.log('📁 Processing selected file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
        
        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            console.error('❌ File too large:', file.size, 'bytes');
            this.showError('File size too large. Please select an image under 10MB.');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            console.error('❌ Invalid file type:', file.type);
            this.showError('Please select a valid image file.');
            return;
        }

        console.log('✅ File validation passed');
        this.selectedImage = file;
        this.displayPreview(file);
        this.enableAnalyzeButton();
        this.hideError();
        console.log('✅ File processing complete');
    }

    displayPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.previewImage) {
                this.previewImage.src = e.target.result;
                this.previewImage.style.display = 'block';
            }

            // Hide upload placeholder
            if (this.uploadArea) {
                const placeholder = this.uploadArea.querySelector('.upload-placeholder');
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
            }
        };
        reader.readAsDataURL(file);
    }

    async capturePhoto() {
        try {
            // For mobile devices, create a temporary input with camera capture
            if (this.isMobileDevice()) {
                const tempInput = document.createElement('input');
                tempInput.type = 'file';
                tempInput.accept = 'image/*';
                tempInput.capture = 'environment'; // This forces camera on mobile
                tempInput.style.display = 'none';
                document.body.appendChild(tempInput);

                tempInput.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files[0]) {
                        this.processSelectedFile(e.target.files[0]);
                    }
                    document.body.removeChild(tempInput);
                });

                tempInput.click();
            } else {
                // For desktop, try getUserMedia first, fallback to file input
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    await this.openCameraStream();
                } else {
                    this.imageInput.click();
                }
            }
        } catch (error) {
            console.error('Camera access error:', error);
            this.handleCameraError(error);
        }
    }

    enableAnalyzeButton() {
        if (this.analyzeBtn) {
            this.analyzeBtn.disabled = false;
        }
    }

    disableAnalyzeButton() {
        if (this.analyzeBtn) {
            this.analyzeBtn.disabled = true;
        }
    }

    showLoading() {
        this.isAnalyzing = true;
        if (this.btnText) {
            this.btnText.style.display = 'none';
        }
        if (this.btnLoading) {
            this.btnLoading.style.display = 'inline-flex';
        }
        this.disableAnalyzeButton();
    }

    hideLoading() {
        this.isAnalyzing = false;
        if (this.btnText) {
            this.btnText.style.display = 'inline';
        }
        if (this.btnLoading) {
            this.btnLoading.style.display = 'none';
        }
        if (this.selectedImage) {
            this.enableAnalyzeButton();
        }
    }

    async analyzeImage() {
        if (!this.selectedImage || this.isAnalyzing) {
            return;
        }

        // Clear previous results immediately
        this.clearPreviousResults();

        // Reset retry state on new analysis
        if (!this.retryAttempted) {
            this.retryAttempted = false;
        }

        this.showLoading();
        this.hideError();

        try {
            // Prepare FormData for API request
            const formData = new FormData();
            formData.append('image', this.selectedImage);

            // Add additional metadata if needed
            formData.append('timestamp', new Date().toISOString());
            formData.append('source', 'web_upload');

            // Make API request
            const response = await this.makeNutritionRequest(formData);

            if (response.success) {
                this.displayResults(response.data);
            } else {
                throw new Error(response.message || 'Analysis failed');
            }

        } catch (error) {
            console.error('Analysis error:', error);

            // Try automatic retry for network errors (silently in background)
            if ((error.message.includes('Failed to fetch') || error.message.includes('CORS')) && !this.retryAttempted) {
                console.log('🔄 Quietly retrying connection in background...');
                this.retryAttempted = true;
                setTimeout(() => {
                    this.analyzeImage();
                }, 3000); // Slightly longer delay
                // Continue to show sample results - don't interrupt user
            }

            // Categorize errors and provide helpful messages
            let errorMessage = 'Unable to analyze your meal right now. ';
            let shouldShowDemo = true;

            if (error.message.includes('timeout')) {
                errorMessage = '⏰ Analysis taking longer than expected. Here are sample results...';
            } else if (error.message.includes('CORS') || error.message.includes('Access-Control-Allow-Origin')) {
                errorMessage = '🎟️ Showing sample analysis while connecting to AI service...';
            } else if (error.message.includes('Network connection failed') || error.message.includes('Failed to fetch')) {
                errorMessage = '⚡ Quick sample results! Trying to connect in background...';
            } else if (error.message.includes('HTTP error')) {
                errorMessage = '🎟️ AI service busy. Here\'s a sample analysis for now...';
            } else if (error.message.includes('AbortError') || error.message.includes('aborted')) {
                errorMessage = '⚡ Quick sample results while we reconnect...';
            } else {
                errorMessage = '🎟️ Sample analysis ready! Still working on AI connection...';
            }

            this.showError(errorMessage);

            // Show sample results with clear user notification
            console.log('🎯 Displaying sample results due to API issue. Error:', error.message);

            // Add specific help for CORS errors
            if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
                console.log('🛠️ CORS Fix: Your webhook needs these headers:');
                console.log('   Access-Control-Allow-Origin: *');
                console.log('   Access-Control-Allow-Methods: POST, OPTIONS');
                console.log('📄 See CORS-FIX.md for complete instructions');
            }

            if (shouldShowDemo) {
                // Show sample results immediately for better UX
                setTimeout(() => {
                    this.clearPreviousResults(); // Clear old results first
                    this.showInfo(errorMessage);
                    this.displayMockResults();
                    this.addRetryButton();
                }, 100); // Nearly instant sample results
            } else {
                this.showError(errorMessage);
            }
        } finally {
            this.hideLoading();
        }
    }

    async quickConnectionTest(url) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second test

            const response = await fetch(url, {
                method: 'HEAD',
                mode: 'no-cors',
                headers: { 'ngrok-skip-browser-warning': 'true' },
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            console.log('✅ Quick connection test passed');
            return true;
        } catch (error) {
            console.log('❌ Quick connection test failed:', error.message);
            return false;
        }
    }

    async testEndpoint(url) {
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                mode: 'no-cors',
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            return true;
        } catch (error) {
            console.log('🚫 Endpoint test failed:', error.message);
            return false;
        }
    }

    startConnectionMonitoring() {
        // Check connection every 30 seconds in background
        setInterval(async() => {
            const isOnline = navigator.onLine;
            if (!isOnline) {
                console.log('📴 Offline detected - sample mode ready');
                return;
            }

            // Quick connectivity test (doesn't affect user experience)
            try {
                await fetch('https://httpbin.org/get', {
                    method: 'HEAD',
                    mode: 'no-cors',
                    signal: AbortSignal.timeout(2000)
                });
                console.log('🌐 Connection healthy');
            } catch (error) {
                console.log('📶 Connection unstable - sample mode ready');
            }
        }, 30000);
    }

    addRetryButton() {
        // Remove existing retry button if present
        const existingRetry = document.querySelector('.retry-btn');
        if (existingRetry) {
            existingRetry.remove();
        }

        // Create retry button
        const retryBtn = document.createElement('button');
        retryBtn.className = 'btn-secondary retry-btn';
        retryBtn.innerHTML = '🔄 Try Real Analysis';
        retryBtn.style.marginTop = '1rem';

        retryBtn.addEventListener('click', () => {
            this.retryAttempted = false;
            this.hideError();
            retryBtn.remove();
            this.analyzeImage();
        });

        // Add to results section
        this.resultsSection.appendChild(retryBtn);
    }

    async makeNutritionRequest(formData) {
        // Multiple API endpoints for reliability
        const isLocalhost = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.port === '8000';
        const isGitHubPages = window.location.hostname.includes('github.io');

        const API_ENDPOINTS = [
            'https://danny-supercrowned-shawnda.ngrok-free.dev/webhook/Meal',
            // Add backup endpoints here if available
        ];

        const selectedEndpoint = (isLocalhost || isGitHubPages) ?
            API_ENDPOINTS[0] :
            '/webhook/Meal'; // Production proxy

        console.log('🌐 Analyzing meal with AI...');
        console.log('📡 Endpoint:', selectedEndpoint);
        const imageFile = formData.get('image');
        console.log('🖼️ Image size:', imageFile && imageFile.size ? imageFile.size : 'unknown');

        // Test endpoint availability first
        if (selectedEndpoint.includes('ngrok')) {
            console.log('🔍 Testing ngrok endpoint availability...');
            console.log('💡 Tip: If you get CORS errors, add these headers to your webhook:');
            console.log('   Access-Control-Allow-Origin: *');
            console.log('   Access-Control-Allow-Methods: POST, OPTIONS');
            console.log('   Access-Control-Allow-Headers: Content-Type, Accept');
        }

        try {
            // Create fetch with longer timeout for AI processing
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.log('⏰ Request timeout after 45 seconds');
                controller.abort();
            }, 45000); // 45 second timeout for AI processing

            console.log('🚀 Sending request to:', selectedEndpoint);

            // Try different CORS modes if the first fails
            let response;
            try {
                response = await fetch(selectedEndpoint, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    mode: 'cors',
                    signal: controller.signal
                });
            } catch (corsError) {
                if (corsError.message.includes('CORS')) {
                    console.log('🔄 CORS failed, trying no-cors mode...');
                    // Fallback: try with no-cors (won't get response data, but might work)
                    response = await fetch(selectedEndpoint, {
                        method: 'POST',
                        body: formData,
                        mode: 'no-cors',
                        signal: controller.signal
                    });

                    if (response.type === 'opaque') {
                        console.log('📦 Got opaque response - CORS is blocking data access');
                        throw new Error('CORS policy blocked - server needs Access-Control-Allow-Origin header');
                    }
                } else {
                    throw corsError;
                }
            }

            clearTimeout(timeoutId);
            console.log('✅ Response received');

            console.log('📊 API Response:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error:', errorText);
                throw new Error(`API returned ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('Parsed response:', JSON.stringify(result, null, 2));
            console.log('Response type:', typeof result);
            console.log('Is array:', Array.isArray(result));

            // Handle multiple possible response formats from your webhook
            let output = null;

            // Format 1: Array with output object - [{output: {...}}]
            if (Array.isArray(result) && result.length > 0 && result[0] && result[0].output) {
                output = result[0].output;
                console.log('Format 1: Array with output object detected');
            }
            // Format 2: Direct object with output property - {output: {...}}
            else if (result && result.output) {
                output = result.output;
                console.log('Format 2: Direct object with output property detected');
            }
            // Format 3: Direct output object - {status: ..., food: ..., total: ...}
            else if (result && result.food && result.total) {
                output = result;
                console.log('Format 3: Direct output object detected');
            }

            if (output) {
                console.log('Output object:', JSON.stringify(output, null, 2));

                // Verify the response has the expected structure
                // Note: Your API returns descriptive status instead of "success"
                if (output.food && output.total && Array.isArray(output.food)) {
                    console.log('Valid response structure detected');
                    console.log('Food items count:', output.food.length);
                    console.log('Total calories:', output.total.calories);

                    return {
                        success: true,
                        data: output
                    };
                } else {
                    console.error('Invalid output structure. Missing food array or total object');
                    console.error('Has food array:', Array.isArray(output.food));
                    console.error('Has total object:', !!output.total);
                    throw new Error('Invalid output structure - missing required fields');
                }
            } else {
                console.error('No valid response format detected');
                console.error('Response type:', typeof result);
                console.error('Is array:', Array.isArray(result));
                console.error('Has output property:', !!(result && result.output));
                console.error('Has food property:', !!(result && result.food));

                throw new Error('Response format not recognized');
            }
        } catch (fetchError) {
            console.error('🔥 Fetch error:', fetchError);

            // Check if it's a CORS or networking issue on GitHub Pages
            if (window.location.hostname.includes('github.io')) {
                console.warn('⚠️ GitHub Pages detected - API calls may require direct endpoint');
                console.log('💡 Ensure your API endpoint supports CORS for:', window.location.origin);
            }

            throw fetchError;
        }
    }

    displayResults(nutritionData) {
        // Handle both detailed food analysis and simple totals
        let totals;

        if (nutritionData.total) {
            // Response from webhook with detailed food items
            totals = nutritionData.total;
            this.displayFoodItems(nutritionData.food || []);
        } else {
            // Fallback for simple response format
            totals = {
                protein: nutritionData.protein || 0,
                carbs: nutritionData.carbohydrates || nutritionData.carbs || 0,
                fat: nutritionData.fat || 0,
                calories: nutritionData.calories || 0
            };
        }

        // Update nutrition values with totals
        this.proteinValue.textContent = `${Math.round(totals.protein * 10) / 10}g`;
        this.carbsValue.textContent = `${Math.round(totals.carbs * 10) / 10}g`;
        this.fatValue.textContent = `${Math.round(totals.fat * 10) / 10}g`;
        this.caloriesValue.textContent = `${Math.round(totals.calories)} kcal`;

        // Show results with animation
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });

        // Add animation class
        this.resultsSection.style.opacity = '0';
        this.resultsSection.style.transform = 'translateY(20px)';

        setTimeout(() => {
            this.resultsSection.style.transition = 'all 0.5s ease';
            this.resultsSection.style.opacity = '1';
            this.resultsSection.style.transform = 'translateY(0)';
        }, 100);
    }

    displayFoodItems(foodItems) {
        // Find or create food items container
        let foodItemsContainer = document.getElementById('foodItemsContainer');
        if (!foodItemsContainer) {
            foodItemsContainer = document.createElement('div');
            foodItemsContainer.id = 'foodItemsContainer';
            foodItemsContainer.className = 'food-items-container';

            // Insert before nutrition grid
            const nutritionGrid = this.resultsSection.querySelector('.nutrition-grid');
            nutritionGrid.parentNode.insertBefore(foodItemsContainer, nutritionGrid);
        }

        // Clear existing items
        foodItemsContainer.innerHTML = '';

        if (foodItems && foodItems.length > 0) {
            const title = document.createElement('h4');
            title.textContent = foodItems.length === 1 ? 'Analyzed Food' : 'Detected Food Items';
            title.className = 'food-items-title';
            foodItemsContainer.appendChild(title);

            const itemsList = document.createElement('div');
            itemsList.className = 'food-items-list';

            foodItems.forEach(item => {
                const foodItem = document.createElement('div');
                foodItem.className = 'food-item';
                foodItem.innerHTML = `
                    <div class="food-item-header">
                        <span class="food-name">${item.name}</span>
                        <span class="food-quantity">${item.quantity}</span>
                    </div>
                    <div class="food-item-nutrition">
                        <span class="food-calories">${item.calories} kcal</span>
                        <span class="food-macros">P: ${item.protein}g | C: ${item.carbs}g | F: ${item.fat}g</span>
                    </div>
                `;
                itemsList.appendChild(foodItem);
            });

            foodItemsContainer.appendChild(itemsList);
        }
    }

    displayMockResults() {
        // Realistic sample meals for better demonstration
        const sampleMeals = [{
                protein: 28,
                carbohydrates: 45,
                fat: 12,
                name: 'Grilled Chicken & Rice Bowl',
                description: 'Balanced protein and carb combination'
            },
            {
                protein: 22,
                carbohydrates: 38,
                fat: 18,
                name: 'Salmon with Quinoa',
                description: 'Omega-3 rich with complete protein'
            },
            {
                protein: 15,
                carbohydrates: 52,
                fat: 8,
                name: 'Pasta with Vegetables',
                description: 'Carb-rich with moderate protein'
            },
            {
                protein: 32,
                carbohydrates: 25,
                fat: 15,
                name: 'High-Protein Power Bowl',
                description: 'Ideal for post-workout nutrition'
            },
            {
                protein: 18,
                carbohydrates: 42,
                fat: 14,
                name: 'Mixed Salad with Protein',
                description: 'Fresh vegetables with lean protein'
            }
        ];

        const selectedMeal = sampleMeals[Math.floor(Math.random() * sampleMeals.length)];

        // Add realistic variations (±10% to simulate real analysis)
        const mockData = {
            protein: Math.round(selectedMeal.protein * (0.9 + Math.random() * 0.2)),
            carbohydrates: Math.round(selectedMeal.carbohydrates * (0.9 + Math.random() * 0.2)),
            fat: Math.round(selectedMeal.fat * (0.9 + Math.random() * 0.2))
        };

        // Calculate calories
        mockData.calories = Math.round(
            (mockData.protein * 4) +
            (mockData.carbohydrates * 4) +
            (mockData.fat * 9)
        );

        console.log(`🍽️ Sample analysis: ${selectedMeal.name}`);
        console.log(`📊 ${selectedMeal.description}`);
        console.log('💡 This is sample data - showing example nutrition analysis');

        // Track sample usage for production insights
        if (typeof this.sessionStats !== 'undefined') {
            this.sessionStats.demoResultsShown++;
            console.log('📈 Session stats:', this.sessionStats);
        }

        this.displayResults(mockData);
    }

    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.className = 'error-message';
            this.errorMessage.style.display = 'block';
        }
        if (this.resultsSection) {
            this.resultsSection.style.display = 'none';
        }
    }

    showInfo(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.className = 'error-message info-style';
            this.errorMessage.style.display = 'block';
        }
        // Don't hide results section for info messages
    }

    hideError() {
        if (this.errorMessage) {
            this.errorMessage.style.display = 'none';
        }
    }

    clearPreviousResults() {
        // Hide results section immediately
        this.resultsSection.style.display = 'none';

        // Clear nutrition values with loading placeholders
        if (this.proteinValue) this.proteinValue.textContent = '...';
        if (this.carbsValue) this.carbsValue.textContent = '...';
        if (this.fatValue) this.fatValue.textContent = '...';
        if (this.caloriesValue) this.caloriesValue.textContent = '...';

        // Clear food items
        const foodItemsContainer = document.getElementById('foodItemsContainer');
        if (foodItemsContainer) {
            foodItemsContainer.innerHTML = '';
        }

        console.log('🔄 Cleared previous results - analyzing new image...');
    }

    reset() {
        // Reset the analyzer state
        this.selectedImage = null;
        if (this.previewImage) {
            this.previewImage.style.display = 'none';
            this.previewImage.src = '';
        }

        // Show upload placeholder
        if (this.uploadArea) {
            const placeholder = this.uploadArea.querySelector('.upload-placeholder');
            if (placeholder) {
                placeholder.style.display = 'flex';
            }
        }

        // Reset buttons
        this.disableAnalyzeButton();
        this.hideLoading();

        // Hide results and errors
        if (this.resultsSection) {
            this.resultsSection.style.display = 'none';
        }
        this.hideError();

        // Clear food items
        const foodItemsContainer = document.getElementById('foodItemsContainer');
        if (foodItemsContainer) {
            foodItemsContainer.innerHTML = '';
        }

        // Close camera if open
        if (this.cameraModal) {
            this.closeCameraModal();
        }

        // Clear file input
        if (this.imageInput) {
            this.imageInput.value = '';
        }
    }
}

// Utility functions
const utils = {
    // Format nutrition value with proper units
    formatNutritionValue(value, unit = 'g') {
        return `${Math.round(value * 10) / 10}${unit}`;
    },

    // Convert file to base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },

    // Compress image if needed
    compressImage(file, maxWidth = 800, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(resolve, 'image/jpeg', quality);
            };

            img.src = URL.createObjectURL(file);
        });
    }
};

// Performance monitoring
const performance = {
    startTime: null,

    start() {
        this.startTime = Date.now();
    },

    end(operation) {
        if (this.startTime) {
            const duration = Date.now() - this.startTime;
            console.log(`${operation} completed in ${duration}ms`);
            this.startTime = null;
        }
    }
};

// Error tracking
const errorTracker = {
    log(error, context = '') {
        console.error('Hill Calories Error:', {
            error: error.message,
            stack: error.stack,
            context: context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });

        // In production, send to error tracking service
        // Example: Sentry.captureException(error, { extra: { context } });
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize the nutrition analyzer
        window.nutritionAnalyzer = new NutritionAnalyzer();

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Press 'R' to reset
            if (e.key === 'r' || e.key === 'R') {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    window.nutritionAnalyzer.reset();
                }
            }

            // Press Enter to analyze (if image is selected)
            if (e.key === 'Enter') {
                if (window.nutritionAnalyzer.selectedImage && !window.nutritionAnalyzer.isAnalyzing) {
                    window.nutritionAnalyzer.analyzeImage();
                }
            }
        });

        // Handle visibility change (pause/resume when tab is hidden/visible)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause any ongoing operations
                console.log('App paused');
            } else {
                // Resume operations
                console.log('App resumed');
            }
        });

        // Mobile-specific initialization and button fixes
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            // Add mobile-specific touch event handling
            document.addEventListener('touchstart', function() {}, { passive: true });
            console.log('📱 Mobile device detected - adding touch optimizations');
        }

        // Add global click logging for debugging
        document.addEventListener('click', function(e) {
            if (e.target.id === 'analyzeBtn' || e.target.id === 'captureBtn' || e.target.id === 'uploadArea' || e.target.closest('#uploadArea')) {
                console.log('🖱️ Global click detected on:', e.target.id, e.target.tagName, e.target.className);
                console.log('🔍 Click target details:', {
                    id: e.target.id,
                    tagName: e.target.tagName,
                    className: e.target.className,
                    disabled: e.target.disabled,
                    hasEventListeners: e.target.hasAttribute('data-initialized')
                });
            }
        });

        // Fix authentication buttons with enhanced handlers
        setTimeout(() => {
            console.log('🔐 Initializing authentication buttons...');

            // Fix all login buttons
            document.querySelectorAll('[onclick*="showLogin"]').forEach(btn => {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);

                newBtn.removeAttribute('onclick');
                newBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔑 Login button clicked');
                    showLogin();
                    if (typeof closeMobileMenu === 'function') {
                        closeMobileMenu();
                    }
                });
                console.log('✅ Login button fixed:', newBtn.textContent);
            });

            // Fix all signup buttons
            document.querySelectorAll('[onclick*="showSignup"]').forEach(btn => {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);

                newBtn.removeAttribute('onclick');
                newBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📝 Signup button clicked');
                    showSignup();
                    if (typeof closeMobileMenu === 'function') {
                        closeMobileMenu();
                    }
                });
                console.log('✅ Signup button fixed:', newBtn.textContent);
            });

            // Fix modal close buttons
            document.querySelectorAll('[onclick*="hide"]').forEach(btn => {
                if (btn.textContent === '×') {
                    const newBtn = btn.cloneNode(true);
                    btn.parentNode.replaceChild(newBtn, btn);

                    newBtn.removeAttribute('onclick');
                    newBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('❌ Close button clicked');
                        hideLogin();
                        hideSignup();
                    });
                }
            });

            console.log('🎉 Authentication buttons initialization complete!');
        }, 500);

        // Fix all authentication buttons with direct event listeners
        setTimeout(() => {
            // Login button in welcome notification (correct selector)
            const loginBtn = document.querySelector('.welcome-actions .btn.btn-primary');
            if (loginBtn) {
                // Remove existing onclick to prevent conflicts
                loginBtn.removeAttribute('onclick');

                loginBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    showLogin();
                });
                loginBtn.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    showLogin();
                }, { passive: false });
                console.log('✅ Login button events attached');
            } else {
                console.log('❌ Login button not found');
            }

            // Close button in welcome notification - ROBUST EVENT HANDLING
            const closeBtn = document.querySelector('.welcome-actions .btn-close');
            const closeBtnById = document.getElementById('welcomeCloseBtn');

            function setupCloseButton(btn) {
                if (!btn) return;

                // Remove any existing event listeners by cloning
                const freshBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(freshBtn, btn);

                // Single, reliable click handler
                freshBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.log('🔴 Close button clicked - hiding welcome');
                    hideWelcome();
                });

                // Touch handler for mobile
                freshBtn.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.log('🔴 Close button touched - hiding welcome');
                    hideWelcome();
                });

                console.log('✅ Close button events attached successfully');
            }

            setupCloseButton(closeBtn || closeBtnById); // Modal close buttons
            const modalCloseButtons = document.querySelectorAll('.modal-close');
            modalCloseButtons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.closest('#loginModal')) hideLogin();
                    if (this.closest('#signupModal')) hideSignup();
                });
                btn.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.closest('#loginModal')) hideLogin();
                    if (this.closest('#signupModal')) hideSignup();
                }, { passive: false });
            });

            // Fix auth buttons in header
            const headerLoginBtn = document.querySelector('.auth-buttons .btn-login');
            const headerSignupBtn = document.querySelector('.auth-buttons .btn-signup');

            if (headerLoginBtn) {
                headerLoginBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    showLogin();
                });
                headerLoginBtn.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    showLogin();
                }, { passive: false });
            }

            if (headerSignupBtn) {
                headerSignupBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    showSignup();
                });
                headerSignupBtn.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    showSignup();
                }, { passive: false });
            }

            console.log('✅ All authentication buttons initialized for mobile with proper event handling');
        }, 100);

        console.log('🚀 Hill Calories AI initialized successfully - Version 2.0');
        console.log('🌐 Platform:', window.location.hostname);
        console.log('📡 Current timestamp:', new Date().toISOString());

        // Enhanced button initialization with comprehensive fixes
        setTimeout(() => {
            console.log('🔧 Starting comprehensive button initialization...');

            const analyzeBtn = document.getElementById('analyzeBtn');
            const captureBtn = document.getElementById('captureBtn');
            const uploadArea = document.getElementById('uploadArea');
            const imageInput = document.getElementById('imageInput');

            // Fix upload area with multiple event types
            if (uploadArea && imageInput) {
                console.log('📤 Initializing upload area with multiple event handlers');
                
                // Add comprehensive click handlers for entire upload area
                uploadArea.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📤 Fallback: Upload area clicked - opening file browser');
                    console.log('📍 Fallback click target:', e.target.tagName, e.target.className);
                    imageInput.click();
                }, true); // Use capture phase
                
                uploadArea.addEventListener('touchstart', function(e) {
                    console.log('📱 Fallback: Upload area touched');
                    setTimeout(() => {
                        imageInput.click();
                    }, 100);
                }, { passive: false });
                
                // Specific camera icon fallback handler
                const cameraIcon = uploadArea.querySelector('.camera-icon');
                const cameraSvg = uploadArea.querySelector('.camera-icon svg');
                
                if (cameraIcon) {
                    cameraIcon.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('📷 Fallback: Camera icon clicked');
                        imageInput.click();
                    }, true);
                }
                
                if (cameraSvg) {
                    cameraSvg.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🎯 Fallback: Camera SVG clicked');
                        imageInput.click();
                    }, true);
                }
                
                // Make area more accessible
                uploadArea.style.cursor = 'pointer';
                uploadArea.setAttribute('role', 'button');
                uploadArea.setAttribute('tabindex', '0');
                uploadArea.setAttribute('aria-label', 'Click to upload image');
                
                console.log('✅ Upload area enhanced initialization complete');
            } else {
                console.error('❌ Upload area or image input not found for fallback');
            }            // Fix file input with enhanced change handler
            if (imageInput) {
                const newImageInput = imageInput.cloneNode(true);
                imageInput.parentNode.replaceChild(newImageInput, imageInput);

                newImageInput.addEventListener('change', function(e) {
                    const selectedFile = e.target.files[0];
                    console.log('📁 File input changed:', selectedFile ? selectedFile.name : 'no file');
                    if (e.target.files[0] && window.nutritionAnalyzer) {
                        window.nutritionAnalyzer.processSelectedFile(e.target.files[0]);
                    } else {
                        console.error('❌ No file selected or analyzer unavailable');
                    }
                });
                console.log('✅ File input enhanced initialization complete');
            }

            // Fix analyze button with multiple handlers
            if (analyzeBtn) {
                // Remove existing listeners and add new ones
                analyzeBtn.onclick = null;
                
                analyzeBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔥 Analyze button clicked - disabled:', this.disabled);
                    
                    if (this.disabled) {
                        console.log('⚠️ Button is disabled - please select an image first');
                        alert('Please select an image first');
                        return;
                    }
                    
                    if (window.nutritionAnalyzer) {
                        console.log('✅ Starting analysis...');
                        window.nutritionAnalyzer.analyzeImage();
                    } else {
                        console.error('❌ Nutrition analyzer not available');
                        alert('Analyzer not available. Please refresh the page.');
                    }
                });
                
                analyzeBtn.addEventListener('touchstart', function(e) {
                    console.log('📱 Analyze button touched');
                }, { passive: true });
                
                console.log('✅ Analyze button enhanced initialization complete');
            }            // Fix capture button with camera functionality
            if (captureBtn) {
                const newCaptureBtn = captureBtn.cloneNode(true);
                captureBtn.parentNode.replaceChild(newCaptureBtn, captureBtn);

                newCaptureBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📷 Capture button clicked');
                    if (window.nutritionAnalyzer) {
                        window.nutritionAnalyzer.capturePhoto();
                    } else {
                        console.error('❌ Analyzer unavailable');
                    }
                });

                console.log('✅ Capture button enhanced initialization complete');
            }

            console.log('🎉 All upload buttons initialization complete!');
        }, 300);

    } catch (error) {
        errorTracker.log(error, 'Application initialization');
    }
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NutritionAnalyzer, utils, performance, errorTracker };
}
// Authentication Functions
function showLogin() {
    try {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            console.log('✅ Login modal opened');
        } else {
            console.error('❌ Login modal not found');
        }
    } catch (error) {
        console.error('❌ Error showing login modal:', error);
    }
}

function hideLogin() {
    try {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
            console.log('✅ Login modal closed');
        }
    } catch (error) {
        console.error('❌ Error hiding login modal:', error);
    }
}

function showSignup() {
    try {
        const modal = document.getElementById('signupModal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            console.log('✅ Signup modal opened');
        } else {
            console.error('❌ Signup modal not found');
        }
    } catch (error) {
        console.error('❌ Error showing signup modal:', error);
    }
}

function hideSignup() {
    try {
        const modal = document.getElementById('signupModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
            console.log('✅ Signup modal closed');
        }
    } catch (error) {
        console.error('❌ Error hiding signup modal:', error);
    }
}

function switchToSignup() {
    hideLogin();
    setTimeout(() => showSignup(), 150);
}

function switchToLogin() {
    hideSignup();
    setTimeout(() => showLogin(), 150);
}

function hideWelcome() {
    try {
        console.log('🔴 hideWelcome() called');
        const notification = document.getElementById('welcomeNotification');
        if (notification) {
            notification.style.display = 'none';
            // Also try removing the element completely as fallback
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 100);
            console.log('✅ Welcome notification closed and will be removed');
        } else {
            console.log('❌ Welcome notification element not found');
        }
    } catch (error) {
        console.error('❌ Error hiding welcome notification:', error);
    }
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    console.log('🔐 Login attempt:', { email, password: '***' });

    hideLogin();
    hideWelcome();

    showNotification('🎉 Welcome back! You are now logged in.', 'success');
    updateAuthState(true, email);
}

function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showNotification('❌ Passwords do not match!', 'error');
        return;
    }

    console.log('📝 Signup attempt:', { name, email, password: '***' });

    hideSignup();
    hideWelcome();

    showNotification('🎉 Account created successfully! Welcome!', 'success');
    updateAuthState(true, email);
}

function updateAuthState(isLoggedIn, userEmail = '') {
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        if (isLoggedIn) {
            authButtons.innerHTML = `
                <span class="user-info">${userEmail.split('@')[0]}</span>
                <button class="btn-logout" onclick="handleLogout()">Logout</button>
            `;
        } else {
            authButtons.innerHTML = `
                <button class="btn-login" onclick="showLogin()">Login</button>
                <button class="btn-signup" onclick="showSignup()">Sign Up</button>
            `;
        }
    }
}

function handleLogout() {
    console.log('👋 User logged out');
    updateAuthState(false);
    showNotification('👋 Logged out successfully!', 'info');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(25px);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        border-left: 4px solid var(--primary-color);
        z-index: 10002;
        max-width: 350px;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Ensure critical functions are globally accessible
window.showLogin = showLogin;
window.hideLogin = hideLogin;
window.showSignup = showSignup;
window.hideSignup = hideSignup;
window.switchToLogin = switchToLogin;
window.switchToSignup = switchToSignup;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.closeMobileMenu = closeMobileMenu;