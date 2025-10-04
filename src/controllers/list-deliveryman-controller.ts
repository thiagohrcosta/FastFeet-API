import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { PrismaService } from '@/prisma/prisma.service'

@Controller('/deliverymen')
@UseGuards(JwtAuthGuard)
export class ListDeliveryMenController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async handle() {
    const fetchDeliveryMen = await this.prisma.user.findMany({
      where: {
        role: 'DELIVERYMAN'
      },
      select: {
        id: true,
        name: true,
      }
    })

    return {
      fetchDeliveryMen,
    }
  }
}
