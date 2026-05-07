import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FollowUpsService } from './follow-ups.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('跟进记录')
@Controller('follow-ups')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FollowUpsController {
  constructor(private followUpsService: FollowUpsService) {}

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.followUpsService.findByCustomer(customerId);
  }

  @Post()
  create(@Body() data: any, @Request() req) {
    return this.followUpsService.create(data, req.user.sub);
  }

  @Get('today-todos')
  getTodayTodos(@Request() req) {
    return this.followUpsService.getTodayTodos(req.user.sub);
  }

  @Get('overdue')
  getOverdue(@Request() req) {
    return this.followUpsService.getOverdue(req.user.sub);
  }
}
