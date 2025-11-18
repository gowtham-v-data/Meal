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

        // Result elements
        this.proteinValue = document.getElementById('proteinValue');
        this.carbsValue = document.getElementById('carbsValue');
        this.fatValue = document.getElementById('fatValue');
        this.caloriesValue = document.getElementById('caloriesValue');

        // Button text elements
        this.btnText = this.analyzeBtn.querySelector('.btn-text');
        this.btnLoading = this.analyzeBtn.querySelector('.btn-loading');

        this.selectedImage = null;
        this.cameraModal = null;
        this.videoStream = null;
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
        this.imageInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Upload area click
        this.uploadArea.addEventListener('click', () => {
            if (!this.selectedImage) {
                this.imageInput.click();
            }
        });

        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Button events
        this.analyzeBtn.addEventListener('click', () => this.analyzeImage());
        this.captureBtn.addEventListener('click', () => this.capturePhoto());

        // Preview image click to change
        this.previewImage.addEventListener('click', () => this.imageInput.click());
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processSelectedFile(file);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                this.processSelectedFile(file);
            } else {
                this.showError('Please select a valid image file.');
            }
        }
    }

    processSelectedFile(file) {
        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showError('File size too large. Please select an image under 10MB.');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('Please select a valid image file.');
            return;
        }

        this.selectedImage = file;
        this.displayPreview(file);
        this.enableAnalyzeButton();
        this.hideError();
    }

    displayPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewImage.src = e.target.result;
            this.previewImage.style.display = 'block';

            // Hide upload placeholder
            const placeholder = this.uploadArea.querySelector('.upload-placeholder');
            placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    async capturePhoto() {
        try {
            // Check if device supports camera
            if (this.isMobileDevice() && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                await this.openCameraStream();
            } else {
                // Fallback: Use file input with camera capture
                this.imageInput.setAttribute('capture', 'environment');
                this.imageInput.setAttribute('accept', 'image/*');
                this.imageInput.click();
            }
        } catch (error) {
            console.error('Camera access error:', error);
            this.handleCameraError(error);
        }
    }

    enableAnalyzeButton() {
        this.analyzeBtn.disabled = false;
    }

    disableAnalyzeButton() {
        this.analyzeBtn.disabled = true;
    }

    showLoading() {
        this.isAnalyzing = true;
        this.btnText.style.display = 'none';
        this.btnLoading.style.display = 'inline-flex';
        this.disableAnalyzeButton();
    }

    hideLoading() {
        this.isAnalyzing = false;
        this.btnText.style.display = 'inline';
        this.btnLoading.style.display = 'none';
        if (this.selectedImage) {
            this.enableAnalyzeButton();
        }
    }

    async analyzeImage() {
        if (!this.selectedImage || this.isAnalyzing) {
            return;
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

            // More detailed error messages based on error type
            let errorMessage = 'Failed to analyze image. ';

            if (error.message.includes('HTTP error')) {
                errorMessage += 'Server connection failed. Please check if the API is available.';
            } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                errorMessage += 'Network error. Please check your internet connection and try again.';
            } else if (error.message.includes('Invalid response format')) {
                errorMessage += 'Unexpected response from server. Please try again.';
            } else {
                errorMessage += 'Please try again or contact support if the issue persists.';
            }

            this.showError(errorMessage);

            // Show mock results for demonstration (comment out in production)
            console.log('Showing mock results due to API error. Error details:', error.message);
            this.displayMockResults();
        } finally {
            this.hideLoading();
        }
    }

    async makeNutritionRequest(formData) {
        // Webhook endpoint for meal analysis - /Meal is the critical endpoint
        const isLocalhost = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.port === '8000';
        const isGitHubPages = window.location.hostname.includes('github.io');

        const API_ENDPOINT = (isLocalhost || isGitHubPages) ?
            'https://danny-supercrowned-shawnda.ngrok-free.dev/webhook/Meal' :
            '/webhook/Meal'; // Other platforms use proxy

        console.log('🌐 Current location:', window.location.href);
        console.log('🔍 Is localhost?:', isLocalhost);
        console.log('🔍 Is GitHub Pages?:', isGitHubPages);
        console.log('🎯 Selected API_ENDPOINT:', API_ENDPOINT);
        console.log('📋 FormData contents:', Array.from(formData.entries()));
        console.log('⚠️ Note: /webhook/Meal endpoint is essential for nutrition analysis');

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors' // Enable CORS for cross-origin requests
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response body:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
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
        // Mock data for demonstration purposes
        const mockData = {
            protein: Math.floor(Math.random() * 30) + 15, // 15-45g
            carbohydrates: Math.floor(Math.random() * 40) + 20, // 20-60g
            fat: Math.floor(Math.random() * 20) + 5, // 5-25g
        };

        // Calculate calories (rough estimation)
        mockData.calories = Math.round(
            (mockData.protein * 4) +
            (mockData.carbohydrates * 4) +
            (mockData.fat * 9)
        );

        this.displayResults(mockData);

        // Show info about mock data
        console.log('Displaying mock results for demonstration. Replace with actual API integration.');
    }

    showError(message) {
        this.errorMessage.querySelector('p').textContent = message;
        this.errorMessage.style.display = 'block';
        this.resultsSection.style.display = 'none';
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    reset() {
        // Reset the analyzer state
        this.selectedImage = null;
        this.previewImage.style.display = 'none';
        this.previewImage.src = '';

        // Show upload placeholder
        const placeholder = this.uploadArea.querySelector('.upload-placeholder');
        placeholder.style.display = 'flex';

        // Reset buttons
        this.disableAnalyzeButton();
        this.hideLoading();

        // Hide results and errors
        this.resultsSection.style.display = 'none';
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
        this.imageInput.value = '';
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

        console.log('🚀 Hill Calories AI initialized successfully - Version 2.0');
        console.log('🌐 Platform:', window.location.hostname);
        console.log('📡 Current timestamp:', new Date().toISOString());

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
    const modal = document.getElementById('loginModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideLogin() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function showSignup() {
    const modal = document.getElementById('signupModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideSignup() {
    const modal = document.getElementById('signupModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
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
    const notification = document.getElementById('welcomeNotification');
    notification.style.display = 'none';
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
    if (isLoggedIn) {
        authButtons.innerHTML = `
            <span class="user-info">${userEmail.split('@')[0]}</span>
            <button class="btn-logout" onclick="handleLogout()">Logout</button>
        `;
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