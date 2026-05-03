<?php
/**
 * API 配置文件
 * 存储全局配置常量
 */

// 数据存储目录（JSON 文件）
define('DATA_DIR', __DIR__ . '/data/');

// JWT 配置
define('JWT_SECRET', 'kanne-canvas-secret-key-2026'); // 生产环境请更换为更安全的密钥
define('JWT_ISSUER', 'kanne-canvas');
define('JWT_ACCESS_EXPIRY', 3600); // 访问令牌过期时间：1 小时
define('JWT_REFRESH_EXPIRY', 604800); // 刷新令牌过期时间：7 天

// 积分配置
define('POINTS_REGISTER_GIFT', 100); // 注册赠送积分
define('POINTS_CHECK_IN', 10); // 签到积分
define('POINTS_CHECK_IN_BONUS', 5); // 连续签到额外奖励（每天递增）
define('POINTS_CHECK_IN_MAX_BONUS', 30); // 连续签到最大额外奖励
define('POINTS_INVITE', 50); // 邀请好友积分

// 等级配置
define('LEVELS', [
    ['name' => '新手用户', 'points' => 0],
    ['name' => '初级用户', 'points' => 500],
    ['name' => '中级用户', 'points' => 2000],
    ['name' => '高级用户', 'points' => 5000],
    ['name' => '资深用户', 'points' => 10000],
    ['name' => '超级用户', 'points' => 50000],
]);

// 任务配置
define('TASKS', [
    [
        'id' => 'daily_check_in',
        'name' => '每日签到',
        'description' => '每日签到获取积分',
        'points' => POINTS_CHECK_IN,
        'type' => 'daily',
    ],
    [
        'id' => 'invite_friend',
        'name' => '邀请好友',
        'description' => '邀请好友注册获取积分',
        'points' => POINTS_INVITE,
        'type' => 'once',
    ],
    [
        'id' => 'first_generate',
        'name' => '首次生图',
        'description' => '首次使用 AI 生成功能',
        'points' => 20,
        'type' => 'once',
    ],
    [
        'id' => 'complete_profile',
        'name' => '完善资料',
        'description' => '完善个人资料信息',
        'points' => 30,
        'type' => 'once',
    ],
]);

// 验证码配置
define('CODE_EXPIRY', 300); // 验证码过期时间：5 分钟
define('CODE_LENGTH', 6); // 验证码长度
