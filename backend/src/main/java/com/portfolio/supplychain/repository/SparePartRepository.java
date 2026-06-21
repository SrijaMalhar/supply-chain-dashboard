package com.portfolio.supplychain.repository;

import com.portfolio.supplychain.model.SparePart;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for SparePart entities.
 *
 * Standard CRUD comes from JpaRepository.
 * Low-stock filtering is done in the service using per-part reorderThreshold,
 * so no custom query method is needed here.
 */
public interface SparePartRepository extends JpaRepository<SparePart, Long> {
}
