import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('数据看板')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('overview')
  getOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.dashboardService.getOverview({ startDate, endDate, departmentId });
  }

  @Get('funnel')
  getFunnel(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.dashboardService.getFunnel({ startDate, endDate, departmentId });
  }

  @Get('sources')
  getSourceStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getSourceStats({ startDate, endDate });
  }

  @Get('signed-trend')
  getSignedTrend(@Query('months') months?: string) {
    return this.dashboardService.getSignedTrend(months ? parseInt(months) : 12);
  }

  @Get('designer-ranking')
  getDesignerRanking(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getDesignerRanking({ startDate, endDate, limit: limit ? parseInt(limit) : 10 });
  }

  @Get('churn-stats')
  getChurnStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getChurnStats({ startDate, endDate });
  }
}
