-- 1. Retrieve all farmers along with the crops they grow  
SELECT  f.name AS farmer_name, c.type AS crop_type, c.quantity 
FROM FARMER f
JOIN FARMER_CROP fc ON f.farmer_id = f.farmer_id
JOIN CROP c ON fc.crop_id = c.crop_id

-- 3. query to Get customers who have placed at least 3 orders
SELECT c.customer_id, c.name, COUNT(o.order_id) AS total_orders
FROM customer c
JOIN farmer_customer_order o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name
HAVING COUNT(o.order_id) >= 3
ORDER BY total_orders DESC;

-- 4. View Products by Type

SELECT * 
FROM product 
WHERE type = 'fertilizer';

-- 5. View Products by Price Range

SELECT * 
FROM product 
WHERE price BETWEEN 10 AND 100;

-- 6. View Available Products (Stock > 0)

SELECT p.product_id, p.name, v.vendor_id, v.name AS vendor_name, vi.stock_level
FROM product p
JOIN vendor_inventory vi ON p.product_id = vi.product_id
JOIN vendor v ON vi.vendor_id = v.vendor_id
WHERE vi.stock_level > 0;


-- 7. View Products by Vendor Ratings

SELECT p.product_id, p.name, v.vendor_id, v.name AS vendor_name, 
       AVG(vf.rating) AS average_rating
FROM product p
JOIN vendor_product vp ON p.product_id = vp.product_id
JOIN vendor v ON vp.vendor_id = v.vendor_id
JOIN vendor_farmer_feedback vf ON v.vendor_id = vf.vendor_id
GROUP BY p.product_id, p.name, v.vendor_id, v.name
HAVING AVG(vf.rating) >= 4
ORDER BY average_rating DESC;

-- 8. list crops for sale with specifications (type, quantity, price)

SELECT crop_id, type, quantity, price
FROM crop
WHERE quantity > 0
ORDER BY type, price ASC;

-- 9. Find the total number of products offered by each vendor

SELECT v.vendor_id, v.name, COUNT(vp.product_id) AS total_products
FROM vendor v
LEFT JOIN vendor_product vp ON v.vendor_id = vp.vendor_id
GROUP BY v.vendor_id, v.name
ORDER BY total_products DESC;

-- 10. Query to Track Orders Placed by Farmers


SELECT v.vendor_id, v.name AS vendor_name, 
       vfo.order_id, vfo.farmer_id, f.name AS farmer_name, 
       vfo.product_id, p.name AS product_name, 
       vfo.quantity, vfo.order_status, vfo.order_date
FROM vendor_farmer_order vfo
JOIN vendor v ON vfo.vendor_id = v.vendor_id
JOIN farmer f ON vfo.farmer_id = f.farmer_id
JOIN product p ON vfo.product_id = p.product_id
ORDER BY vfo.order_date DESC;

-- 11.Query to track Disputes

SELECT v.vendor_id, v.name AS vendor_name, 
       vfd.dispute_id, vfd.order_id, 
       vfd.dispute_type, vfd.dispute_status, vfd.details, vfd.resolution_date
FROM vendor_farmer_dispute vfd
JOIN vendor v ON vfd.order_id IN (SELECT order_id FROM vendor_farmer_order WHERE vendor_id = v.vendor_id)
ORDER BY vfd.resolution_date DESC;

-- 12.Give the name and ID of vendor with Excellent and good in their comments

SELECT v.vendor_id,
       v.name
FROM vendor_farmer_feedback AS vff
JOIN vendor AS v 
  ON vff.vendor_id = v.vendor_id
WHERE vff.comments REGEXP 'Excellent|Good';

-- 13.Find the orders placed in year 2025SELECT *

FROM farmer_customer_order
WHERE order_date BETWEEN '2025-01-01 00:00:00' AND '2025-12-01 23:59:59';

-- 14.Query to find sales of each crop 
SELECT 
    c.crop_id,
    c.type,
    SUM(o.quantity) AS total_quantity_sold,
    SUM(o.quantity * c.price) AS total_sales_amount
FROM farmer_customer_order o
JOIN crop c ON o.crop_id = c.crop_id
GROUP BY c.crop_id, c.type;

-- 15.Query to find a farmer who is in dipute with both customer and vendor.
SELECT 
    f.farmer_id,
    fc.details AS customer_dispute_detail,
    vf.details AS vendor_dispute_detail
FROM farmer f
LEFT JOIN (
    SELECT o.farmer_id, d.details
    FROM farmer_customer_order o
    JOIN farmer_customer_dispute d 
      ON o.order_id = d.order_id
) AS fc ON f.farmer_id = fc.farmer_id
LEFT JOIN (
    SELECT o.farmer_id, d.details
    FROM vendor_farmer_order o
    JOIN vendor_farmer_dispute d 
      ON o.order_id = d.order_id
) AS vf ON f.farmer_id = vf.farmer_id;


-- 16. Generate admin analytics report for most sold items
SELECT 
    c.type AS crop_name, 
    COUNT(fco.order_id) AS total_orders
FROM crop c
JOIN farmer_customer_order fco 
    ON c.crop_id = fco.crop_id
GROUP BY c.crop_id, c.type
ORDER BY total_orders DESC
LIMIT 5;

