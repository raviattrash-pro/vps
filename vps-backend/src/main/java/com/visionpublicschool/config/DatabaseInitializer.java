package com.visionpublicschool.config;

import com.visionpublicschool.entity.Student;
import com.visionpublicschool.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Running Database Initializer...");

        try {
            // 1. Create table WITHOUT Foreign Key first to ensure it exists
            String createTableSql = "CREATE TABLE IF NOT EXISTS marksheet_subjects (" +
                    "marksheet_id BIGINT NOT NULL, " +
                    "marks_obtained DOUBLE, " +
                    "max_marks DOUBLE, " +
                    "subject_name VARCHAR(255))";

            jdbcTemplate.execute(createTableSql);
            System.out.println("✅ Table 'marksheet_subjects' check/creation completed.");

            // 2. Attempt to add Foreign Key constraint (Safely)
            try {
                String addFkSql = "ALTER TABLE marksheet_subjects " +
                        "ADD CONSTRAINT fk_marksheet_subjects_marksheet " +
                        "FOREIGN KEY (marksheet_id) REFERENCES marksheet(id)";
                jdbcTemplate.execute(addFkSql);
                System.out.println("✅ Foreign Key 'fk_marksheet_subjects_marksheet' added.");
            } catch (Exception fkEx) {
                System.out
                        .println("⚠️ Foreign Key addition skipped/failed (might already exist): " + fkEx.getMessage());
            }

            // 3. Seed Data if Empty
            if (studentRepository.count() == 0) {
                System.out.println("🌱 Database appears empty. Seeding initial data...");

                // Admin
                Student admin = new Student();
                admin.setName("Admin");
                admin.setAdmissionNo("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                studentRepository.save(admin);
                System.out.println("Created Admin user (User: admin, Pass: admin123)");

                // Teacher
                Student teacher = new Student();
                teacher.setName("Ravi");
                teacher.setAdmissionNo("1234");
                teacher.setPassword(passwordEncoder.encode("1234"));
                teacher.setRole("TEACHER");
                teacher.setClassName("10"); // Assigned Class
                teacher.setSection("A");
                studentRepository.save(teacher);
                System.out.println("Created Teacher user (User: 1234, Pass: 1234)");

                // Student
                Student student = new Student();
                student.setName("Rahul Kumar");
                student.setAdmissionNo("S101");
                student.setRollNo("01");
                student.setPassword(passwordEncoder.encode("1234"));
                student.setRole("STUDENT");
                student.setClassName("10");
                student.setSection("A");
                student.setFatherName("Rajesh Kumar");
                studentRepository.save(student);
                System.out.println("Created Student user (User: S101, Pass: 1234)");

                // Another Student for diversity
                Student student2 = new Student();
                student2.setName("Priya string");
                student2.setAdmissionNo("S102");
                student2.setRollNo("02");
                student2.setPassword(passwordEncoder.encode("1234"));
                student2.setRole("STUDENT");
                student2.setClassName("10");
                student2.setSection("B");
                studentRepository.save(student2);
                System.out.println("Created Student user (User: S102, Pass: 1234)");

            } else {
                System.out.println("ℹ️ Database already contains data. Seeding skipped.");
                // Check if any STUDENT role exists
                if (studentRepository.findByRole("STUDENT").isEmpty()) {
                    System.out.println("⚠️ No students found. Seeding one sample student...");
                    Student student = new Student();
                    student.setName("Rahul Kumar");
                    student.setAdmissionNo("S101");
                    student.setRollNo("01");
                    student.setPassword(passwordEncoder.encode("1234"));
                    student.setRole("STUDENT");
                    student.setClassName("10");
                    student.setSection("A");
                    studentRepository.save(student);
                    System.out.println("Created Sample Student (User: S101)");
                }
            }

        } catch (Exception e) {
            System.err.println("❌ Database Initializer Critical Failure: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
