<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$imageUrl = trim((string)($input['imageUrl'] ?? ''));

if ($imageUrl === '') {
    http_response_code(400);
    echo json_encode(['error' => '缺少 imageUrl'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!filter_var($imageUrl, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(['error' => 'imageUrl 不是有效地址'], JSON_UNESCAPED_UNICODE);
    exit;
}

$context = stream_context_create([
    'http' => [
        'timeout' => 30,
        'follow_location' => 1,
        'user_agent' => 'KanneCanvas/1.0'
    ]
]);

$content = @file_get_contents($imageUrl, false, $context);
if ($content === false) {
    http_response_code(502);
    echo json_encode(['error' => '下载生成图片失败'], JSON_UNESCAPED_UNICODE);
    exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->buffer($content);
$extMap = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
];
$ext = $extMap[$mime] ?? 'png';

$saveDir = __DIR__ . '/generated';
if (!is_dir($saveDir) && !mkdir($saveDir, 0755, true)) {
    http_response_code(500);
    echo json_encode(['error' => '无法创建 generated 目录'], JSON_UNESCAPED_UNICODE);
    exit;
}

$fileName = date('YmdHis') . '-' . bin2hex(random_bytes(8)) . '.' . $ext;
$filePath = $saveDir . '/' . $fileName;

if (file_put_contents($filePath, $content) === false) {
    http_response_code(500);
    echo json_encode(['error' => '保存生成图片失败'], JSON_UNESCAPED_UNICODE);
    exit;
}

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
$url = $scheme . '://' . $host . ($basePath === '' ? '' : $basePath) . '/generated/' . $fileName;

echo json_encode(['data' => ['url' => $url, 'fileName' => $fileName]], JSON_UNESCAPED_UNICODE);
