## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动数据库

```bash
docker compose up -d
```

### 3. 配置 Couchbase

首次安装需要访问 Couchbase Web 控制台：

**访问地址：** http://localhost:8091/

**登录信息：**

- 账号：`Administrator`
- 密码：`password@123`

**创建 Bucket 和数据结构：**

在 Couchbase 控制台中执行以下 SQL++ 查询：

```sql
-- 创建 Scope
CREATE SCOPE `hilton`.`reservations`;
CREATE SCOPE `hilton`.`restaurants`;
CREATE SCOPE `hilton`.`users`;

-- 创建 Collection
CREATE COLLECTION `hilton`.`reservations`.`reservations`;
CREATE COLLECTION `hilton`.`restaurants`.`restaurants`;
CREATE COLLECTION `hilton`.`users`.`users`;

-- 创建主键索引
CREATE PRIMARY INDEX `#primary` ON `hilton`.`restaurants`.`restaurants`;
CREATE PRIMARY INDEX `#primary` ON `hilton`.`reservations`.`reservations`;
CREATE PRIMARY INDEX `#primary` ON `hilton`.`users`.`users`;

-- 创建辅助索引
CREATE INDEX idx_users_email ON `hilton`.`users`.`users`(email);
CREATE INDEX idx_reservations_user_id ON `hilton`.`reservations`.`reservations`(userId);
```

### 4. 初始化数据库

执行种子脚本创建初始数据：

```bash
pnpm seed
```

> 💡 **提示：** 这将在 `apps/api` 目录下运行种子脚本，自动创建初始数据。

### 5. 启动开发服务器

```bash
# 同时启动前后端
pnpm dev

# 或者单独启动
cd apps/api && pnpm dev    # 后端 API
cd apps/web && pnpm dev    # 前端应用
```

## 🔐 默认账户

种子脚本执行后，可以使用以下账户登录系统：

**登录地址：** http://localhost:5173/login

**管理员账户：**

- 用户名：`admin@hilton.com`
- 密码：`Admin@123`

**普通用户账户：**

- 用户名：`guest@hilton.com`
- 密码：`Password@123`

> ⚠️ **注意：**
>
> - 请确保在执行种子脚本前已完成 Couchbase 的配置和环境变量的设置
> - 首次启动可能需要等待 1-2 分钟让所有服务完全启动
> - 如果无法登录，请检查后端 API 是否正常运行

## 🛠️ 可用命令

| 命令                       | 说明                     |
| -------------------------- | ------------------------ |
| `pnpm dev`                 | 同时启动前后端开发服务器 |
| `pnpm build`               | 构建整个项目             |
| `pnpm seed`                | 执行数据库种子脚本       |
| `cd apps/api && pnpm seed` | 单独执行种子脚本         |
