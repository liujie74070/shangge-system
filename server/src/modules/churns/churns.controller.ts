import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChurnsService } from './churns.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('流失管理')
@Controller('churns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChurnsController {
  constructor(private churnsService: ChurnsService) {}

  @Post()
  create(@Body() data: any, @Request() req) {
    return this.churnsService.create(data, req.user.sub);
  }

  @Post(':customerId/reactivate')
  reactivate(@Param('customerId') customerId: string) {
    return this.churnsService.reactivate(customerId);
  }

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('reason') reason?: string,
  ) {
    return this.churnsService.findAll({ skip: skip ? parseInt(skip) : 0, take: take ? parseInt(take) : 20, startDate, endDate, reason });
  }
}
