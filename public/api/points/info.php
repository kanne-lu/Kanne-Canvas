<?php
/**
 * 获取积分信息接口
 * GET /api/points/info
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

// 查找用户
$db = new JsonDB();
$user = $db->getUserById($userId);
if (!$user) {
    respondError('用户不存在', 404);
}

// 更新等级信息
$levelInfo = getLevelInfo($user['totalPoints']);
$user['level'] = $levelInfo['level'];
$db->saveUser($user);

// 检查今天是否已签到
$todayCheckedIn = false;
if ($user['lastCheckIn']) {
    $lastCheckIn = date('Y-m-d', strtotime($user['lastCheckIn']));
    $today = date('Y-m-d');
    $todayCheckedIn = ($lastCheckIn === $today);
}

// 返回积分信息
respondSuccess([
    'points' => $user['points'],
    'totalPoints' => $user['totalPoints'],
    'level' => $levelInfo['level'],
    'levelName' => $levelInfo['levelName'],
    'nextLevelPoints' => $levelInfo['nextLevelPoints'],
    'todayCheckedIn' => $todayCheckedIn,
    'consecutiveCheckInDays' => $user['consecutiveCheckInDays'] ?? 0,
]);
