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
            // Fix for missing marksheet_subjects table
            String sql = "CREATE TABLE IF NOT EXISTS marksheet_subjects (" +
                    "marksheet_id BIGINT NOT NULL, " +
                    "marks_obtained DOUBLE, " +
                    "max_marks DOUBLE, " +
                    "subject_name VARCHAR(255), " +
                    "FOREIGN KEY (marksheet_id) REFERENCES marksheet(id))";

            jdbcTemplate.execute(sql);
            System.out.println("Ensured table 'marksheet_subjects' exists.");

        } catch (Exception e) {
            System.err.println("Database Initializer Error: " + e.getMessage());
            // If table 'marksheet' is capitalized by hibernate, try referencing
            // 'Marksheet'?
            // Usually Spring uses lowercase. We will just log error if it fails (e.g. if
            // parent table missing).
        }
    }
}
