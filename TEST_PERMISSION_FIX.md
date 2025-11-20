# 权限系统修复测试指南 v2

## � 主要问题和修复

### 问题1: Setup后显示level 2而不是owner(0)
- **症状**: Setup完成跳转dashboard显示"Current level: 2 | Required: Admin (≤1) or Owner (0)"
- **原因**: getUserLevel函数在找不到角色时会自动调用assignDefaultRole，可能覆盖刚分配的owner角色
- **修复**: 移除getUserLevel中的自动角色分配逻辑，避免冲突

### 问题2: Dashboard显示"Failed to load users"
- **症状**: 角色管理页面无法加载用户列表
- **原因**: 尝试访问可能不存在的userInfo集合
- **修复**: 添加错误处理，即使userInfo集合不存在也能正常显示用户列表

## 🧪 调试和测试步骤

### 第一步: 清理测试环境
```javascript
// 在浏览器console中执行
import { cleanupDuplicateRoles } from './src/services/roleService.js'
await cleanupDuplicateRoles()
```

### 第二步: 重新执行Setup
1. 访问 `/admin/setup-system`
2. 点击"Complete System Setup"
3. **观察控制台日志**，应该看到：
   ```
   🔄 Starting exclusive owner assignment for user: [userId]
   📋 Current roles before assignment: [...]
   📋 New roles after assignment: ["owner"]
   🔢 New user level: 0
   ✅ Successfully made current user the exclusive owner
   ```

### 第三步: 验证Setup结果
1. Setup完成后等待自动跳转
2. Dashboard应该正常显示，不显示权限错误
3. 检查console是否有"🔍 getUserLevel Debug"日志显示level: 0

### 第四步: 测试角色管理
1. 在Dashboard中点击"Role Management"标签
2. 应该看到当前用户被列为"Owner"角色
3. 用户列表应该正常显示，不显示"Failed to load users"

## 🔍 调试日志关键点

### Setup过程日志
```
🔄 Initializing role system...
� Assigning owner role...
🔄 Starting exclusive owner assignment for user: [userId]
🗑️ Removed X existing roles for user [userId]
� New roles after assignment: ["owner"]
🔢 New user level: 0
� Verifying role assignment...
✅ Successfully made current user the exclusive owner
🎉 System setup complete! You are now the owner.
```

### 权限检查日志
```
� getUserLevel Debug: {
  userId: "[userId]",
  userRoles: [{ roleId: "owner", level: 0, name: "Owner" }],
  validLevels: [0],
  minLevel: 0
}
🔍 canAccessAdmin Debug: { userId: "[userId]", level: 0, hasAdmin: true, threshold: 1 }
```

## ⚠️ 如果仍有问题

### 手动验证Firestore数据
1. 访问Firebase Console
2. 检查`userRoles`集合中当前用户是否有`roleId: "owner"`记录
3. 检查`roles`集合中是否有`id: "owner"`的角色定义

### 强制刷新权限
如果Setup成功但Dashboard仍显示权限不足：
1. 完全刷新页面 (Ctrl+F5)
2. 或者等待3-5秒让权限hooks重新查询
3. 检查Network tab是否有Firestore访问错误

### 清理和重置
如果问题持续：
1. 在Firebase Console中删除`userRoles`和`roles`集合的所有文档
2. 重新执行Setup流程
3. 注意观察console日志确保每一步都成功

## ✅ 预期最终状态
- ✅ Setup完成后用户level为0 (Owner)
- ✅ Dashboard正常访问，无权限错误
- ✅ 角色管理显示当前用户为Owner
- ✅ 用户列表正常加载，显示真实邮箱和ID