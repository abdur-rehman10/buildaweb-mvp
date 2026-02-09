import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PasswordResetToken, PasswordResetTokenSchema } from './password-reset-token.schema';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: PasswordResetToken.name, schema: PasswordResetTokenSchema }]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('Missing JWT_SECRET. Set it in apps/api/.env or environment variables.');
        }

        return {
          secret,
          signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') ?? '1d' },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
