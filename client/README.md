# PARCEL: P2P Shipping Platform (Frontend)

Welcome to the frontend of the PARCEL platform. This project is built using React 18, Vite, TypeScript, and TailwindCSS to provide a fast and robust user experience.

## 🚀 Quick Setup

First, ensure you have the necessary dependencies installed:

```bash
cd client
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 8
- **Language**: TypeScript 5
- **Routing**: React Router 7
- **Styling**: TailwindCSS 4
- **Components**: Shadcn/UI + Base UI
- **Animations**: Framer Motion 12
- **Forms**: Zod + React Hook Form
- **Charts**: Recharts 3

## 🏗️ Project Structure

The project currently has 25 MVP screens implemented covering everything from landing pages to complex flows like shipment booking and tracking. The source code is organized generally as:
- `/src/components`: Reusable UI components.
- `/src/app`: Page views representing different routes.
- `/src/lib`: Utility functions and shared helpers.
- `/src/context`: React contexts for shared state (e.g. Auth, Bookings).

## 🌍 Environment Variables

Create a `.env.local` file in the `client` directory (or modify the existing one) to include required variables:

```
VITE_API_URL=http://localhost:3001
```

## 📝 Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles TypeScript and builds the application for production.
- `npm run preview`: Previews the built production application locally.
