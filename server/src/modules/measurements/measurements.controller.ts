import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MeasurementsService } from './measurements.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('量房记录')
@Controller('measurements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeasurementsController {
  constructor(private measurementsService: MeasurementsService) {}

  @Post()
  create(@Body() data: any) {
    return this.measurementsService.create(data);
  }

  @Put(':id/complete')
  complete(@Param('id') id: string, @Body() data: any) {
    return this.measurementsService.complete(id, data);
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.measurementsService.findByCustomer(customerId);
  }
}
