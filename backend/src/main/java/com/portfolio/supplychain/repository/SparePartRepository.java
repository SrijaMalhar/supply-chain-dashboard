package com.portfolio.supplychain.repository;

import com.portfolio.supplychain.model.SparePart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository for SparePart entities.
 *
 * Extending JpaRepository gives us standard CRUD methods for free
 * (save, findAll, findById, deleteById, etc.).
 */
public interface SparePartRepository extends JpaRepository<SparePart, Long> {

    /**
     * Custom query method derived from the method name.
     * Spring Data JPA generates: SELECT * FROM spare_part WHERE stock_quantity < ?
     */
    List<SparePart> findByStockQuantityLessThan(int threshold);
}
