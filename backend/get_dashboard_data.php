<?php 
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include "db.php";

// Initialize stats
$stats = [
    "sales" => 0,          // total sales amount
    "transactions" => 0,   // total number of sales
    "products" => 0,       // total number of products
    "customers" => 0,      // total customers
    "stockAlerts" => 0,    // low stock OR expiring soon
    "criticalAlerts" => 0  // expired products
];

// Today's sales and transactions
$res = $conn->query("
    SELECT 
        SUM(total) as totalSales, 
        COUNT(*) as totalTransactions 
    FROM sales 
    WHERE DATE(sale_date) = CURDATE()
");
if($row = $res->fetch_assoc()) {
    $stats['sales'] = $row['totalSales'] ?? 0;
    $stats['transactions'] = $row['totalTransactions'] ?? 0;
}


// Total products
$res = $conn->query("SELECT COUNT(*) as totalProducts FROM products");
if($row = $res->fetch_assoc()) {
    $stats['products'] = $row['totalProducts'] ?? 0;
}

// Total customers
$res = $conn->query("SELECT COUNT(*) as totalCustomers FROM customers");
if($row = $res->fetch_assoc()) {
    $stats['customers'] = $row['totalCustomers'] ?? 0;
}

// Critical alerts (already expired)
$res = $conn->query("SELECT COUNT(*) as expired FROM products WHERE expiry_date <= CURDATE()");
if($row = $res->fetch_assoc()) {
    $stats['criticalAlerts'] = $row['expired'] ?? 0;
}

// Stock alerts (low stock OR expiring soon within 14 days)
$res = $conn->query("
    SELECT COUNT(*) as lowStockOrExpiring 
    FROM products 
    WHERE (stock_quantity > 0 AND stock_quantity <= 20) 
       OR (expiry_date > CURDATE() AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 14 DAY))
");
if($row = $res->fetch_assoc()) {
    $stats['stockAlerts'] = $row['lowStockOrExpiring'] ?? 0;
}

echo json_encode($stats);
?>
