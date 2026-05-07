import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('预约管理')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() data: any) {
    return this.appointmentsService.create(data);
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.appointmentsService.findByCustomer(customerId);
  }

  @Put(':id/arrive')
  arrive(@Param('id') id: string, @Body() data: { isArrived: boolean; noShowReason?: string }) {
    return this.appointmentsService.arrive(id, data);
  }

  @Put(':id/reschedule')
  reschedule(@Param('id') id: string, @Body() data: { newTime: string }) {
    return this.appointmentsService.reschedule(id, data.newTime);
  }
}
