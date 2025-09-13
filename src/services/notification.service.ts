import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)
  private transporter: nodemailer.Transporter

  constructor() {
    this.setupTransporter()
  }

  private async setupTransporter() {
    const testAccount = await nodemailer.createTestAccount()

    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })

    this.logger.log(`Ethereal test account: ${testAccount.user}`)
  }

  async notifyRecipient(
    recipientEmail: string,
    product: string,
    status: string,
  ) {
    const info = await this.transporter.sendMail({
      from: '"FastFeet" <no-reply@fastfeet.com>',
      to: recipientEmail,
      subject: 'Update on your delivery',
      text: `Hello! Your order (${product}) has been updated. Current status: ${status}.`,
    })

    this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
    return info
  }
}
