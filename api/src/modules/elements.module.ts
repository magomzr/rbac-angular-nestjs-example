import { Module } from '@nestjs/common';
import { ElementsService } from '../services/elements.service';
import { ElementsController } from '../controllers/elements.controller';

@Module({
  controllers: [ElementsController],
  providers: [ElementsService],
})
export class ElementsModule {}
