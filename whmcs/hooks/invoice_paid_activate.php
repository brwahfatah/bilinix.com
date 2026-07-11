<?php

use WHMCS\Database\Capsule;

/**
 * AfterModuleCreate: safety net for status activation.
 */
add_hook('AfterModuleCreate', 1, function($vars) {
    $serviceId = $vars['params']['serviceid'] ?? 0;
    if (!$serviceId) return;

    try {
        $service = Capsule::table('tblhosting')->where('id', $serviceId)->first();
        if (!$service) return;

        if (strtolower($service->domainstatus) !== 'active') {
            Capsule::table('tblhosting')
                ->where('id', $serviceId)
                ->update(['domainstatus' => 'Active']);
        }

        if ($service->orderid) {
            $order = Capsule::table('tblorders')->where('id', $service->orderid)->first();
            if ($order && strtolower($order->status) === 'pending') {
                Capsule::table('tblorders')
                    ->where('id', $order->id)
                    ->update(['status' => 'Active']);
            }
        }
    } catch (\Exception $e) {
        logActivity("AfterModuleCreate hook error: " . $e->getMessage());
    }
});

/**
 * InvoicePaid: accept order and launch async provisioning.
 */
add_hook('InvoicePaid', 1, function($vars) {
    $invoiceId = $vars['invoiceid'];

    try {
        // Accept the order
        $order = Capsule::table('tblorders')
            ->where('invoiceid', $invoiceId)
            ->first();

        if ($order && strtolower($order->status) === 'pending') {
            Capsule::table('tblorders')
                ->where('id', $order->id)
                ->update(['status' => 'Active']);
        }

        if (!$order) return;

        // Find hosting services for this invoice
        $items = Capsule::table('tblinvoiceitems')
            ->where('invoiceid', $invoiceId)
            ->where('type', 'Hosting')
            ->get();

        foreach ($items as $item) {
            $serviceId = $item->relid;
            if (!$serviceId) continue;

            $service = Capsule::table('tblhosting')->where('id', $serviceId)->first();
            if (!$service || !empty($service->username)) continue;

            // Launch background provisioning (non-blocking)
            $script = dirname(__DIR__) . '/provision_service.php';
            exec("php $script $serviceId > /dev/null 2>&1 &");
            logActivity("InvoicePaid hook: queued async provisioning for service #{$serviceId}");
        }
    } catch (\Exception $e) {
        logActivity("InvoicePaid hook error: " . $e->getMessage());
    }
});
