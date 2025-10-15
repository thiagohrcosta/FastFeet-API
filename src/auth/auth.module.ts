import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthenticateController } from '@/controllers/authenticate-controller'
import { PrismaModule } from '@/prisma/prisma.module'
import { PrismaService } from '@/prisma/prisma.service'
import { JwtStrategy } from './jwt.stratety'
import { Env } from '@/env'

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory(config: ConfigService<Env, true>) {
        const privateKey = config.get('JWT_PRIVATE_KEY', { infer: true })
        const publicKey = config.get('JWT_PUBLIC_KEY', { infer: true })

        if (!privateKey) {
          throw new Error('JWT_PRIVATE_KEY is not defined')
        }
        if (!publicKey) {
          throw new Error('JWT_PUBLIC_KEY is not defined')
        }

        return {
          signOptions: { algorithm: 'RS256' },
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
        }
      },
    }),
  ],
  controllers: [AuthenticateController],
  providers: [JwtStrategy, PrismaService],
})
export class AuthModule {}
