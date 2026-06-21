package com.portfolio.supplychain.service;

import com.portfolio.supplychain.model.HistoryEntry;
import com.portfolio.supplychain.model.SparePart;
import com.portfolio.supplychain.repository.SparePartRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Business logic layer.
 *
 * Also maintains an in-memory audit log per part (resets on restart).
 * Each create / stock update / stage advance appends a HistoryEntry.
 */
@Service
public class SparePartService {

    private final SparePartRepository repository;

    // In-memory audit log — keyed by part id
    private static final Map<Long, List<HistoryEntry>> history = new ConcurrentHashMap<>();
    private static final AtomicLong historyId = new AtomicLong(1);

    private static final List<String> STAGE_ORDER =
            List.of("SUPPLIER", "WAREHOUSE", "ASSEMBLY", "DEPLOYED");

    public SparePartService(SparePartRepository repository) {
        this.repository = repository;
    }

    private void addHistory(Long partId, String event, String note) {
        HistoryEntry entry = new HistoryEntry(
            historyId.getAndIncrement(), event, note, Instant.now().toString()
        );
        history.computeIfAbsent(partId, k -> new ArrayList<>()).add(entry);
    }

    public List<SparePart> getAllParts() {
        return repository.findAll();
    }

    public SparePart addPart(SparePart part) {
        SparePart saved = repository.save(part);
        addHistory(saved.getId(), "created", "Part created: " + saved.getPartName());
        return saved;
    }

    public void deletePart(Long id) {
        history.remove(id);
        repository.deleteById(id);
    }

    public SparePart updatePart(Long id, SparePart updated) {
        SparePart existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Part not found: " + id));

        existing.setPartName(updated.getPartName());
        existing.setSupplierName(updated.getSupplierName());
        existing.setMachineModel(updated.getMachineModel());
        existing.setStage(updated.getStage());
        existing.setUnitCost(updated.getUnitCost());
        existing.setReorderThreshold(updated.getReorderThreshold());
        existing.setNotes(updated.getNotes());

        int oldQty = existing.getStockQuantity() != null ? existing.getStockQuantity() : 0;
        existing.setStockQuantity(updated.getStockQuantity());

        SparePart saved = repository.save(existing);

        if (updated.getStockQuantity() != null && updated.getStockQuantity() != oldQty) {
            addHistory(id, "stock_updated",
                "Stock changed: " + oldQty + " → " + updated.getStockQuantity());
        }
        return saved;
    }

    /** Returns parts whose stock is at or below their individual reorder threshold. */
    public List<SparePart> getLowStockParts() {
        return repository.findAll().stream()
                .filter(p -> {
                    int threshold = p.getReorderThreshold() != null ? p.getReorderThreshold() : 10;
                    return p.getStockQuantity() <= threshold;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Long> getStageSummary() {
        List<SparePart> all = repository.findAll();
        Map<String, Long> counts = new LinkedHashMap<>();
        for (String stage : STAGE_ORDER) counts.put(stage, 0L);
        for (SparePart p : all) counts.merge(p.getStage(), 1L, Long::sum);
        return counts;
    }

    public SparePart advanceStage(Long id) {
        SparePart part = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Part not found: " + id));
        int idx = STAGE_ORDER.indexOf(part.getStage());
        if (idx >= 0 && idx < STAGE_ORDER.size() - 1) {
            String oldStage = part.getStage();
            part.setStage(STAGE_ORDER.get(idx + 1));
            SparePart saved = repository.save(part);
            addHistory(id, "stage_changed", oldStage + " → " + saved.getStage());
            return saved;
        }
        return part;
    }

    public List<HistoryEntry> getHistory(Long id) {
        return history.getOrDefault(id, Collections.emptyList());
    }
}
