import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('客户管理')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post()
  create(@Body() dto: CreateCustomerDto, @Request() req) {
    return this.customersService.create(dto, req.user.sub);
  }

  @Get('collision-check')
  checkCollision(@Query('phone') phone?: string, @Query('wechat')?: string, @Query('communityName')?: string, @Query('name')?: string) {
    return this.customersService.checkCollision({ phone, wechat, communityName, name });
  }

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('keyword') keyword?: string,
    @Query('stage') stage?: string,
    @Query('intentLevel') intentLevel?: string,
    @Query('source') source?: string,
    @Query('departmentId') departmentId?: string,
    @Query('ownerId') ownerId?: string,
    @Query('isSigned') isSigned?: string,
    @Query('isLost') isLost?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.customersService.findAll({
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 20,
      keyword,
      stage,
      intentLevel,
      source,
      departmentId,
      ownerId,
      isSigned: isSigned !== undefined ? isSigned === 'true' : undefined,
      isLost: isLost !== undefined ? isLost === 'true' : undefined,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto, @Request() req) {
    return this.customersService.update(id, dto, req.user.sub);
  }

  @Post(':id/stage')
  stageTransition(
    @Param('id') id: string,
    @Body() body: { toStage: string; remark?: string },
    @Request() req,
  ) {
    return this.customersService.stageTransition(id, body.toStage, body.remark || '', req.user.sub);
  }

  @Post(':id/assign')
  assign(
    @Param('id') id: string,
    @Body() body: { toOwnerId: string; reason?: string },
    @Request() req,
  ) {
    return this.customersService.assign(id, body.toOwnerId, body.reason || '', req.user.sub);
  }

  @Delete(':id')
  @Roles('GM')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
