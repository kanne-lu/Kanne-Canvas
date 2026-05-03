<?php
/**
 * 积分历史记录接口
 * GET /api/points/history?page=1&size=10
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../jwt.php';

setCorsHeaders();
handleOptionsRequest();

// 只允许 GET 请求
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respondError('请求方法不允许', 405);
}

// 验证 Token
$userId = JWT::validateAccessToken();
if (!$userId) {
    respondError('未登录或 Token 已过期', 401);
}

// 获取分页参数
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$size = isset($_GET['size']) ? max(1, min(50, intval($_GET['size']))) : 10;

// 查找用户
$db = new JsonDB();
$user = $db->getUserById($userId);
if (!$user) {
    respondError('用户不存在', 404);
}

// 获取积分记录
$records = $db->getPointsRecords($userId);

// 按时间倒序排序
usort($records, function ($a, $b) {
    return strtotime($b['createdAt']) - strtotime($a['createdAt']);
});

// 分页处理
$total = count($records);
$offset = ($page - 1) * $size;
$records = array_slice($records, $offset, $size);

// 格式化记录
$formattedRecords = array_map(function ($record) {
    return [
        'id' => $record['id'],
        'type' => $record['type'],
        'amount' => $record['amount'],
        'balance' => $record['balance'],
        'description' => $record['description'],
        'createdAt' => $record['createdAt'],
    ];
}, $records);

// 返回响应
respondSuccess($formattedRecords);
