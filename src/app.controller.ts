import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import { PrsimaService } from './prisma/prisma.service'

@Controller('/api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private prisma: PrsimaService
  ) {}

  @Get('/hello')
  index(): string {
    return this.appService.getHello()
  }
}
