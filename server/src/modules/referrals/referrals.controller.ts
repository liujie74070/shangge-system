import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('转介绍管理')
@Controller('referrals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReferralsController {
  constructor(private referralsService: ReferralsService) {}

  @Get()
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.referralsService.findAll({ skip: skip ? parseInt(skip) : 0, take: take ? parseInt(take) : 20 });
  }

  @Get('stats')
  getStats() {
    return this.referralsService.getStats();
  }

  @Post()
  create(@Body() data: any) {
    return this.referralsService.create(data);
  }
}
