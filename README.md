# Fytr - AI-Powered Gym Form Analysis

Fytr is a comprehensive fitness application that helps users track their workouts, nutrition, and improve their gym form using AI-powered video analysis.

## Project Structure

The project is divided into three main components:

- **`frontend/`**: A React Native (Expo) mobile application.
- **`backend/`**: A Node.js Express server handling user data, workouts, and quotas.
- **`fastapi/`**: A Python FastAPI server specialized in AI video analysis using Google Gemini.

## Features

- **User Authentication**: Secure login via Firebase and Google Sign-in.
- **Form Analysis**: Upload workout videos to get real-time feedback on your form (powered by Google Gemini).
- **Workout Planning**: Create and manage personalized workout plans.
- **Nutrition Tracking**: Calculate and track daily nutrition targets (calories, protein, etc.).
- **Body Metrics**: Track age, weight, height, and activity level.
- **Quota Management**: Controlled AI usage via a credit-based system.

## Tech Stack

- **Mobile**: React Native, Expo, NativeWind (Tailwind CSS), Zustand, React Navigation.
- **Backend**: Node.js, Express, PostgreSQL, Firebase Admin, Cloudinary.
- **AI Service**: Python, FastAPI, Google Gemini API.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.9 or higher)
- [PostgreSQL](https://www.postgresql.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Firebase Account](https://firebase.google.com/)
- [Google Gemini API Key](https://aistudio.google.com/)
- [Cloudinary Account](https://cloudinary.com/)

### 1. Backend Setup (Express)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and add the following:
   ```env
   PORT=3000
   PG_HOST=your_postgres_host
   PG_PORT=5432
   PG_USER=your_postgres_user
   PG_PASSWORD=your_postgres_password
   PG_DATABASE=your_database_name
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```
4. Setup the database:
   - Run the SQL script found in `backend/database.sql` on your PostgreSQL instance.
5. Add your Firebase `serviceAccount.json` to `backend/src/config/`.
6. Start the server:
   ```bash
   npm run dev
   ```

### 2. AI Service Setup (FastAPI)

1. Navigate to the fastapi directory:
   ```bash
   cd fastapi
   ```
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `fastapi/` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   EXPRESS_API_URL=http://localhost:3000
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### 3. Frontend Setup (React Native / Expo)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your API URLs:
   - Update `frontend/src/api/client.ts` with your Express backend URL.
   - Update `frontend/src/api/videoClient.ts` with your FastAPI server URL.
4. Add your `google-services.json` (for Android) or `GoogleService-Info.plist` (for iOS) if needed for Firebase.
5. Start the Expo development server:
   ```bash
   npx expo start
   ```

---

## Scripts

- **Backend**: `npm run dev`, `npm start`
- **FastAPI**: `uvicorn main:app --reload`
- **Frontend**: `npm run android`, `npm run ios`, `npm run web`, `npm run lint`

## License

This project is licensed under the ISC License.
