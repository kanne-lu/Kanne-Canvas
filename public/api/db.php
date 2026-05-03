<?php
/**
 * JSON 文件存储类
 * 使用 JSON 文件模拟数据库操作
 */

require_once __DIR__ . '/config.php';

class JsonDB
{
    private $dataDir;

    public function __construct()
    {
        $this->dataDir = DATA_DIR;
        if (!is_dir($this->dataDir)) {
            mkdir($this->dataDir, 0755, true);
        }
    }

    /**
     * 获取所有用户
     */
    public function getUsers()
    {
        return $this->read('users') ?: [];
    }

    /**
     * 根据 ID 获取用户
     */
    public function getUserById($id)
    {
        $users = $this->getUsers();
        foreach ($users as $user) {
            if ($user['id'] === $id) {
                return $user;
            }
        }
        return null;
    }

    /**
     * 根据邮箱获取用户
     */
    public function getUserByEmail($email)
    {
        $users = $this->getUsers();
        foreach ($users as $user) {
            if ($user['email'] === $email) {
                return $user;
            }
        }
        return null;
    }

    /**
     * 保存用户
     */
    public function saveUser($user)
    {
        $users = $this->getUsers();
        $found = false;
        for ($i = 0; $i < count($users); $i++) {
            if ($users[$i]['id'] === $user['id']) {
                $users[$i] = $user;
                $found = true;
                break;
            }
        }
        if (!$found) {
            $users[] = $user;
        }
        return $this->write('users', $users);
    }

    /**
     * 获取积分记录
     */
    public function getPointsRecords($userId)
    {
        $records = $this->read('points_records') ?: [];
        return array_filter($records, function ($r) use ($userId) {
            return $r['userId'] === $userId;
        });
    }

    /**
     * 添加积分记录
     */
    public function addPointsRecord($record)
    {
        $records = $this->read('points_records') ?: [];
        $records[] = $record;
        return $this->write('points_records', $records);
    }

    /**
     * 获取用户任务完成情况
     */
    public function getUserTasks($userId)
    {
        $tasks = $this->read('user_tasks') ?: [];
        return array_filter($tasks, function ($t) use ($userId) {
            return $t['userId'] === $userId;
        });
    }

    /**
     * 记录任务完成
     */
    public function completeUserTask($userId, $taskId)
    {
        $tasks = $this->read('user_tasks') ?: [];
        $tasks[] = [
            'userId' => $userId,
            'taskId' => $taskId,
            'completedAt' => date('c'),
        ];
        return $this->write('user_tasks', $tasks);
    }

    /**
     * 获取验证码
     */
    public function getCode($email)
    {
        $codes = $this->read('codes') ?: [];
        foreach ($codes as $code) {
            if ($code['email'] === $email) {
                return $code;
            }
        }
        return null;
    }

    /**
     * 保存验证码
     */
    public function saveCode($email, $code)
    {
        $codes = $this->read('codes') ?: [];
        // 删除旧验证码
        $codes = array_filter($codes, function ($c) use ($email) {
            return $c['email'] !== $email;
        });
        $codes[] = [
            'email' => $email,
            'code' => $code,
            'expiresAt' => time() + CODE_EXPIRY,
        ];
        return $this->write('codes', array_values($codes));
    }

    /**
     * 删除验证码
     */
    public function deleteCode($email)
    {
        $codes = $this->read('codes') ?: [];
        $codes = array_filter($codes, function ($c) use ($email) {
            return $c['email'] !== $email;
        });
        return $this->write('codes', array_values($codes));
    }

    /**
     * 读取 JSON 文件
     */
    private function read($name)
    {
        $file = $this->dataDir . $name . '.json';
        if (!file_exists($file)) {
            return null;
        }
        $content = file_get_contents($file);
        return json_decode($content, true);
    }

    /**
     * 写入 JSON 文件
     */
    private function write($name, $data)
    {
        $file = $this->dataDir . $name . '.json';
        return file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}
