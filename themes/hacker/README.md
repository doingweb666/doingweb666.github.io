# HACKER — 黑客终端风 Hexo 主题

深色终端 / 字符雨 / CRT 扫描线 / 电光蓝与冰蓝，纯本地资源，无外部字体或 CDN 依赖。

## 启用

站点 `_config.yml`：

```yaml
theme: hacker
```

主题自身的文案、菜单、终端内容都在 `themes/hacker/_config.yml` 里：

- `identity`：首页大标题、角色、终端提示符
- `terminal.boot / profile`：终端启动日志与 `whoami` 输出
- `menu`：顶部导航
- `matrix`：字符雨开关、透明度和速度
- `footer`：页脚签名

## 特性

- Canvas 字符雨（跟随 `prefers-reduced-motion`，页脚可随时关闭并记忆偏好）
- CRT 扫描线、暗角与轻微闪烁
- 首页终端打字机效果（`whoami`）
- 标题 glitch 故障效果
- 文章阅读进度条、悬浮目录、代码复制按钮
- 归档 / 标签 / 404 页面
- 响应式布局，移动端汉堡菜单

## 约定

- 文章摘要优先读取 front matter 的 `description`，否则取正文第一段
- 需要目录时直接用 Markdown 二级 / 三级标题，主题会自动生成 TOC
- 代码块使用 Hexo 默认 highlight.js 输出，无需额外插件

## 文件

```
layout/           EJS 模板
source/css/       样式
source/js/        matrix + 交互
source/img/       favicon
```
