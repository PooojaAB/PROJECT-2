<?php
// updateDepartment.php
// Updates a department record in the database

ini_set('display_errors', 'On');
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}


$id = $_POST['id'];
$name = $_POST['name'];

// Get current locationID for department
$locationID = null;
$query = $conn->prepare('SELECT locationID FROM department WHERE id = ?');
$query->bind_param('i', $id);
$query->execute();
$result = $query->get_result();
if ($row = $result->fetch_assoc()) {
    $locationID = $row['locationID'];
}
$query->close();

// Update department name only, keep locationID unchanged
$query = $conn->prepare('UPDATE department SET name=? WHERE id=?');
$query->bind_param('si', $name, $id);
if (!$query->execute()) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "update failed";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}
$query->close();

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = [];

mysqli_close($conn);
echo json_encode($output);
?>
