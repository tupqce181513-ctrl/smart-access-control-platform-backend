const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);
  console.log(process.env.RESEND_API_KEY);
/**
 * Send an email via Resend API
 * @param {string} toEmail
 * @param {string} toName
 * @param {string} subject
 * @param {string} htmlContent
 */
const sendEmail = async (toEmail, toName, subject, htmlContent) => {
  const { data, error } = await resend.emails.send({
    from: `Smart Access Control <${process.env.RESEND_SENDER_EMAIL}>`,
    to: [toEmail],
    subject: subject,
    html: htmlContent,
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Send email verification email
 */
const sendVerificationEmail = async (user, token) => {
  try {
    const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .title { font-size: 22px; font-weight: bold; color: #1f2937; margin-top: 8px; }
            .btn { display: inline-block; padding: 12px 32px; background: #2563eb; color: #fff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .note { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #666; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Smart Access Control</div>
              <div class="title">Xác thực Email</div>
            </div>
            <p>Xin chào <strong>${user.fullName}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác thực email của bạn bằng cách nhấp vào nút bên dưới:</p>
            <center><a href="${verificationUrl}" class="btn">Xác thực Email</a></center>
            <div class="note">
              <strong>Hoặc sao chép link này vào trình duyệt:</strong><br>
              ${verificationUrl}
            </div>
            <p>Link này sẽ hết hạn trong 24 giờ.</p>
            <p>Nếu bạn không yêu cầu xác thực này, vui lòng bỏ qua email này.</p>
            <div class="footer">
              <p>&copy; 2026 Smart Access Control Platform. All rights reserved.</p>
              <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(user.email, user.fullName, 'Xác thực email - Smart Access Control Platform', html);
    console.log(`✓ Verification email sent to ${user.email} (via Resend)`);
  } catch (error) {
    console.error('✗ Failed to send verification email:', error.message);
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (user) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 8px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; text-align: center; }
            .title { font-size: 22px; font-weight: bold; color: #1f2937; text-align: center; margin-top: 8px; }
            .features { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .feature-item { margin: 8px 0; padding-left: 10px; }
            .btn { display: inline-block; padding: 12px 32px; background: #2563eb; color: #fff !important; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Smart Access Control</div>
            <div class="title">Chào mừng đến Platform!</div>
            <p>Xin chào <strong>${user.fullName}</strong>,</p>
            <p>Chúng tôi vui mừng chào đón bạn đến với Smart Access Control Platform.</p>
            <div class="features">
              <strong>Các tính năng chính:</strong>
              <div class="feature-item">✓ Quản lý thiết bị truy cập từ xa</div>
              <div class="feature-item">✓ Cấp phép truy cập linh hoạt và bảo mật</div>
              <div class="feature-item">✓ Theo dõi nhật ký truy cập</div>
              <div class="feature-item">✓ Cảnh báo và thông báo thời gian thực</div>
              <div class="feature-item">✓ Tích hợp IoT và MQTT</div>
            </div>
            <center><a href="${process.env.CLIENT_URL}" class="btn">Truy cập Dashboard</a></center>
            <div class="footer">
              <p>&copy; 2026 Smart Access Control Platform. All rights reserved.</p>
              <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(user.email, user.fullName, 'Chào mừng đến Smart Access Control Platform', html);
    console.log(`✓ Welcome email sent to ${user.email} (via Resend)`);
  } catch (error) {
    console.error('✗ Failed to send welcome email:', error.message);
  }
};

/**
 * Send access granted email
 */
const sendAccessGrantedEmail = async (user, device, accessType) => {
  try {
    const accessTypeLabel = { permanent: 'Vĩnh viễn', scheduled: 'Theo lịch', one_time: 'Một lần' }[accessType] || accessType;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 8px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; text-align: center; }
            .title { font-size: 22px; font-weight: bold; color: #059669; text-align: center; margin-top: 8px; }
            .alert-success { background: #d1fae5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .device-info { background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .info-row { margin: 8px 0; }
            .info-label { font-weight: bold; color: #555; display: inline-block; width: 140px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Smart Access Control</div>
            <div class="title">✓ Quyền truy cập được cấp</div>
            <div class="alert-success"><strong>Chúc mừng!</strong> Bạn đã được cấp quyền truy cập đến thiết bị.</div>
            <p>Xin chào <strong>${user.fullName}</strong>,</p>
            <div class="device-info">
              <div class="info-row"><span class="info-label">Thiết bị:</span>${device.name}</div>
              <div class="info-row"><span class="info-label">Loại:</span>${device.deviceType}</div>
              <div class="info-row"><span class="info-label">Loại truy cập:</span>${accessTypeLabel}</div>
              ${device.location?.address ? `<div class="info-row"><span class="info-label">Vị trí:</span>${device.location.address}</div>` : ''}
            </div>
            <div class="footer">
              <p>&copy; 2026 Smart Access Control Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(user.email, user.fullName, `Bạn đã được cấp quyền truy cập - ${device.name}`, html);
    console.log(`✓ Access granted email sent to ${user.email} (via Resend)`);
  } catch (error) {
    console.error('✗ Failed to send access granted email:', error.message);
  }
};

/**
 * Send access revoked email
 */
const sendAccessRevokedEmail = async (user, device) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 8px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; text-align: center; }
            .title { font-size: 22px; font-weight: bold; color: #dc2626; text-align: center; margin-top: 8px; }
            .alert-warning { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .device-info { background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Smart Access Control</div>
            <div class="title">Quyền truy cập đã bị thu hồi</div>
            <div class="alert-warning"><strong>Thông báo:</strong> Quyền truy cập của bạn đã bị thu hồi.</div>
            <p>Xin chào <strong>${user.fullName}</strong>,</p>
            <div class="device-info">
              <strong>Thiết bị:</strong> ${device.name}
            </div>
            <div class="footer">
              <p>&copy; 2026 Smart Access Control Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(user.email, user.fullName, `Quyền truy cập đã bị thu hồi - ${device.name}`, html);
    console.log(`✓ Access revoked email sent to ${user.email} (via Resend)`);
  } catch (error) {
    console.error('✗ Failed to send access revoked email:', error.message);
  }
};

/**
 * Send device alert email
 */
const sendDeviceAlertEmail = async (user, device, alertType) => {
  try {
    const alertConfig = {
      offline: { title: 'Thiết bị ngoại tuyến', color: '#dc2626', bgColor: '#fee2e2', message: 'Thiết bị không thể kết nối. Vui lòng kiểm tra kết nối mạng.' },
      tamper: { title: 'Phát hiện can dụng', color: '#dc2626', bgColor: '#fee2e2', message: 'Phát hiện dấu hiệu can dụng trên thiết bị.' },
      battery_low: { title: 'Pin sắp hết', color: '#f59e0b', bgColor: '#fef3c7', message: 'Pin thiết bị sắp hết. Vui lòng thay pin sớm nhất.' },
      malfunction: { title: 'Sự cố thiết bị', color: '#dc2626', bgColor: '#fee2e2', message: 'Phát hiện sự cố trên thiết bị. Vui lòng liên hệ kỹ thuật.' },
    };
    const alert = alertConfig[alertType] || alertConfig.offline;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 8px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; text-align: center; }
            .title { font-size: 22px; font-weight: bold; color: ${alert.color}; text-align: center; margin-top: 8px; }
            .alert-box { background: ${alert.bgColor}; border-left: 4px solid ${alert.color}; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .device-info { background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .info-row { margin: 8px 0; }
            .info-label { font-weight: bold; color: #555; display: inline-block; width: 140px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Smart Access Control</div>
            <div class="title">${alert.title}</div>
            <div class="alert-box"><strong>Thông báo cảnh báo:</strong> ${alert.message}</div>
            <p>Xin chào <strong>${user.fullName}</strong>,</p>
            <div class="device-info">
              <div class="info-row"><span class="info-label">Thiết bị:</span>${device.name}</div>
              <div class="info-row"><span class="info-label">Loại cảnh báo:</span>${alertType}</div>
              <div class="info-row"><span class="info-label">Thời gian:</span>${new Date().toLocaleString('vi-VN')}</div>
            </div>
            <div class="footer">
              <p>&copy; 2026 Smart Access Control Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(user.email, user.fullName, `Cảnh báo thiết bị - ${device.name}`, html);
    console.log(`✓ Device alert email sent to ${user.email} (via Resend)`);
  } catch (error) {
    console.error('✗ Failed to send device alert email:', error.message);
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendAccessGrantedEmail,
  sendAccessRevokedEmail,
  sendDeviceAlertEmail,
};
