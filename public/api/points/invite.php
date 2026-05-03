<?php
/**
 * 邀请好友接口
 * POST /api/points/invite
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

// 验证 Token
$userId = JWT::validateAccessToken();
if (!$userId) {
    respondError('未登录或 Token 已过期', 401);
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

// 查找用户
$db = new JsonDB();
$user = $db->getUserById($userId);
if (!$user) {
    respondError('用户不存在', 404);
}

// 检查是否邀请自己
if ($email === $user['email']) {
    respondError('不能邀请自己');
}

// 检查被邀请人是否已注册
$invitedUser = $db->getUserByEmail($email);
if ($invitedUser) {
    respondError('该用户已注册');
}

// 检查是否已邀请过（简化处理：检查积分记录）
$records = $db->getPointsRecords($userId);
foreach ($records as $record) {
    if ($record['description'] === '邀请好友：' . $email) {
        respondError('已经邀请过该用户');
    }
}

// 增加积分
$pointsEarned = POINTS_INVITE;
$user['points'] += $pointsEarned;
$user['totalPoints'] += $pointsEarned;

// 更新等级
$levelInfo = getLevelInfo($user['totalPoints']);
$user['level'] = $levelInfo['level'];

// 保存用户
$db->saveUser($user);

// 记录积分变动
$db->addPointsRecord([
    'id' => generateId(),
    'userId' => $user['id'],
    'type' => 'earn',
    'amount' => $pointsEarned,
    'balance' => $user['points'],
    'description' => '邀请好友：' . $email,
    'createdAt' => date('c'),
]);

// 返回响应
respondSuccess([
    'success' => true,
    'pointsEarned' => $pointsEarned,
    'newTotalPoints' => $user['totalPoints'],
]);
