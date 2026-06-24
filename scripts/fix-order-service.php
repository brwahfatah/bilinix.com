<?php
$file = '/var/www/bilinix-api/app/Services/OrderService.php';
$content = file_get_contents($file);

// Fix the broken substitution from previous attempt
$content = str_replace(
    "\$user->update(['whmcs_client_id' => ->id]);",
    "\$user->update(['whmcs_client_id' => \$user->id]);",
    $content
);

file_put_contents($file, $content);
echo "Done\n";

// Verify
$lines = file($file);
foreach ($lines as $i => $line) {
    if (strpos($line, 'whmcs_client_id') !== false) {
        printf("Line %d: %s", $i + 1, $line);
    }
}
