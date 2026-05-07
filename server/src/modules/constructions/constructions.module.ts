import { Module } from '@nestjs/common';
import { ConstructionsService } from './constructions.service';
import { ConstructionsController } from './constructions.controller';

@Module({
  controllers: [ConstructionsController],
  providers: [ConstructionsService],
  exports: [ConstructionsService],
})
export class ConstructionsModule {}
