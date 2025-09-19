import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { PrismaService } from '@/prisma/prisma.service'
import { Delivery, Recipient, User } from '@prisma/client'

@Controller('/deliveries')
@UseGuards(JwtAuthGuard)
export class GetDeliveryController {
  constructor(private prisma: PrismaService) {}

  @Get(':id')
  @HttpCode(200)
  async handle(@Param('id') id: string, @Req() req) {
    const user = req.user

    if (user.role !== 'ADMIN' && user.role !== 'DELIVERYMAN') {
      throw new ForbiddenException('Unauthorized access.')
    }

    const fetchDelivery: Delivery | null =
      await this.prisma.delivery.findUnique({
        where: { id },
      })

    if (!fetchDelivery) {
      throw new NotFoundException('Delivery not found.')
    }

    const fetchRecipientInformation: Recipient | null =
      await this.prisma.recipient.findUnique({
        where: { id: fetchDelivery.recipientId },
      })

    let fetchDeliveryManInformation: User | null = null
    if (fetchDelivery.deliverymanId) {
      fetchDeliveryManInformation = await this.prisma.user.findUnique({
        where: { id: fetchDelivery.deliverymanId },
      })
    }

    return {
      delivery: fetchDelivery,
      recipient: fetchRecipientInformation,
      deliveryman: fetchDeliveryManInformation
        ? {
            id: fetchDeliveryManInformation.id,
            name: fetchDeliveryManInformation.name,
          }
        : null,
    }
  }
}
