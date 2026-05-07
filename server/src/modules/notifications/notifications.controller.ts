import { Controller, Get, Put, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('消息通知')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findByUser(
    @Request() req,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('isRead') isRead?: string,
  ) {
    return this.notificationsService.findByUser(req.user.sub, {
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 20,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
    });
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('read-all')
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }
}
