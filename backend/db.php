<?php
$servername = "localhost";
$username = "root";  // Default for XAMPP
$password = "";
$dbname = "pharmatrack";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die(json_encode(["status" => "error", "message" => "Database connection failed."]));
}
?>
