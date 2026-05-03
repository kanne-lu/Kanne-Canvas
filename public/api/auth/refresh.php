<?php
/**
 * 刷新 Token 接口
 * POST /api/auth/refresh
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../jwt.php';

setCorsHeaders();
handleOptionsRequest();

// 只允许 POST 请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondError('请求方法不允许', 405);
}

// 验证刷新 Token
$tokenData = JWT::validateRefreshToken();
if (!$tokenData) {
    respondError('无效或过期的刷新 Token', 401);
}

// 查找用户
$db = new JsonDB();
$user = $db->getUserById($tokenData['userId']);
if (!$user) {
    respondError('用户不存在', 401);
}

// 更新等级信息
$levelInfo = getLevelInfo($user['totalPoints']);
$user['level'] = $levelInfo['level'];
$db->saveUser($user);

// 生成新 Token
$newToken = JWT::generateAccessToken($user['id'], $user['email']);
$newRefreshToken = JWT::generateRefreshToken($user['id'], $user['email']);

// 返回响应
respondSuccess([
    'token' => $newToken,
    'refreshToken' => $newRefreshToken,
    'user' => formatUserData($user),
]);
