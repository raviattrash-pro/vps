package com.visionpublicschool.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

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
                // Check if constraint exists or just try to add it.
                // MySQL doesn't support "IF NOT EXISTS" for constraints easily in one line
                // without procedures.
                // We will catch the exception if it fails (e.g., duplicate constraint).
                String addFkSql = "ALTER TABLE marksheet_subjects " +
                        "ADD CONSTRAINT fk_marksheet_subjects_marksheet " +
                        "FOREIGN KEY (marksheet_id) REFERENCES marksheet(id)";
                jdbcTemplate.execute(addFkSql);
                System.out.println("✅ Foreign Key 'fk_marksheet_subjects_marksheet' added.");
            } catch (Exception fkEx) {
                // Ignore if it fails (likely already exists or parent table issue).
                // The crucial part is the table existence for inserts to work.
                System.out
                        .println("⚠️ Foreign Key addition skipped/failed (might already exist): " + fkEx.getMessage());
            }

        } catch (Exception e) {
            System.err.println("❌ Database Initializer Critical Failure: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
