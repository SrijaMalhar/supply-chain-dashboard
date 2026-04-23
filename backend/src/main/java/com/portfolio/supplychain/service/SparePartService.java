package com.portfolio.supplychain.service;

import com.portfolio.supplychain.model.SparePart;
import com.portfolio.supplychain.repository.SparePartRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Business logic layer.
 *
 * Sits between the controller and the repository so that
 * controllers stay thin and any future logic (validation,
 * notifications, etc.) has a clear home.
 */
@Service
public class SparePartService {

    // Low stock threshold used by getLowStockParts()
    private static final int LOW_STOCK_THRESHOLD = 10;

    private final SparePartRepository repository;

    // Constructor injection (preferred over field injection)
    public SparePartService(SparePartRepository repository) {
        this.repository = repository;
    }

    /** Return every spare part in the database. */
    public List<SparePart> getAllParts() {
        return repository.findAll();
    }

    /** Persist a new spare part and return the saved entity (with id). */
    public SparePart addPart(SparePart part) {
        return repository.save(part);
    }

    /** Delete a spare part by its id. */
    public void deletePart(Long id) {
        repository.deleteById(id);
    }

    /**
     * Update an existing spare part. Looks up by id, copies over the
     * editable fields from the incoming object, and saves.
     */
    public SparePart updatePart(Long id, SparePart updated) {
        SparePart existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Part not found: " + id));
        existing.setPartName(updated.getPartName());
        existing.setSupplierName(updated.getSupplierName());
        existing.setMachineModel(updated.getMachineModel());
        existing.setStage(updated.getStage());
        existing.setStockQuantity(updated.getStockQuantity());
        return repository.save(existing);
    }

    /** Return parts whose stock is strictly below the low-stock threshold. */
    public List<SparePart> getLowStockParts() {
        return repository.findByStockQuantityLessThan(LOW_STOCK_THRESHOLD);
    }

    // Ordered pipeline used by advanceStage() and stage summaries.
    private static final List<String> STAGE_ORDER =
            List.of("SUPPLIER", "WAREHOUSE", "ASSEMBLY", "DEPLOYED");

    /**
     * Return a count of parts at each stage, in pipeline order.
     * Stages with zero parts are still included so the dashboard
     * always shows the full pipeline.
     */
    public Map<String, Long> getStageSummary() {
        List<SparePart> all = repository.findAll();
        // LinkedHashMap preserves SUPPLIER -> WAREHOUSE -> ASSEMBLY -> DEPLOYED order.
        Map<String, Long> counts = new LinkedHashMap<>();
        for (String stage : STAGE_ORDER) {
            counts.put(stage, 0L);
        }
        for (SparePart p : all) {
            counts.merge(p.getStage(), 1L, Long::sum);
        }
        return counts;
    }

    /**
     * Advance a part to the next stage in the pipeline:
     *   SUPPLIER -> WAREHOUSE -> ASSEMBLY -> DEPLOYED
     * If the part is already DEPLOYED (the final stage), it is returned unchanged.
     */
    public SparePart advanceStage(Long id) {
        SparePart part = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Part not found: " + id));

        int currentIndex = STAGE_ORDER.indexOf(part.getStage());
        // If the stage is unknown OR already at the last stage, do nothing.
        if (currentIndex >= 0 && currentIndex < STAGE_ORDER.size() - 1) {
            part.setStage(STAGE_ORDER.get(currentIndex + 1));
            return repository.save(part);
        }
        return part;
    }
}
