<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$dbPath = __DIR__ . '/../sql/kitchen.db';
$initSqlPath = __DIR__ . '/../sql/init.sql';

try {
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Auto-initialize if table doesn't exist
    $query = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='projects'");
    if (!$query->fetch()) {
        $sql = file_get_contents($initSqlPath);
        $db->exec($sql);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'list') {
            $stmt = $db->query("SELECT name, updated_at FROM projects ORDER BY name ASC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($action === 'load') {
            $name = $_GET['name'] ?? '';
            $stmt = $db->prepare("SELECT * FROM projects WHERE name = ?");
            $stmt->execute([$name]);
            $project = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($project) {
                echo json_encode($project);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Project not found']);
            }
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $name = $data['name'] ?? '';
        $content = $data['content'] ?? '';
        $meta = isset($data['meta']) ? json_encode($data['meta']) : null;

        if (!$name || !$content) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing project name or content']);
            break;
        }

        $stmt = $db->prepare("INSERT INTO projects (name, content, meta, updated_at) 
                              VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                              ON CONFLICT(name) DO UPDATE SET 
                              content = excluded.content,
                              meta = excluded.meta,
                              updated_at = CURRENT_TIMESTAMP");
        $stmt->execute([$name, $content, $meta]);
        echo json_encode(['success' => true]);
        break;

    case 'DELETE':
        $name = $_GET['name'] ?? '';
        if (!$name) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing project name']);
            break;
        }
        $stmt = $db->prepare("DELETE FROM projects WHERE name = ?");
        $stmt->execute([$name]);
        echo json_encode(['success' => true]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
