import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ConstructionsService } from './constructions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('施工管理')
@Controller('constructions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConstructionsController {
  constructor(private constructionsService: ConstructionsService) {}

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('stage') stage?: string,
    @Query('managerId') managerId?: string,
  ) {
    return this.constructionsService.findAll({
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 20,
      stage, managerId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.constructionsService.findOne(id);
  }

  @Post()
  @Roles('GM', 'VP', 'PM')
  create(@Body() data: any) {
    return this.constructionsService.create(data);
  }

  @Put(':id')
  @Roles('PM', 'GM', 'VP')
  update(@Param('id') id: string, @Body() data: any) {
    return this.constructionsService.update(id, data);
  }

  @Put(':id/stage')
  @Roles('PM')
  updateStage(@Param('id') id: string, @Body() data: { stage: string }) {
    return this.constructionsService.updateStage(id, data.stage, '');
  }
}
