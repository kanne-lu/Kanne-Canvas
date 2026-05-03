<?php
/**
 * Kanne Canvas 专用 AI API 代理层
 * 放置于服务器根目录 (dist) 下
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Target-Url");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// ----------------------------------------------------
// 【安全注意】请将你的真实 API Key 填写在下方
// 例如: $API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxx";
// ----------------------------------------------------
$API_KEY = "sk-your-api-key-here";

// 前端会在 Header 里告诉 PHP 真实的目标 URL
$targetUrl = isset($_SERVER['HTTP_X_TARGET_URL']) ? $_SERVER['HTTP_X_TARGET_URL'] : '';

if (empty($targetUrl)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing X-Target-Url header. Frontend proxy configuration error."]);
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// 构建传给大模型接口的请求头，静默注入 API Key
$headers = [
    "Authorization: Bearer " . trim($API_KEY),
    "Accept: application/json"
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    curl_setopt($ch, CURLOPT_POST, true);
    $input = file_get_contents("php://input");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
    
    if (isset($_SERVER['CONTENT_TYPE'])) {
        $headers[] = "Content-Type: " . $_SERVER['CONTENT_TYPE'];
    } else {
        $headers[] = "Content-Type: application/json";
    }
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// 规避一些主机的 SSL 证书验证失败问题
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(["error" => "PHP cURL 内部错误: " . curl_error($ch)]);
} else {
    http_response_code($httpCode);
    echo $response;
}

curl_close($ch);
