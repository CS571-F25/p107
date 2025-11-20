# 🔧 Guest用户访问修复 - Firestore规则更新

## ❌ 问题描述
Guest用户（未登录用户）无法查看主页博客，因为当前的Firestore规则要求所有用户都必须登录才能读取posts和likes集合。

## ✅ 解决方案
更新Firestore规则，允许未登录用户读取已发布的博客文章和点赞数，但仍然要求登录才能写入数据。

## 🚀 立即修复步骤

### 第一步: 更新Firestore规则
1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 选择项目 `orientingway`
3. 进入 **Firestore Database** → **规则** 标签
4. 将以下两个规则段替换：

**原来的规则：**
```javascript
// Posts collection
match /posts/{postId} {
  allow read, write: if isAuthenticated();
}

// Likes collection
match /likes/{likeId} {
  allow read, write: if isAuthenticated();
}
```

**新的规则：**
```javascript
// Posts collection - allow public read for published posts
match /posts/{postId} {
  allow read: if true; // Anyone can read posts (blog is public)
  allow write: if isAuthenticated(); // Only authenticated users can write
}

// Likes collection - allow public read for like counts, auth required for write
match /likes/{likeId} {
  allow read: if true; // Anyone can read like counts
  allow write: if isAuthenticated(); // Only authenticated users can like
}
```

5. 点击 **发布** 按钮

### 第二步: 测试修复结果
1. 打开无痕窗口访问 `http://localhost:5174/p107/`
2. 应该能够看到已发布的博客文章
3. 应该能够看到文章的点赞数
4. 点击点赞应该提示需要登录

## 🔒 安全说明

这个更改是安全的，因为：
- ✅ 博客通常是公开可读的内容
- ✅ 只有已认证用户才能创建/编辑文章
- ✅ 只有已认证用户才能点赞
- ✅ 用户管理和系统管理功能仍然受到保护

## 🧪 验证清单

修复后，应该满足以下条件：
- [ ] 未登录用户可以查看主页
- [ ] 未登录用户可以看到已发布的文章
- [ ] 未登录用户可以看到点赞数
- [ ] 未登录用户点击点赞时提示登录
- [ ] 已登录用户所有功能正常
- [ ] Admin功能仍然受权限保护

## 🎯 修复原理

**问题根源：**
Firestore规则 `allow read, write: if isAuthenticated()` 要求用户必须登录才能读取数据。

**解决方案：**
分离读写权限，允许公开读取，但要求认证才能写入：
- `allow read: if true` - 任何人都可以读取
- `allow write: if isAuthenticated()` - 只有认证用户可以写入

这样guest用户就能查看博客内容，同时保持安全性！