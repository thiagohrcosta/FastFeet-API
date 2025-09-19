import {
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { PrismaService } from '@/prisma/prisma.service'

@Controller('/deliveries')
@UseGuards(JwtAuthGuard)
export class DeleteDeliveryController {
  constructor(private prisma: PrismaService) {}

  @Delete(':id')
  @HttpCode(200)
  async handle(@Param('id') id: string, @Req() req) {
    const user = req.user

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Unauthorized access.')
    }

    const findDeliveryToDelete = await this.prisma.delivery.findFirst({
      where: {
        id,
      },
    })

    if (!findDeliveryToDelete) {
      throw new NotFoundException('Delivery not found')
    }

    await this.prisma.delivery.delete({
      where: {
        id,
      },
    })
  }
}
