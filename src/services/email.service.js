const transporter = require('../config/mailtrap');
require('dotenv').config();

/**
 * Send email verification email
 * @param {Object} user - User object with email and fullName
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (user, token) => {
  try {
    const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
            }
            .content {
              margin: 30px 0;
            }
            .message {
              font-size: 16px;
              color: #555;
              margin-bottom: 20px;
            }
            .btn {
              display: inline-block;
              padding: 12px 32px;
              background-color: #2563eb;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
              text-align: center;
            }
            .btn:hover {
              background-color: #1d4ed8;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #9ca3af;
            }
            .note {
              background-color: #f3f4f6;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐 Smart Access Control</div>
              <div class="title">Xác thực Email</div>
            </div>

            <div class="content">
              <div class="message">
                Xin chào <strong>${user.fullName}</strong>,
              </div>
              
              <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác thực email của bạn bằng cách nhấp vào nút bên dưới:</p>

              <center>
                <a href="${verificationUrl}" class="btn">Xác thực Email</a>
              </center>

              <div class="note">
                <strong>Hoặc sao chép link này vào trình duyệt:</strong><br>
                ${verificationUrl}
              </div>

              <p>Link này sẽ hết hạn trong 24 giờ.</p>
              
              <p>Nếu bạn không yêu cầu xác thực ngay này, vui lòng bỏ qua email này.</p>
            </div>

            <div class="footer">
              <p>&copy; 2026 Smart Access Control Platform. All rights reserved.</p>
              <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Xác thực email - Smart Access Control',
      html: htmlContent,
    });

    console.log(`✓ Verification email sent to ${user.email}`);
  } catch (error) {
    console.error('✗ Failed to send verification email:', error.message);
  }
};

/**
 * Send welcome email
 * @param {Object} user - User object with email and fullName
 */
const sendWelcomeEmail = async (user) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
            }
            .content {
              margin: 30px 0;
            }
            .features {
              background-color: #f9fafb;
              padding: 20px;
              border-radius: 6px;
              margin: 20px 0;
            }
            .feature-item {
              margin: 10px 0;
              padding-left: 20px;
            }
            .btn {
              display: inline-block;
              padding: 12px 32px;
              background-color: #2563eb;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
              text-align: center;
            }
            .btn:hover {
              background-color: #1d4ed8;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐 Smart Access Control</div>
              <div class="title">Chào mừng đến Platform!</div>
            </div>

            <div class="content">
              <div style="font-size: 16px; color: #555; margin-bottom: 20px;">
                Xin chào <strong>${user.fullName}</strong>,
              </div>
              
              <p>Chúng tôi vui mừng chào đón bạn đến với Smart Access Control Platform - giải pháp quản lý truy cập thông minh và an toàn.</p>

              <div class="features">
                <strong>Các tính năng chính của Platform:</strong>
                <div class="feature-item">✓ Quản lý thiết bị truy cập từ xa</div>
                <div class="feature-item">✓ Cấp phép truy cập linh hoạt và bảo mật</div>
                <div class="feature-item">✓ Theo dõi hoàn toàn nhật ký truy cập</div>
                <div class="feature-item">✓ Cảnh báo và thông báo thời gian thực</div>
                <div class="feature-item">✓ Tích hợp IoT và MQTT</div>
              </div>

              <p>Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi.</p>

              <center>
                <a href="${process.env.CLIENT_URL}" class="btn">Truy cập Dashboard</a>
              </center>
            </div>

            <div class="footer">
              <p>&copy; 2026 Smart Access Control Platform. All rights reserved.</p>
              <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Chào mừng đến Smart Access Control Platform',
      html: htmlContent,
    });

    console.log(`✓ Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('✗ Failed to send welcome email:', error.message);
  }
};

/**
 * Send access granted email
 * @param {Object} user - User object with email and fullName
 * @param {Object} device - Device object with name, deviceType, location
 * @param {string} accessType - Access type (permanent, scheduled, one_time)
 */
const sendAccessGrantedEmail = async (user, device, accessType) => {
  try {
    const accessTypeLabel = {
      permanent: 'Vĩnh viễn',
      scheduled: 'Theo lịch',
      one_time: 'Một lần',
    }[accessType] || accessType;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #059669;
              margin-bottom: 10px;
            }
            .alert-success {
              background-color: #d1fae5;
              border-left: 4px solid #059669;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .device-info {
              background-color: #f3f4f6;
              padding: 20px;
              border-radius: 6px;
              margin: 20px 0;
            }
            .info-row {
              margin: 10px 0;
              display: flex;
            }
            .info-label {
              font-weight: bold;
              width: 150px;
              color: #555;
            }
            .info-value {
              color: #333;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐 Smart Access Control</div>
              <div class="title">✓ Quyền truy cập được cấp</div>
            </div>

            <div class="alert-success">
              <strong>Chúc mừng!</strong> Bạn đã được cấp quyền truy cập đến thiết bị.
            </div>

            <div style="font-size: 16px; color: #555; margin-bottom: 20px;">
              Xin chào <strong>${user.fullName}</strong>,
            </div>

            <p>Bạn vừa được cấp quyền truy cập đến thiết bị sau:</p>

            <div class="device-info">
              <div class="info-row">
                <div class="info-label">Thiết bị:</div>
                <div class="info-value">${device.name}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Loại:</div>
                <div class="info-value">${device.deviceType}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Loại truy cập:</div>
                <div class="info-value">${accessTypeLabel}</div>
              </div>
              ${device.location?.address ? `
              <div class="info-row">
                <div class="info-label">Vị trí:</div>
                <div class="info-value">${device.location.address}</div>
              </div>
              ` : ''}
            </div>

            <p>Bạn có thể truy cập thiết bị này ngay bây giờ thông qua ứng dụng hoặc thẻ RFID của mình.</p>

            <div class="footer">
              <p>&copy; 2026 Smart Access Control Platform. All rights reserved.</p>
              <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Bạn đã được cấp quyền truy cập - ${device.name}`,
      html: htmlContent,
    });

    console.log(`✓ Access granted email sent to ${user.email}`);
  } catch (error) {
    console.error('✗ Failed to send access granted email:', error.message);
  }
};

