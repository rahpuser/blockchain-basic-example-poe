import { Body, Controller, FileInterceptor, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { Block } from './blockchain/block';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('blocks/:height')
  getBlock(@Param('height') height: number): Block {
    return this.appService.getBlockByHeight(height);
  }

  @Post('blocks/:height/validate')
  validateBlock(@Param('height') height: number): Promise<Boolean> {
    return this.appService.validateBlock(height);
  }

  @Post('request-submission')
  @UseInterceptors(FileInterceptor('file'))
  requestSubmission(@Body('address') address: string, @UploadedFile() file: Express.Multer.File): string {
    return this.appService.requestSubmission(address, file);
  }

  @Post('documents')
  @UseInterceptors(FileInterceptor('file'))
  submitDocument(@Body('message') message: string, @Body('signature') signature: string): Block {
    return this.appService.submitDocument(message, signature);
  }

  @Post('documents/verify')
  @UseInterceptors(FileInterceptor('file'))
  verifyDocument(@UploadedFile() file: Express.Multer.File): Block {
    return this.appService.verifyDocument(file);
  }

  @Post('validate')
  validateBlockchain(): Boolean {
    return this.appService.validateBlockchain()
  }

}