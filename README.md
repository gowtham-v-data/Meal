# 🏔️ Hill Calories AI - Meal Nutrition Analyzer

A professional, mobile-first web application that provides instant nutrition analysis from meal photos using AI-powered image recognition. Built with modern web technologies and optimized for production deployment.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/gowtham-v-data/Meal)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gowtham-v-data/Meal)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://gowtham-v-data.github.io/Meal/)

## 🚀 Features

- **⚡ Instant Analysis**: Get detailed nutrition data in under 3 seconds
- **📱 Mobile Optimized**: Professional camera integration with real-time preview
- **🎯 Accurate Results**: Precise breakdown of protein, carbs, fats, and calories
- **📸 Advanced Camera**: Switch between front/back cameras, high-quality capture
- **🎨 Modern UI**: Glassmorphism design with smooth animations
- **🌐 PWA Ready**: Install as native app on mobile devices
- **🔒 Secure**: HTTPS-ready with proper camera permissions

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Design**: Mobile-first responsive design with glassmorphism
- **API Integration**: RESTful webhook integration
- **Performance**: GPU-accelerated animations, optimized loading
- **Deployment**: Multi-platform ready (Netlify, Vercel, GitHub Pages)

## 📱 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- For camera functionality: HTTPS connection (for production)

### Installation

1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start uploading meal photos for analysis!

### Local Development

For local development with file protocol:
```bash
# Simple HTTP server (Python)
python -m http.server 8000

# Or with Node.js
npx http-server

# Then visit http://localhost:8000
```

## 🔧 API Integration

### Critical Webhook Endpoint: `/Meal`

The application is specifically configured to work with the `/webhook/Meal` endpoint:

**Development URL:** `https://danny-supercrowned-shawnda.ngrok-free.dev/webhook/Meal`
**Production URL:** `/webhook/Meal` (proxied through deployment platform)

### Setting Up Your Nutrition API

1. **Endpoint Configuration**: The `/Meal` endpoint is pre-configured in:
   - `script.js` - Main API call
   - `netlify.toml` - Netlify proxy configuration
   - `vercel.json` - Vercel proxy configuration

2. **Expected Request Format**:
   ```javascript
   POST /webhook/Meal
   Content-Type: multipart/form-data
   Body: FormData with 'image' file
   ```

3. **Expected Response Format**:
   ```json
   {
     "output": {
       "status": "success",
       "food": [
         {
           "name": "Food Item",
           "quantity": "100g",
           "calories": 100,
           "protein": 10,
           "carbs": 15,
           "fat": 5
         }
       ],
       "total": {
         "calories": 100,
         "protein": 10,
         "carbs": 15,
         "fat": 5
       }
     }
   }
   ```

### Expected API Request Format

The app sends a `POST` request with:
- **Content-Type**: `multipart/form-data`
- **Body**: FormData containing the image file
- **Headers**: Accept: application/json

## 📂 Project Structure

```
Hill-Calories-AI/
├── index.html          # Main HTML structure
├── styles.css          # Complete CSS styling
├── script.js           # JavaScript functionality
├── README.md           # Project documentation
└── .github/
    └── copilot-instructions.md  # Development guidelines
```

## 🎨 Customization

### Colors & Branding
Edit CSS custom properties in `styles.css`:
```css
:root {
    --primary-color: #2563eb;    /* Main brand color */
    --success-color: #059669;    /* Success states */
    --error-color: #dc2626;      /* Error states */
    /* ... more variables */
}
```

### Features & Content
- Update hero text in `index.html`
- Modify feature cards and benefits
- Customize nutrition display cards
- Add/remove sections as needed

## 🚀 Deployment

### Static Hosting (Recommended)
- **Netlify**: Drag & drop the folder
- **Vercel**: Connect your Git repository
- **GitHub Pages**: Push to `gh-pages` branch
- **AWS S3**: Upload as static website

### HTTPS Requirement
For camera functionality in production, ensure HTTPS is enabled.

## 📊 Performance Features

- **Lazy Loading**: Images load on demand
- **Optimized CSS**: Minimal, efficient styling
- **Compressed Assets**: Optimized for fast loading
- **Mobile-First**: Responsive design philosophy
- **Error Handling**: Graceful fallbacks and user feedback

## 🔒 Security & Privacy

- **Client-Side Processing**: Image preview handled locally
- **Secure Upload**: Files sent via secure POST requests
- **No Storage**: Images not stored locally (unless cached by browser)
- **Error Logging**: Configurable error tracking

## 📱 Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+
- **Features**: FileReader API, Fetch API, CSS Grid, Flexbox

## 🐛 Troubleshooting

### Common Issues

1. **Camera not working**: Ensure HTTPS in production
2. **Large file uploads**: Check file size limits (current: 10MB)
3. **API errors**: Verify endpoint URL and authentication
4. **Styling issues**: Check CSS custom properties support

### Development Mode

The app includes mock data for testing without an API:
```javascript
// Displays random mock nutrition data
this.displayMockResults();
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source. Feel free to use, modify, and distribute.

## 🔮 Future Enhancements

- [ ] Offline support with service workers
- [ ] Multiple image analysis
- [ ] Nutrition history tracking
- [ ] Social sharing features
- [ ] Advanced dietary insights
- [ ] Barcode scanning integration

## 📞 Support

For issues and questions:
- Check the browser console for errors
- Verify API endpoint configuration
- Ensure proper file formats (JPEG, PNG, WebP)
- Test with different image sizes

---

**Built with ❤️ for instant nutrition insights**