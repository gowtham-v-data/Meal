# CORS Fix for Hill Calories AI

## The Problem
Your webhook is returning CORS errors because it doesn't include the necessary headers to allow cross-origin requests from your web app.

## The Solution
Add these headers to your webhook response:

```python
# If using Flask
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/webhook-test/Meal', methods=['POST', 'OPTIONS'])
def meal_analysis():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    # Your actual webhook logic here
    result = {"protein": 25, "carbs": 40, "fat": 15, "calories": 365}
    
    response = jsonify(result)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response
```

```javascript
// If using Express.js
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});
```

## Quick Test
Test your webhook with curl:
```bash
curl -X POST https://danny-supercrowned-shawnda.ngrok-free.dev/webhook-test/Meal \
  -H "Origin: http://localhost:8000" \
  -H "ngrok-skip-browser-warning: true" \
  -F "image=@test-image.jpg"
```

## Alternative: Use ngrok with CORS
If you can't modify your webhook, you can use ngrok's built-in CORS support:
```bash
ngrok http 5000 --response-header-add="Access-Control-Allow-Origin:*"
```