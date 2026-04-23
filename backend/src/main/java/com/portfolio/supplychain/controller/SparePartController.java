package com.portfolio.supplychain.controller;

import com.portfolio.supplychain.model.SparePart;
import com.portfolio.supplychain.service.SparePartService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * REST controller exposing CRUD endpoints for spare parts.
 *
 * Base URL: /api/parts
 *
 * @CrossOrigin allows the React dev server (Vite default port 5173)
 * to call this API without being blocked by the browser's CORS policy.
 */
@RestController
@RequestMapping("/api/parts")
@CrossOrigin(origins = "http://localhost:5173")
public class SparePartController {

    private final SparePartService service;

    public SparePartController(SparePartService service) {
        this.service = service;
    }

    @Operation(summary = "Get all spare parts")
    @GetMapping
    public List<SparePart> getAll() {
        return service.getAllParts();
    }

    @Operation(summary = "Add a new spare part")
    @PostMapping
    public SparePart add(@Valid @RequestBody SparePart part) {
        return service.addPart(part);
    }

    @Operation(summary = "Update an existing spare part")
    @PutMapping("/{id}")
    public SparePart update(@PathVariable Long id, @Valid @RequestBody SparePart part) {
        return service.updatePart(id, part);
    }

    @Operation(summary = "Delete a spare part by id")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deletePart(id);
    }

    @Operation(summary = "Get parts with low stock (stockQuantity < 10)")
    @GetMapping("/low-stock")
    public List<SparePart> getLowStock() {
        return service.getLowStockParts();
    }

    @Operation(summary = "Advance a part to the next stage (Supplier -> Warehouse -> Assembly -> Deployed)")
    @PutMapping("/{id}/advance")
    public SparePart advance(@PathVariable Long id) {
        return service.advanceStage(id);
    }

    @Operation(summary = "Get a count of parts at each stage of the pipeline")
    @GetMapping("/summary")
    public Map<String, Long> summary() {
        return service.getStageSummary();
    }
}
