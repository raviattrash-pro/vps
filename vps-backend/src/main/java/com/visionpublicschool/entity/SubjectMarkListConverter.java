package com.visionpublicschool.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Converter
public class SubjectMarkListConverter implements AttributeConverter<List<SubjectMark>, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<SubjectMark> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            System.err.println("Error converting SubjectMark list to JSON: " + e.getMessage());
            return "[]";
        }
    }

    @Override
    public List<SubjectMark> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(dbData, new TypeReference<List<SubjectMark>>() {
            });
        } catch (IOException e) {
            System.err.println("Error converting JSON to SubjectMark list: " + e.getMessage());
            return new ArrayList<>();
        }
    }
}
