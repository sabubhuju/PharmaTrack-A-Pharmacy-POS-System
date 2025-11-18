<?php
header("Content-Type: text/html; charset=UTF-8");
include "db.php";

$sale_id = $_GET['id'] ?? null;
if (!$sale_id) die("Sale ID is missing.");

// Get sale info
$sale_res = $conn->query("SELECT id, customer, payment_method, subtotal, discount, total, sale_date FROM sales WHERE id='$sale_id'");
$sale = $sale_res->fetch_assoc();
if (!$sale) die("Sale not found.");

// Get sale items
$items_res = $conn->query("SELECT name, quantity, price, (quantity*price) AS total FROM sale_items WHERE sale_id='$sale_id'");

$products = [];
while ($row = $items_res->fetch_assoc()) {
    $products[] = $row;
}

$date = date("Y-m-d H:i:s", strtotime($sale['sale_date']));
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PharmaTrack POS Receipt</title>
<style>
body { font-family: Arial, sans-serif; margin: 20px; }
h1 { text-align: center; }
table { width: 100%; border-collapse: collapse; margin-top: 20px; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background-color: #f2f2f2; }
tfoot td { font-weight: bold; }
</style>
</head>
<body>
<h1>PharmaTrack POS Receipt</h1>
<p><strong>Date:</strong> <?= $date ?></p>
<p><strong>Customer:</strong> <?= $sale['customer'] ?: "Walk-in Customer" ?></p>
<p><strong>Payment Method:</strong> <?= $sale['payment_method'] ?></p>

<table>
    <thead>
        <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($products as $item): ?>
        <tr>
            <td><?= htmlspecialchars($item['name']) ?></td>
            <td><?= $item['quantity'] ?></td>
            <td>₨ <?= number_format($item['price'], 2) ?></td>
            <td>₨ <?= number_format($item['total'], 2) ?></td>
        </tr>
        <?php endforeach; ?>
    </tbody>
    <tfoot>
        <tr>
            <td colspan="3">Subtotal:</td>
            <td>₨ <?= number_format($sale['subtotal'], 2) ?></td>
        </tr>
        <tr>
            <td colspan="3">Discount:</td>
            <td>₨ <?= number_format($sale['discount'], 2) ?></td>
        </tr>
        <tr>
            <td colspan="3">Total:</td>
            <td>₨ <?= number_format($sale['total'], 2) ?></td>
        </tr>
    </tfoot>
</table>

<p style="text-align:center; margin-top:20px;">Thank you for your purchase!</p>
</body>
</html>
