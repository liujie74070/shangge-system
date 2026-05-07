import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (existing) {
      throw new ConflictException('手机号已被注册');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        passwordHash,
        role: dto.role,
        departmentId: dto.departmentId,
        avatar: dto.avatar,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        department: {
          include: { store: true },
        },
        createdAt: true,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    departmentId?: string;
    role?: string;
    isActive?: boolean;
    keyword?: string;
  }) {
    const { skip = 0, take = 20, departmentId, role, isActive = true, keyword } = params;

    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          avatar: true,
          isActive: true,
          department: { include: { store: true } },
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        department: {
          include: { store: true },
        },
      },
    });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: any = { ...dto };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
      delete data.password;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        department: { include: { store: true } },
      },
    });
  }

  async remove(id: string) {
    // 软删除：停用账号
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getDesigners() {
    return this.prisma.user.findMany({
      where: {
        role: 'DESIGNER',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        department: true,
      },
    });
  }
}
