# Vision Public School (VPS) - Full System Documentation

## 1. Global System Architecture 🌍

This system uses a **Cloud-Native Microservices-like Architecture**.
The application is split into 4 distinct parts hosted on different cloud providers.

### **The 4 Pillars of VPS**
1.  **Frontend (The Face)**: Hosted on **Vercel**. This is what the user sees.
2.  **Backend (The Brain)**: Hosted on **Render**. This processes logic.
3.  **Database (The Memory)**: Hosted on **Aiven**. This stores data.
4.  **Monitoring (The Watchdog)**: Hosted on **UptimeRobot**. This checks health.

### **Integration Diagram**
```mermaid
graph TD
    User((User)) -- "1. Visit Website" --> Vercel[Frontend (Vercel)]
    Vercel -- "2. API Requests" --> Render[Backend (Render)]
    Render -- "3. Read/Write Data" --> Aiven[(MySQL DB (Aiven))]
    
    subgraph Monitoring System
    Uptime[UptimeRobot] -- "4. Health Check (Every 5m)" --> Render
    end
```

---

## 2. Detailed Integration Workflow 🔗

### **How Vercel talks to Render (Frontend -> Backend)**
*   **The Problem**: Vercel is in the USA (e.g., East Coast) and Render might be in a different region. They are completely separate computers.
*   **The Solution**: REST API over HTTP.
*   **Mechanism**:
    1.  The Frontend has a "Key" (Environment Variable `VITE_API_BASE_URL`).
    2.  This key holds the address of the Backend: `https://vps-hqtk.onrender.com`.
    3.  Every time a user does anything, Vercel sends a message to this address.

### **How Render talks to Aiven (Backend -> Database)**
*   **The Problem**: The Backend code (Java) needs to save data effectively.
*   **The Solution**: JDBC Connection.
*   **Mechanism**:
    1.  The Backend has "Secret Keys" (Env Variables: `SPRING_DATASOURCE_URL`, `USERNAME`, `PASSWORD`).
    2.  When the Backend starts, it uses these keys to "login" to the Aiven MySQL server.
    3.  It keeps this connection open ("Connection Pooling") to query data instantly (milliseconds).

### **How Render talks to Cloudinary (File Storage)**
*   **The Problem**: Render deletes files when it restarts.
*   **The Solution**: We store files in Cloudinary.
*   **Mechanism**:
    1.  The Backend acts as a "Middleman".
    2.  It sends the file to Cloudinary using `CLOUDINARY_API_KEY`.
    3.  Cloudinary returns a URL (`http://...`).
    4.  Backend saves this URL in the MySQL Database.

### **How UptimeRobot talks to Render (Monitoring)**
*   **The Mechanism**:
    1.  We created a special door in the Backend called `/actuator/health`.
    2.  If you knock on this door, the Backend runs a self-test: "Can I talk to the Database?".
    3.  If YES, it replies `UP`. If NO, it replies `DOWN`.
    4.  UptimeRobot knocks on this door every 5 minutes. If it ever hears "DOWN" or silence, it emails you.

---

## 3. Deep Dive: Implementation of Every Feature ⚙️

### **1. Login & Authentication** 🔐
*   **Flow**:
    1.  User enters credentials.
    2.  Frontend sends `POST /api/auth/login`.
    3.  Backend looks up the `Student` table by `admissionNo`.
    4.  If password matches -> Updates `lastLogin` timestamp -> Returns User Object.
    5.  **Critical Security**: The Frontend stores this User Object in `localStorage`. This acts as the "Session". All private pages check this storage before opening.

### **2. Homework System** 📝
*   **Teacher Upload**:
    1.  Teacher fills form + selects PDF.
    2.  Frontend uses `FormData` to bundle text + file.
    3.  Backend `POST /api/features/homework` receives `MultipartFile`.
    4.  **File Storage**: The file bytes are saved to the server's disk (in `/uploads` folder).
    5.  **DB Entry**: A row is added to `homework` table with the `filePath` pointing to that image/pdf.
*   **Student View**:
    1.  Frontend calls `GET /api/features/homework?studentId=...`.
    2.  Backend filters homework by the student's `Class` and `Section`.
    3.  Returns list. User clicks "Download" -> Backend serves the file from the disk.

### **3. Fee Payment System** 💰
*   **Step A: Payment**:
    1.  Student sees "Pending Amount".
    2.  Scans QR code (Offline Payment via UPI).
*   **Step B: Verification**:
    1.  Student takes screenshot of payment.
    2.  Uploads it via "Upload Receipt".
    3.  Backend saves this as a `Payment` request with status `PENDING`.
*   **Step C: Approval**:
    1.  Admin logs in -> Goes to Admin Dashboard.
    2.  Sees "Pending Payments".
    3.  Clicks "Verify".
    4.  Backend updates `Payment` status to `Verified` AND updates `Student` fee record to reduce pending amount.

### **4. Live Class System** 📹
*   **Teacher**:
    1.  Enters "Topic" and clicks "Go Live".
    2.  Backend creates a `LiveSession` entry with `isActive = true`.
    3.  React uses the **ZegoCloud SDK** (or Jitsi/Embedded Video) to start a room using a unique `roomID`.
*   **Student**:
    1.  Dashboard polls `GET /api/features/live-class`.
    2.  If response has a session where `isActive = true`, the "Join" button appears.
    3.  Clicking "Join" connects them to the same `roomID`.

### **5. Attendance System** 📅
*   **Marking (Teacher)**:
    1.  Selects Class `10` Section `A`.
    2.  Backend `GET /api/students` filters by 10-A.
    3.  Teacher toggles Present/Absent.
    4.  Backend saves a batch of `Attendance` records for specific `Date`.
*   **Viewing (Student)**:
    1.  Frontend `GET /api/features/attendance`.
    2.  Backend queries `Attendance` table for `studentId`.
    3.  Frontend converts this list of dates into Red/Green flags on the Calendar UI.

### **6. Report Generation** 📊
*   **The Logic**:
    1.  Admin clicks "Fee Report".
    2.  Backend runs a complex SQL aggregation: `SELECT SUM(paid) FROM payments GROUP BY class`.
    3.  It calculates Total Expected vs Total Received.
    4.  Returns a JSON summary `{"Class 10": {"pending": 50000, "received": 20000}}`.
    5.  Frontend renders this as a Bar Chart or Table.

### **7. Notice Board** 📌
*   **Broadcast**:
    1.  Admin posts Notice.
    2.  Backend saves to `Notice` table.
*   **Targeting**: notices can be global.
*   **Polling**: Every user's dashboard requests `GET /api/features/notices` on load to see the latest 5 items.

---

## 4. Database Schema Structure 🗄️

To support the above, the database is structured as follows:
*   **users/students**: `id, name, admissionNo, password, role, class, section, feesPending`
*   **homework**: `id, title, description, class, section, filePath, dueDate`
*   **attendance**: `id, studentId, date, status (P/A)`
*   **payments**: `id, studentId, amount, screenShotPath, status (Pending/Verified)`
*   **notices**: `id, title, content, date`
*   **live_sessions**: `id, teacherId, roomId, driveLink, isActive`
