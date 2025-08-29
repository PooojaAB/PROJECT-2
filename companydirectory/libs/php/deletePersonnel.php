<?php
// deletePersonnel.php
// Endpoint to delete a personnel record by ID
header('Content-Type: application/json');
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit();
}

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid id parameter']);
    exit();
}

$id = intval($_GET['id']);

$stmt = $conn->prepare('DELETE FROM personnel WHERE id = ?');
$stmt->bind_param('i', $id);
if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Personnel not found or already deleted.']);
    }
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $stmt->error]);
}
$stmt->close();
$conn->close();
