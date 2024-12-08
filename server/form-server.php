<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$response = ['success' => false,'message' => '','data' => null];
try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }
    $jsonData = file_get_contents('php://input');
    $formData = json_decode($jsonData, true);
    if (!$formData) {
        throw new Exception('Invalid form data');
    }
    $logEntry = date('Y-m-d H:i:s') . " - " . json_encode($formData) . "\n";
    file_put_contents('submissions.log', $logEntry, FILE_APPEND);

    $to = "your@email.com";
    $subject = "New Form Submission";
    $message = "New submission received:\n\n" . print_r($formData, true);
    mail($to, $subject, $message);    
    $response['success'] = true;
    $response['message'] = 'Form submitted successfully';
    $response['data'] = ['id' => uniqid()];

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}
echo json_encode($response);

?>
