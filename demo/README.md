# CYS Demo

This demo showcases the Connect YourSelf (CYS) authentication flow with both a React frontend and Express backend.

## Requirements

- Node.js (v16 or higher)
- Yarn
- ngrok (recommended for mobile testing)

## Quick Start

### 1. Install Dependencies

From the root of the monorepo:

```bash
yarn install
yarn build
```

### 2. Setup Environment Variables

Create `.env` files for both frontend and backend:

**Backend** (`demo/backend/.env`):
```bash
BACKEND_URL=http://localhost:3001
```

**Frontend** (`demo/app/.env`):
```bash
VITE_BACKEND_URL=http://localhost:3001
```

### 3. Run Locally (Development)

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd demo/backend
yarn start
```
Backend will run on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd demo/app
yarn dev
```
Frontend will run on http://localhost:5173

Visit http://localhost:5173 to see the demo.

## Using with ngrok (Recommended for Mobile Testing)

To test authentication with the SELF mobile app, you need to expose your backend to the internet using ngrok:

### 1. Install ngrok

```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

### 2. Start ngrok

In a new terminal:
```bash
ngrok http 3001
```

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3001
```

### 3. Update Environment Variables

Copy the ngrok URL and update your `.env` files:

**Backend** (`demo/backend/.env`):
```bash
BACKEND_URL=https://abc123.ngrok-free.app
```

**Frontend** (`demo/app/.env`):
```bash
VITE_BACKEND_URL=https://abc123.ngrok-free.app
```

### 4. Restart Both Servers

Stop and restart both backend and frontend to pick up the new environment variables.

### 5. Test Authentication

1. Open the frontend in your browser
2. Click on either "Sign In With YourSelf" or "Connect YourSelf" tab
3. Scan the QR code with the SELF mobile app
4. Complete authentication on your mobile device
5. The browser will automatically detect successful authentication

## Demo Features

### Sign In With YourSelf (Fully Managed)
A complete, ready-to-use authentication component that handles:
- Challenge creation
- QR code display
- Polling for authentication
- Success state

### Connect YourSelf (Manual Control)
A customizable flow where you manually manage:
- Challenge creation via API
- Authentication polling
- State management
- Custom UI/UX

## API Endpoints

- `POST /challenges` - Create a new authentication challenge
- `GET /check-auth?challenge={did}` - Poll for authentication status
- `POST /login` - Callback endpoint for authentication responses
- `GET /login?challenge={did}` - Browser-friendly callback page

## Troubleshooting

### ngrok Warning Page

If you see an ngrok warning page, the demo already includes the `ngrok-skip-browser-warning` header in all API requests.

### Backend Connection Issues

Make sure:
1. Backend is running on port 3001
2. Environment variables are set correctly
3. You've restarted services after changing `.env` files

### Build Issues

If you see import errors, rebuild the packages:
```bash
cd ../..  # back to monorepo root
yarn build
```
