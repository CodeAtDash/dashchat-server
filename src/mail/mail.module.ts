import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { SesService } from './services/ses.service';

@Module({
  providers: [MailService, SesService],
  exports: [MailService],
})
export class MailModule {}
