import nodemailer from 'nodemailer'

export async function sendWelcomeEmail(opts: {
  to: string
  username: string
  password: string
  packageName: string
}): Promise<true> {
  const runtime = useRuntimeConfig()

  const host = String(runtime.smtpHost ?? '')
  const port = Number(runtime.smtpPort ?? 587)
  const user = String(runtime.smtpUser ?? '')
  const pass = String(runtime.smtpPass ?? '')
  const from = String(runtime.smtpFrom ?? '')

  if (!host || !user || !pass || !from) {
    throw new Error(
      'SMTP is not fully configured — set smtpHost, smtpUser, smtpPass, smtpFrom in environment',
    )
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  const body = [
    'Hello,',
    '',
    'Your hosting account has been created successfully.',
    '',
    `Username: ${opts.username}`,
    `Password: ${opts.password}`,
    '',
    'Control Panel:',
    'https://server1.bilinix.com:8083',
    '',
    'Package:',
    opts.packageName,
    '',
    'FTP Host:',
    'server1.bilinix.com',
    '',
    'Webmail:',
    'https://server1.bilinix.com/webmail',
    '',
    'Thank you for choosing Bilinix Hosting.',
  ].join('\n')

  const info = await transporter.sendMail({
    from,
    to: opts.to,
    subject: 'Welcome to Bilinix Hosting',
    text: body,
  })

  if (!info.messageId) {
    throw new Error('Email transport returned no messageId — delivery unconfirmed')
  }

  return true
}
