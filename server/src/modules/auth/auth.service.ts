import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
      include: {
        department: {
          include: { store: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
      departmentId: user.departmentId,
    };

    // 更新最后登录时间
    await this.prisma.user.update({
      where: { id: user.id },
      data: {},
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        department: user.department
          ? {
              id: user.department.id,
              name: user.department.name,
              type: user.department.type,
              store: user.department.store
                ? { id: user.department.store.id, name: user.department.store.name }
                : null,
            }
          : null,
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: {
          include: { store: true },
        },
      },
    });
  }
}
