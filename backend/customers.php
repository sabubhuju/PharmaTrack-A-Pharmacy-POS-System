<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

$method = $_SERVER['REQUEST_METHOD'];
$host = "localhost";
$user = "root"; 
$pass = "";     
$db   = "pharmatrack";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    case 'GET':
        $result = $conn->query("SELECT * FROM customers ORDER BY id DESC");
        $customers = [];
        while ($row = $result->fetch_assoc()) {
            $customers[] = $row;
        }
        echo json_encode($customers);
        break;

    case 'POST':
        if(!$input || !isset($input['name']) || !isset($input['email']) || !isset($input['phone'])){
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields"]);
            exit;
        }

        $name = $conn->real_escape_string($input['name']);
        $email = $conn->real_escape_string($input['email']);
        $phone = $conn->real_escape_string($input['phone']);

        $sql = "INSERT INTO customers (name, email, phone) 
                VALUES ('$name', '$email', '$phone')";

        if ($conn->query($sql)) {
            echo json_encode([
                "success" => true,
                "id" => $conn->insert_id,
                "name" => $name,
                "email" => $email,
                "phone" => $phone
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
        }
        break;

    case 'PUT':
        $id = intval($input['id']);
        $name = $conn->real_escape_string($input['name']);
        $email = $conn->real_escape_string($input['email']);
        $phone = $conn->real_escape_string($input['phone']);

        $sql = "UPDATE customers 
                SET name='$name', email='$email', phone='$phone' 
                WHERE id=$id";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
        }
        break;

    case 'DELETE':
        $id = intval($input['id']);
        $sql = "DELETE FROM customers WHERE id=$id";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}

$conn->close();
