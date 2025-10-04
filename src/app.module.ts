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
import { GetRecipientController } from './controllers/get-recipient-controller'
import { UpdateRecipientController } from './controllers/update-recipient-controller'
import { DeleteRecipientController } from './controllers/delete-recipient-controller'
import { CreateDeliveryController } from './controllers/create-delivery-controller'
import { ListDeliveryController } from './controllers/list-delivery-controller'
import { GetDeliveryController } from './controllers/get-delivery-controller'
import { UpdateDeliveryController } from './controllers/update-delivery-controller'
import { DeleteDeliveryController } from './controllers/delete-delivery-controller'
import { ListDeliveryManItemsController } from './controllers/list-deliveryman-items-controller'
import { ListRecipientItemsController } from './controllers/list-recipient-items-controller'
import { NotificationService } from './services/notification.service'
import { ListDeliveryMenController } from './controllers/list-deliveryman-controller'

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
    GetRecipientController,
    ListRecipientController,
    CreateRecipientController,
    UpdateRecipientController,
    DeleteRecipientController,
    GetDeliveryController,
    ListDeliveryController,
    CreateDeliveryController,
    UpdateDeliveryController,
    DeleteDeliveryController,
    ListDeliveryManItemsController,
    ListRecipientItemsController,
    ListDeliveryMenController
  ],
  providers: [AppService, PrismaService, NotificationService],
})
export class AppModule {}
