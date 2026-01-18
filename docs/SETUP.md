# Setup Instructions

This guide provides detailed instructions on how to set up, run, and deploy the Kevlify Authenticator application.

## Prerequisites

Before identifying, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **git**

## Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/kevlify/authenticator.git
    cd kevlify-authenticator
    ```

2.  **Install dependencies**
    Run the following command to install dependencies for both the client (React) and the server (Express):
    ```bash
    npm run install:all
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory by copying the example:
    ```bash
    cp .env.example .env
    # On Windows PowerShell: copy .env.example .env
    ```
    
    Update the `.env` file with your specific configuration if needed (e.g., custom session secret).

## Running Locally (Development)

To start the application in development mode with hot-reloading:

```bash
npm run dev
```

This will start:
- **Frontend** (Vite): http://localhost:5173
- **Backend** (Express): http://localhost:3001

The frontend treats `/api` requests as proxy requests to the backend.

## Production Build

To test the production build locally:

1.  **Build the frontend**
    ```bash
    npm run build
    ```
    This compiles the React application into static files in `client/dist`.

2.  **Start the production server**
    ```bash
    npm start
    ```
    The server will serve the static frontend files and handle API requests on port 3001 (or your configured PORT).

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SESSION_SECRET` | Secret key for signing session cookies | - | **Yes** |
| `PORT` | Port for the backend server | `3001` | No |
| `DATABASE_PATH` | Path to the SQLite database file | `./server/data/kevlify.db` | No |
| `CORS_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:5173` | No |
| `LOG_LEVEL` | Logging verbosity (debug/info/warn/error) | `info` | No |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` | No |
| `VITE_API_URL` | Backend URL for frontend build (if separate) | (Relative `/api`) | No |

## Deployment (Render)

This project is configured for easy deployment on [Render](https://render.com).

1.  **Push to GitHub**: Ensure your code is pushed to a GitHub repository.
2.  **New Web Service**: In Render dashboard, create a NEW Web Service.
3.  **Connect Repo**: Select your repository.
4.  **Auto-Deploy**: Render should detect the `render.yaml` file.
5.  **Environment Variables**:
    - Add `SESSION_SECRET` (generate a random string).
    - Other variables will be set automatically based on `render.yaml`.

### Manual Deployment Configuration
If not using `render.yaml`:
- **Build Command**: `npm run install:all && npm run build`
- **Start Command**: `npm start`
- **Environment**: Node.js

## Testing

Run the End-to-End (E2E) test suite using Playwright:

```bash
# one-time browser installation
npx playwright install

# Run headless tests
npm run test:e2e

# Run tests with UI for debugging
npm run test:e2e:ui
```
