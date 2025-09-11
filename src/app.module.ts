import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { PrismaService } from './prisma/prisma.service'
import { CreateAccountController } from './controllers/create-account-controller'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env'
import { AuthModule } from './auth/auth.module'
import { CreateRecipientController } from './controllers/create-recipient-controller'
import { ListAccountsController } from './controllers/list-account-controller'
import { ListRecipientController } from './controllers/list-recipient-controller'
import { GetAccountController } from './controllers/get-account.controller'
import { UpdateAccountController } from './controllers/update-account-controller'
import { DeleteAccountController } from './controllers/delete-account.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
      envFilePath: '.env',
    }),
    AuthModule,
  ],
  controllers: [
    GetAccountController,
    ListAccountsController,
    CreateAccountController,
    UpdateAccountController,
    DeleteAccountController,
    ListRecipientController,
    CreateRecipientController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
