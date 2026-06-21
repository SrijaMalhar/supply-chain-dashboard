package com.portfolio.supplychain.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * SparePart entity — one row per part in the H2 database.
 *
 * Pipeline stages: SUPPLIER -> WAREHOUSE -> ASSEMBLY -> DEPLOYED
 */
@Entity
public class SparePart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "partName is required")
    private String partName;

    @NotBlank(message = "supplierName is required")
    private String supplierName;

    @NotBlank(message = "machineModel is required")
    private String machineModel;

    @NotBlank(message = "stage is required")
    @Pattern(
        regexp = "SUPPLIER|WAREHOUSE|ASSEMBLY|DEPLOYED",
        message = "stage must be one of: SUPPLIER, WAREHOUSE, ASSEMBLY, DEPLOYED"
    )
    private String stage;

    @NotNull(message = "stockQuantity is required")
    @Min(value = 0, message = "stockQuantity must be 0 or greater")
    private Integer stockQuantity;

    private Double unitCost;

    // Per-part threshold — low-stock alert fires when stockQuantity <= this value.
    private Integer reorderThreshold = 10;

    private String notes;

    // ---- Constructors ----

    public SparePart() {}

    // ---- Getters and Setters ----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public String getMachineModel() { return machineModel; }
    public void setMachineModel(String machineModel) { this.machineModel = machineModel; }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Double getUnitCost() { return unitCost; }
    public void setUnitCost(Double unitCost) { this.unitCost = unitCost; }

    public Integer getReorderThreshold() { return reorderThreshold != null ? reorderThreshold : 10; }
    public void setReorderThreshold(Integer reorderThreshold) { this.reorderThreshold = reorderThreshold; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
