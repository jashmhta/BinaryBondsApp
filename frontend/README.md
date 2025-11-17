# BinaryBonds Frontend

Cross-platform bond portfolio management application built with React Native and Expo.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn 1.22+
- Expo CLI

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn start
```

### Platform-Specific Development

```bash
# Run on iOS (requires macOS)
yarn ios

# Run on Android
yarn android

# Run on Web
yarn web
```

## 🌐 Web Deployment

### Build for Production

```bash
# Build web version
yarn web:build

# Test locally
yarn web:serve
# Open http://localhost:3000
```

### Deploy to Netlify

**Option 1: Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

**Option 2: Git Integration**
1. Push code to GitHub
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import project"
4. Select your repository
5. Configure:
   - Base directory: `frontend`
   - Build command: `yarn web:build`
   - Publish directory: `frontend/dist`
6. Add environment variable:
   - `EXPO_PUBLIC_BACKEND_URL`: Your backend API URL

### Environment Variables

Create `.env` file:
```bash
EXPO_PUBLIC_BACKEND_URL=https://your-api-domain.com
```

## 📱 Mobile App Deployment

### iOS (App Store)

```bash
npm install -g eas-cli
eas login
eas build --platform ios
eas submit --platform ios
```

### Android (Play Store)

```bash
eas build --platform android
eas submit --platform android
```

## 🏗️ Project Structure

```
frontend/
├── app/                  # Expo Router screens
│   ├── (tabs)/          # Bottom tab navigation
│   ├── bond/[id].tsx    # Dynamic routes
│   ├── login.tsx
│   └── register.tsx
├── contexts/            # React contexts
├── services/            # API services
├── assets/             # Images, fonts
└── app.json           # Expo config
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `yarn start` | Start Expo dev server |
| `yarn android` | Run on Android |
| `yarn ios` | Run on iOS |
| `yarn web` | Run on web browser |
| `yarn web:build` | Build for web production |
| `yarn web:serve` | Serve web build locally |
| `yarn lint` | Run ESLint |

## 📚 Documentation

- [Main README](../README.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [Architecture Guide](../ARCHITECTURE.md)

## 🐛 Troubleshooting

**Clear cache:**
```bash
yarn start -c
```

**Clean install:**
```bash
rm -rf node_modules && yarn install
```

---

Built with ❤️ using React Native & Expo
