# 🤖 Hill Calories AI - Real API Integration Guide

## Overview

Your Hill Calories AI app now supports **real nutrition analysis** using multiple AI services! By default, it runs in demo mode, but you can easily connect to real APIs for production-level food analysis.

## 🚀 Quick Start

1. **Open the API Configuration Panel**
   - Click the "🤖 Configure APIs" button in the navigation
   - Or use the mobile menu → "🤖 Configure AI APIs"

2. **Choose Your Preferred API**
   - **OpenAI GPT-4 Vision** (Recommended) - Most accurate food recognition
   - **n8n Custom Workflow** - Use your existing automation setup
   - **Google Gemini Vision** - Google's multimodal AI
   - **Nutritionix Database** - Comprehensive nutrition data

3. **Configure and Test**
   - Enter your API keys/endpoints
   - Test the connection
   - Save the configuration

## 🔑 API Setup Instructions

### 1. OpenAI GPT-4 Vision (Recommended)

**Why Choose This:** Most accurate food recognition and nutrition analysis

**Setup Steps:**
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Enter the key in the configuration panel
4. Test the connection

**Sample Response Quality:**
```json
{
  "protein": 28,
  "carbs": 45,
  "fat": 12,
  "calories": 380
}
```

### 2. n8n Custom Workflow 

**Why Choose This:** Perfect if you already have n8n workflows or want custom logic

**Setup Steps:**
1. Create an n8n workflow with a webhook trigger
2. Add image processing and nutrition analysis nodes
3. Enter your webhook URL in the configuration
4. Optionally add an API key for security

**Workflow Template:**
- Webhook Trigger → Image Analysis → Nutrition Calculation → Response

### 3. Google Gemini Vision

**Why Choose This:** Excellent multimodal AI capabilities from Google

**Setup Steps:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Generate an API key
3. Enter the key in the configuration panel
4. Test the connection

### 4. Nutritionix Database

**Why Choose This:** Comprehensive nutrition database for known foods

**Setup Steps:**
1. Register at [Nutritionix Developer](https://developer.nutritionix.com/)
2. Get your Application ID and API Key
3. Enter both in the configuration panel
4. Test the connection

## 🔧 Advanced Configuration

### Programmatic Setup

You can also configure APIs programmatically:

```javascript
// Configure OpenAI
window.nutritionAnalyzer.apiConfig.openai.apiKey = 'your-openai-key';

// Configure n8n
window.nutritionAnalyzer.apiConfig.n8n.endpoint = 'https://n8n-rx89.onrender.com/webhook/Meal';
window.nutritionAnalyzer.apiConfig.n8n.apiKey = 'optional-security-key';

// Refresh configuration
window.nutritionAnalyzer.detectAvailableAPIs();
```

### Multiple API Fallback

The system automatically tries APIs in this order:
1. OpenAI GPT-4 Vision (if configured)
2. n8n Workflow (if configured)
3. Google Gemini Vision (if configured)
4. Clarifai Food Recognition (if configured)
5. Demo mode (as fallback)

## 📊 Expected Response Format

All APIs should return nutrition data in this format:

```json
{
  "protein": 25,     // grams
  "carbs": 40,       // grams  
  "fat": 15,         // grams
  "calories": 380    // total calories
}
```

## 🛡️ Security & Privacy

### API Key Security
- All API keys are stored locally in your browser
- Keys are never sent to our servers
- Use environment variables for production deployments

### Data Privacy
- Images are sent directly to your chosen API provider
- No data is stored on Hill Calories servers
- Follow your API provider's data policies

## 🚀 Production Deployment

### Environment Variables
For production deployments, use environment variables:

```bash
# OpenAI
REACT_APP_OPENAI_API_KEY=your_openai_key

# n8n  
REACT_APP_N8N_ENDPOINT=your_n8n_webhook
REACT_APP_N8N_API_KEY=your_n8n_key

# Google
REACT_APP_GOOGLE_API_KEY=your_google_key

# Nutritionix
REACT_APP_NUTRITIONIX_APP_ID=your_app_id
REACT_APP_NUTRITIONIX_API_KEY=your_api_key
```

### Build Configuration
Update your build process to inject these at build time:

```javascript
// In your build script
const config = {
  openai: {
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
  },
  n8n: {
    endpoint: process.env.REACT_APP_N8N_ENDPOINT || '',
    apiKey: process.env.REACT_APP_N8N_API_KEY || '',
  },
  // ... other APIs
};
```

## 🔍 Troubleshooting

### Common Issues

**"No API keys configured" message:**
- Open the API configuration panel
- Set up at least one API service
- Make sure to save the configuration

**"Connection failed" errors:**
- Check your API key is correct
- Verify your internet connection  
- Check API service status pages
- Review browser console for detailed errors

**Poor analysis results:**
- Try different APIs for comparison
- Ensure good photo quality (clear, well-lit)
- Consider food items the API might recognize better

### Debug Mode

Enable detailed logging:
```javascript
window.nutritionAnalyzer.debugMode = true;
```

## 📈 Usage Analytics

The app tracks basic usage statistics:

```javascript
// View session stats
console.log(window.nutritionAnalyzer.sessionStats);

// Sample output:
{
  analysesRequested: 5,
  demoResultsShown: 2,
  realResultsShown: 3,
  errorsEncountered: 0
}
```

## 🆕 Adding New APIs

Want to add a new nutrition analysis service? The code is designed to be extensible:

1. Add the new service to `apiConfig` in the constructor
2. Create an `analyzeWith[ServiceName]()` method
3. Update the `performRealAnalysis()` method to try your new service
4. Add configuration options to the setup panel

## 💡 Best Practices

### For Accuracy
- Use high-quality, well-lit photos
- Capture the entire meal in frame
- Include common foods that APIs can easily recognize
- Consider portion sizes in your prompts

### For Performance  
- Implement caching for repeated foods
- Use appropriate image compression
- Consider batch processing for multiple items
- Monitor API usage and costs

### For Users
- Provide clear feedback during analysis
- Show confidence levels when available
- Allow manual adjustments to results
- Offer nutritional goal tracking

## 🔗 Useful Links

- [OpenAI Platform](https://platform.openai.com/)
- [Google AI Studio](https://makersuite.google.com/)
- [Nutritionix Developer](https://developer.nutritionix.com/)
- [n8n Documentation](https://docs.n8n.io/)
- [Clarifai Food Model](https://clarifai.com/clarifai/main/models/food-item-recognition)

---

**Need Help?** Open the browser console and look for detailed logs, or check the configuration panel for connection test results.

**Ready for Production?** Your app is now equipped with real AI-powered nutrition analysis! 🎉