import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProposalsService } from './proposals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('方案与报价')
@Controller('proposals')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProposalsController {
  constructor(private proposalsService: ProposalsService) {}

  @Post()
  @Roles('DESIGNER', 'DESIGN_MGR', 'GM', 'VP', 'DIRECTOR')
  create(@Body() data: any) {
    return this.proposalsService.create(data);
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.proposalsService.findByCustomer(customerId);
  }

  @Put(':id/quote')
  @Roles('DESIGNER', 'DESIGN_MGR', 'GM', 'VP')
  submitQuote(@Param('id') id: string, @Body() data: { quotationAmount: number; discountAmount?: number; finalAmount: number }) {
    return this.proposalsService.submitQuote(id, data);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() data: { status: string }) {
    return this.proposalsService.updateStatus(id, data.status);
  }
}
