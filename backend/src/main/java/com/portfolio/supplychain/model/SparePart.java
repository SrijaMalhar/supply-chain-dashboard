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
 * SparePart entity.
 *
 * Represents a single spare part flowing through the supply chain.
 * The "stage" field tracks where the part currently is:
 *   SUPPLIER  -> WAREHOUSE -> ASSEMBLY -> DEPLOYED
 */
@Entity
public class SparePart {

    // Auto-generated primary key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "partName is required")
    private String partName;

    @NotBlank(message = "supplierName is required")
    private String supplierName;

    @NotBlank(message = "machineModel is required")
    private String machineModel;

    // Must be one of the four pipeline stages.
    @NotBlank(message = "stage is required")
    @Pattern(
        regexp = "SUPPLIER|WAREHOUSE|ASSEMBLY|DEPLOYED",
        message = "stage must be one of: SUPPLIER, WAREHOUSE, ASSEMBLY, DEPLOYED"
    )
    private String stage;

    @NotNull(message = "stockQuantity is required")
    @Min(value = 0, message = "stockQuantity must be 0 or greater")
    private Integer stockQuantity;

    // ---- Constructors ----

    public SparePart() {
        // Default constructor required by JPA
    }

    public SparePart(String partName, String supplierName, String machineModel,
                     String stage, Integer stockQuantity) {
        this.partName = partName;
        this.supplierName = supplierName;
        this.machineModel = machineModel;
        this.stage = stage;
        this.stockQuantity = stockQuantity;
    }

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
}
