import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { PrismaService } from '@/prisma/prisma.service'

@Controller('/deliveries/items')
@UseGuards(JwtAuthGuard)
export class ListDeliveryManItemsController {
  constructor(private prisma: PrismaService) {}

  @Get(':id')
  @HttpCode(200)
  async handle(@Param('id') id: string, @Req() req) {
    const user = req.user

    if (user.role !== 'ADMIN' && user.role !== 'DELIVERYMAN') {
      throw new ForbiddenException('Access denied')
    }

    const listDeliverys = await this.prisma.delivery.findMany({
      where: {
        deliverymanId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { listDeliverys }
  }
}
