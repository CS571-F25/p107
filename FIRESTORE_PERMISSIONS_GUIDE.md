# Firestore 权限配置指南

## 问题：Missing or insufficient permissions

这个错误表明 Firestore 安全规则阻止了角色初始化操作。以下是解决方案：

## 🚀 快速解决方案（推荐用于开发）

### 方案 1：临时使用测试模式
1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 选择你的项目
3. 进入 Firestore Database
4. 点击 "Rules" 标签
5. 临时使用以下规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

6. 点击 "Publish" 保存规则
7. 现在可以正常使用系统初始化功能

### 方案 2：使用开发规则（更安全）
将项目中的 `firestore-dev.rules` 内容复制到 Firebase Console 的 Rules 中。

## 🔧 详细配置步骤

### 1. 配置 Firestore 安全规则

访问 [Firebase Console](https://console.firebase.google.com/) → 你的项目 → Firestore Database → Rules

粘贴以下开发阶段规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 角色集合
    match /roles/{roleId} {
      allow read, write: if request.auth != null;
    }
    
    // 用户角色集合  
    match /userRoles/{userRoleId} {
      allow read, write: if request.auth != null;
    }
    
    // 博客文章集合
    match /posts/{postId} {
      allow read: if resource.data.status == 'published' || 
                     resource.data.isPublished == true ||
                     request.auth != null;
      allow create, update, delete: if request.auth != null;
    }
    
    // 点赞集合
    match /likes/{likeId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
    
    // 审计日志
    match /auditLogs/{logId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. 发布规则
点击 "Publish" 按钮保存并发布规则。

### 3. 初始化系统
现在可以正常访问 `/admin/setup-system` 进行系统初始化：

1. 点击 "Initialize Roles" - 创建角色体系
2. 点击 "Make Me Owner" - 获得管理员权限  
3. 点击 "Create Sample Posts" - 生成示例内容

## 🔒 生产环境安全规则

初始化完成后，建议使用更严格的生产规则（见 `firestore.rules` 文件）：

主要安全特性：
- 只有管理员可以修改角色
- 用户只能编辑自己的文章
- 未发布文章只有作者和管理员可见
- 审计日志只有管理员可读

## 🐛 常见问题

### Q: 规则更新后仍然报错？
A: 规则更新可能需要几分钟生效，请稍等片刻后重试。

### Q: 怎么知道当前用户的角色？
A: 可以在浏览器开发者工具的 Console 中运行：
```javascript
// 方法 1: 在控制台中直接访问（如果变量已经导出到 window）
if (window.roleService) {
  window.roleService.getUserRoles(firebase.auth().currentUser.uid).then(console.log);
}

// 方法 2: 在 React 组件中查看
// 打开任何页面的 React 开发者工具，找到使用 useUserPermissions 的组件

// 方法 3: 临时在组件中添加 console.log
// 在任何组件中添加：
// const { level, isOwner, isAdmin } = useUserPermissions();
// console.log('User permissions:', { level, isOwner, isAdmin });
```

### Q: 如何重置整个系统？
A: 删除 Firestore 中的 `roles` 和 `userRoles` 集合，然后重新初始化。

## 📝 本地开发建议

1. **开发阶段**: 使用宽松的规则方便调试
2. **测试阶段**: 使用接近生产的规则
3. **生产环境**: 使用严格的安全规则

## 🚨 安全提醒

- 开发规则仅用于开发环境
- 生产环境务必使用严格的安全规则
- 定期审查和更新安全规则
- 监控异常访问模式