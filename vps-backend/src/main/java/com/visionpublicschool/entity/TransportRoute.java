package com.visionpublicschool.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class TransportRoute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String routeName; // e.g. "Route 1 - City Center"
    private String vehicleNumber; // e.g. "KA-01-AB-1234"
    private String driverName;
    private String driverPhone;

    // Comma separated areas or description
    @Column(length = 1000)
    private String routeAreas;

    // Manual Getters/Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRouteName() {
        return routeName;
    }

    public void setRouteName(String routeName) {
        this.routeName = routeName;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public String getDriverPhone() {
        return driverPhone;
    }

    public void setDriverPhone(String driverPhone) {
        this.driverPhone = driverPhone;
    }

    public String getRouteAreas() {
        return routeAreas;
    }

    public void setRouteAreas(String routeAreas) {
        this.routeAreas = routeAreas;
    }
}
