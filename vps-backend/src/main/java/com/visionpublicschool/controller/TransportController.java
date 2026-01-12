package com.visionpublicschool.controller;

import com.visionpublicschool.entity.TransportRoute;
import com.visionpublicschool.repository.TransportRouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transport")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class TransportController {

    @Autowired
    private TransportRouteRepository transportRouteRepository;

    @GetMapping
    public List<TransportRoute> getAllRoutes() {
        return transportRouteRepository.findAll();
    }

    @PostMapping
    public TransportRoute addRoute(@RequestBody TransportRoute route) {
        return transportRouteRepository.save(route);
    }

    @DeleteMapping("/{id}")
    public void deleteRoute(@PathVariable Long id) {
        transportRouteRepository.deleteById(id);
    }
}
