<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>OTP Verification - St. James Clinic</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset styles */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            outline: none;
            text-decoration: none;
        }
        
        /* Main styles */
        body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            height: 100% !important;
            background-color: #f3f4f6;
            font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .email-wrapper {
            width: 100%;
            background-color: #f3f4f6;
            padding: 40px 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .email-header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%);
            padding: 40px 30px;
            text-align: center;
        }
        
        .email-header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 16px;
            line-height: 1.6;
            color: #374151;
            margin: 0 0 20px 0;
        }
        
        .message-text {
            font-size: 16px;
            line-height: 1.6;
            color: #4b5563;
            margin: 0 0 30px 0;
        }
        
        .otp-container {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 2px dashed #16a34a;
            border-radius: 12px;
            padding: 30px 20px;
            margin: 30px 0;
            text-align: center;
        }
        
        .otp-label {
            font-size: 14px;
            font-weight: 600;
            color: #166534;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0 0 15px 0;
        }
        
        .otp-code {
            font-size: 42px;
            font-weight: 700;
            font-family: 'Courier New', 'Monaco', monospace;
            letter-spacing: 12px;
            color: #16a34a;
            margin: 0;
            text-align: center;
            line-height: 1.2;
        }
        
        .warning-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 30px 0;
        }
        
        .warning-box strong {
            color: #92400e;
            font-size: 14px;
            display: block;
            margin-bottom: 8px;
        }
        
        .warning-box p {
            color: #78350f;
            font-size: 14px;
            line-height: 1.5;
            margin: 0;
        }
        
        .info-text {
            font-size: 14px;
            line-height: 1.6;
            color: #6b7280;
            margin: 20px 0 0 0;
        }
        
        .email-footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
            font-size: 12px;
            line-height: 1.6;
            color: #9ca3af;
            margin: 0 0 10px 0;
        }
        
        .footer-text:last-child {
            margin-bottom: 0;
        }
        
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 30px 0;
            border: none;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                padding: 20px 10px;
            }
            
            .email-header {
                padding: 30px 20px;
            }
            
            .email-header h1 {
                font-size: 24px;
            }
            
            .email-body {
                padding: 30px 20px;
            }
            
            .otp-code {
                font-size: 32px;
                letter-spacing: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td align="center">
                    <div class="email-container">
                        <!-- Header -->
                        <div class="email-header">
                            <h1>St. James Clinic</h1>
                        </div>
                        
                        <!-- Body -->
                        <div class="email-body">
                            <p class="greeting">Hello,</p>
                            
                            <p class="message-text">
                                {{ $messageText ?? 'Your verification code is:' }}
                            </p>
                            
                            <!-- OTP Code -->
                            <div class="otp-container">
                                <p class="otp-label">Your Verification Code</p>
                                <p class="otp-code">{{ $code ?? '000000' }}</p>
                            </div>
                            
                            <!-- Warning Box -->
                            <div class="warning-box">
                                <strong>⚠️ Important Security Notice</strong>
                                <p>This code will expire in 10 minutes. For your security, please do not share this code with anyone. Our team will never ask for this code.</p>
                            </div>
                            
                            <p class="info-text">
                                If you didn't request this code, please ignore this email or contact our support team immediately if you have any concerns about your account security.
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div class="email-footer">
                            <p class="footer-text">
                                This is an automated message from St. James Clinic.
                            </p>
                            <p class="footer-text">
                                Please do not reply to this email. For assistance, please contact our support team.
                            </p>
                            <p class="footer-text" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                                © {{ date('Y') }} St. James Clinic. All rights reserved.
                            </p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
