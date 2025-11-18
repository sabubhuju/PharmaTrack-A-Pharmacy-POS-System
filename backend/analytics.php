<?php 
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include 'db.php';

// Total sales, revenue, and average order value
$summaryQuery = "SELECT COUNT(*) AS total_sales, SUM(total) AS total_revenue, AVG(total) AS avg_order_value FROM sales";
$summaryResult = $conn->query($summaryQuery);
$summary = $summaryResult ? $summaryResult->fetch_assoc() : ["total_sales" => 0, "total_revenue" => 0, "avg_order_value" => 0];

// Top products
$topProductsQuery = "
    SELECT p.name, SUM(si.quantity) AS total_sold
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    GROUP BY si.product_id
    ORDER BY total_sold DESC
    LIMIT 5";
$topProductsResult = $conn->query($topProductsQuery);
$topProducts = [];
if ($topProductsResult) {
    while ($row = $topProductsResult->fetch_assoc()) {
        $topProducts[] = $row;
    }
}

// Current inventory
$inventoryQuery = "SELECT SUM(stock_quantity) AS total_items, SUM(stock_quantity * unit_price) AS total_value FROM products";
$inventoryResult = $conn->query($inventoryQuery);
$inventory = $inventoryResult ? $inventoryResult->fetch_assoc() : ["total_items" => 0, "total_value" => 0];

// Respond with JSON
echo json_encode([
    "summary" => $summary,
    "topProducts" => $topProducts,
    "inventory" => $inventory
], JSON_NUMERIC_CHECK);
?>
