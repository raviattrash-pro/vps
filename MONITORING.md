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
This checks if your website is accessible to users.

*   **Monitor Type**: HTTP(s)
*   **Friendly Name**: VPS Frontend
*   **URL (or IP)**: `https://vps-frontend-one.vercel.app` (or your actual Vercel URL)
*   **Monitoring Interval**: 5 minutes
*   **Select "Alert Contacts To Notify"**: Check your email.
*   Click **Create Monitor**.

### Monitor 2: Backend & Database Health
This checks if your Backend is running AND if it can successfully talk to your Database.

*   **Monitor Type**: HTTP(s)
*   **Friendly Name**: VPS Backend Health
*   **URL (or IP)**: `https://vps-backend.onrender.com/actuator/health`
    *   *Note: Replace `vps-backend.onrender.com` with your actual Render URL if different.*
*   **Monitoring Interval**: 5 minutes
*   **Advanced Settings (Optional)**:
    *   You can look for the keyword `UP` in the response ensuring it returns `{"status":"UP"}`.
*   **Select "Alert Contacts To Notify"**: Check your email.
*   Click **Create Monitor**.

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
