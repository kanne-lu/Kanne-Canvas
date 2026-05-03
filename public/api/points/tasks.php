<?php
/**
 * 获取任务列表接口
 * GET /api/points/tasks
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

// 获取用户已完成的任务
$completedTasks = $db->getUserTasks($userId);
$completedTaskIds = array_map(function ($t) {
    return $t['taskId'];
}, $completedTasks);

// 今日日期
$today = date('Y-m-d');

// 构建任务列表
$tasks = [];
foreach (TASKS as $task) {
    $completed = false;

    switch ($task['type']) {
        case 'daily':
            // 每日任务：检查今天是否完成
            foreach ($completedTasks as $ct) {
                if ($ct['taskId'] === $task['id'] && date('Y-m-d', strtotime($ct['completedAt'])) === $today) {
                    $completed = true;
                    break;
                }
            }
            break;
        case 'once':
            // 一次性任务：检查是否已完成
            $completed = in_array($task['id'], $completedTaskIds);
            break;
    }

    $tasks[] = [
        'id' => $task['id'],
        'name' => $task['name'],
        'description' => $task['description'],
        'points' => $task['points'],
        'type' => $task['type'],
        'completed' => $completed,
    ];
}

// 返回响应
respondSuccess($tasks);
