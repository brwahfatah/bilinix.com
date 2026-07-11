<?php
/**
 * Background provisioning script.
 * Called asynchronously by the InvoicePaid hook.
 * Usage: php provision_service.php <service_id>
 */

$serviceId = (int)($argv[1] ?? 0);
if (!$serviceId) exit(1);

// Wait a moment for the AddOrder transaction to commit
sleep(2);

define('WHMCS', true);
require dirname(__DIR__) . '/init.php';
use WHMCS\Database\Capsule;

$logFile = '/tmp/provision.log';
$t = date('Y-m-d H:i:s');

$service = Capsule::table('tblhosting')->where('id', $serviceId)->first();
if (!$service) {
    file_put_contents($logFile, "$t Service #$serviceId not found\n", FILE_APPEND);
    exit(1);
}

// Skip if already provisioned (has username)
if (!empty($service->username)) {
    file_put_contents($logFile, "$t Service #$serviceId already provisioned (user={$service->username}), skipping\n", FILE_APPEND);
    exit(0);
}

file_put_contents($logFile, "$t Provisioning service #$serviceId ({$service->domain})\n", FILE_APPEND);

$result = localAPI('ModuleCreate', ['serviceid' => $serviceId], 'Brwa');

$status = $result['result'] ?? 'null';
file_put_contents($logFile, "$t ModuleCreate for service #$serviceId: $status\n", FILE_APPEND);
