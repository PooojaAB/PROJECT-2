<?php
header('Content-Type: application/json');
require "config.php";

$response = ["status" => ["code" => "400", "description" => "Invalid request"], "data" => null];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $firstName = isset($_POST['firstName']) ? trim($_POST['firstName']) : '';
    $lastName = isset($_POST['lastName']) ? trim($_POST['lastName']) : '';
    $jobTitle = isset($_POST['jobTitle']) ? trim($_POST['jobTitle']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $departmentID = isset($_POST['departmentID']) ? intval($_POST['departmentID']) : null;

    if ($firstName && $lastName && $email && $departmentID) {
        $stmt = $conn->prepare("INSERT INTO personnel (firstName, lastName, jobTitle, email, departmentID) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssi", $firstName, $lastName, $jobTitle, $email, $departmentID);
        if ($stmt->execute()) {
            $response['status'] = ["code" => "200", "description" => "Success"];
            $response['data'] = ["id" => $conn->insert_id];
        } else {
            $response['status'] = ["code" => "500", "description" => "Database insert failed: " . $stmt->error];
        }
        $stmt->close();
    } else {
        $response['status'] = ["code" => "400", "description" => "Missing required fields."];
    }
} else {
    $response['status'] = ["code" => "405", "description" => "Method not allowed."];
}

$conn->close();
echo json_encode($response);
