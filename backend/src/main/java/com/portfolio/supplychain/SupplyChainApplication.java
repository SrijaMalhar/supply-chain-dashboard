package com.portfolio.supplychain;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Application entry point.
 * The @SpringBootApplication annotation enables auto-configuration,
 * component scanning, and Spring Boot configuration.
 */
@SpringBootApplication
public class SupplyChainApplication {

    public static void main(String[] args) {
        SpringApplication.run(SupplyChainApplication.class, args);
    }
}
