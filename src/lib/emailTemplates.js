export function getOtpEmailTemplate(otp, userName) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="480" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e4e4e7; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
                
                <!-- Header Badge -->
                <tr>
                  <td align="left" style="padding-bottom: 20px;">
                    <span style="background-color: #18181b; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; display: inline-block;">
                      Auno 🎓
                    </span>
                  </td>
                </tr>

                <!-- Heading -->
                <tr>
                  <td align="left" style="padding-bottom: 12px;">
                    <h1 style="margin: 0; color: #09090b; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">
                      Verify your college email
                    </h1>
                  </td>
                </tr>

                <!-- Text -->
                <tr>
                  <td align="left" style="padding-bottom: 24px; color: #71717a; font-size: 14px; line-height: 1.6;">
                    Hey <strong>${userName}</strong> 👋, enter this code to complete your registration and unlock the Auno.
                  </td>
                </tr>

                <!-- OTP Code Display -->
                <tr>
                  <td align="center" style="padding: 24px; background-color: #fafafa; border: 2px dashed #e4e4e7; border-radius: 16px; margin-bottom: 24px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #09090b; padding-left: 12px;">
                      ${otp}
                    </span>
                  </td>
                </tr>

                <!-- Warning Notice -->
                <tr>
                  <td align="left" style="padding-top: 20px; color: #a1a1aa; font-size: 12px; line-height: 1.5;">
                    ⏳ This code expires in <strong>10 minutes</strong>. If you didn't request this email, you can safely ignore it.
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export function getResetPasswordEmailTemplate(otp, userName) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="480" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e4e4e7; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
                
                <!-- Header Badge -->
                <tr>
                  <td align="left" style="padding-bottom: 20px;">
                    <span style="background-color: #18181b; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; display: inline-block;">
                      Auno Security 🔑
                    </span>
                  </td>
                </tr>

                <!-- Heading -->
                <tr>
                  <td align="left" style="padding-bottom: 12px;">
                    <h1 style="margin: 0; color: #09090b; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">
                      Reset Your Password
                    </h1>
                  </td>
                </tr>

                <!-- Text -->
                <tr>
                  <td align="left" style="padding-bottom: 24px; color: #71717a; font-size: 14px; line-height: 1.6;">
                    Hey <strong>${userName}</strong> 👋, enter this security code to verify your identity and set a new password.
                  </td>
                </tr>

                <!-- OTP Code Display -->
                <tr>
                  <td align="center" style="padding: 24px; background-color: #fafafa; border: 2px dashed #e4e4e7; border-radius: 16px; margin-bottom: 24px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #09090b; padding-left: 12px;">
                      ${otp}
                    </span>
                  </td>
                </tr>

                <!-- Warning Notice -->
                <tr>
                  <td align="left" style="padding-top: 20px; color: #a1a1aa; font-size: 12px; line-height: 1.5;">
                    ⏳ This code expires in <strong>10 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}