# 徐俊个人学术主页

面向教育技术学博士申请的个人学术主页，包含：

- 教育人工智能、自我调节学习与学习分析研究主线
- 已发表论文的站内 PDF 阅读与 DOI 链接
- 在研论文的同行评审状态证明
- 科研项目职责与截图证据
- 教育智能体实验平台与研究能力
- 私密留言、访问记录与密码保护后台

## 本地预览

```powershell
node scripts/mock-server.mjs
```

访问 `http://127.0.0.1:4173/`，后台为 `http://127.0.0.1:4173/admin.html`。

## 部署

- 静态站点：GitHub Pages，仓库 `bigWhiteTofu/xujun1569`
- API：Cloudflare Worker + D1（通过 Sites 托管）
- API 域名：`https://xujun-academic-api.xdx555.chatgpt.site`

管理密码通过 Worker secret 配置，不写入前端代码。
