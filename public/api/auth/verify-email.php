<?php
/**
 * 邮箱验证接口
 * POST /api/auth/verify-email
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

// 验证必填字段
if (empty($email)) {
    respondError('邮箱不能为空');
}
if (empty($code)) {
    respondError('验证码不能为空');
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

// 更新用户邮箱验证状态
$user['emailVerified'] = true;
$db->saveUser($user);

// 删除已使用的验证码
$db->deleteCode($email);

// 返回成功
respondSuccess([
    'success' => true,
]);
