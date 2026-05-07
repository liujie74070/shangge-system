import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('合同管理')
@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('departmentId') departmentId?: string,
    @Query('designerId') designerId?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.contractsService.findAll({
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 20,
      departmentId,
      designerId,
      paymentStatus,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.contractsService.findByCustomer(customerId);
  }

  @Put(':id')
  @Roles('DESIGNER', 'DESIGN_MGR', 'GM', 'VP')
  update(@Param('id') id: string, @Body() data: any) {
    return this.contractsService.update(id, data);
  }

  @Post(':id/sign')
  @Roles('DESIGNER', 'GM', 'VP')
  sign(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.contractsService.sign(id, data, req.user.sub);
  }
}
