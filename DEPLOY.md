# Deployment Guide for VPS Application

This guide explains how to deploy your **Spring Boot Backend** and **React Frontend** for free.

## Prerequisites
- GitHub Account
- Accounts on [Render.com](https://render.com) (Backend & DB option) and [Vercel.com](https://vercel.com) (Frontend)

---

## 1. Database Setup (MySQL)
Since free MySQL hosting is scarce, you have two main options:

### Option A: Aiven (Free Tier MySQL)
1. Go to [Aiven.io](https://aiven.io) and sign up.
2. Create a new **MySQL** service (select the Free Plan/Tier).
3. Once created, copy the **Service URI** (Resulting connection string).
   - It usually looks like: `mysql://user:password@host:port/defaultdb?ssl-mode=REQUIRED`

### Option B: Render (PostgreSQL - Recommended if flexible)
Render offers free PostgreSQL. If you can switch from MySQL to PostgreSQL:
1. Update `pom.xml` to include `postgresql` driver instead of `mysql`.
2. Update `application.properties` driver name.
3. Create a **PostgreSQL** database on Render.

*> **Note:** This guide assumes you stick with MySQL (Option A) or find another MySQL provider.*

---

## 2. Backend Deployment (Render)
Render can build your Dockerfile automatically.

1. **Push your code** to a GitHub repository.
2. Log in to [Render.com](https://render.com).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Select the `vps-backend` directory as the **Root Directory** (Important!).
6. **Runtime**: Select **Docker**.
7. **Instance Type**: Free.
8. **Environment Variables**: Add the following:
   - `SPRING_DATASOURCE_URL`: Your database JDBC URL (e.g., `jdbc:mysql://host:port/db_name`)
   - `SPRING_DATASOURCE_USERNAME`: Your DB username
   - `SPRING_DATASOURCE_PASSWORD`: Your DB password
9. Click **Create Web Service**.
   - Render will build the Docker image and deploy it.
   - Once live, you will get a URL (e.g., `https://vps-backend.onrender.com`).
   - *Note: Free tier spins down after inactivity. The first request might take 50s+.*

---

## 3. Frontend Deployment (Vercel)
Vercel is excellent for React/Vite apps.

1. In your project code, you need to ensure the frontend knows the backend URL.
   - check the `src` folder for where you define the base URL (e.g., axios config, or fetch calls).
   - It should use an environment variable, e.g., `import.meta.env.VITE_API_URL`.
   - *If hardcoded to localhost, change it!*
2. Login to [Vercel](https://vercel.com).
3. **Add New** -> **Project**.
4. Import your Git Repository.
5. **Project Settings**:
   - Framework Preset: **Vite** (should auto-detect).
   - Root Directory: `vps-frontend`.
6. **Environment Variables**:
   - `VITE_API_BASE_URL` (or your variable name): `https://vps-backend.onrender.com` (The backend URL from step 2).
7. Click **Deploy**.

---

## 4. Final Connection
1. Open your Vercel URL (e.g., `https://vps-frontend.vercel.app`).
2. Try logging in or performing an action.
3. If it fails, check the Browser Console (F12) and the Network tab.
   - Verify it's calling the Render backend URL.
   - Check Render logs for backend errors.
