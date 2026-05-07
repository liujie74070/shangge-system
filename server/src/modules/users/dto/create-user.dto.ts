import { IsNotEmpty, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: '张三' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '13800138000' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'zhang@example.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ enum: Role, example: 'SALES' })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: 'uuid-of-department' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({ example: 'https://example.com/avatar.png', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}
