<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include "db.php";

// Get last 7 days
$days = [];
for ($i = 6; $i >= 0; $i--) {
    $days[] = date("Y-m-d", strtotime("-$i days"));
}

// Initialize sales array
$weeklySales = [];
foreach ($days as $day) {
    $weeklySales[$day] = 0;
}

// Fetch sales totals from database
$query = "SELECT DATE(sale_date) as sale_day, SUM(total) as total_sales
          FROM sales
          WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
          GROUP BY DATE(sale_date)";
$result = $conn->query($query);

while ($row = $result->fetch_assoc()) {
    $weeklySales[$row['sale_day']] = floatval($row['total_sales']);
}

// Format for chart: [{date: '2025-11-12', total: 1000}, ...]
$response = [];
foreach ($weeklySales as $date => $total) {
    $response[] = [
        "date" => $date,
        "total" => $total
    ];
}

echo json_encode($response);
?>
