export type NavItem = {
  label: string
  to: string
}

export type BillingCycle = 'monthly' | 'annually'

export type HostingPlan = {
  id: number
  name: string
  tagline: string
  description: string
  monthly: number
  yearly: number
  allowed_cycles: BillingCycle[]
  features: string[]
  popular?: boolean
  badge?: string
  whmcs_product_id?: number
  limits: {
    websites: string
    storage: string
    bandwidth: string
    emails: string
    databases: string
    ssl: boolean
    ftp: boolean
    controlPanel: boolean
    backups: string
  }
}

export type VpsPlan = {
  id: number
  name: string
  tagline: string
  cpu: string
  ram: string
  storage: string
  bandwidth: string
  price: number
  popular?: boolean
  badge?: string
  whmcs_product_id?: number
  features: string[]
}

export type DedicatedPlan = {
  id: number
  name: string
  processor: string
  cores: string
  ram: string
  storage: string
  bandwidth: string
  price: number
  popular?: boolean
  badge?: string
  whmcs_product_id?: number
  provider: 'ovh'
  location: string
}

export type TldEntry = {
  tld: string
  price: number
  renew?: number
  popular?: boolean
  category?: string
}

export type HomeFeature = {
  title: string
  description: string
  icon: string
}

export type Metric = {
  label: string
  value: string
  detail: string
}

export type Testimonial = {
  quote: string
  name: string
  role: string
  company?: string
  initials: string
}

/* ------------------------------------------------------------------ */
/*  Navigation                                                           */
/* ------------------------------------------------------------------ */

export const publicNavItems: NavItem[] = [
  { label: 'Hosting', to: '/hosting' },
  { label: 'VPS', to: '/vps' },
  { label: 'Domains', to: '/domains' },
  { label: 'Dedicated', to: '/dedicated' },
]

/* ------------------------------------------------------------------ */
/*  Hero Metrics                                                         */
/* ------------------------------------------------------------------ */

export const heroMetrics: Metric[] = [
  { label: 'Uptime SLA', value: '99.9%', detail: 'Monitored infrastructure' },
  { label: 'Deploy time', value: '< 5m', detail: 'Average VPS provisioning' },
  { label: 'Support', value: '24/7', detail: 'Ticket & client area' },
  { label: 'Datacenters', value: '12+', detail: 'Global locations' },
]

/* ------------------------------------------------------------------ */
/*  Home Features                                                        */
/* ------------------------------------------------------------------ */

export const homeFeatures: HomeFeature[] = [
  {
    title: 'NVMe Performance',
    description: 'All plans ship with NVMe SSD storage. Noticeably faster database queries, app boot times, and file operations.',
    icon: 'bolt',
  },
  {
    title: 'One Dashboard',
    description: 'Hosting, VPS, dedicated, domains, and invoices. One client area. No jumping between separate panels.',
    icon: 'panel',
  },
  {
    title: 'Global Infrastructure',
    description: 'Dedicated servers and high-performance VPS run on enterprise-grade hardware across 12+ global datacenters at transparent prices.',
    icon: 'server',
  },
  {
    title: 'Clean Billing',
    description: 'Predictable monthly and annual billing. No surprise line-items. Automated invoicing with one-click payment.',
    icon: 'billing',
  },
  {
    title: 'Instant SSL',
    description: 'Free Let\'s Encrypt certificates provisioned automatically. Your sites run on HTTPS from day one.',
    icon: 'shield',
  },
  {
    title: 'Scale Freely',
    description: 'Start with shared hosting, upgrade to VPS or dedicated as your project grows. Your cart and billing stays connected.',
    icon: 'scale',
  },
]

/* ------------------------------------------------------------------ */
/*  Shared Hosting Plans                                                 */
/* ------------------------------------------------------------------ */

