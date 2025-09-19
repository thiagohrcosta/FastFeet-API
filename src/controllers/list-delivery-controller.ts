import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { PrismaService } from '@/prisma/prisma.service'

@Controller('/deliveries')
@UseGuards(JwtAuthGuard)
export class ListDeliveryController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async handle() {
    const fetchDeliveries = await this.prisma.delivery.findMany({
      select: {
        id: true,
        product: true,
        photoUrl: true,
        recipientId: true,
        deliverymanId: true,
        createdAt: true,
      },
    })

    return {
      fetchDeliveries,
    }
  }
}