/**
 * Send access revoked email
 * @param {Object} user - User object with email and fullName
 * @param {Object} device - Device object with name
 */
const sendAccessRevokedEmail = async (user, device) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #dc2626;
              margin-bottom: 10px;
            }
            .alert-warning {
              background-color: #fee2e2;
              border-left: 4px solid #dc2626;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .device-info {
              background-color: #f3f4f6;
              padding: 20px;
              border-radius: 6px;
              margin: 20px 0;
            }
            .info-row {
              margin: 10px 0;
              display: flex;
            }
            .info-label {
              font-weight: bold;
              width: 150px;
              color: #555;
            }
            .info-value {
              color: #333;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐 Smart Access Control</div>
              <div class="title">Quyền truy cập đã bị thu hồi</div>
            </div>

            <div class="alert-warning">
              <strong>Thông báo:</strong> Quyền truy cập của bạn đã bị thu hồi.
            </div>

            <div style="font-size: 16px; color: #555; margin-bottom: 20px;">
              Xin chào <strong>${user.fullName}</strong>,
            </div>

            <p>Quyền truy cập của bạn đến thiết bị sau đã bị thu hồi:</p>

            <div class="device-info">
              <div class="info-row">
                <div class="info-label">Thiết bị:</div>
                <div class="info-value">${device.name}</div>
              </div>
            </div>

            <p>Nếu bạn tin rằng đây là một lỗi, vui lòng liên hệ với quản trị viên.</p>

            <div class="footer">
              <p>&copy; 2026 Smart Access Control Platform. All rights reserved.</p>
              <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Quyền truy cập đã bị thu hồi - ${device.name}`,
      html: htmlContent,
    });

    console.log(`✓ Access revoked email sent to ${user.email}`);
  } catch (error) {
    console.error('✗ Failed to send access revoked email:', error.message);
  }
};

/**
 * Send device alert email
 * @param {Object} user - User object with email and fullName
 * @param {Object} device - Device object with name
 * @param {string} alertType - Alert type (offline, tamper, battery_low, malfunction)
 */
const sendDeviceAlertEmail = async (user, device, alertType) => {
  try {
    const alertConfig = {
      offline: {
        title: '⚠️ Thiết bị ngoại tuyến',
        color: '#dc2626',
        bgColor: '#fee2e2',
        message: 'Thiết bị không thể kết nối. Vui lòng kiểm tra kết nối mạng.',
      },
      tamper: {
        title: '🚨 Phát hiện can dụng',
        color: '#dc2626',
        bgColor: '#fee2e2',
        message: 'Phát hiện dấu hiệu can dụng trên thiết bị. Vui lòng kiểm tra ngay.',
      },
      battery_low: {
        title: '⚡ Pin sắp hết',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        message: 'Pin thiết bị sắp hết. Vui lòng thay pin trong thời gian sớm nhất.',
      },
      malfunction: {
        title: '❌ Sự cố thiết bị',
        color: '#dc2626',
        bgColor: '#fee2e2',
        message: 'Phát hiện sự cố trên thiết bị. Vui lòng liên hệ bộ phận kỹ thuật.',
      },
    };

    const alert = alertConfig[alertType] || alertConfig.offline;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: ${alert.color};
              margin-bottom: 10px;
            }
            .alert-box {
              background-color: ${alert.bgColor};
              border-left: 4px solid ${alert.color};
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .device-info {
              background-color: #f3f4f6;
              padding: 20px;
              border-radius: 6px;
              margin: 20px 0;
            }
            .info-row {
              margin: 10px 0;
              display: flex;
            }
            .info-label {
              font-weight: bold;
              width: 150px;
              color: #555;
            }
            .info-value {
              color: #333;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐 Smart Access Control</div>
              <div class="title">${alert.title}</div>
            </div>

            <div class="alert-box">
              <strong>Thông báo cảnh báo:</strong> ${alert.message}
            </div>

            <div style="font-size: 16px; color: #555; margin-bottom: 20px;">
              Xin chào <strong>${user.fullName}</strong>,
            </div>

            <p>Chúng tôi phát hiện sự cố trên thiết bị của bạn:</p>

            <div class="device-info">
              <div class="info-row">
                <div class="info-label">Thiết bị:</div>
                <div class="info-value">${device.name}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Loại cảnh báo:</div>
                <div class="info-value">${alertType}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Thời gian:</div>
                <div class="info-value">${new Date().toLocaleString('vi-VN')}</div>
              </div>
            </div>

            <p>Vui lòng kiểm tra tình trạng thiết bị và thực hiện hành động cần thiết.</p>

            <div class="footer">
              <p>&copy; 2026 Smart Access Control Platform. All rights reserved.</p>
              <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Cảnh báo thiết bị - ${device.name}`,
      html: htmlContent,
    });

    console.log(`✓ Device alert email sent to ${user.email}`);
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
