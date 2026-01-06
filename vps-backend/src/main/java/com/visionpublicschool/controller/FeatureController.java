package com.visionpublicschool.controller;

import com.visionpublicschool.entity.*;
import com.visionpublicschool.repository.*;
import com.visionpublicschool.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, allowCredentials = "true")
public class FeatureController {

    @Autowired
    private HomeworkRepository homeworkRepository;
    @Autowired
    private NoticeRepository noticeRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private StudyMaterialRepository studyMaterialRepository;
    @Autowired
    private QuestionRepository questionRepository;
    @Autowired
    private SyllabusRepository syllabusRepository;
    @Autowired
    private AttendanceRepository attendanceRepository;
    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private FileStorageService fileStorageService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private WhatsAppService whatsAppService;

    // Homework
    @GetMapping("/homework")
    public List<Homework> getHomework() {
        return homeworkRepository.findAll();
    }

    @PostMapping("/homework")
    public Homework createHomework(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "dueDate", required = false) String dueDate,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        Homework homework = new Homework();
        homework.setTitle(title);
        homework.setDescription(description);
        if (dueDate != null && !dueDate.isEmpty()) {
            homework.setDueDate(LocalDate.parse(dueDate));
        } else {
            homework.setDueDate(LocalDate.now().plusDays(1));
        }

        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.storeFile(file);
            homework.setFileName(fileName);
        }

        Homework saved = homeworkRepository.save(homework);

        // Notifications
        String subject = "New Homework: " + title;
        String body = "Dear Student,\n\nNew homework has been uploaded.\n\nTitle: " + title + "\nDescription: "
                + description + "\nDue Date: " + homework.getDueDate() + "\n\nPlease check the portal for details.";

        // Send to common class email (Placeholder)
        emailService.sendEmail("class10@visionpublicschool.com", subject, body);

        // Send to class WhatsApp Group
        whatsAppService.sendWhatsAppMessage("Class 10 Group", subject + " - Check Portal");

        return saved;
    }

    @PostMapping("/payment/qr")
    public String uploadQrCode(@RequestParam("file") MultipartFile file) {
        // Force save as 'school_qr.png' (or jpg, detecting extension would be better
        // but let's assume image)
        // Actually, let's just use the FileStorageService and return the name.
        // To make it persistent and "single source", we should probably have a
        // "Setting" entity.
        // For this homework, I will simply store the filename in a specific "Payment"
        // record with ID=1 or something?
        // No, let's simply save it to disk and return the name, and the frontend can
        // assume a fixed URL if we save it as fixed name.

        try {
            java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads");
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }
            String fileName = "school_qr.png";
            try (java.io.InputStream inputStream = file.getInputStream()) {
                java.nio.file.Files.copy(inputStream, uploadPath.resolve(fileName),
                        java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }
            return fileName;
        } catch (Exception e) {
            throw new RuntimeException("Could not store file " + e.getMessage());
        }
    }

    @DeleteMapping("/homework/{id}")
    public ResponseEntity<?> deleteHomework(@PathVariable Long id) {
        try {
            if (!homeworkRepository.existsById(id)) {
                return ResponseEntity.status(404).body("Homework not found");
            }
            homeworkRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error deleting homework: " + e.getMessage());
        }
    }

    @GetMapping("/payment")
    public List<Payment> getPayments(@RequestParam(required = false) Long studentId) {
        if (studentId != null) {
            return paymentRepository.findByStudentId(studentId);
        }
        return paymentRepository.findAll();
    }

    @PostMapping("/payment")
    public Payment createPayment(
            @RequestParam("amount") Double amount,
            @RequestParam("studentId") Long studentId,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        System.out.println("Processing Payment: Amount=" + amount + ", StudentId=" + studentId);

        Payment payment = new Payment();
        payment.setAmount(amount);
        payment.setDate(LocalDate.now());
        payment.setStatus("PENDING");

        System.out.println("Finding Student...");
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        payment.setStudent(student);
        System.out.println("Student Found: " + student.getName());

        if (file != null && !file.isEmpty()) {
            System.out.println("Storing File: " + file.getOriginalFilename());
            try {
                String fileName = fileStorageService.storeFile(file);
                payment.setScreenshotFileName(fileName);
                System.out.println("File Stored: " + fileName);
            } catch (Exception e) {
                e.printStackTrace();
                throw new RuntimeException("File upload failed");
            }
        }

        System.out.println("Saving Payment...");
        return paymentRepository.save(payment);
    }

    @PutMapping("/payment/{id}/verify")
    public Payment verifyPayment(@PathVariable Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setStatus("VERIFIED");
        return paymentRepository.save(payment);
    }

    // Notices
    @GetMapping("/notices")
    public List<Notice> getNotices() {
        return noticeRepository.findAll();
    }

    @PostMapping("/notices")
    public Notice createNotice(@RequestBody Notice notice) {
        if (notice.getDate() == null)
            notice.setDate(LocalDate.now());
        return noticeRepository.save(notice);
    }

    @DeleteMapping("/notices/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable Long id) {
        if (!noticeRepository.existsById(id)) {
            return ResponseEntity.status(404).body("Notice not found");
        }
        noticeRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Study Material
    @GetMapping("/studymaterial")
    public List<StudyMaterial> getStudyMaterial() {
        return studyMaterialRepository.findAll();
    }

    @PostMapping("/studymaterial")
    public StudyMaterial createStudyMaterial(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        StudyMaterial material = new StudyMaterial();
        material.setTitle(title);
        material.setDescription(description);
        material.setUploadDate(LocalDate.now());

        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.storeFile(file);
            material.setFileName(fileName);
        }

        return studyMaterialRepository.save(material);
    }

    @DeleteMapping("/studymaterial/{id}")
    public ResponseEntity<?> deleteStudyMaterial(@PathVariable Long id) {
        if (!studyMaterialRepository.existsById(id)) {
            return ResponseEntity.status(404).body("Material not found");
        }
        studyMaterialRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @Autowired
    private AnswerRepository answerRepository;

    // Questions
    @GetMapping("/questions")
    public List<Question> getQuestions() {
        return questionRepository.findAll();
    }

    @PostMapping("/questions")
    public Question createQuestion(@RequestBody Question question) {
        if (question.getDate() == null)
            question.setDate(LocalDate.now());
        // Frontend should send studentId now (or we extract from context if secure)
        return questionRepository.save(question);
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        if (!questionRepository.existsById(id)) {
            return ResponseEntity.status(404).body("Question not found");
        }
        questionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Answers
    @PostMapping("/questions/{id}/answers")
    public Answer createAnswer(@PathVariable Long id, @RequestBody Answer answer) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        answer.setQuestion(question);
        if (answer.getDate() == null)
            answer.setDate(LocalDate.now());
        return answerRepository.save(answer);
    }

    @DeleteMapping("/answers/{id}")
    public ResponseEntity<?> deleteAnswer(@PathVariable Long id) {
        if (!answerRepository.existsById(id)) {
            return ResponseEntity.status(404).body("Answer not found");
        }
        answerRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Syllabus
    @GetMapping("/syllabus")
    public List<Syllabus> getSyllabus() {
        return syllabusRepository.findAll();
    }

    @PostMapping("/syllabus")
    public Syllabus createSyllabus(
            @RequestParam("subject") String subject,
            @RequestParam("className") String className,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        Syllabus syllabus = new Syllabus();
        syllabus.setSubject(subject);
        syllabus.setClassName(className);
        syllabus.setUploadDate(LocalDate.now());

        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.storeFile(file);
            syllabus.setFileName(fileName);
        }

        return syllabusRepository.save(syllabus);
    }

    @DeleteMapping("/syllabus/{id}")
    public ResponseEntity<?> deleteSyllabus(@PathVariable Long id) {
        if (!syllabusRepository.existsById(id)) {
            return ResponseEntity.status(404).body("Syllabus not found");
        }
        syllabusRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Attendance
    @GetMapping("/attendance/{date}")
    public List<Attendance> getAttendanceByDate(@PathVariable String date) {
        return attendanceRepository.findByDate(LocalDate.parse(date));
    }

    @PostMapping("/attendance")
    public Attendance createAttendance(@RequestBody Attendance attendance) {
        // Validation
        if (attendance.getStudent() == null || attendance.getStudent().getId() == null) {
            throw new RuntimeException("Student ID is required");
        }

        // Fetch Student to ensure it exists and is managed (prevents detached entity
        // errors)
        Student student = studentRepository.findById(attendance.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        attendance.setStudent(student);

        // Upsert Logic with Duplicate Cleanup (Self-Healing)
        List<Attendance> existingRecords = attendanceRepository.findByStudentIdAndDate(student.getId(),
                attendance.getDate());

        if (existingRecords.isEmpty()) {
            return attendanceRepository.save(attendance);
        } else {
            // Update the first one
            Attendance recordToUpdate = existingRecords.get(0);
            recordToUpdate.setStatus(attendance.getStatus());
            Attendance saved = attendanceRepository.save(recordToUpdate);

            // Delete duplicates if any
            if (existingRecords.size() > 1) {
                for (int i = 1; i < existingRecords.size(); i++) {
                    attendanceRepository.delete(existingRecords.get(i));
                }
            }
            return saved;
        }
    }

    @GetMapping("/attendance/student/{studentId}")
    public List<Attendance> getStudentAttendance(@PathVariable Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    @Autowired
    private MarksheetRepository marksheetRepository;

    // Marksheets
    @GetMapping("/marksheets")
    public List<Marksheet> getMarksheets(@RequestParam(required = false) Long studentId) {
        if (studentId != null) {
            return marksheetRepository.findByStudentId(studentId);
        }
        return marksheetRepository.findAll();
    }

    @PostMapping("/marksheets")
    public Marksheet createMarksheet(@RequestBody Marksheet marksheet) {
        if (marksheet.getStudent() == null || marksheet.getStudent().getId() == null) {
            throw new RuntimeException("Student ID Requirement");
        }
        Student student = studentRepository.findById(marksheet.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        marksheet.setStudent(student);
        if (marksheet.getDate() == null)
            marksheet.setDate(LocalDate.now());

        // Auto calculation
        marksheet.calculateStats();

        return marksheetRepository.save(marksheet);
    }

    @PutMapping("/marksheets/{id}")
    public Marksheet updateMarksheet(@PathVariable Long id, @RequestBody Marksheet updatedMarksheet) {
        Marksheet existing = marksheetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marksheet not found"));

        existing.setExamType(updatedMarksheet.getExamType());
        existing.setDate(LocalDate.now()); // Update date to interaction time, or keep original? Let's update.

        // Update subjects
        // Clear and add all (simplest way to handle add/remove/update logic)
        existing.getSubjects().clear();
        existing.getSubjects().addAll(updatedMarksheet.getSubjects());

        // Recalculate
        existing.calculateStats();

        return marksheetRepository.save(existing);
    }

    @Autowired
    private LiveSessionRepository liveSessionRepository;

    // Live Class Endpoints
    @GetMapping("/live-session")
    public LiveSession getActiveLiveSession() {
        return liveSessionRepository.findTopByIsActiveTrueOrderByStartTimeDesc();
    }

    @PostMapping("/live-session")
    public LiveSession startLiveSession(@RequestBody LiveSession session) {
        // Deactivate previous sessions to ensure only one is active (optional logic)
        List<LiveSession> active = liveSessionRepository.findAll();
        for (LiveSession s : active) {
            s.setActive(false);
            liveSessionRepository.save(s);
        }

        session.setStartTime(LocalDateTime.now());
        session.setActive(true);
        return liveSessionRepository.save(session);
    }

    @DeleteMapping("/live-session")
    public ResponseEntity<?> endLiveSession() {
        List<LiveSession> active = liveSessionRepository.findAll();
        boolean found = false;
        for (LiveSession s : active) {
            if (s.isActive()) {
                s.setActive(false);
                liveSessionRepository.save(s);
                found = true;
            }
        }
        return ResponseEntity.ok().body("Session ended");
    }

    @DeleteMapping("/marksheets/{id}")
    public ResponseEntity<?> deleteMarksheet(@PathVariable Long id) {
        System.out.println("Received request to delete marksheet ID: " + id);
        try {
            if (!marksheetRepository.existsById(id)) {
                System.out.println("Marksheet ID " + id + " not found!");
                return ResponseEntity.status(404).body("Marksheet not found");
            }
            marksheetRepository.deleteById(id);
            System.out.println("Successfully deleted marksheet ID: " + id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error deleting marksheet ID " + id);
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error deleting marksheet: " + e.getMessage());
        }
    }

    @Autowired
    private ClassFeeRepository classFeeRepository;

    @GetMapping("/fees")
    public List<ClassFee> getAllFees() {
        return classFeeRepository.findAll();
    }

    @PostMapping("/fees")
    public ClassFee setClassFee(@RequestParam("className") String className, @RequestParam("amount") Double amount) {
        ClassFee fee = classFeeRepository.findByClassName(className).orElse(new ClassFee());
        fee.setClassName(className);
        fee.setAmount(amount);
        return classFeeRepository.save(fee);
    }

    @Autowired
    private FeedbackRepository feedbackRepository;

    @GetMapping("/feedback")
    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    @PostMapping("/feedback")
    public Feedback submitFeedback(@RequestBody Feedback feedback) {
        if (feedback.getDate() == null) {
            feedback.setDate(LocalDate.now());
        }
        return feedbackRepository.save(feedback);
    }
}
