import { Controller, Body, ForbiddenException, Get } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Controller('/recipient/items')
export class ListRecipientItemsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(
    @Body('email') email: string,
    @Body('documentId') documentId: string,
  ) {
    const recipient = await this.prisma.recipient.findUnique({
      where: { email },
    })

    if (!recipient) {
      throw new ForbiddenException('Recipient not found')
    }

    if (recipient.document_id !== documentId) {
      throw new ForbiddenException('Invalid credentials')
    }

    const recipientDeliveries = await this.prisma.delivery.findMany({
      where: { recipientId: recipient.id },
    })

    return { recipientDeliveries }
  }
}
