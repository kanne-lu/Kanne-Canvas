<?php
/**
 * 签到接口
 * POST /api/points/check-in
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

// 查找用户
$db = new JsonDB();
$user = $db->getUserById($userId);
if (!$user) {
    respondError('用户不存在', 404);
}

// 检查今天是否已签到
$today = date('Y-m-d');
if ($user['lastCheckIn']) {
    $lastCheckIn = date('Y-m-d', strtotime($user['lastCheckIn']));
    if ($lastCheckIn === $today) {
        respondError('今天已经签到过了');
    }
}

// 计算连续签到天数
$yesterday = date('Y-m-d', strtotime('-1 day'));
if ($user['lastCheckIn'] && date('Y-m-d', strtotime($user['lastCheckIn'])) === $yesterday) {
    // 连续签到
    $user['consecutiveCheckInDays'] = ($user['consecutiveCheckInDays'] ?? 0) + 1;
} else {
    // 断签，重新开始
    $user['consecutiveCheckInDays'] = 1;
}

// 计算签到积分（基础 + 连续签到奖励）
$bonusDays = min($user['consecutiveCheckInDays'] - 1, 5); // 最多 5 天额外奖励
$pointsEarned = POINTS_CHECK_IN + ($bonusDays * POINTS_CHECK_IN_BONUS);
$pointsEarned = min($pointsEarned, POINTS_CHECK_IN + POINTS_CHECK_IN_MAX_BONUS); // 限制最大奖励

// 更新用户数据
$user['points'] += $pointsEarned;
$user['totalPoints'] += $pointsEarned;
$user['lastCheckIn'] = date('c');

// 更新等级
$levelInfo = getLevelInfo($user['totalPoints']);
$levelUp = ($user['level'] < $levelInfo['level']);
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
    'description' => '每日签到（连续' . $user['consecutiveCheckInDays'] . '天）',
    'createdAt' => date('c'),
]);

// 返回响应
respondSuccess([
    'success' => true,
    'pointsEarned' => $pointsEarned,
    'consecutiveDays' => $user['consecutiveCheckInDays'],
    'newTotalPoints' => $user['totalPoints'],
    'levelUp' => $levelUp,
]);
