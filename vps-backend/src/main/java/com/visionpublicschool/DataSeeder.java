package com.visionpublicschool;

import com.visionpublicschool.entity.Student;
import com.visionpublicschool.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(StudentRepository studentRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        return args -> {
            if (studentRepository.count() == 0) {
                Student s1 = new Student();
                s1.setAdmissionNo("1001");
                s1.setName("Sumit Kumar");
                s1.setPassword(passwordEncoder.encode("1234"));
                s1.setClassName("10");
                s1.setSection("A");
                s1.setRollNo("1");
                s1.setRole("STUDENT");
                studentRepository.save(s1);

                Student s2 = new Student();
                s2.setAdmissionNo("1002");
                s2.setName("Amit Raj");
                s2.setPassword(passwordEncoder.encode("1234"));
                s2.setClassName("10");
                s2.setSection("B");
                s2.setRollNo("2");
                s2.setRole("STUDENT");
                studentRepository.save(s2);
            }

            if (studentRepository.findByAdmissionNo("admin").isEmpty()) {
                Student admin = new Student();
                admin.setAdmissionNo("admin");
                admin.setName("Admin User");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                studentRepository.save(admin);
                System.out.println("Admin User Seeded");
            }
        };
    }
}
