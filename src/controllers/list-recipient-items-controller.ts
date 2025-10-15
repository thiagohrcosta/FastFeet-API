import {
  Controller,
  Body,
  ForbiddenException,
  Post,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

@Controller('/recipient/items')
export class ListRecipientItemsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @Body('email') email: string,
    @Body('documentId') documentId: string,
  ) {
    if (!email || !documentId) {
      throw new BadRequestException(
        'Missing email or documentId in request body',
      )
    }

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

    return {
      recipient: {
        id: recipient.id,
        name: recipient.name,
        email: recipient.email,
        document_id: recipient.document_id,
      },
      deliveries: recipientDeliveries,
    }
  }
}
