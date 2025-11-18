<?php
// Enable CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "pharmatrack";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $conn->connect_error]);
    exit();
}

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['products'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid data']);
    exit();
}

// Begin transaction
$conn->begin_transaction();

try {
    // Insert sale record (optional)
    $customer = $conn->real_escape_string($data['customer']);
    $payment_method = $conn->real_escape_string($data['payment_method']);
    $subtotal = $conn->real_escape_string($data['subtotal']);
    $discount = $conn->real_escape_string($data['discount']);
    $total = $conn->real_escape_string($data['total']);

    $conn->query("INSERT INTO sales (customer, payment_method, subtotal, discount, total, sale_date)
                  VALUES ('$customer', '$payment_method', '$subtotal', '$discount', '$total', NOW())");
    $sale_id = $conn->insert_id;

    // Insert each product and update stock
    foreach ($data['products'] as $item) {
        $product_id = $conn->real_escape_string($item['product_id']);
        $name = $conn->real_escape_string($item['name']);
        $quantity = $conn->real_escape_string($item['quantity']);
        $price = $conn->real_escape_string($item['price']);

        // Insert into sale_items table (optional)
        $conn->query("INSERT INTO sale_items (sale_id, product_id, name, quantity, price)
                      VALUES ('$sale_id', '$product_id', '$name', '$quantity', '$price')");

        // Decrease stock in products table
        $conn->query("UPDATE products 
                      SET stock_quantity = stock_quantity - $quantity 
                      WHERE id = $product_id");
    }

    $conn->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
