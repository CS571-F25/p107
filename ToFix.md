1. [3/5] Blog Like - When in guest mode, try to like, the prompt "😊 请先注册并登录才能点赞文章！只有注册用户才能表达对文章的喜爱。" is shown on the top of the page, which isnt easy to be seen, 尤其是在文章末尾时页面顶部通常不显示，无法看到。而且提示文字是中文，我们的项目要求是英文展示。建议的修复是出现在like button附近，并替换成英文，检查是否有其他提示也需要相应改成中文。
2. [2/5] AuthorCard - 内部的文章暂时没生成，所以无法访问。暂时不需要修改。
3. [1/5] Admin/Setup - UI 简单错误。暂时不需要修改。
4. [1/5] Blog 1 min read 估算方式检查。暂时不需要修改。
#/editor/new 下没有author选项，新建的post不会有author，在#/admin/dashboard 中对应post 的 author下显示Unknown， 不便于在这里使用Filter by Author。建议的修复是：因为在post页面暂时没有author展示，所以可以考虑暂时使用Role Management中显示的User（注册邮箱）来确定，以前已有的文章全部改为unknown作为保护选项，未来的都是在创建时根据登录状态自动填入。在edit状态下可以编辑修改具体内容，方便对错误或者之前的历史unknown进行修改。

#/admin/roles 参照其样式对

Post Management 和 Role Management 的结构其实非常相似,可以使用非常相似的样式以提高访问体验。一保持位置和样式一致，这样页面直接切换时用户更舒服。