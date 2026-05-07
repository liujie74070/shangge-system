import { Module } from '@nestjs/common';
import { ChurnsService } from './churns.service';
import { ChurnsController } from './churns.controller';

@Module({
  controllers: [ChurnsController],
  providers: [ChurnsService],
  exports: [ChurnsService],
})
export class ChurnsModule {}
