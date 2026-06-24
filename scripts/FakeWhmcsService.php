<?php

namespace App\Integrations;

use Illuminate\Support\Facades\Cache;

/**
 * Local-development stub for WhmcsService.
 *
 * Active when WHMCS_DRIVER=fake (or ENABLE_DEV_MOCKS=true / no WHMCS_API_URL).
 * Invoices and orders are stored per-client in Redis cache.
 * IDs start at 10001 to avoid collision with any legacy hardcoded IDs.
 */
class FakeWhmcsService extends WhmcsService
{
    // ── Auth ──────────────────────────────────────────────────────────────────

    public function validateLogin(string $email, string $password): array
    {
        return ['result' => 'success', 'userid' => 1, 'passwordhash' => password_hash($password, PASSWORD_BCRYPT)];
    }

    public function createClient(array $data): array
    {
        return ['result' => 'success', 'clientid' => 1];
    }

    public function getClientDetails(int $clientId): array
    {
        return [
            'result' => 'success',
            'client' => [
                'id'             => $clientId,
                'firstname'      => 'Test',
                'lastname'       => 'User',
                'email'          => "client{$clientId}@test.com",
                'phonenumber'    => '+1-555-0100',
                'address1'       => '123 Hosting Street',
                'city'           => 'Cloud City',
                'state'          => 'CA',
                'postcode'       => '90210',
                'countrycode'    => 'US',
                'currency'       => 1,
                'currencyprefix' => '$',
                'currencysuffix' => ' USD',
            ],
        ];
    }

    public function resetPassword(string $email): void {}

    public function updateClientDetails(int $clientId, array $data): array
    {
        return array_merge($this->getClientDetails($clientId), $data);
    }

    public function updateClientPassword(int $clientId, string $newPassword): void {}

    // ── VPS / Servers ─────────────────────────────────────────────────────────

    public function listServers(int $clientId): array
    {
        return [$this->serverRecord(1001, $clientId), $this->serverRecord(1002, $clientId)];
    }

    public function getServer(int $serviceId): array
    {
        return $this->serverRecord($serviceId, 1);
    }

    public function createServer(int $clientId, array $data): array
    {
        return $this->serverRecord(1099, $clientId);
    }

    public function startServer(int $serviceId): void {}

    public function stopServer(int $serviceId): void {}

    public function rebootServer(int $serviceId): void {}

    public function destroyServer(int $serviceId): void {}

    // ── Domains ───────────────────────────────────────────────────────────────

    public function listDomains(int $clientId): array
    {
        return [$this->domainRecord(1, $clientId), $this->domainRecord(2, $clientId)];
    }

    public function getDomain(int $domainId): array
    {
        return $this->domainRecord($domainId, 1);
    }

    public function updateDomain(int $domainId, array $data): array
    {
        return $this->domainRecord($domainId, 1);
    }

    public function renewDomain(int $domainId, int $years = 1): array
    {
        return $this->domainRecord($domainId, 1);
    }

    public function setAutoRenew(int $domainId, bool $enabled): array
    {
        return array_merge($this->domainRecord($domainId, 1), ['autorenew' => $enabled ? '1' : '0']);
    }

    public function lockDomain(int $domainId): array
    {
        return array_merge($this->domainRecord($domainId, 1), ['locked' => '1']);
    }

    public function unlockDomain(int $domainId): array
    {
        return array_merge($this->domainRecord($domainId, 1), ['locked' => '0']);
    }

    public function updateNameservers(int $domainId, array $nameservers): array
    {
        $record = $this->domainRecord($domainId, 1);
        foreach (array_values($nameservers) as $i => $ns) {
            $record['nameserver' . ($i + 1)] = $ns;
        }
        return $record;
    }

    public function searchDomain(string $sld, array $tlds = []): array
    {
        if (empty($tlds)) {
            $tlds = ['.com', '.net', '.org', '.io'];
        }

        $pricing  = $this->getDomainPricing();
        $sldLower = strtolower($sld);
        $takenSlds = ['google', 'facebook', 'amazon', 'apple', 'microsoft', 'taken', 'unavailable'];

        return array_map(function (string $tld) use ($sldLower, $pricing, $takenSlds) {
            $taken     = in_array($sldLower, $takenSlds, true);
            $available = ! $taken;
            $price     = $available ? ($pricing[$tld]['register']['1'] ?? '12.99') : null;

            return [
                'domain'    => $sldLower . $tld,
                'tld'       => $tld,
                'available' => $available,
                'price'     => $price,
            ];
        }, $tlds);
    }

