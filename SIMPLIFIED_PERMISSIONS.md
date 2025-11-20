# 简化权限系统架构 v2

## 🎯 权限级别 (连续数字)

| 角色 | 级别 | 描述 | 权限 |
|------|------|------|------|
| **Owner** | 0 | 系统拥有者 | 全部权限 (`*`) |
| **Admin** | 1 | 管理员 | 文章管理、用户管理 |
| **User** | 2 | 注册用户 | 阅读、点赞、评论 |
| **Guest** | 3 | 访客 | 仅阅读已发布内容 |

## 🔒 安全控制

### 初始化安全
- 只有 `src/config/security.js` 中预设的邮箱可以执行系统初始化
- 防止任意用户获得 Owner 权限

### 自动角色分配
- 新用户注册/登录时自动获得 **User (2)** 角色
- 未登录访客自动视为 **Guest (3)**

## 🌊 权限流程

### 首次设置
1. 在 `src/config/security.js` 中配置你的邮箱
2. 你登录后访问 `/admin/setup-system`
3. 完成一次性初始化，成为 Owner

### 日常管理
1. **Owner**: 使用 `/dashboard` 管理文章和分配角色
2. **Admin**: 使用 `/dashboard` 管理文章
3. **User**: 阅读、点赞、评论文章
4. **Guest**: 仅阅读已发布文章

## 📊 页面访问权限

| 页面 | Owner | Admin | User | Guest |
|------|--------|-------|------|-------|
| `/` (主页) | ✅ | ✅ | ✅ | ✅ |
| `/blog/:slug` | ✅ | ✅ | ✅ | ✅ (仅已发布) |
| `/dashboard` | ✅ | ✅ | ❌ | ❌ |
| `/editor/*` | ✅ | ✅ | ❌ | ❌ |
| `/admin/setup-system` | ✅ (仅授权邮箱) | ❌ | ❌ | ❌ |

## 🛠 管理功能

### Dashboard 功能分布
- **文章管理**: Owner, Admin 可访问
- **角色管理**: 仅 Owner 可访问

### 角色管理
- Owner 可以将任何用户的角色改为 Admin 或 User
- 每个用户必须拥有且仅拥有一个角色
- Owner 无法修改自己的角色（保持系统稳定）
- Admin 无法访问角色管理
- 不存在"无角色"状态，确保系统稳定运行

## 🔧 技术实现

### 权限检查逻辑
```javascript
// 管理员检查
canAccessAdmin = level <= 1  // Owner(0) 或 Admin(1)

// Owner 检查  
isOwner = level === 0        // 仅 Owner(0)

// 内容权限
canRead = level <= 3         // 所有人
canWrite = level <= 1        // Owner, Admin
```

### 自动角色分配
- `AuthProvider.jsx` 在用户登录时自动调用 `assignDefaultRole()`
- 确保每个登录用户都有适当的角色

## 📝 配置文件

### `src/config/security.js`
```javascript
AUTHORIZED_OWNERS: [
  'your-email@example.com',  // 修改为你的邮箱
]
```

这个简化的权限系统删除了 Author 角色，使用连续的 0,1,2,3 级别，更直观易懂。