import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('系统配置中心')
@Controller('config')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConfigController {
  constructor(private configService: ConfigService) {}

  // 字典 CRUD (通用路由)
  @Get('dict/:type')
  getDict(@Param('type') type: string) {
    return this.configService.getDict(type as any);
  }

  @Post('dict/:type')
  @Roles('GM', 'VP')
  createDictItem(@Param('type') type: string, @Body() data: any) {
    return this.configService.createDictItem(type as any, data);
  }

  @Put('dict/:type/:id')
  @Roles('GM', 'VP')
  updateDictItem(@Param('type') type: string, @Param('id') id: string, @Body() data: any) {
    return this.configService.updateDictItem(type as any, id, data);
  }

  @Delete('dict/:type/:id')
  @Roles('GM', 'VP')
  deleteDictItem(@Param('type') type: string, @Param('id') id: string) {
    return this.configService.deleteDictItem(type as any, id);
  }

  // 业务规则
  @Get('business-rules')
  getBusinessRules() {
    return this.configService.getBusinessRules();
  }

  @Post('business-rules/:key')
  @Roles('GM', 'VP')
  upsertBusinessRule(@Param('key') key: string, @Body() data: any, @Request() req) {
    return this.configService.upsertBusinessRule(key, data, req.user.sub);
  }

  // 系统参数
  @Get('system')
  getSystemConfigs() {
    return this.configService.getSystemConfigs();
  }

  @Get('system/:key')
  getSystemConfig(@Param('key') key: string) {
    return this.configService.getSystemConfig(key);
  }

  @Post('system/:key')
  @Roles('GM')
  upsertSystemConfig(@Param('key') key: string, @Body() data: { value: string; description: string }, @Request() req) {
    return this.configService.upsertSystemConfig(key, data.value, data.description, req.user.sub);
  }
}
