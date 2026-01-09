# Application Monitoring Guide

This guide explains how to set up free, continuous monitoring for your VPS application using **UptimeRobot**.

## Prerequisite: Deploy Changes
**Important**: You must deploy the latest backend code (which includes the new "health check" feature) to Render before setting this up.

1.  Push your changes to GitHub:
    ```bash
    git add .
    git commit -m "Add health check endpoint"
    git push origin main
    ```
2.  Wait for the Render deployment to finish.

## Setup UptimeRobot (Free)

1.  Go to [uptimerobot.com](https://uptimerobot.com/) and create a free account.
2.  Click **"Add New Monitor"**.

### Monitor 1: Frontend (User Interface)
*   **Goal**: Check if your website is loading for users.
*   **How to find the URL**:
    1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    2.  Click on your "vps" project.
    3.  Click the **"Visit"** button or copy the domain listed under "Domains" (e.g., `https://vps-chi.vercel.app`).
*   **Monitor Details**:
    *   **Monitor Type**: HTTP(s)
    *   **Friendly Name**: VPS Frontend
    *   **URL**: Paste the URL you found above.
    *   **Interval**: 5 minutes.

### Monitor 2: Backend Health (The "Deployed" Status)
*   **Goal**: Check if your Backend is running AND successfully connected to the Database.
*   **Monitor Details**:
    *   **Monitor Type**: HTTP(s)
    *   **Friendly Name**: VPS Backend Health
    *   **URL**: `https://vps-hqtk.onrender.com/actuator/health`
    *   **Interval**: 5 minutes.
    *   **Advanced**: You can optionally text-match for `"status": "UP"`.

## How to Read Alerts

*   **Frontend Down**: Your Vercel deployment is failing or Vercel is down. Users cannot load the page.
*   **Backend Health Down**:
    *   If the error is **Timeout/5xx**: Your Spring Boot app on Render has crashed or is restarting.
    *   If the error is **503 Service Unavailable** (but response is valid JSON): Your App is running, but the **Database connection failed**.

## Testing the Setup
Once configured, you can verify it works by visiting the backend health URL in your browser:
`https://vps-backend.onrender.com/actuator/health`

It should display:
```json
{"status":"UP"}
```