export const hostingPlans: HostingPlan[] = [
  {
    id: 101,
    name: 'Starter',
    tagline: 'For personal sites and blogs',
    description: 'A clean plan for side projects, portfolios, and small launches.',
    monthly: 2.99,
    yearly: 28.70,
    allowed_cycles: ['annually'],
    whmcs_product_id: 1,
    features: [
      '1 Website',
      '50 GB NVMe SSD',
      '100 GB Bandwidth',
      '10 Email Accounts',
      '5 Databases',
      'Free SSL Certificate',
      'FTP Access',
      'Control Panel Included',
      'Weekly Backups',
    ],
    limits: {
      websites: '1',
      storage: '50 GB NVMe',
      bandwidth: '100 GB',
      emails: '10',
      databases: '5',
      ssl: true,
      ftp: true,
      controlPanel: true,
      backups: 'Weekly',
    },
  },
  {
    id: 102,
    name: 'Business',
    tagline: 'For growing sites and shops',
    description: 'More room for client projects, WooCommerce, and WordPress multisite.',
    monthly: 5.99,
    yearly: 57.50,
    allowed_cycles: ['annually'],
    whmcs_product_id: 2,
    popular: true,
    badge: 'Most Popular',
    features: [
      '10 Websites',
      '150 GB NVMe SSD',
      'Unmetered Bandwidth',
      '50 Email Accounts',
      'Unlimited Databases',
      'Free SSL Certificate',
      'FTP Access',
      'Control Panel Included',
      'Daily Backups',
      'Priority Support',
    ],
    limits: {
      websites: '10',
      storage: '150 GB NVMe',
      bandwidth: 'Unmetered',
      emails: '50',
      databases: 'Unlimited',
      ssl: true,
      ftp: true,
      controlPanel: true,
      backups: 'Daily',
    },
  },
  {
    id: 103,
    name: 'Agency',
    tagline: 'For agencies and high-traffic sites',
    description: 'High capacity for client portfolios, busy stores, and growing teams.',
    monthly: 10.99,
    yearly: 105.50,
    allowed_cycles: ['monthly', 'annually'],
    whmcs_product_id: 3,
    badge: 'Best Value',
    features: [
      'Unlimited Websites',
      '300 GB NVMe SSD',
      'Unmetered Bandwidth',
      'Unlimited Email Accounts',
      'Unlimited Databases',
      'Free SSL Certificate',
      'FTP Access',
      'Control Panel Included',
      'Daily Backups',
      'Dedicated IP Address',
      'Priority Support',
    ],
    limits: {
      websites: 'Unlimited',
      storage: '300 GB NVMe',
      bandwidth: 'Unmetered',
      emails: 'Unlimited',
      databases: 'Unlimited',
      ssl: true,
      ftp: true,
      controlPanel: true,
      backups: 'Daily',
    },
  },
]

/* ------------------------------------------------------------------ */
/*  VPS Plans (Cloud VPS)                                               */
/* ------------------------------------------------------------------ */

