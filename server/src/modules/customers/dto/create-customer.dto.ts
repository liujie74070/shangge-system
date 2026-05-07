import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class CreateCustomerDto {
  @ApiProperty({ example: '张三' })
  @IsString()
  name: string;

  @ApiProperty({ example: '13800138000' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'zhangsan', required: false })
  @IsOptional()
  @IsString()
  wechat?: string;

  @ApiProperty({ example: '340123199001011234', required: false })
  @IsOptional()
  @IsString()
  idNumber?: string;

  @ApiProperty({ enum: Gender, example: '男', required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ example: 35, required: false })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiProperty({ example: '天下锦城' })
  @IsOptional()
  @IsString()
  communityName?: string;

  @ApiProperty({ example: '12栋101室', required: false })
  @IsOptional()
  @IsString()
  houseAddress?: string;

  @ApiProperty({ example: 120.5 })
  @IsOptional()
  @IsNumber()
  houseArea?: number;

  @ApiProperty({ example: '3室2厅' })
  @IsOptional()
  @IsString()
  houseType?: string;

  @ApiProperty({ example: '新房' })
  @IsOptional()
  @IsString()
  renovationType?: string;

  @ApiProperty({ example: '已交房' })
  @IsOptional()
  @IsString()
  houseStatus?: string;

  @ApiProperty({ example: '2026-06-01' })
  @IsOptional()
  @IsDateString()
  decorationTime?: string;

  @ApiProperty({ example: 150000 })
  @IsOptional()
  @IsNumber()
  expectedBudget?: number;

  @ApiProperty({ example: '12-20万' })
  @IsOptional()
  @IsString()
  budgetRange?: string;

  @ApiProperty({ example: '现代简约' })
  @IsOptional()
  @IsString()
  decorationStyle?: string;

  @ApiProperty({ example: '需要衣帽间', required: false })
  @IsOptional()
  @IsString()
  specialRequirement?: string;

  @ApiProperty({ example: '老客户转介绍' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sourceDetail?: string;

  @ApiProperty({ example: '李四', required: false })
  @IsOptional()
  @IsString()
  referrerName?: string;

  @ApiProperty({ example: '13900001111', required: false })
  @IsOptional()
  @IsString()
  referrerPhone?: string;

  @ApiProperty({ example: 'A' })
  @IsOptional()
  @IsString()
  intentLevel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentOwnerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  marketOwnerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  designOwnerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deptId?: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
