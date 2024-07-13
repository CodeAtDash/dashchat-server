import { Injectable } from '@nestjs/common';
import mjml2html from 'mjml';
import * as ejs from 'ejs';
import { SesService } from './ses.service';

@Injectable()
export class MailService {
  constructor(private sesService: SesService) {}

  async sendEmailWithOtp(
    subject: string,
    message: string,
    otp: string,
    to: string,
  ) {
    const mjmlObject = mjml2html(`
    <mjml>
        <mj-head>
        <mj-style>
            .body {
            align:center;
            background-color: rgba(242,242,242,1)!important;
            }
            .wrapper {
            background-color: #FFFFFF;
            padding: 0px 20px 0px 20px;
            }
            .footer-wrapper {
            background-color: #1A1A1A;
            padding: 0px 20px 0px 20px;
            }
        </mj-style>
        <mj-attributes>
            <mj-body css-class="body" />
        </mj-attributes>
        </mj-head>
        <mj-body>
        <mj-wrapper css-class="wrapper">
            <mj-section>
            <mj-column>
                </mj-image>
                <mj-text font-size="20px" line-height="18px" font-weight="600" color="#1A1A1A" padding="20px 0px 0px 0px">
                <%=message%></mj-text>
            </mj-column>
            </mj-section>
            <mj-section padding="0px">
            <mj-column>
                <mj-text padding="10px 0px 0px 0px" font-size="16px" line-height="25px" color="#1A1A1A">
                The one-time password ( OTP ) to complete your action is:
                </mj-text>
                <mj-text padding="10px 0px 0px 0px" font-size="20px" line-height="25px" color="red" font-weight="600">
                <%=otp%></mj-text>
                <mj-text padding="10px 0px 0px 0px" font-size="16px" line-height="25px" color="#1A1A1A">
                <mj-raw><text style="color:#4A4A4A; font-weight:600; font-size:16px">Please note: </text></mj-raw>
                Do not share this otp with anyone.
                </mj-text>
            </mj-column>
            </mj-section>
        </mj-wrapper>
        <mj-wrapper css-class="footer-wrapper">
            <mj-section padding="0px">
            <mj-column>
                <mj-text font-size="16px" font-weight="600" align="center" color="#E8EDF3" padding="0px">
                Team Gradeviser
                </mj-text>
            </mj-column>
            </mj-section>
            <mj-section padding="15px 0px 0px 0px">
            <mj-column>
                <mj-text align="center" color="#F8FAFC" line-height="19.07px" font-size="14px" padding="0px">
                <text style="color:#CCCCCC; font-weight:600">Disclaimer:</text> This communication is confidential and priviledged and is directed to and for the use of the addressee only.
                </mj-text>
            </mj-column>
            </mj-section>
        </mj-wrapper>
        </mj-body>
    </mjml>
`);

    const htmlString = ejs.render(mjmlObject.html, { message, otp });

    await this.sesService.triggerEmail(
      'verify@dashpad.in',
      [to],
      subject,
      htmlString,
      'Gradeviser',
    );
  }

  async sendVerificationEmail(otp: string, to: string) {
    const subject = `OTP for email verification - ${otp}`;
    const message = 'Verify your email';
    await this.sendEmailWithOtp(subject, message, otp, to);
  }

  async sendPasswordResetVerificationEmail(otp: string, to: string) {
    const subject = `OTP for password reset - ${otp}`;
    const message = 'Reset your password';
    await this.sendEmailWithOtp(subject, message, otp, to);
  }
}
