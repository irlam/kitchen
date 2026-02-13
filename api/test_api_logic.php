<?php
$_SERVER['REQUEST_METHOD'] = 'POST';
$data = [
    'name' => 'API_TEST_2',
    'content' => '{"floorplan":{}, "items":[]}',
    'meta' => ['projectName' => 'API_TEST_2']
];

// Helper to simulate php://input
function mock_post($data) {
    $temp = tmpfile();
    fwrite($temp, json_encode($data));
    fseek($temp, 0);
    return $temp;
}

// Since we can't easily override php://input in a script, 
// let's just test the logic by modifying the projects.php 
// or creating a dedicated test script that requires it but mocks the input.

// Actually, I can just write a small test script that does what projects.php does.

$dbPath = __DIR__ . '/../sql/kitchen.db';
$db = new PDO('sqlite:' . $dbPath);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$name = $data['name'];
$content = $data['content']; // Assume it's a string
if (is_array($content)) {
    $content = json_encode($content);
}
$meta = json_encode($data['meta']);

$check = $db->prepare("SELECT id FROM projects WHERE name = ?");
$check->execute([$name]);
if ($check->fetch()) {
    $stmt = $db->prepare("UPDATE projects SET content = ?, meta = ?, updated_at = CURRENT_TIMESTAMP WHERE name = ?");
    $stmt->execute([$content, $meta, $name]);
    echo "Updated\n";
} else {
    $stmt = $db->prepare("INSERT INTO projects (name, content, meta, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
    $stmt->execute([$name, $content, $meta]);
    echo "Inserted\n";
}
?>