<?php

use WHMCS\Database\Capsule;

add_hook('InvoicePaid', 1, function($vars) {
    $invoiceId = $vars['invoiceid'];

    try {
        $items = Capsule::table('tblinvoiceitems')
            ->where('invoiceid', $invoiceId)
            ->where('type', 'Hosting')
            ->get();

        foreach ($items as $item) {
            $serviceId = $item->relid;
            if (!$serviceId) continue;

            $service = Capsule::table('tblhosting')
                ->where('id', $serviceId)
                ->first();

            if (!$service || strtolower($service->domainstatus) !== 'pending') {
                continue;
            }

            $orderItem = Capsule::table('tblorders')
                ->where('invoiceid', $invoiceId)
                ->first();

            if ($orderItem && strtolower($orderItem->status) === 'pending') {
                localAPI('AcceptOrder', [
                    'orderid'   => $orderItem->id,
                    'autosetup' => false,
                    'sendemail' => false,
                ]);
                logActivity("InvoicePaid hook: accepted order #{$orderItem->id} for invoice #{$invoiceId}");
            }

            Capsule::table('tblhosting')
                ->where('id', $serviceId)
                ->update(['domainstatus' => 'Active']);

            logActivity("InvoicePaid hook: activated service #{$serviceId} for invoice #{$invoiceId}");

            // Send the hosting welcome email with credentials
            $emailResult = localAPI('SendEmail', [
                'messagename' => 'Hosting Account Welcome Email',
                'id'          => $serviceId,
            ]);

            if ($emailResult['result'] === 'success') {
                logActivity("InvoicePaid hook: sent welcome email for service #{$serviceId}");
            } else {
                logActivity("InvoicePaid hook: welcome email failed for service #{$serviceId}: " . ($emailResult['message'] ?? 'unknown'));
            }
        }
    } catch (\Exception $e) {
        logActivity("InvoicePaid hook error: " . $e->getMessage());
    }
});
