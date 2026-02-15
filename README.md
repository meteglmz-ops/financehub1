# FinanceHub - Production-Grade Financial Super App

A sophisticated financial management application with real-time market data, portfolio tracking, and multi-language support.

## Features

### Core Features
- 📊 **Real-Time Market Data** - Live crypto, forex, and commodity prices via public APIs
- 💼 **Portfolio Management** - Track investments with real-time P&L calculations
- 💰 **Budget Control** - Multi-account management with transaction tracking
- 📅 **Calendar View** - Visual bill tracker with monthly grid
- 🛠️ **Financial Tools** - Currency converter and loan calculator
- 🎯 **Savings Vaults** - Goal tracking with circular progress indicators
- 👁️ **Privacy Mode** - Hide all monetary values with one click
- 🌍 **10 Languages** - Turkish (default), English, German, French, Spanish, Russian, Arabic, Chinese, Japanese, Italian

### Technical Features
- 🔥 **Firebase Authentication** (with mock fallback)
- 🌐 **Auto Language Detection** 
- 📱 **Fully Responsive** - Mobile-first design
- 🎨 **Cyberpunk Theme** - Neon cyan/purple/pink aesthetics
- 🔄 **Auto-Refresh** - Market data updates every 60 seconds
- 💾 **Smart Caching** - Prevents API rate limits

## Firebase Setup (Optional)

The app works in **Demo Mode** by default. To enable real Google Authentication:

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Follow the setup wizard

### 2. Enable Google Authentication
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Add your domain to authorized domains

### 3. Get Firebase Config
1. Go to **Project Settings** → **General**
2. Scroll to "Your apps" section
3. Click the Web icon `</>`
4. Copy your Firebase configuration

### 4. Add to Environment Variables

Create `/app/frontend/.env` file (or update existing):

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef

# Backend URL (already configured)
REACT_APP_BACKEND_URL=your_backend_url
```

### 5. Restart Frontend
```bash
sudo supervisorctl restart frontend
```

**Note:** If Firebase is not configured, the app automatically falls back to Demo Mode.

## Language Support

The app automatically detects your browser/device language:
- Turkish device → App opens in Turkish
- English device → App opens in English
- Unsupported language → Falls back to Turkish

Change language anytime using the language selector in the sidebar.

## API Keys

### Required APIs (No Keys Needed - Public)
- **CoinGecko** - Crypto prices (free, no key)
- **Frankfurter** - Forex rates (free, no key)
- **Metals.live** - Gold prices (free, no key)

### Optional Firebase
- Only needed for real Google Authentication
- App works perfectly in Demo Mode without it

## Mobile Experience

- Hamburger menu (☰) for navigation
- Swipeable sidebar with backdrop
- Responsive tables with horizontal scrolling
- Touch-optimized buttons and controls
- Readable ticker tape on small screens

## Tech Stack

- **Frontend:** React, Tailwind CSS, Recharts
- **Backend:** FastAPI, MongoDB
- **Auth:** Firebase (optional) or localStorage (demo)
- **APIs:** CoinGecko, Frankfurter, Metals.live
- **i18n:** react-i18next with auto-detection

## Production Checklist

✅ Real Google Authentication with Firebase fallback
✅ Auto language detection (10 languages)
✅ Mobile responsive design
✅ Privacy mode for sensitive data
✅ Real-time market data with caching
✅ Portfolio tracking with P&L
✅ Calendar bill tracker
✅ Financial calculation tools
✅ Cyberpunk theme optimized for all screens

## Support

For issues or questions, check the Firebase setup steps above or ensure all environment variables are properly configured.
