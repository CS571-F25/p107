1. [3/5] Blog Like - When in guest mode, try to like, the prompt "😊 请先注册并登录才能点赞文章！只有注册用户才能表达对文章的喜爱。" is shown on the top of the page, which isnt easy to be seen, 尤其是在文章末尾时页面顶部通常不显示，无法看到。而且提示文字是中文，我们的项目要求是英文展示。建议的修复是出现在like button附近，并替换成英文，检查是否有其他提示也需要相应改成中文。
2. [2/5] AuthorCard - 内部的文章暂时没生成，所以无法访问。暂时不需要修改。
3. [1/5] Admin/Setup - UI 简单错误。暂时不需要修改。
4. [1/5] Blog 1 min read 估算方式检查。暂时不需要修改。
#/editor/new 下没有author选项，新建的post不会有author，在#/admin/dashboard 中对应post 的 author下显示Unknown， 不便于在这里使用Filter by Author。建议的修复是：因为在post页面暂时没有author展示，所以可以考虑暂时使用Role Management中显示的User（注册邮箱）来确定，以前已有的文章全部改为unknown作为保护选项，未来的都是在创建时根据登录状态自动填入。在edit状态下可以编辑修改具体内容，方便对错误或者之前的历史unknown进行修改。
#/admin 中左侧Admin Panel还保留了 已经删掉的 Dashboard，建议的修复是删除。另外Admin Panel底色是灰色的，标题颜色会随黑夜/白天模式变化，目前看白天模式效果不错，但是黑夜模式下这个接近白色的底色显得非常突兀，建议的修复是调整黑夜模式下的底色，以保证标题及跳转连接文字显眼的情况下Admin Panel背景和页面背景接近不突兀。注意，Admin Panel这个部件除了出现在#/admin，在#/admin/posts和#/admin/roles以及#/admin/setup都有出现，修改需要维持一致。

#/admin/roles 参照其样式对