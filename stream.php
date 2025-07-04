<?php
$api_key = '8f490a45-e8b4-47be-8903-3a8bc12dd6a1';

if (!isset($_GET['id']) || empty($_GET['id'])) {
    http_response_code(400);
    exit('❌ Missing video ID');
}

$id = preg_replace('/[^a-zA-Z0-9]/', '', $_GET['id']);
$url = "https://pixeldrain.com/api/file/$id";

$headers = [
    "Authorization: Bearer $api_key",
    "User-Agent: Mozilla/5.0"
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);

$response = curl_exec($ch);

$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$headers_text = substr($response, 0, $header_size);
$body = substr($response, $header_size);

// ✅ نرجع فقط الهيدرات المهمة للفيديو
foreach (explode("\r\n", $headers_text) as $header) {
    if (
        stripos($header, 'Content-Type:') === 0 ||
        stripos($header, 'Content-Length:') === 0 ||
        stripos($header, 'Accept-Ranges:') === 0 ||
        stripos($header, 'Content-Range:') === 0
    ) {
        header($header);
    }
}

http_response_code($http_code);
echo $body;

