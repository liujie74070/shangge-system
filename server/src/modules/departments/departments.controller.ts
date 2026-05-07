import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('部门管理')
@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Post()
  @Roles('GM')
  create(@Body() data: { name: string; type: string; parentId?: string; storeId?: string; managerId?: string }) {
    return this.departmentsService.create(data);
  }

  @Put(':id')
  @Roles('GM')
  update(@Param('id') id: string, @Body() data: Partial<{ name: string; type: string; parentId: string; storeId: string; managerId: string }>) {
    return this.departmentsService.update(id, data);
  }

  @Delete(':id')
  @Roles('GM')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}
