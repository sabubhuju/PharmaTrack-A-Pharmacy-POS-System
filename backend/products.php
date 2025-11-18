<?php
// Enable CORS for React frontend
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
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
$input = json_decode(file_get_contents("php://input"), true);
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $result = $conn->query("SELECT * FROM products ORDER BY id DESC");
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        echo json_encode($products);
        break;

    case 'POST': // Add new product
        $name = $conn->real_escape_string($input['name']);
        $generic_name = $conn->real_escape_string($input['generic_name']);
        $category = $conn->real_escape_string($input['category']);
        $unit_price = $conn->real_escape_string($input['unit_price']);
        $cost_price = $conn->real_escape_string($input['cost_price']);
        $stock_quantity = $conn->real_escape_string($input['stock_quantity']);
        $reorder_level = $conn->real_escape_string($input['reorder_level']);
        $expiry_date = $conn->real_escape_string($input['expiry_date']);

        $sql = "INSERT INTO products 
        (name, generic_name, category, unit_price, cost_price, stock_quantity, reorder_level, expiry_date)
        VALUES ('$name', '$generic_name', '$category', '$unit_price', '$cost_price', '$stock_quantity', '$reorder_level', '$expiry_date')";

        if ($conn->query($sql)) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['success' => false, 'error' => $conn->error]);
        }
        break;

    case 'PUT': // Update product
    case 'PATCH':
        $id = $conn->real_escape_string($input['id']);
        $name = $conn->real_escape_string($input['name']);
        $generic_name = $conn->real_escape_string($input['generic_name']);
        $category = $conn->real_escape_string($input['category']);
        $unit_price = $conn->real_escape_string($input['unit_price']);
        $cost_price = $conn->real_escape_string($input['cost_price']);
        $stock_quantity = $conn->real_escape_string($input['stock_quantity']);
        $reorder_level = $conn->real_escape_string($input['reorder_level']);
        $expiry_date = $conn->real_escape_string($input['expiry_date']);

        $sql = "UPDATE products SET 
                name='$name', 
                generic_name='$generic_name',
                category='$category',
                unit_price='$unit_price',
                cost_price='$cost_price',
                stock_quantity='$stock_quantity',
                reorder_level='$reorder_level',
                expiry_date='$expiry_date'
                WHERE id='$id'";

        if ($conn->query($sql)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => $conn->error]);
        }
        break;

    case 'DELETE':
        $id = $conn->real_escape_string($input['id']);
        $sql = "DELETE FROM products WHERE id='$id'";
        if ($conn->query($sql)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => $conn->error]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
        break;
}
?>