    // ── Products ─────────────────────────────────────────────────────────────

    public function getProducts(int $gid = null): array
    {
        return [
            $this->sharedHostingProduct(1, 'Shared Hosting Starter',  '4.99',  '49.99'),
            $this->sharedHostingProduct(2, 'Shared Hosting Business',  '9.99',  '99.99'),
            $this->vpsProduct(3,  'VPS 2GB',          '9.99',  '99.99',  true),
            $this->vpsProduct(4,  'VPS 4GB',          '19.99', '199.99', false),
            $this->dedicatedProduct(5, 'Dedicated Server', '79.99', '799.99'),
            $this->sslProduct(6,  'SSL Certificate',   '9.99'),
        ];
    }

    public function getProduct(int $productId): array
    {
        return $this->getProducts()[$productId - 1] ?? $this->vpsProduct($productId, "Product {$productId}", '9.99', '99.99', false);
    }

    public function getDomainPricing(): array
    {
        return [
            '.com' => [
                'register' => ['1' => '12.99', '2' => '25.98'],
                'renew'    => ['1' => '14.99', '2' => '29.98'],
                'transfer' => ['1' => '12.99'],
            ],
            '.net' => [
                'register' => ['1' => '13.99', '2' => '27.98'],
                'renew'    => ['1' => '15.99', '2' => '31.98'],
                'transfer' => ['1' => '13.99'],
            ],
            '.org' => [
                'register' => ['1' => '11.99', '2' => '23.98'],
                'renew'    => ['1' => '13.99', '2' => '27.98'],
                'transfer' => ['1' => '11.99'],
            ],
            '.io' => [
                'register' => ['1' => '39.99', '2' => '79.98'],
                'renew'    => ['1' => '44.99', '2' => '89.98'],
                'transfer' => ['1' => '39.99'],
            ],
            '.test' => [
                'register' => ['1' => '0.99'],
                'renew'    => ['1' => '0.99'],
                'transfer' => ['1' => '0.99'],
            ],
        ];
    }

    // ── Billing (cache-backed, per-client) ────────────────────────────────────

    public function listInvoices(int $clientId): array
    {
        $ids = Cache::get($this->clientInvoicesKey($clientId), []);
        return array_values(array_filter(array_map(
            fn($id) => Cache::get($this->invoiceKey($id)),
            $ids
        )));
    }

    public function getInvoice(int $invoiceId): array
    {
        $invoice = Cache::get($this->invoiceKey($invoiceId));
        if (! $invoice) {
            abort(404, "Invoice #{$invoiceId} not found.");
        }

        // Preserve existing paid-status cache behavior
        if (Cache::get("fake_whmcs_paid_{$invoiceId}", false) && $invoice['status'] !== 'Paid') {
            $invoice['status']   = 'Paid';
            $invoice['datepaid'] = now()->format('Y-m-d');
        }

        return $invoice;
    }

    public function getPaymentUrl(int $clientId, int $invoiceId): string
    {
        return 'https://whmcs.example.com/viewinvoice.php?id=' . $invoiceId . '&token=fake-sso-token';
    }

    public function payInvoice(int $invoiceId, string $gateway, float $amount): void
    {
        Cache::put("fake_whmcs_paid_{$invoiceId}", true, now()->addDays(7));

        $invoice = Cache::get($this->invoiceKey($invoiceId));
        if ($invoice) {
            $invoice['status']   = 'Paid';
            $invoice['datepaid'] = now()->format('Y-m-d');
            Cache::forever($this->invoiceKey($invoiceId), $invoice);
        }
    }

    public function getDashboardSummary(int $clientId): array
    {
        $invoices = $this->listInvoices($clientId);
        $paid     = count(array_filter($invoices, fn($i) => $i['status'] === 'Paid'));
        $unpaid   = count(array_filter($invoices, fn($i) => $i['status'] === 'Unpaid'));
        $overdue  = count(array_filter($invoices, fn($i) =>
            $i['status'] === 'Unpaid' && isset($i['duedate']) && $i['duedate'] < now()->format('Y-m-d')
        ));

        return [
            'servers'  => ['total' => 2, 'running' => 2, 'provisioning' => 0],
            'domains'  => ['total' => 2, 'active' => 2, 'expired' => 0],
            'invoices' => ['total' => count($invoices), 'paid' => $paid, 'unpaid' => $unpaid, 'overdue' => $overdue],
        ];
    }

