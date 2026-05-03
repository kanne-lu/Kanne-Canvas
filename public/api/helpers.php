<?php
/**
 * 辅助函数
 * CORS、错误处理、工具函数
 */

require_once __DIR__ . '/config.php';

/**
 * 设置 CORS 响应头
 */
function setCorsHeaders()
{
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Max-Age: 86400");
    header("Content-Type: application/json; charset=utf-8");
}

/**
 * 处理 OPTIONS 预检请求
 */
function handleOptionsRequest()
{
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit(0);
    }
}

/**
 * 输出错误响应
 */
function respondError($message, $httpCode = 400)
{
    http_response_code($httpCode);
    echo json_encode(['error' => $message]);
    exit;
}

/**
 * 输出成功响应
 */
function respondSuccess($data = [])
{
    http_response_code(200);
    echo json_encode($data);
    exit;
}

/**
 * 获取请求体 JSON 数据
 */
function getRequestBody()
{
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    return $data ?: [];
}

/**
 * 生成唯一 ID
 */
function generateId()
    {
        return bin2hex(random_bytes(16));
    }

/**
 * 生成验证码
 */
function generateCode($length = CODE_LENGTH)
{
    $code = '';
    for ($i = 0; $i < $length; $i++) {
        $code .= random_int(0, 9);
    }
    return $code;
}

/**
 * 根据积分获取等级信息
 */
function getLevelInfo($points)
{
    $level = 0;
    $levelName = LEVELS[0]['name'];
    $nextLevelPoints = LEVELS[1]['points'] ?? PHP_INT_MAX;

    for ($i = count(LEVELS) - 1; $i >= 0; $i--) {
        if ($points >= LEVELS[$i]['points']) {
            $level = $i;
            $levelName = LEVELS[$i]['name'];
            $nextLevelPoints = LEVELS[$i + 1]['points'] ?? PHP_INT_MAX;
            break;
        }
    }

    return [
        'level' => $level,
        'levelName' => $levelName,
        'nextLevelPoints' => $nextLevelPoints,
    ];
}

/**
 * 格式化用户数据（返回给前端）
 */
function formatUserData($user)
{
    return [
        'id' => $user['id'],
        'email' => $user['email'],
        'nickname' => $user['nickname'],
        'avatar' => $user['avatar'] ?? '',
        'level' => $user['level'] ?? 0,
        'points' => $user['points'] ?? 0,
        'totalPoints' => $user['totalPoints'] ?? 0,
        'emailVerified' => $user['emailVerified'] ?? false,
        'createdAt' => $user['createdAt'],
    ];
}

/**
 * 验证邮箱格式
 */
function validateEmail($email)
{
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

/**
 * 验证密码强度
 */
function validatePassword($password)
{
    return strlen($password) >= 6;
}

/**
 * 验证昵称
 */
function validateNickname($nickname)
{
    $len = mb_strlen($nickname);
    return $len >= 2 && $len <= 20;
}
