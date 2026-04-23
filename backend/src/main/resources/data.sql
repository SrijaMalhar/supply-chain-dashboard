-- Seed the H2 database with 5 sample spare parts.
-- Two of them have stockQuantity below 10 so the low-stock banner shows up.
INSERT INTO spare_part (part_name, supplier_name, machine_model, stage, stock_quantity) VALUES
  ('Hydraulic Filter', 'Bosch',     'Excavator X200', 'WAREHOUSE', 25),
  ('Engine Piston',    'Mahle',     'Truck T800',     'ASSEMBLY',  4),
  ('Drive Shaft',      'GKN',       'Tractor F50',    'SUPPLIER',  15),
  ('Fuel Injector',    'Denso',     'Truck T800',     'DEPLOYED',  7),
  ('Brake Pad',        'Brembo',    'Excavator X200', 'WAREHOUSE', 30);
