<?php
// ======= إعدادات ========
$api_key = '8f490a45-e8b4-47be-8903-3a8bc12dd6a1';

// ======= التحقق من وجود ID ========
if (!isset($_GET['id']) || empty($_GET['id'])) {
    http_response_code(400);
    exit('❌ Missing video ID');
}

$id = preg_replace('/[^a-zA-Z0-9]/', '', $_GET['id']); // تنظيف ID

// ======= رابط Pixeldrain المحمي ========
$pixeldrain_url = "https://pixeldrain.com/api/file/$id";

// ======= إعداد headers ========
$headers = [
    "Authorization: Bearer $api_key",
    "User-Agent: Mozilla/5.0"
];

$ch = curl_init($pixeldrain_url);

// ======= دعم التقديم (Range) لتقليل التقطيع ========
if (isset($_SERVER['HTTP_RANGE'])) {
    $headers[] = "Range: " . $_SERVER['HTTP_RANGE'];
}

// ======= إرسال headers وتهيئة الاتصال ========
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($ch, $header) {
    if (stripos($header, 'Content-Length') !== false || 
        stripos($header, 'Content-Range') !== false ||
        stripos($header, 'Content-Type') !== false ||
        stripos($header, 'Accept-Ranges') !== false) {
        header($header);
    }
    return strlen($header);
});

// ======= تشغيل البروكسي ========
curl_exec($ch);
curl_close($ch);
