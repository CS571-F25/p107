# 🔧 Debug测试指南

## 🚀 立即测试步骤

### 第一步：检查调试信息
1. 打开无痕窗口
2. 按F12打开开发者工具
3. 访问：`http://localhost:5174/p107/`
4. 点击任意一篇文章链接
5. 查看Console标签中的调试信息

### 第二步：查看调试输出
你应该看到类似以下的调试信息：
```
🔍 getPostBySlug called with slug: xxx
🔍 Executing Firestore query...
🔍 Query result - empty? false
🔍 Post data: {slug: "xxx", status: "published", title: "xxx"}
🔍 Current user ID: null
🔍 Checking permissions...
🔍 canUserViewPost called: {userId: null, postStatus: "published", ...}
🔍 Post is published? true
✅ Post is published, allowing access to everyone
🔍 Can view post: true
```

### 第三步：根据输出诊断问题

#### 如果看到"Query result - empty? true"
**问题：** 文章不存在或slug不匹配
**解决：** 检查文章是否存在，或者使用其他文章链接

#### 如果看到"Post is published? false"
**问题：** 文章状态不是已发布
**解决：** 需要发布文章
1. 登录系统
2. 访问：`http://localhost:5174/p107/#/admin/debug`
3. 找到要发布的文章，点击"Publish"按钮

#### 如果看到Firestore权限错误
**问题：** Firebase规则未正确部署
**解决：** 
1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 确保规则中有：`allow read: if true;` for posts collection
3. 点击发布按钮

#### 如果看到其他错误
**问题：** 可能是代码逻辑问题
**解决：** 请提供完整的Console错误信息

### 第四步：创建测试文章（如果需要）
如果没有已发布的文章：
1. 登录系统
2. 访问：`http://localhost:5174/p107/#/admin/setup`
3. 点击"Create Sample Blog Posts"
4. 然后回到主页测试

### 第五步：手动发布文章（如果需要）
如果文章都是draft状态：
1. 登录系统
2. 访问：`http://localhost:5174/p107/#/admin/debug`
3. 找到状态为"❌ No"的文章
4. 点击"Publish"按钮
5. 刷新主页，用无痕窗口重新测试

## 🐛 常见问题排查

### 问题1：404错误
- 检查URL是否正确
- 确认文章slug存在于数据库中

### 问题2：权限被拒绝
- 确认Firebase规则已更新
- 检查文章是否为已发布状态

### 问题3：空白页面
- 检查网络请求是否成功
- 查看Console中的JavaScript错误

### 问题4：加载中状态持续
- 可能是网络问题
- 刷新页面重试

## 📋 成功标志

修复成功后，你应该看到：
- ✅ 无痕窗口可以访问主页
- ✅ 可以点击进入文章详情页
- ✅ 可以看到完整的文章内容
- ✅ 可以看到点赞数量
- ✅ Console中没有权限错误

请按照这个指南测试，并告诉我Console中显示的具体调试信息！