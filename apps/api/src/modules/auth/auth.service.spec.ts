import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { PasswordResetTokenDocument } from './password-reset-token.schema';
import { AuthService } from './auth.service';

type MockUsersService = {
  findByEmail: jest.Mock;
  create: jest.Mock;
  updatePasswordHashById: jest.Mock;
};

type MockResetTokenModel = {
  create: jest.Mock;
  findOne: jest.Mock;
};

type MockConfigService = {
  get: jest.Mock;
};

describe('AuthService password reset flow', () => {
  let service: AuthService;
  let users: MockUsersService;
  let resetTokenModel: MockResetTokenModel;
  let config: MockConfigService;
  let jwt: { signAsync: jest.Mock };

  beforeEach(() => {
    users = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      updatePasswordHashById: jest.fn(),
    };

    resetTokenModel = {
      create: jest.fn(),
      findOne: jest.fn(),
    };

    config = {
      get: jest.fn((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'PASSWORD_RESET_TOKEN_PEPPER') return 'pepper';
        if (key === 'PASSWORD_RESET_TTL_MINUTES') return '30';
        if (key === 'BCRYPT_SALT_ROUNDS') return '4';
        if (key === 'JWT_EXPIRES_IN') return '1d';
        return undefined;
      }),
    };

    jwt = {
      signAsync: jest.fn().mockResolvedValue('test-access-token'),
    };

    service = new AuthService(
      users as unknown as UsersService,
      jwt as unknown as JwtService,
      config as unknown as ConfigService,
      resetTokenModel as unknown as Model<PasswordResetTokenDocument>,
    );
  });

  it('creates user on signup and returns access token', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      email: 'new@example.com',
      name: 'New User',
      tenantId: 'default',
    });

    const result = await service.signup({
      email: '  NEW@example.com  ',
      password: 'Password123',
      name: '  New User  ',
    });

    expect(result).toEqual({
      ok: true,
      user: {
        id: '507f1f77bcf86cd799439011',
        email: 'new@example.com',
        name: 'New User',
        tenantId: 'default',
      },
      accessToken: 'test-access-token',
    });

    expect(users.create).toHaveBeenCalledWith({
      tenantId: 'default',
      email: 'new@example.com',
      passwordHash: expect.any(String),
      name: 'New User',
    });
    expect(users.create.mock.calls[0][0].passwordHash).not.toBe('Password123');
  });

  it('returns duplicate email error when signup hits unique index race', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockRejectedValue({ code: 11000 });

    const result = await service.signup({
      email: 'exists@example.com',
      password: 'Password123',
    });

    expect(result).toEqual({
      ok: false,
      code: 'EMAIL_ALREADY_EXISTS',
      message: 'Email already in use',
    });
  });

  it('returns ok for unknown email without creating token (no enumeration)', async () => {
    users.findByEmail.mockResolvedValue(null);

    const result = await service.forgotPassword({ email: 'missing@example.com' });

    expect(result).toEqual({ ok: true });
    expect(resetTokenModel.create).not.toHaveBeenCalled();
  });

  it('returns debug token in development for existing user and stores only hash', async () => {
    users.findByEmail.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });
    resetTokenModel.create.mockResolvedValue(undefined);

    const result = await service.forgotPassword({ email: 'user@example.com' });

    expect(result.ok).toBe(true);
    expect('debugResetToken' in result && result.debugResetToken).toBeTruthy();
    expect(resetTokenModel.create).toHaveBeenCalledTimes(1);
    const payload = resetTokenModel.create.mock.calls[0][0];
    expect(payload.tokenHash).not.toBe(result.debugResetToken);
    expect(payload.usedAt).toBeNull();
  });

  it('does not return debug token in production', async () => {
    config.get.mockImplementation((key: string) => {
      if (key === 'NODE_ENV') return 'production';
      if (key === 'PASSWORD_RESET_TOKEN_PEPPER') return 'pepper';
      if (key === 'PASSWORD_RESET_TTL_MINUTES') return '30';
      if (key === 'BCRYPT_SALT_ROUNDS') return '4';
      return undefined;
    });
    users.findByEmail.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });
    resetTokenModel.create.mockResolvedValue(undefined);

    const result = await service.forgotPassword({ email: 'user@example.com' });

    expect(result).toEqual({ ok: true });
  });

  it('rejects reset with invalid or expired token', async () => {
    resetTokenModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const result = await service.resetPassword({ token: 'bad-token', newPassword: 'Password123' });

    expect(result).toEqual({
      ok: false,
      code: 'INVALID_OR_EXPIRED_TOKEN',
      message: 'Invalid or expired reset token',
    });
    expect(users.updatePasswordHashById).not.toHaveBeenCalled();
  });

  it('resets password and marks token as used for valid token', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    resetTokenModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        userId: '507f1f77bcf86cd799439011',
        usedAt: null,
        save,
      }),
    });
    users.updatePasswordHashById.mockResolvedValue({ acknowledged: true, matchedCount: 1 });

    const result = await service.resetPassword({ token: 'valid-token', newPassword: 'Password123' });

    expect(result).toEqual({ ok: true });
    expect(users.updatePasswordHashById).toHaveBeenCalledTimes(1);
    const [, passwordHash] = users.updatePasswordHashById.mock.calls[0];
    expect(typeof passwordHash).toBe('string');
    expect(passwordHash).not.toBe('Password123');
    expect(save).toHaveBeenCalledTimes(1);
  });
});
