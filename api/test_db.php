<?php
header('Content-Type: application/json');
$dbPath = __DIR__ . '/../sql/kitchen.db';
$results = [];

$results['db_path'] = realpath(dirname($dbPath)) . '/' . basename($dbPath);
$results['dir_writable'] = is_writable(dirname($dbPath));
$results['file_exists'] = file_exists($dbPath);
if ($results['file_exists']) {
    $results['file_writable'] = is_writable($dbPath);
}

try {
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec("CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, val TEXT)");
    $db->exec("INSERT INTO test_table (val) VALUES ('test')");
    $stmt = $db->query("SELECT COUNT(*) FROM test_table");
    $results['db_test_write'] = "Success, count: " . $stmt->fetchColumn();
    $db->exec("DROP TABLE test_table");
} catch (Exception $e) {
    $results['db_error'] = $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);
