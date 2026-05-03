<?php
/**
 * JWT 工具类
 * 简化版 JWT 实现
 */

require_once __DIR__ . '/config.php';

class JWT
{
    /**
     * 生成 JWT Token
     */
    public static function encode($payload)
    {
        $header = self::base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload = self::base64UrlEncode(json_encode($payload));
        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
        );
        return "$header.$payload.$signature";
    }

    /**
     * 解码 JWT Token
     */
    public static function decode($token)
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $parts;

        // 验证签名
        $expectedSignature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
        );

        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }

        $payload = json_decode(self::base64UrlDecode($payload), true);

        // 验证过期时间
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    /**
     * 生成访问令牌
     */
    public static function generateAccessToken($userId, $email)
    {
        return self::encode([
            'iss' => JWT_ISSUER,
            'sub' => $userId,
            'email' => $email,
            'type' => 'access',
            'iat' => time(),
            'exp' => time() + JWT_ACCESS_EXPIRY,
        ]);
    }

    /**
     * 生成刷新令牌
     */
    public static function generateRefreshToken($userId, $email)
    {
        return self::encode([
            'iss' => JWT_ISSUER,
            'sub' => $userId,
            'email' => $email,
            'type' => 'refresh',
            'iat' => time(),
            'exp' => time() + JWT_REFRESH_EXPIRY,
        ]);
    }

    /**
     * 从请求头获取 Token
     */
    public static function getTokenFromHeader()
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * 验证访问令牌并返回用户 ID
     */
    public static function validateAccessToken()
    {
        $token = self::getTokenFromHeader();
        if (!$token) {
            return null;
        }

        $payload = self::decode($token);
        if (!$payload || $payload['type'] !== 'access') {
            return null;
        }

        return $payload['sub'];
    }

    /**
     * 验证刷新令牌并返回用户信息
     */
    public static function validateRefreshToken()
    {
        $token = self::getTokenFromHeader();
        if (!$token) {
            return null;
        }

        $payload = self::decode($token);
        if (!$payload || $payload['type'] !== 'refresh') {
            return null;
        }

        return [
            'userId' => $payload['sub'],
            'email' => $payload['email'],
        ];
    }

    private static function base64UrlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data)
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