    // ── Tickets ───────────────────────────────────────────────────────────────

    public function listTickets(int $clientId): array
    {
        return [
            $this->ticketListRecord(3001, 'Open'),
            $this->ticketListRecord(3002, 'Answered'),
            $this->ticketListRecord(3003, 'Closed'),
        ];
    }

    public function getTicket(int $ticketId): array
    {
        return $this->ticketDetailRecord($ticketId);
    }

    public function createTicket(int $clientId, array $data): array
    {
        return ['result' => 'success', 'id' => 3099, 'tid' => 'TKT-' . mt_rand(1000, 9999)];
    }

    public function replyToTicket(int $ticketId, int $clientId, string $message): array
    {
        return $this->ticketDetailRecord($ticketId);
    }

    public function closeTicket(int $ticketId): void {}

    // ── Orders (cache-backed, per-client) ─────────────────────────────────────

    public function createOrder(int $clientId, array $data): array
    {
        $invoiceId = $this->nextInvoiceId();
        $orderId   = $this->nextOrderId();
        $now       = now()->format('Y-m-d H:i:s');
        $today     = now()->format('Y-m-d');
        $due       = now()->addDays(14)->format('Y-m-d');

        $pids   = array_values((array) ($data['pid'] ?? [3]));
        $cycles = array_values((array) ($data['billingcycle'] ?? ['monthly']));
        $amount = $this->calculateAmount($pids, $cycles);
        $total  = number_format($amount, 2, '.', '');

        $lineItems = [];
        foreach ($pids as $i => $pid) {
            $cycle = $cycles[$i] ?? 'monthly';
            $lineItems[] = [
                'id'          => (int) $pid,
                'description' => $this->productName((int) $pid) . ' - ' . ucfirst($cycle),
                'amount'      => number_format($this->productPrice((int) $pid, $cycle), 2, '.', ''),
            ];
        }

        $invoice = [
            'result'     => 'success',
            'invoiceid'  => $invoiceId,
            'id'         => $invoiceId,
            'userid'     => $clientId,
            'invoicenum' => 'INV-' . str_pad($invoiceId, 5, '0', STR_PAD_LEFT),
            'status'     => 'Unpaid',
            'date'       => $today,
            'duedate'    => $due,
            'datepaid'   => '0000-00-00',
            'subtotal'   => $total,
            'tax'        => '0.00',
            'total'      => $total,
            'notes'      => '',
            'items'      => ['item' => $lineItems],
        ];

        $order = [
            'result'     => 'success',
            'id'         => $orderId,
            'orderid'    => $orderId,
            'userid'     => $clientId,
            'date'       => $now,
            'status'     => 'Active',
            'amount'     => $total,
            'invoiceid'  => $invoiceId,
            'lineitems'  => [
                'lineitem' => array_map(fn($li) => [
                    'product'      => $li['description'],
                    'domain'       => '',
                    'billingcycle' => ucfirst($cycles[0] ?? 'monthly'),
                    'amount'       => $li['amount'],
                    'type'         => 'Hosting',
                ], $lineItems),
            ],
        ];

        Cache::forever($this->invoiceKey($invoiceId), $invoice);
        Cache::forever($this->orderKey($orderId), $order);

        $clientInvoices   = Cache::get($this->clientInvoicesKey($clientId), []);
        $clientInvoices[] = $invoiceId;
        Cache::forever($this->clientInvoicesKey($clientId), $clientInvoices);

        $clientOrders   = Cache::get($this->clientOrdersKey($clientId), []);
        $clientOrders[] = $orderId;
        Cache::forever($this->clientOrdersKey($clientId), $clientOrders);

        return [
            'result'     => 'success',
            'orderid'    => $orderId,
            'invoiceid'  => $invoiceId,
            'amount'     => $total,
            'date'       => $now,
            'status'     => 'Active',
            'productids' => implode(',', $pids),
        ];
    }

    public function getOrders(int $clientId): array
    {
        $ids = Cache::get($this->clientOrdersKey($clientId), []);
        return array_values(array_filter(array_map(
            fn($id) => Cache::get($this->orderKey($id)),
            $ids
        )));
    }

    public function getOrder(int $orderId): array
    {
        $order = Cache::get($this->orderKey($orderId));
        if (! $order) {
            abort(404, "Order #{$orderId} not found.");
        }
        return $order;
    }

    // ── Admin scope ───────────────────────────────────────────────────────────

    public function adminListAllOrders(int $limit = 200): array
    {
        return [];
    }

