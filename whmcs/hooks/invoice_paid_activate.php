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
 * InvoicePaid: activate order and provision via localAPI.
 * Fires when invoice is fully paid (gateway payment, manual credit, admin action).
 * Does NOT fire during AddOrder's internal credit-auto-apply (handled by Laravel).
 */
add_hook('InvoicePaid', 1, function($vars) {
    $invoiceId = $vars['invoiceid'];

    try {
        $order = Capsule::table('tblorders')
            ->where('invoiceid', $invoiceId)
            ->first();

        if ($order && strtolower($order->status) === 'pending') {
            Capsule::table('tblorders')
                ->where('id', $order->id)
                ->update(['status' => 'Active']);
        }

        if (!$order) return;

        $items = Capsule::table('tblinvoiceitems')
            ->where('invoiceid', $invoiceId)
            ->where('type', 'Hosting')
            ->get();

        foreach ($items as $item) {
            $serviceId = $item->relid;
            if (!$serviceId) continue;

            $service = Capsule::table('tblhosting')->where('id', $serviceId)->first();
            if (!$service || !empty($service->username)) continue;

            $result = localAPI('ModuleCreate', ['serviceid' => $serviceId], 'Brwa');
            logActivity("InvoicePaid hook: provisioned service #$serviceId — " . ($result['result'] ?? 'unknown'));
        }
    } catch (\Exception $e) {
        logActivity("InvoicePaid hook error: " . $e->getMessage());
    }
});
