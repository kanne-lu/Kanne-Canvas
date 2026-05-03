<?php
/**
 * 重置密码接口
 * POST /api/auth/reset-password
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

setCorsHeaders();
handleOptionsRequest();

// 只允许 POST 请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondError('请求方法不允许', 405);
}

// 获取请求数据
$data = getRequestBody();
$email = $data['email'] ?? '';
$code = $data['code'] ?? '';
$newPassword = $data['newPassword'] ?? '';

// 验证必填字段
if (empty($email)) {
    respondError('邮箱不能为空');
}
if (empty($code)) {
    respondError('验证码不能为空');
}
if (empty($newPassword)) {
    respondError('新密码不能为空');
}

// 验证密码强度
if (!validatePassword($newPassword)) {
    respondError('密码长度至少 6 位');
}

// 查找用户
$db = new JsonDB();
$user = $db->getUserByEmail($email);
if (!$user) {
    respondError('用户不存在');
}

// 验证验证码
$savedCode = $db->getCode($email);
if (!$savedCode) {
    respondError('验证码已过期或不存在');
}
if ($savedCode['code'] !== $code) {
    respondError('验证码错误');
}
if ($savedCode['expiresAt'] < time()) {
    respondError('验证码已过期');
}

// 更新密码
$user['password'] = password_hash($newPassword, PASSWORD_DEFAULT);
$db->saveUser($user);

// 删除已使用的验证码
$db->deleteCode($email);

// 返回成功
respondSuccess([
    'success' => true,
]);
