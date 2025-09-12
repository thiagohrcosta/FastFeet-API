import { Controller, ForbiddenException, Get, HttpCode, Param, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { PrismaService } from "src/prisma/prisma.service";

@Controller('/deliveries')
@UseGuards(JwtAuthGuard)
export class GetDeliveryController {
  constructor(private prisma: PrismaService) {}

  @Get(":id")
  @HttpCode(200)
  async handle(
    @Param('id') id: string,
    @Req() req
  ) {
    const user = req.user

    if (user.role !== 'ADMIN' && user.role !== 'DELIVERYMAN') {
      throw new ForbiddenException('Unauthorized access.')
    }

    const fetchDelivery = await this.prisma.delivery.findFirst({
      where: {
        id
      }
    })

    const fetchRecipientInformation = await this.prisma.recipient.findFirst({
      where: {
        id: fetchDelivery?.recipientId
      }
    })

    return {
      fetchDelivery,
      informations: {
        fetchRecipientInformation
      }
    }


  }

}