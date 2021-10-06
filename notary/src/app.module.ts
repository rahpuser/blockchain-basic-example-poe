import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Blockchain } from './blockchain/blockchain';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, Blockchain],
})
export class AppModule {}
