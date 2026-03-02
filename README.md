# Smart Access Control Platform

Nền tảng quản lý truy cập thông minh cho các tòa nhà, văn phòng và cơ sở được tích hợp với IoT và MQTT.

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
- [Cấu hình môi trường](#cấu-hình-môi-trường)
- [Hướng dẫn tạo tài khoản Mailtrap](#hướng-dẫn-tạo-tài-khoản-mailtrap)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [MQTT Topics Convention](#mqtt-topics-convention)
- [Hướng dẫn test với Postman](#hướng-dẫn-test-với-postman)

## 🎯 Giới thiệu

Smart Access Control Platform là một giải pháp quản lý truy cập hiện đại cho các tòa nhà, văn phòng và cơ sở. Nền tảng này cho phép quản lý truy cập từ xa, theo dõi nhật ký truy cập, cấp phép người dùng linh hoạt, và nhận cảnh báo thời gian thực thông qua tích hợp IoT/MQTT.

**Phiên bản hiện tại:** 1.0.0  
**Năm phát hành:** 2026

## ✨ Tính năng chính

### Quản lý người dùng
- ✅ Đăng ký, đăng nhập, xác thực email
- ✅ Quản lý hồ sơ cá nhân
- ✅ Đổi mật khẩu
- ✅ Khóa tài khoản sau 5 lần đăng nhập sai
- ✅ Quản lý vai trò (Owner, Member, Admin)

### Quản lý thiết bị
- ✅ Tạo, chỉnh sửa, xóa thiết bị
- ✅ Hỗ trợ nhiều loại thiết bị (cửa, cổng, tủ)
- ✅ Monitoring trạng thái thiết bị real-time
- ✅ Điều khiển thiết bị từ xa (mở/khóa)
- ✅ Tự động phát hiện thiết bị offline khi mất tín hiệu heartbeat

### Quản lý quyền truy cập
- ✅ Cấp phép truy cập vĩnh viễn, theo lịch, một lần
- ✅ Lập lịch truy cập theo ngày và giờ
- ✅ Thu hồi quyền truy cập
- ✅ Kiểm tra quyền truy cập real-time

### Theo dõi và báo cáo
- ✅ Ghi nhật ký tất cả hoạt động truy cập
- ✅ Lọc và tìm kiếm theo thiết bị, người dùng, ngày
- ✅ Thống kê chi tiết

### Thông báo
- ✅ Thông báo truy cập real-time
- ✅ Cảnh báo sự cố thiết bị
- ✅ Email thông báo
- ✅ Quản lý trạng thái đã đọc

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication token
- **Bcryptjs** - Password hashing
- **MQTT** - IoT protocol
- **Nodemailer** - Email service
- **Cors** - Cross-origin support
- **Helmet** - Security headers
- **Morgan** - Request logging

### Công cụ phát triển
- **Nodemon** - Development server with auto-reload
- **Dotenv** - Environment configuration

## 📁 Cấu trúc thư mục

```
smart-access-control-platform/
├── src/
│   ├── config/                 # Cấu hình ứng dụng
│   │   ├── db.js              # MongoDB connection
│   │   ├── mailtrap.js        # Email configuration
│   │   └── mqtt.js            # MQTT configuration
│   ├── controllers/           # Route handlers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── device.controller.js
│   │   ├── access.controller.js
│   │   ├── log.controller.js
│   │   └── notification.controller.js
│   ├── models/               # Database schemas
│   │   ├── User.js
│   │   ├── Device.js
│   │   ├── AccessPermission.js
│   │   ├── AccessLog.js
│   │   ├── Notification.js
│   │   ├── EmailVerificationToken.js
│   │   ├── RefreshToken.js
│   │   └── DeviceGroup.js
│   ├── middlewares/          # Express middlewares
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── validate.middleware.js
│   │   ├── validateQuery.middleware.js
│   │   └── error.middleware.js
│   ├── routes/               # API routes
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── device.routes.js
│   │   ├── access.routes.js
│   │   ├── log.routes.js
│   │   └── notification.routes.js
│   ├── services/             # Business logic
│   │   ├── auth.service.js
│   │   ├── email.service.js
│   │   └── mqtt.service.js
│   ├── utils/                # Utilities
│   │   ├── ApiError.js
│   │   ├── catchAsync.js
│   │   └── constants.js
│   ├── app.js                # Express app setup
│   └── server.js             # Server entry point
├── .env.example              # Environment variables example
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies
└── README.md               # This file
```

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js v14+ hoặc cao hơn
- MongoDB v4.4+ hoặc cao hơn
- MQTT Broker (ví dụ: Mosquitto)
- Postman (để test API)

### Bước 1: Clone Repository

```bash
git clone https://github.com/yourusername/smart-access-control-platform.git
cd smart-access-control-platform
```

### Bước 2: Cài đặt Dependencies

```bash
npm install
```

### Bước 3: Cấu hình Environment

```bash
# Copy file mẫu
cp .env.example .env

# Chỉnh sửa .env với thông tin của bạn
# Xem phần "Cấu hình môi trường" dưới đây
```

### Bước 4: Chạy MongoDB

```bash
# Nếu MongoDB đã được cài đặt:
mongod

# Hoặc sử dụng MongoDB Atlas (cloud)
# Lấy connection string từ https://www.mongodb.com/cloud/atlas
```

### Bước 5: Chạy MQTT Broker (tuỳ chọn)

```bash
# Cài đặt Mosquitto: https://mosquitto.org/download/
# Chạy Mosquitto
mosquitto

# Hoặc sử dụng Docker
docker run -it -p 1883:1883 eclipse-mosquitto
```

### Bước 6: Chạy ứng dụng

```bash
# Development (với auto-reload)
npm run dev

# Production
npm start

# Kiểm tra server
curl http://localhost:3000/api/health
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "message": "Smart Access Control Platform is running",
  "timestamp": "2026-02-25T10:30:00.000Z"
}
```

## 📝 Cấu hình môi trường

Tạo file `.env` trong thư mục root và thêm các biến sau:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/smart-access-control

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Email Configuration (Mailtrap)
MAILTRAP_HOST=send.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_username
MAILTRAP_PASS=your_mailtrap_password
EMAIL_FROM=noreply@smartaccesscontrol.com

# MQTT Configuration
MQTT_BROKER_URL=mqtt://localhost
MQTT_PORT=1883
MQTT_USERNAME=optional_username
MQTT_PASSWORD=optional_password
MQTT_CLIENT_ID=smart-access-control-platform

# Device Offline Detection
DEVICE_OFFLINE_THRESHOLD=120000
DEVICE_OFFLINE_CHECK_FREQ=60000

# Application URLs
APP_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
```

### Chú ý:
- **JWT_SECRET**: Thay đổi giá trị này trong production
- **MONGODB_URI**: 
  - Local: `mongodb://localhost:27017/smart-access-control`
  - Atlas: `mongodb+srv://user:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- **MAILTRAP_***: Xem phần dưới để tạo tài khoản

## 📧 Hướng dẫn tạo tài khoản Mailtrap

Mailtrap là dịch vụ giả lập SMTP để test email trong development.

### Bước 1: Tạo tài khoản
1. Truy cập https://mailtrap.io
2. Bấm "Sign Up"
3. Điền email và mật khẩu
4. Xác thực email

### Bước 2: Lấy thông tin SMTP
1. Đăng nhập vào Mailtrap
2. Chọn "Inboxes" → "Demo Inbox"
3. Chọn tab "SMTP Settings"
4. Chọn Node.js từ dropdown

### Bước 3: Sao chép thông tin
Bạn sẽ thấy:
```
Host: send.mailtrap.io
Port: 2525 (hoặc 465 cho TLS)
Username: [your_username]
Password: [your_password]
```

### Bước 4: Cập nhật .env
```env
MAILTRAP_HOST=send.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_username_here
MAILTRAP_PASS=your_password_here
EMAIL_FROM=noreply@smartaccesscontrol.com
```

### Bước 5: Test
Gửi email qua API và kiểm tra trình inbox của Mailtrap:
https://mailtrap.io/inboxes

---

## 🌐 API Endpoints

### Authentication Routes

| Method | Endpoint | Mô tả | Auth | Body |
|--------|----------|-------|------|------|
| POST | `/api/auth/register` | Đăng ký tài khoản | ❌ | `{email, password, fullName, phone?}` |
| GET | `/api/auth/verify-email?token=...` | Xác thực email | ❌ | - |
| POST | `/api/auth/login` | Đăng nhập | ❌ | `{email, password}` |
| POST | `/api/auth/refresh-token` | Làm mới access token | ❌ | `{refreshToken}` |
| POST | `/api/auth/logout` | Đăng xuất | ✅ | `{refreshToken?}` |

### User Routes

| Method | Endpoint | Mô tả | Auth | Role | Query/Body |
|--------|----------|-------|------|------|-----------|
| GET | `/api/users/profile` | Lấy hồ sơ cá nhân | ✅ | - | - |
| PUT | `/api/users/profile` | Cập nhật hồ sơ | ✅ | - | `{fullName?, phone?, avatar?}` |
| PUT | `/api/users/change-password` | Đổi mật khẩu | ✅ | - | `{currentPassword, newPassword}` |
| GET | `/api/users` | Lấy tất cả người dùng | ✅ | admin | `?page=1&limit=10&search=email` |
| PUT | `/api/users/:id/toggle-active` | Kích hoạt/vô hiệu hóa người dùng | ✅ | admin | - |

### Device Routes

| Method | Endpoint | Mô tả | Auth | Role | Query/Body |
|--------|----------|-------|------|------|-----------|
| POST | `/api/devices` | Tạo thiết bị mới | ✅ | owner,admin | `{name, deviceType, serialNumber, firmwareVersion?, location?}` |
| GET | `/api/devices` | Lấy các thiết bị | ✅ | - | `?page=1&limit=10&deviceType=&status=` |
| GET | `/api/devices/:id` | Lấy chi tiết thiết bị | ✅ | - | - |
| PUT | `/api/devices/:id` | Cập nhật thiết bị | ✅ | - | `{name?, deviceType?, firmwareVersion?, location?, isEnabled?}` |
| DELETE | `/api/devices/:id` | Xóa thiết bị | ✅ | - | - |
| POST | `/api/devices/:id/command` | Gửi lệnh đến thiết bị | ✅ | - | `{action: "unlock"/"lock"}` |

### Access Control Routes

| Method | Endpoint | Mô tả | Auth | Query/Body |
|--------|----------|-------|------|-----------|
| POST | `/api/access/grant` | Cấp quyền truy cập | ✅ | `{userId, deviceId, accessType, schedule?}` |
| PUT | `/api/access/revoke/:id` | Thu hồi quyền truy cập | ✅ | - |
| GET | `/api/access/device/:deviceId` | Lấy quyền truy cập của thiết bị | ✅ | `?page=1&limit=10` |
| GET | `/api/access/user/:userId` | Lấy quyền truy cập của người dùng | ✅ | `?page=1&limit=10` |
| GET | `/api/access/check/:deviceId` | Kiểm tra quyền truy cập | ✅ | - |

### Access Log Routes

| Method | Endpoint | Mô tả | Auth | Role | Query |
|--------|----------|-------|------|------|-------|
| GET | `/api/logs` | Lấy tất cả nhật ký | ✅ | admin | `?page=1&limit=20&deviceId=&userId=&action=&status=&startDate=&endDate=` |
| GET | `/api/logs/device/:deviceId` | Lấy nhật ký thiết bị | ✅ | - | `?page=1&limit=20&action=&status=&startDate=&endDate=` |
| GET | `/api/logs/user/:userId` | Lấy nhật ký người dùng | ✅ | - | `?page=1&limit=20&action=&status=&startDate=&endDate=` |

### Notification Routes

| Method | Endpoint | Mô tả | Auth | Query/Body |
|--------|----------|-------|------|-----------|
| GET | `/api/notifications` | Lấy thông báo | ✅ | `?page=1&limit=10&isRead=false` |
| PUT | `/api/notifications/:id/read` | Đánh dấu đã đọc | ✅ | - |
| PUT | `/api/notifications/read-all` | Đánh dấu tất cả đã đọc | ✅ | - |
| GET | `/api/notifications/unread-count` | Lấy số thông báo chưa đọc | ✅ | - |

### Health Check

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/health` | Kiểm tra trạng thái server | ❌ |

---

## 💾 Database Schema

### User
Lưu trữ thông tin người dùng, vai trò, và trạng thái tài khoản.

```javascript
{
  email: String (unique, lowercase),
  password: String (hashed, select:false),
  fullName: String,
  phone: String,
  avatar: String,
  role: "owner" | "member" | "admin",
  isVerified: Boolean,
  isActive: Boolean,
  failedLoginAttempts: Number,
  lockUntil: Date,
  lastLoginAt: Date,
  lastLoginIP: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Device
Lưu trữ thông tin thiết bị điều khiển truy cập.

```javascript
{
  name: String,
  deviceType: "door" | "gate" | "locker",
  serialNumber: String (unique),
  firmwareVersion: String,
  mqttTopic: String,
  ownerId: ObjectId (ref: User),
  location: {
    address: String,
    description: String,
    coordinates: { lat: Number, lng: Number }
  },
  status: "online" | "offline",
  currentState: "locked" | "unlocked",
  lastHeartbeat: Date,
  isEnabled: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### AccessPermission
Lưu trữ quyền truy cập của người dùng đến thiết bị.

```javascript
{
  userId: ObjectId (ref: User),
  deviceId: ObjectId (ref: Device),
  accessType: "permanent" | "scheduled" | "one_time",
  schedule: {
    startTime: Date,
    endTime: Date,
    daysOfWeek: [Number], // 0-6 (Sunday-Saturday)
    timeOfDay: { from: String, to: String } // HH:MM format
  },
  isRevoked: Boolean,
  revokedAt: Date,
  revokedBy: ObjectId (ref: User),
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### AccessLog
Ghi nhật ký tất cả hoạt động truy cập.

```javascript
{
  deviceId: ObjectId (ref: Device),
  userId: ObjectId (ref: User),
  action: "unlock" | "lock" | "access_denied",
  method: "app" | "rfid" | "keypad" | "auto",
  status: "success" | "failed",
  failReason: String,
  metadata: {
    ipAddress: String,
    userAgent: String,
    rfidCardId: String
  },
  timestamp: Date
}
```

### Notification
Lưu trữ thông báo cho người dùng.

```javascript
{
  userId: ObjectId (ref: User),
  type: "access_alert" | "device_offline" | "permission_granted" | "permission_revoked",
  title: String,
  message: String,
  relatedDevice: ObjectId (ref: Device),
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### EmailVerificationToken
Lưu trữ token xác thực email (tự động xóa sau hết hạn).

```javascript
{
  userId: ObjectId (ref: User),
  token: String (unique),
  expiresAt: Date (TTL: 24h)
}
```

### RefreshToken
Lưu trữ refresh token cho authentication.

```javascript
{
  userId: ObjectId (ref: User),
  token: String,
  expiresAt: Date (TTL: 7d),
  revoked: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### DeviceGroup
Lưu trữ nhóm các thiết bị.

```javascript
{
  name: String,
  ownerId: ObjectId (ref: User),
  deviceIds: [ObjectId] (ref: Device),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📡 MQTT Topics Convention

Các thiết bị giao tiếp với server thông qua MQTT topics theo convention:

### Device → Server (Inbound)

**Status Updates:**
```
devices/{serialNumber}/status
```
Payload:
```json
{
  "state": "locked|unlocked",
  "timestamp": 1645753800000
}
```

**Heartbeat:**
```
devices/{serialNumber}/heartbeat
```
Payload:
```json
{
  "timestamp": 1645753800000,
  "signal_strength": -65
}
```

### Server → Device (Outbound)

**Commands:**
```
devices/{serialNumber}/command
```
Payload:
```json
{
  "action": "unlock|lock",
  "timestamp": 1645753800000
}
```

### Ví dụ
- Topic: `devices/DOOR-001/status`
- Topic: `devices/DOOR-001/heartbeat`
- Topic: `devices/DOOR-001/command`

### Cơ chế phát hiện thiết bị Offline

Server tự động kiểm tra định kỳ trạng thái heartbeat của tất cả thiết bị:

- Nếu thiết bị đang `online` nhưng `lastHeartbeat` vượt quá ngưỡng (`DEVICE_OFFLINE_THRESHOLD`, mặc định 2 phút), server sẽ tự động cập nhật trạng thái thành `offline`
- Tạo notification cảnh báo cho owner của thiết bị (type: `device_offline`)
- Tần suất kiểm tra được cấu hình qua `DEVICE_OFFLINE_CHECK_FREQ` (mặc định 60 giây)

**Cấu hình .env:**
```env
# Thời gian (ms) không nhận heartbeat thì coi là offline (mặc định: 120000 = 2 phút)
DEVICE_OFFLINE_THRESHOLD=120000

# Tần suất quét thiết bị offline (ms) (mặc định: 60000 = 1 phút)
DEVICE_OFFLINE_CHECK_FREQ=60000
```

---

## 🧪 Hướng dẫn test với Postman

### Bước 1: Tải Postman

Tải xuống Postman từ https://www.postman.com/downloads/

### Bước 2: Tạo Environment

1. Bấm "Environments" ở sidebar trái
2. Bấm "+" để tạo environment mới
3. Đặt tên "Smart Access Control"
4. Thêm variables:

```
VARIABLE         | VALUE
base_url         | http://localhost:3000/api
access_token     | (để trống - sẽ được set sau khi login)
refresh_token    | (để trống - sẽ được set sau khi login)
user_id          | (để trống)
device_id        | (để trống)
```

5. Bấm "Save"

### Bước 3: Test Authentication

#### Test 1: Register
```
Method: POST
URL: {{base_url}}/auth/register
Body (JSON):
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "0123456789"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "userId": "....",
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}
```

#### Test 2: Verify Email
```
Method: GET
URL: {{base_url}}/auth/verify-email?token=TOKEN_FROM_EMAIL
```

**Note:** Token cần được copy từ email mà Mailtrap gửi

#### Test 3: Login
```
Method: POST
URL: {{base_url}}/auth/login
Body (JSON):
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "abc123...",
    "user": {
      "userId": "...",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "member",
      "isVerified": true,
      "isActive": true
    }
  }
}
```

**Save tokens:** Copy `accessToken` và `refreshToken` vào environment variables

### Bước 4: Test User Endpoints

#### Test 1: Get Profile
```
Method: GET
URL: {{base_url}}/users/profile
Headers:
  Authorization: Bearer {{access_token}}
```

#### Test 2: Update Profile
```
Method: PUT
URL: {{base_url}}/users/profile
Headers:
  Authorization: Bearer {{access_token}}
Body (JSON):
{
  "fullName": "John Smith",
  "phone": "0987654321"
}
```

### Bước 5: Test Device Endpoints

#### Test 1: Create Device
```
Method: POST
URL: {{base_url}}/devices
Headers:
  Authorization: Bearer {{access_token}}
Body (JSON):
{
  "name": "Front Door",
  "deviceType": "door",
  "serialNumber": "DOOR-001",
  "firmwareVersion": "v1.0.0",
  "location": {
    "address": "Building A, Floor 1"
  }
}
```

**Save device_id:** Copy returned `_id` vào environment variable

#### Test 2: Get All Devices
```
Method: GET
URL: {{base_url}}/devices?page=1&limit=10
Headers:
  Authorization: Bearer {{access_token}}
```

#### Test 3: Get Device Details
```
Method: GET
URL: {{base_url}}/devices/{{device_id}}
Headers:
  Authorization: Bearer {{access_token}}
```

#### Test 4: Update Device
```
Method: PUT
URL: {{base_url}}/devices/{{device_id}}
Headers:
  Authorization: Bearer {{access_token}}
Body (JSON):
{
  "name": "Main Entrance Door",
  "isEnabled": true
}
```

#### Test 5: Send Command
```
Method: POST
URL: {{base_url}}/devices/{{device_id}}/command
Headers:
  Authorization: Bearer {{access_token}}
Body (JSON):
{
  "action": "unlock"
}
```

### Bước 6: Test Access Control

#### Test 1: Grant Access
```
Method: POST
URL: {{base_url}}/access/grant
Headers:
  Authorization: Bearer {{access_token}}
Body (JSON):
{
  "userId": "{{user_id_to_grant}}",
  "deviceId": "{{device_id}}",
  "accessType": "permanent"
}
```

#### Test 2: Check Access
```
Method: GET
URL: {{base_url}}/access/check/{{device_id}}
Headers:
  Authorization: Bearer {{access_token}}
```

### Bước 7: Test Logs & Notifications

#### Get Access Logs
```
Method: GET
URL: {{base_url}}/logs/device/{{device_id}}?page=1&limit=10
Headers:
  Authorization: Bearer {{access_token}}
```

#### Get Notifications
```
Method: GET
URL: {{base_url}}/notifications?page=1&limit=10
Headers:
  Authorization: Bearer {{access_token}}
```

#### Mark Notification as Read
```
Method: PUT
URL: {{base_url}}/notifications/{{notification_id}}/read
Headers:
  Authorization: Bearer {{access_token}}
```

### Bước 8: Import Collection (Optional)

1. Bấm "Import" trong Postman
2. Chọn "Link" tab
3. Paste link (nếu có export)
4. Hoặc tạo thủ công các request trên

### Tips
- Luôn set `Authorization: Bearer {{access_token}}` header
- Copy token từ response JSON vào environment variable
- Kiểm tra Mailtrap inbox cho email verification
- Kiểm tra server logs khi có lỗi
- Dùng `console.log()` ở server để debug

---

## 🔒 Bảo mật

- Mật khẩu được hash bằng bcryptjs (12 rounds)
- JWT tokens có thời hạn tính theo giờ
- Rate limiting áp dụng cho tất cả API
- Helmet.js bảo vệ các header
- CORS chỉ cho phép từ Client URL

## 📞 Hỗ trợ

Nếu gặp vấn đề:

1. Kiểm tra file `.env`
2. Kiểm tra MongoDB có đang chạy không
3. Kiểm tra server logs
4. Kiểm tra Mailtrap dashboard
5. Kiểm tra MQTT broker connection

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết

---

**Phiên bản:** 1.0.0  
**Cập nhật lần cuối:** 2026-02-25  
**Tác giả:** Your Team
