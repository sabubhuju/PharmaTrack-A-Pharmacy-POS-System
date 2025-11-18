<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include "db.php";

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? null;

    if ($id) {
        // Start transaction
        $conn->begin_transaction();

        try {
            // 1️⃣ Delete items from sale_items
            $conn->query("DELETE FROM sale_items WHERE sale_id = '$id'");

            // 2️⃣ Delete sale itself
            $conn->query("DELETE FROM sales WHERE id = '$id'");

            // Commit
            $conn->commit();

            echo json_encode(["success" => true]);
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(["error" => "Failed to delete sale: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["error" => "Missing sale ID"]);
    }

    exit;
}


$query = "SELECT id, customer, payment_method, subtotal, discount, total, sale_date 
          FROM sales 
          ORDER BY sale_date DESC";
$result = $conn->query($query);

$sales = [];
while ($row = $result->fetch_assoc()) {
  $sales[] = $row;
}

echo json_encode($sales);
?>
