import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AfterSalesService } from './after-sales.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('售后管理')
@Controller('after-sales')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AfterSalesController {
  constructor(private afterSalesService: AfterSalesService) {}

  @Get()
  findAll(@Query('skip') skip?: string, @Query('take') take?: string, @Query('status') status?: string) {
    return this.afterSalesService.findAll({ skip: skip ? parseInt(skip) : 0, take: take ? parseInt(take) : 20, status });
  }

  @Post()
  create(@Body() data: any) {
    return this.afterSalesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.afterSalesService.update(id, data);
  }
}
