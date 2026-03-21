<div align="center">
  <img src="https://api.dicebear.com/9.x/shapes/svg?seed=VPS&backgroundColor=0f4c3a" width="120" height="120" alt="VPS Logo" />
  <h1>🏫 Vision Public School (VPS)</h1>
  <p><strong>The All-in-One Enterprise School Management System</strong></p>

  <div>
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  </div>

  <br />

  ---

  [Explore Features](#-features) • [User Guide](#-user-operations-manual) • [Setup Guide](#-developer-setup) • [Support](#-support--faq)

  ---
</div>

<br />

## 🌟 Overview
Vision Public School (VPS) is a high-performance, cloud-native ERP system designed to digitize every aspect of school administration. Built with a **modern glassmorphism UI**, it ensures that students, parents, faculty, and management stay connected through a unified digital ecosystem.

---

## 📸 Interface Previews

<details open>
<summary><strong>🔍 Click to Expand: System Dashboards</strong></summary>

| Student Hub | Admin Command Center |
| :---: | :---: |
| ![Student Dashboard](assets/sop/student_dashboard.png) | ![Admin Users](assets/sop/admin_users.png) |

| Faculty Portal | Finance Hub |
| :---: | :---: |
| ![Teacher Dashboard](assets/sop/teacher_dashboard.png) | ![Accountant Reports](assets/sop/accountant_reports.png) |

</details>

---

## 🛠️ Infrastructure & Stack

### **Service Providers**
| Component | Provider | Role | Status |
| :--- | :--- | :--- | :--- |
| **Backend** | Render | Spring Boot API | Always On (via Pinger) |
| **Frontend** | Vercel | React/Vite | Instant Load |
| **Primary DB** | Aiven | MySQL (Write) | Managed & Secure |
| **Secondary DB** | TiDB Cloud | MySQL (Read/Backup) | Auto-Synced Daily |
| **Artifacts** | GitHub | SQL Backups | Stored for 5 Days |

### **Architecture Flow**
```mermaid
graph LR
    User((User)) --> Web[Frontend - Vercel]
    Web --> API[Backend - Render]
    API --> DB[(Aiven MySQL)]
    API --> CDN[Cloudinary Media]
    DB -.-> TiDB[(TiDB Backup)]
```

---

## 🧑‍💻 User Operations Manual

<details>
<summary><strong>🎓 For Students & Parents</strong></summary>

### **Operations**
1.  **Fee Payment**: Scan the QR code in the **Fees** section, pay via UPI, and upload the receipt.
2.  **Academic tracking**: Access **Homework**, **Syllabus**, and **Study Materials** from the sidebar.
3.  **Live Class**: Click the green **Join** button when a session is active.
4.  **Results**: Instantly download marksheets from the **Marks** tab.

### **Visual Guide**
![Fee Payment](assets/sop/fee_payment_qr.png)
*Typical payment process for students*

</details>

<details>
<summary><strong>👩‍🏫 For Faculty & Teachers</strong></summary>

### **Operations**
1.  **Attendance**: Toggle **P/A** for your assigned class and click **Save**.
2.  **Assigning Content**: Use the **Create Content** panel to post homework and syllabus.
3.  **Virtual Classroom**: Enter a topic and click **Go Live** to start a session.

### **Visual Guide**
![Homework Assignment](assets/sop/homework_assignment.png)
*Homework creation portal for teachers*

</details>

<details>
<summary><strong>🛠️ For Management & Staff</strong></summary>

### **Operations**
1.  **Finance**: Verify student payments and generate class-wise collection reports.
2.  **Notice Board**: Broadcast urgent school-wide announcements.
3.  **User Management**: Register new students and staff members.

### **Visual Guide**
![Notice Board](assets/sop/notice_board.png)
*Central notice board for school-wide communication*

</details>

---

## 🚀 Developer Setup

<details>
<summary><strong>⚙️ Requirements & Installation</strong></summary>

> [!IMPORTANT]
> Ensure you have Node.js (v18+) and JDK (v17+) installed before proceeding.

### **1. Configure Environment**
Rename the sample env files and fill in your secrets:
*   **Backend**: Edit `src/main/resources/application.properties` (MySQL/Cloudinary/JWT).
*   **Frontend**: Create `.env` with `VITE_API_BASE_URL`.

### **2. Local Execution**
```bash
# Start Backend
cd vps-backend && mvn spring-boot:run

# Start Frontend
cd vps-frontend && npm install && npm run dev
```
</details>

---

## 🆘 Support & FAQ

> [!TIP]
> Always use Chrome or Edge for the smoothest experience with interactive charts and video sessions.

*   **Q: How do I reset my password?**  
    Contact the school Admin to trigger a secure reset from the dashboard.
*   **Q: Where can I Find SQL Backups?**  
    Backups are stored in the GitHub Artifacts section of this repository for up to 5 days.

---
<div align="center">
  <p><i>Vision Public School - Excellence in Every Action</i></p>
</div>
