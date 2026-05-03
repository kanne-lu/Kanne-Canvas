<?php
/**
 * 用户登录接口
 * POST /api/auth/login
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

// 获取请求数据
$data = getRequestBody();
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// 验证必填字段
if (empty($email)) {
    respondError('邮箱不能为空');
}
if (empty($password)) {
    respondError('密码不能为空');
}

// 查找用户
$db = new JsonDB();
$user = $db->getUserByEmail($email);
if (!$user) {
    respondError('邮箱或密码错误', 401);
}

// 验证密码
if (!password_verify($password, $user['password'])) {
    respondError('邮箱或密码错误', 401);
}

// 更新等级信息
$levelInfo = getLevelInfo($user['totalPoints']);
$user['level'] = $levelInfo['level'];
$db->saveUser($user);

// 生成 Token
$token = JWT::generateAccessToken($user['id'], $user['email']);
$refreshToken = JWT::generateRefreshToken($user['id'], $user['email']);

// 返回响应
respondSuccess([
    'token' => $token,
    'refreshToken' => $refreshToken,
    'user' => formatUserData($user),
]);
