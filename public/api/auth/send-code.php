<?php
/**
 * 发送验证码接口
 * POST /api/auth/send-code
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

// 验证必填字段
if (empty($email)) {
    respondError('邮箱不能为空');
}

// 验证邮箱格式
if (!validateEmail($email)) {
    respondError('邮箱格式不正确');
}

// 生成验证码
$code = generateCode();

// 保存验证码
$db = new JsonDB();
$db->saveCode($email, $code);

// TODO: 实际项目中这里应该发送邮件
// mail($email, '验证码', "您的验证码是：$code");

// 返回成功（开发环境返回验证码，生产环境不返回）
respondSuccess([
    'success' => true,
    'code' => $code, // 开发环境返回验证码，生产环境应移除此行
]);