export const vpsPlans: VpsPlan[] = [
  {
    id: 1,
    name: 'VPS Essential',
    tagline: 'For dev environments and small apps',
    cpu: '2 vCores',
    ram: '2 GB DDR5',
    storage: '40 GB NVMe SSD',
    bandwidth: '250 Mbps / 500 GB',
    price: 5.99,
    whmcs_product_id: 0,
    features: [
      'Full root access',
      'KVM Virtualisation',
      'IPv4 + IPv6',
      'Instant OS reinstall',
      'DDoS Protection',
    ],
  },
  {
    id: 2,
    name: 'VPS Comfort',
    tagline: 'For production apps and APIs',
    cpu: '4 vCores',
    ram: '4 GB DDR5',
    storage: '80 GB NVMe SSD',
    bandwidth: '500 Mbps / 1 TB',
    price: 11.99,
    popular: true,
    badge: 'Popular',
    whmcs_product_id: 0,
    features: [
      'Full root access',
      'KVM Virtualisation',
      'IPv4 + IPv6',
      'Snapshot & backup',
      'DDoS Protection',
      'Priority network',
    ],
  },
  {
    id: 3,
    name: 'VPS Elite',
    tagline: 'For databases and high-traffic apps',
    cpu: '6 vCores',
    ram: '8 GB DDR5',
    storage: '160 GB NVMe SSD',
    bandwidth: '1 Gbps / 2 TB',
    price: 21.99,
    whmcs_product_id: 0,
    features: [
      'Full root access',
      'KVM Virtualisation',
      'IPv4 + IPv6',
      'Snapshot & backup',
      'DDoS Protection',
      'Anti-DDoS Advanced',
    ],
  },
  {
    id: 4,
    name: 'VPS Max',
    tagline: 'For heavy workloads and large teams',
    cpu: '8 vCores',
    ram: '16 GB DDR5',
    storage: '320 GB NVMe SSD',
    bandwidth: '2 Gbps / 5 TB',
    price: 39.99,
    badge: 'Best Performance',
    whmcs_product_id: 0,
    features: [
      'Full root access',
      'KVM Virtualisation',
      'IPv4 + IPv6',
      'Snapshot & backup',
      'DDoS Protection',
      'Anti-DDoS Advanced',
      'Dedicated bandwidth',
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Dedicated Server Plans (OVH Infrastructure)                         */
/* ------------------------------------------------------------------ */

export const dedicatedPlans: DedicatedPlan[] = [
  {
    id: 201,
    name: 'Rise 1',
    processor: 'Intel Xeon E3-1230 v6',
    cores: '4c / 8t — 3.5 GHz',
    ram: '32 GB DDR4 ECC',
    storage: '2× 2 TB HDD SATA',
    bandwidth: '1 Gbps / unmetered',
    price: 59.99,
    whmcs_product_id: 0,
    provider: 'ovh',
    location: 'Strasbourg, France',
  },
  {
    id: 202,
    name: 'Rise 2',
    processor: 'Intel Xeon E5-1620 v4',
    cores: '4c / 8t — 3.5 GHz',
    ram: '64 GB DDR4 ECC',
    storage: '2× 4 TB HDD SATA',
    bandwidth: '1 Gbps / unmetered',
    price: 94.99,
    popular: true,
    badge: 'Most Popular',
    whmcs_product_id: 0,
    provider: 'ovh',
    location: 'Gravelines, France',
  },
  {
    id: 203,
    name: 'Advance 1',
    processor: 'Intel Xeon E5-2620 v3',
    cores: '6c / 12t — 2.4 GHz',
    ram: '128 GB DDR4 ECC',
    storage: '2× 4 TB SSD NVMe',
    bandwidth: '1 Gbps / unmetered',
    price: 149.99,
    badge: 'High Storage',
    whmcs_product_id: 0,
    provider: 'ovh',
    location: 'Beauharnois, Canada',
  },
  {
    id: 204,
    name: 'Advance 2',
    processor: 'AMD EPYC 7272',
    cores: '12c / 24t — 2.9 GHz',
    ram: '128 GB DDR4 ECC',
    storage: '2× 960 GB SSD NVMe',
    bandwidth: '2 Gbps / unmetered',
    price: 249.99,
    badge: 'Max Power',
    whmcs_product_id: 0,
    provider: 'ovh',
    location: 'Roubaix, France',
  },
]

/* ------------------------------------------------------------------ */
/*  Domain TLD Pricing                                                   */
/* ------------------------------------------------------------------ */

export const domainTlds: TldEntry[] = [
  { tld: '.com', price: 9.99, renew: 11.99, popular: true, category: 'classic' },
  { tld: '.net', price: 10.99, renew: 12.99, popular: true, category: 'classic' },
  { tld: '.org', price: 8.99, renew: 10.99, popular: true, category: 'classic' },
  { tld: '.io', price: 34.99, renew: 39.99, popular: true, category: 'tech' },
  { tld: '.dev', price: 14.99, renew: 16.99, popular: true, category: 'tech' },
  { tld: '.app', price: 13.99, renew: 15.99, category: 'tech' },
  { tld: '.tech', price: 8.99, renew: 39.99, category: 'tech' },
  { tld: '.co', price: 19.99, renew: 22.99, category: 'business' },
  { tld: '.store', price: 4.99, renew: 29.99, category: 'business' },
  { tld: '.shop', price: 3.99, renew: 24.99, category: 'business' },
  { tld: '.online', price: 3.99, renew: 24.99, category: 'business' },
  { tld: '.site', price: 3.99, renew: 24.99, category: 'business' },
  { tld: '.info', price: 4.99, renew: 11.99, category: 'info' },
  { tld: '.me', price: 7.99, renew: 16.99, category: 'personal' },
  { tld: '.blog', price: 5.99, renew: 19.99, category: 'personal' },
  { tld: '.cloud', price: 7.99, renew: 19.99, category: 'tech' },
]

/* ------------------------------------------------------------------ */
/*  Testimonials                                                         */
/* ------------------------------------------------------------------ */

export const testimonials: Testimonial[] = [
  {
    quote: 'The ordering flow is clean and fast. From domain search to checkout took me under five minutes. The dashboard keeps billing and servers in one place.',
    name: 'Sara Khalil',
    role: 'Founder',
    company: 'DevStudio',
    initials: 'SK',
  },
  {
    quote: 'Enterprise-grade dedicated servers with a modern client area. The VPS configurator shows exactly what you are getting before you commit.',
    name: 'Ahmed Raza',
    role: 'Senior DevOps',
    company: 'CloudScale',
    initials: 'AR',
  },
  {
    quote: 'Switched from a crowded server. Bilinix\'s hosting plans are transparent and the free SSL was provisioned automatically. Very smooth.',
    name: 'Lena Brandt',
    role: 'Operations Lead',
    company: 'Brandhaus',
    initials: 'LB',
  },
]

/* ------------------------------------------------------------------ */
/*  FAQ                                                                  */
/* ------------------------------------------------------------------ */

export const faqs = [
  {
    question: 'Can I order hosting, VPS, and a domain in one cart?',
    answer: 'Yes. You can add shared hosting, cloud VPS, and domain registrations to the same cart before checkout. One order, one invoice.',
  },
  {
    question: 'What powers the dedicated servers?',
    answer: 'Dedicated servers are provisioned on enterprise bare-metal hardware. Full hardware access, enterprise-grade DDR4 ECC RAM, and unmetered bandwidth on most plans.',
  },
  {
    question: 'Can I manage my billing from the client area?',
    answer: 'Yes. The dashboard shows services, domain expiry dates, invoices, and includes an SSO link to the payment page. Everything in one view.',
  },
  {
    question: 'What OS images are available for VPS?',
    answer: 'Ubuntu 22.04 LTS, Ubuntu 24.04 LTS, Debian 12, AlmaLinux 9, Rocky Linux 9, and Windows Server 2022 (additional fee). More images available on request.',
  },
  {
    question: 'What is the migration policy?',
    answer: 'Free migration assistance is available on Business hosting and VPS Comfort plans and above. Contact support after ordering to schedule it.',
  },
]
