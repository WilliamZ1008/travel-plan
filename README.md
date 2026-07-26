# 漫行 · 北京周末旅行计划

为周文龙与吴志宏设计的双人旅行计划网页。项目采用 React、TypeScript、
Vite 与 CloudBase Web SDK，可直接构建为纯静态文件并部署到腾讯云
CloudBase 静态网站托管。

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

未填写 CloudBase 环境 ID 时，网页仍可正常运行，修改会保存在浏览器的
`localStorage` 中。填写环境变量后，会使用 CloudBase 文档数据库保存并实时
同步两位同游人的修改。

## CloudBase 环境变量

```dotenv
VITE_CLOUDBASE_ENV_ID=你的环境ID
VITE_CLOUDBASE_REGION=ap-shanghai
VITE_CLOUDBASE_ACCESS_KEY=
VITE_BASE_PATH=./
```

- `VITE_CLOUDBASE_ENV_ID`：必填，在 CloudBase 环境概览中复制。
- `VITE_CLOUDBASE_REGION`：按环境地域填写，上海环境保持默认值即可。
- `VITE_CLOUDBASE_ACCESS_KEY`：可选。使用 Web 安全来源与匿名登录时可留空；
  如果控制台要求 Publishable Key，则填写公开访问 Key，不能填写腾讯云
  `SecretId` 或 `SecretKey`。
- `VITE_BASE_PATH`：保持 `./` 即可同时兼容根目录与 `/travel-plan` 子目录部署。
  如果需要生成绝对资源路径，也可明确填写 `/` 或 `/travel-plan/`。

## CloudBase 控制台准备

1. 在身份认证中启用“匿名登录”。
2. 在安全来源/安全域名中添加静态托管域名和自定义域名；本地开发可添加
   `localhost`。
3. 创建文档数据库集合 `travel_plans`。
4. 为 `travel_plans` 配置以下最小可用安全规则：

```json
{
  "read": "auth != null",
  "write": "auth != null"
}
```

网页首次打开会自动创建固定文档 `beijing-weekend-2026`，后续通过实时监听
同步修改。

> 匿名登录适合这个低风险的双人行程场景，但共享码会出现在前端代码中，
> 不能当作强密码。如果页面包含证件、订单号或精确实时位置，应改用手机号/
> 微信登录，并在安全规则中校验两位成员的用户 UID。

## CloudBase 静态网页部署参数

| 配置项 | 填写内容 |
| --- | --- |
| 项目框架 | 其他 |
| 运行时环境 | Node.js 18 |
| 目标目录 | `./` |
| 安装命令 | `npm ci` |
| 构建命令 | `npm run build` |
| 构建产物目录 | `./dist` |
| 部署路径 | `/travel-plan`（与你当前配置一致） |

项目默认生成相对资源路径，因此部署到 `/travel-plan` 不需要额外修改公共路径。
如果以后把部署路径改成 `/`，同一套配置也可以直接使用。

## 验证

```bash
npm run check
npm test
```

`npm test` 会重新构建并确认产物中只有可被静态托管的 HTML、CSS、JavaScript
与公共资源，不依赖 Node.js 服务端或 `/api` 路由。
