# 🔧 Guest用户Blog详情页访问修复

## ❌ 问题描述
Guest用户可以看到主页博客列表，但点击进入单独的博客页面时显示"Post Not Found"和"Missing or insufficient permissions"错误。

## ✅ 已应用的修复

### 1. 更新了Firestore规则
- 允许未登录用户读取posts和likes集合
- 保持写入权限需要认证

### 2. 改进了权限检查逻辑
更新了`canUserViewPost`函数以支持新旧数据格式兼容性：

```javascript
// 检查新的status字段和旧的isPublished字段
const isPublished = postData.status === POST_STATUS.PUBLISHED || postData.isPublished === true;
```

## 🚀 测试步骤

### 第一步：确认Firebase规则已部署
1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 确认以下规则已发布：
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

### 第二步：测试Guest访问
1. 打开无痕窗口
2. 访问 `http://localhost:5174/p107/`
3. 点击任意一篇博客文章
4. 应该能够正常查看文章内容

### 第三步：检查数据格式
如果仍有问题，检查数据库中文章的状态字段：

1. 打开Firebase Console → Firestore Database
2. 查看posts集合中的文档
3. 确认文章有以下其中一个字段：
   - `status: "published"` (新格式)
   - `isPublished: true` (旧格式)

## 🐛 调试方法

### 方法1：控制台调试
在浏览器控制台中运行：
```javascript
// 检查当前用户状态
console.log('Auth user:', firebase.auth().currentUser);

// 检查Firestore连接
firebase.firestore().collection('posts').limit(1).get()
  .then(snapshot => console.log('Firestore accessible:', !snapshot.empty))
  .catch(error => console.log('Firestore error:', error));
```

### 方法2：服务器日志
查看开发服务器的控制台输出，寻找：
- Firestore权限错误
- BlogService错误
- 网络请求失败

## 🔧 可能的其他原因

### 1. 缓存问题
- 清除浏览器缓存
- 硬刷新页面 (Ctrl+F5)

### 2. 路由问题
- 确认文章URL使用正确的slug格式
- 检查文章的slug字段是否存在且唯一

### 3. 数据库文章状态
- 可能文章存储为draft状态
- 使用`/admin/debug`页面检查和修改文章状态

## 📋 验证清单

修复后应该满足：
- [ ] Guest用户可以查看主页
- [ ] Guest用户可以点击进入文章详情页
- [ ] Guest用户可以看到文章内容和点赞数
- [ ] Guest用户点击点赞时提示登录
- [ ] 已登录用户所有功能正常

## 🆘 如果仍有问题

1. 检查浏览器开发者工具中的Network标签页
2. 查看是否有403/401错误
3. 检查Console中的JavaScript错误
4. 访问`/admin/debug`页面查看文章状态
5. 手动发布文章：登录后访问debug页面点击"Publish"按钮

修复完成后，Guest用户应该能够正常浏览所有已发布的博客文章！🎉