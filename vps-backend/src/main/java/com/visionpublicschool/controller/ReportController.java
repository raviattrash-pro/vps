package com.visionpublicschool.controller;

import com.visionpublicschool.entity.Student;
import com.visionpublicschool.repository.StudentRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping("/users/excel")
    public void exportUsersToExcel(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=users_report.xlsx";
        response.setHeader(headerKey, headerValue);

        List<Student> listUsers = studentRepository.findAll();

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Users");

        Row headerRow = sheet.createRow(0);
        String[] columns = { "ID", "Name", "Admission No", "Role", "Class", "Section", "Roll No" };

        CellStyle headerCellStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerCellStyle.setFont(headerFont);

        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerCellStyle);
        }

        int rowNum = 1;
        for (Student user : listUsers) {
            Row row = sheet.createRow(rowNum++);

            // Use toString for ID to avoid double conversion issues
            row.createCell(0).setCellValue(user.getId() != null ? user.getId().toString() : "");

            // Safe null checks for all fields
            row.createCell(1).setCellValue(user.getName() != null ? user.getName() : "");
            row.createCell(2).setCellValue(user.getAdmissionNo() != null ? user.getAdmissionNo() : "");
            row.createCell(3).setCellValue(user.getRole() != null ? user.getRole() : "");
            row.createCell(4).setCellValue(user.getClassName() != null ? user.getClassName() : "");
            row.createCell(5).setCellValue(user.getSection() != null ? user.getSection() : "");
            row.createCell(6).setCellValue(user.getRollNo() != null ? user.getRollNo() : "");
        }

        // Removed autoSizeColumn because it crashes on servers without Fonts installed
        // (like Render)
        // Instead, we set a reasonable default width
        for (int i = 0; i < columns.length; i++) {
            sheet.setColumnWidth(i, 20 * 256); // 20 characters wide
        }

        workbook.write(response.getOutputStream());
        workbook.close();
    }
}
