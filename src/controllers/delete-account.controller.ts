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

@Controller('/accounts')
@UseGuards(JwtAuthGuard)
export class DeleteAccountController {
  constructor(private prisma: PrismaService) {}

  @Delete(':id')
  @HttpCode(200)
  async handle(@Param('id') id: string, @Req() req) {
    const user = req.user

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Unauthorized access.')
    }

    const findUserToDelete = await this.prisma.user.findFirst({
      where: {
        id,
      },
    })

    if (!findUserToDelete) {
      throw new NotFoundException('User not found.')
    }

    await this.prisma.user.delete({
      where: {
        id,
      },
    })
  }
}