    public function adminDashboardStats(): array
    {
        return [
            'active_vps'      => 2,
            'active_domains'  => 2,
            'open_tickets'    => 1,
            'unpaid_invoices' => 0,
            'monthly_revenue' => 0,
        ];
    }

    // ── Cache key helpers ─────────────────────────────────────────────────────

    private function clientInvoicesKey(int $clientId): string
    {
        return "fake_whmcs:client:{$clientId}:invoices";
    }

    private function clientOrdersKey(int $clientId): string
    {
        return "fake_whmcs:client:{$clientId}:orders";
    }

    private function invoiceKey(int $invoiceId): string
    {
        return "fake_whmcs:invoice:{$invoiceId}";
    }

    private function orderKey(int $orderId): string
    {
        return "fake_whmcs:order:{$orderId}";
    }

    private function nextInvoiceId(): int
    {
        if (! Cache::has('fake_whmcs:invoice_seq')) {
            Cache::forever('fake_whmcs:invoice_seq', 10000);
        }
        return (int) Cache::increment('fake_whmcs:invoice_seq');
    }

    private function nextOrderId(): int
    {
        if (! Cache::has('fake_whmcs:order_seq')) {
            Cache::forever('fake_whmcs:order_seq', 20000);
        }
        return (int) Cache::increment('fake_whmcs:order_seq');
    }

    // ── Product price helpers ─────────────────────────────────────────────────

    private function productPrice(int $pid, string $cycle = 'monthly'): float
    {
        $product = collect($this->getProducts())->firstWhere('pid', $pid);
        if (! $product) {
            return 9.99;
        }
        $price = $product['pricing']['USD'][$cycle] ?? $product['pricing']['USD']['monthly'] ?? '9.99';
        $f = (float) $price;
        return $f > 0 ? $f : 9.99;
    }

    private function productName(int $pid): string
    {
        $product = collect($this->getProducts())->firstWhere('pid', $pid);
        return $product['name'] ?? "Product #{$pid}";
    }

    private function calculateAmount(array $pids, array $cycles): float
    {
        $total = 0.0;
        foreach ($pids as $i => $pid) {
            $total += $this->productPrice((int) $pid, $cycles[$i] ?? 'monthly');
        }
        return $total > 0 ? $total : 9.99;
    }

    // ── Static record builders ────────────────────────────────────────────────

    private function serverRecord(int $id, int $clientId = 1): array
    {
        $plans = [
            1001 => ['label' => 'vps-2gb.beeliin.test', 'cpu' => '1', 'ram' => '2048',  'disk' => '50',  'ip' => '10.0.0.1'],
            1002 => ['label' => 'vps-4gb.beeliin.test', 'cpu' => '2', 'ram' => '4096',  'disk' => '100', 'ip' => '10.0.0.2'],
            1099 => ['label' => 'vps-new.beeliin.test', 'cpu' => '1', 'ram' => '2048',  'disk' => '50',  'ip' => '10.0.0.99'],
        ];
        $p = $plans[$id] ?? [
            'label' => "vps-{$id}.beeliin.test",
            'cpu'   => '1',
            'ram'   => '2048',
            'disk'  => '50',
            'ip'    => '10.0.0.' . ($id % 256),
        ];

        return [
            'id'            => $id,
            'serviceid'     => $id,
            'domain'        => $p['label'],
            'status'        => 'Active',
            'clientid'      => $clientId,
            'configoption1' => $p['cpu'],
            'configoption2' => $p['ram'],
            'configoption3' => $p['disk'],
            'dedicatedip'   => $p['ip'],
            'nextduedate'   => '2026-12-18',
            'regdate'       => '2026-06-18',
        ];
    }

    private function domainRecord(int $id, int $clientId = 1): array
    {
        $names = [1 => 'beeliin.test', 2 => 'example.com'];

        return [
            'id'               => $id,
            'domainname'       => $names[$id] ?? "domain{$id}.com",
            'status'           => 'Active',
            'expirydate'       => '2027-06-18',
            'autorenew'        => '1',
            'locked'           => '0',
            'idprotection'     => '0',
            'nameserver1'      => 'ns1.beeliin.com',
            'nameserver2'      => 'ns2.beeliin.com',
            'nameserver3'      => '',
            'nameserver4'      => '',
            'nameserver5'      => '',
            'registrationdate' => '2026-06-18',
            'userid'           => $clientId,
            'firstname'        => 'Test',
            'lastname'         => 'User',
            'email'            => "client{$clientId}@test.com",
            'countrycode'      => 'US',
        ];
    }

