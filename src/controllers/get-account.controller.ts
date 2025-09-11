import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { PrismaService } from 'src/prisma/prisma.service'

@Controller('/accounts')
@UseGuards(JwtAuthGuard)
export class GetAccountController {
  constructor(private prisma: PrismaService) {}

  @Get(':identifier')
  @HttpCode(200)
  async handle(@Param('identifier') identifier: string, @Req() req) {
    const user = req.user

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Unauthorized access.')
    }

    const account = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: identifier }, { document_id: identifier }],
      },
      select: {
        id: true,
        name: true,
        document_id: true,
        role: true,
      },
    })

    if (!account) {
      throw new NotFoundException('Account not found.')
    }

    return account
  }
}
