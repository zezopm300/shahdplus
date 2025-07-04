<?php
// ======= إعدادات ========
$api_key = '8f490a45-e8b4-47be-8903-3a8bc12dd6a1';

// ======= السماح بالتشغيل من كل الأجهزة ========
header("Access-Control-Allow-Origin: *");
header("Access-Control-Expose-Headers: Content-Length, Content-Range, Accept-Ranges, Content-Type");
header("Cross-Origin-Resource-Policy: cross-origin");

// ======= التحقق من وجود ID ========
if (!isset($_GET['id']) || empty($_GET['id'])) {
    http_response_code(400);
    exit('❌ Missing video ID');
}

$id = preg_replace('/[^a-zA-Z0-9]/', '', $_GET['id']); // تنظيف ID

// ======= إعداد رابط Pixeldrain ========
$pixeldrain_url = "https://pixeldrain.com/api/file/$id";

// ======= إرسال Headers ========
$headers = [
    "Authorization: Bearer $api_key",
    "User-Agent: Mozilla/5.0"
];

// ======= دعم Range Request لتقليل التقطيع ========
if (isset($_SERVER['HTTP_RANGE'])) {
    $headers[] = 'Range: ' . $_SERVER['HTTP_RANGE'];
}

// ======= إعداد CURL ========
$ch = curl_init($pixeldrain_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// تمرير headers تلقائي للمتصفح
curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($ch, $header) {
    if (stripos($header, "transfer-encoding") === false) {
        header($header, false);
    }
    return strlen($header);
});

// ======= تشغيل الفيديو ========
curl_exec($ch);
curl_close($ch);