    private function ticketListRecord(int $id, string $status = 'Open'): array
    {
        $subjects = [
            3001 => 'Cannot connect to VPS via SSH',
            3002 => 'Invoice total seems incorrect',
            3003 => 'How do I set up email hosting?',
        ];
        $depts = [3001 => 'Technical', 3002 => 'Billing', 3003 => 'General'];

        return [
            'id'        => $id,
            'ticketid'  => $id,
            'tid'       => 'TKT-' . $id,
            'subject'   => $subjects[$id] ?? "Support Ticket #{$id}",
            'deptname'  => $depts[$id] ?? 'General',
            'status'    => $status,
            'priority'  => 'Medium',
            'date'      => '2026-06-18 10:00:00',
            'lastreply' => '2026-06-18 11:00:00',
            'userid'    => 1,
        ];
    }

    private function ticketDetailRecord(int $ticketId): array
    {
        $list = $this->ticketListRecord($ticketId);

        return array_merge($list, [
            'result'  => 'success',
            'message' => 'Hello, I have a question about my account.',
            'replies' => [
                'reply' => [
                    [
                        'id'      => 1,
                        'message' => 'Thank you for contacting us. We are looking into this.',
                        'name'    => 'Support Agent',
                        'date'    => '2026-06-18 11:00:00',
                    ],
                ],
            ],
        ]);
    }

    private function sharedHostingProduct(int $pid, string $name, string $monthly, string $annually): array
    {
        return [
            'pid'          => $pid,
            'name'         => $name,
            'description'  => 'Reliable shared hosting with cPanel, free SSL, and 24/7 support.',
            'type'         => 'hostingaccount',
            'module'       => 'cpanel',
            'gid'          => 1,
            'stockcontrol' => 0,
            'stocklevel'   => 0,
            'customfields' => [],
            'pricing'      => [
                'USD' => [
                    'monthly'      => $monthly,
                    'quarterly'    => '-1.00',
                    'semiannually' => '-1.00',
                    'annually'     => $annually,
                    'biennially'   => '-1.00',
                    'triennially'  => '-1.00',
                ],
            ],
        ];
    }

    private function vpsProduct(int $pid, string $name, string $monthly, string $annually, bool $featured): array
    {
        return [
            'pid'          => $pid,
            'name'         => $name,
            'description'  => 'Cloud VPS with full root access, dedicated resources, and SSD storage.',
            'type'         => 'server',
            'module'       => 'virtfusion',
            'gid'          => 2,
            'stockcontrol' => 0,
            'stocklevel'   => 0,
            'customfields' => $featured
                ? ['customfield' => [['name' => 'featured', 'value' => 'yes']]]
                : [],
            'pricing' => [
                'USD' => [
                    'monthly'      => $monthly,
                    'quarterly'    => '-1.00',
                    'semiannually' => '-1.00',
                    'annually'     => $annually,
                    'biennially'   => '-1.00',
                    'triennially'  => '-1.00',
                ],
            ],
        ];
    }

    private function dedicatedProduct(int $pid, string $name, string $monthly, string $annually): array
    {
        return [
            'pid'          => $pid,
            'name'         => $name,
            'description'  => 'Bare-metal dedicated server with full hardware isolation.',
            'type'         => 'server',
            'module'       => 'dedicatedserver',
            'gid'          => 3,
            'stockcontrol' => 0,
            'stocklevel'   => 0,
            'customfields' => [],
            'pricing'      => [
                'USD' => [
                    'monthly'      => $monthly,
                    'quarterly'    => '-1.00',
                    'semiannually' => '-1.00',
                    'annually'     => $annually,
                    'biennially'   => '-1.00',
                    'triennially'  => '-1.00',
                ],
            ],
        ];
    }

    private function sslProduct(int $pid, string $name, string $annually): array
    {
        return [
            'pid'          => $pid,
            'name'         => $name,
            'description'  => 'Domain Validated SSL certificate. Issued in minutes.',
            'type'         => 'other',
            'module'       => 'sectigo',
            'gid'          => 4,
            'stockcontrol' => 0,
            'stocklevel'   => 0,
            'customfields' => [],
            'pricing'      => [
                'USD' => [
                    'monthly'      => '-1.00',
                    'quarterly'    => '-1.00',
                    'semiannually' => '-1.00',
                    'annually'     => $annually,
                    'biennially'   => '-1.00',
                    'triennially'  => '-1.00',
                ],
            ],
        ];
    }
}
