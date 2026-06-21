-- Seed the H2 database with 5 sample spare parts.
-- Engine Piston (stock 4, threshold 5) and Fuel Injector (stock 7, threshold 8)
-- are below their thresholds so the low-stock banner shows them.
INSERT INTO spare_part (part_name, supplier_name, machine_model, stage, stock_quantity, unit_cost, reorder_threshold, notes) VALUES
  ('Hydraulic Filter', 'Bosch',  'Excavator X200', 'WAREHOUSE', 25, 45.00,  10, ''),
  ('Engine Piston',    'Mahle',  'Truck T800',     'ASSEMBLY',  4,  120.00, 5,  'Low stock — urgent'),
  ('Drive Shaft',      'GKN',    'Tractor F50',    'SUPPLIER',  15, 340.00, 8,  ''),
  ('Fuel Injector',    'Denso',  'Truck T800',     'DEPLOYED',  7,  275.00, 8,  'Below threshold'),
  ('Brake Pad',        'Brembo', 'Excavator X200', 'WAREHOUSE', 30, 65.00,  10, '');
