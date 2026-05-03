<?php
/**
 * 用户注册接口
 * POST /api/auth/register
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
$nickname = $data['nickname'] ?? '';

// 验证必填字段
if (empty($email)) {
    respondError('邮箱不能为空');
}
if (empty($password)) {
    respondError('密码不能为空');
}
if (empty($nickname)) {
    respondError('昵称不能为空');
}

// 验证邮箱格式
if (!validateEmail($email)) {
    respondError('邮箱格式不正确');
}

// 验证密码强度
if (!validatePassword($password)) {
    respondError('密码长度至少 6 位');
}

// 验证昵称
if (!validateNickname($nickname)) {
    respondError('昵称长度需要 2-20 个字符');
}

// 检查邮箱是否已注册
$db = new JsonDB();
$existingUser = $db->getUserByEmail($email);
if ($existingUser) {
    respondError('该邮箱已注册');
}

// 创建用户
$user = [
    'id' => generateId(),
    'email' => $email,
    'nickname' => $nickname,
    'password' => password_hash($password, PASSWORD_DEFAULT),
    'avatar' => '',
    'level' => 0,
    'points' => POINTS_REGISTER_GIFT,
    'totalPoints' => POINTS_REGISTER_GIFT,
    'emailVerified' => false,
    'createdAt' => date('c'),
    'lastCheckIn' => null,
    'consecutiveCheckInDays' => 0,
];

// 保存用户
$db->saveUser($user);

// 记录注册赠送积分
$db->addPointsRecord([
    'id' => generateId(),
    'userId' => $user['id'],
    'type' => 'earn',
    'amount' => POINTS_REGISTER_GIFT,
    'balance' => POINTS_REGISTER_GIFT,
    'description' => '注册赠送',
    'createdAt' => date('c'),
]);

// 生成 Token
$token = JWT::generateAccessToken($user['id'], $user['email']);
$refreshToken = JWT::generateRefreshToken($user['id'], $user['email']);

// 返回响应
respondSuccess([
    'token' => $token,
    'refreshToken' => $refreshToken,
    'user' => formatUserData($user),
]);
