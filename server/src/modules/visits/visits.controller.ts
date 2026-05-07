import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VisitsService } from './visits.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('到店记录')
@Controller('visits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VisitsController {
  constructor(private visitsService: VisitsService) {}

  @Post()
  create(@Body() data: any, @Request() req) {
    return this.visitsService.create(data, req.user.sub);
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.visitsService.findByCustomer(customerId);
  }
}
