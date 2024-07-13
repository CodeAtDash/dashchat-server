import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { applicationConfig } from 'config';

@Injectable()
export class SesService {
  private sesClient: SESClient;

  constructor() {
    this.sesClient = new SESClient({
      region: applicationConfig.aws.region as string,
      credentials: {
        accessKeyId: applicationConfig.aws.accessKey as string,
        secretAccessKey: applicationConfig.aws.secretAccessKey as string,
      },
    });
  }

  async triggerEmail(
    senderEmail: string,
    recipientEmails: string[],
    subject: string,
    body: string,
    sourcePrefix: string,
  ) {
    const params = {
      Source: `${sourcePrefix} <${senderEmail}>`,
      Destination: {
        ToAddresses: recipientEmails,
      },

      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },

        Body: {
          Html: {
            Data: body,
            Charset: 'UTF-8',
          },
        },
      },
    };

    const command = new SendEmailCommand(params);

    return this.sesClient.send(command);
  }
}
