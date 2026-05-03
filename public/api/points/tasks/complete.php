<?php
/**
 * 完成任务接口
 * POST /api/points/tasks/{taskId}/complete
 * 注意：此文件需要通过 .htaccess 重写来处理动态路由
 */

require_once __DIR__ . '/../../helpers.php';
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../jwt.php';

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

// 获取任务 ID（从 URL 路径中提取）
$requestUri = $_SERVER['REQUEST_URI'];
preg_match('/\/tasks\/([^\/]+)\/complete/', $requestUri, $matches);
$taskId = $matches[1] ?? '';

if (empty($taskId)) {
    respondError('任务 ID 不能为空');
}

// 查找任务配置
$taskConfig = null;
foreach (TASKS as $task) {
    if ($task['id'] === $taskId) {
        $taskConfig = $task;
        break;
    }
}

if (!$taskConfig) {
    respondError('任务不存在', 404);
}

// 查找用户
$db = new JsonDB();
$user = $db->getUserById($userId);
if (!$user) {
    respondError('用户不存在', 404);
}

// 检查任务是否已完成
$completedTasks = $db->getUserTasks($userId);
$today = date('Y-m-d');

foreach ($completedTasks as $ct) {
    if ($ct['taskId'] === $taskId) {
        // 对于每日任务，检查今天是否已完成
        if ($taskConfig['type'] === 'daily') {
            if (date('Y-m-d', strtotime($ct['completedAt'])) === $today) {
                respondError('今天已完成该任务');
            }
        } else {
            // 一次性任务
            respondError('该任务已完成');
        }
    }
}

// 增加积分
$pointsEarned = $taskConfig['points'];
$user['points'] += $pointsEarned;
$user['totalPoints'] += $pointsEarned;

// 更新等级
$levelInfo = getLevelInfo($user['totalPoints']);
$levelUp = ($user['level'] < $levelInfo['level']);
$user['level'] = $levelInfo['level'];

// 保存用户
$db->saveUser($user);

// 记录任务完成
$db->completeUserTask($userId, $taskId);

// 记录积分变动
$db->addPointsRecord([
    'id' => generateId(),
    'userId' => $user['id'],
    'type' => 'earn',
    'amount' => $pointsEarned,
    'balance' => $user['points'],
    'description' => '完成任务：' . $taskConfig['name'],
    'createdAt' => date('c'),
]);

// 返回响应
respondSuccess([
    'success' => true,
    'pointsEarned' => $pointsEarned,
    'newTotalPoints' => $user['totalPoints'],
    'levelUp' => $levelUp,
]);
