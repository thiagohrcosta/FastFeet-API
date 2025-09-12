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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { PrismaService } from 'src/prisma/prisma.service'

@Controller('/recipients')
@UseGuards(JwtAuthGuard)
export class DeleteRecipientController {
  constructor(private prisma: PrismaService) {}

  @Delete(':id')
  @HttpCode(200)
  async handle(@Param('id') id: string, @Req() req) {
    const user = req.user

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Unauthorized access.')
    }

    const findRecipientToDelete = await this.prisma.recipient.findFirst({
      where: {
        id,
      },
    })

    if (!findRecipientToDelete) {
      throw new NotFoundException('Recipient not found')
    }

    await this.prisma.recipient.delete({
      where: {
        id,
      },
    })
  }
}
