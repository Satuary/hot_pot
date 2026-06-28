# 火锅匹配应用 - UI 重构计划

## 项目概述
基于 hotpot_ui 文件夹中的 56 张 UI 设计图，重新实现火锅匹配小程序应用。

## 技术栈
- **框架**: uni-app (Vue 3 + TypeScript)
- **UI 组件**: NutUI + 自定义组件
- **状态管理**: Vue 3 Composition API + Reactive Store
- **样式**: SCSS
- **平台**: 微信小程序 (主要)，支持多端

## UI 设计分析

### 设计风格
- **主色调**: 火锅橙 (#FF6B3D)
- **背景**: 深色主题 (#1A1A1A)
- **辅助色**: 金黄色 (#FFB946)，红色强调 (#FF4D4F)
- **圆角**: 大圆角设计 (16-32rpx)
- **渐变**: 橙红渐变按钮

### 页面模块 (根据 UI 图推测)

#### 1. 认证流程 (iPhone 225-231)
- 启动页/欢迎页
- 微信登录
- 手机号登录
- 隐私协议
- 个人信息设置

#### 2. 主界面 Tab Bar (iPhone 240-250)
- **匹配 Tab**: 主要功能入口
- **查看 Tab**: 订单和匹配历史
- **我的 Tab**: 个人中心

#### 3. 匹配流程 (iPhone 258-280)
- 发布需求页
  - 选择店铺
  - 设置时间
  - 选择人数
  - 性别偏好
  - 标签选择 (火锅类型、口味等)
- 匹配模式选择 (精准匹配/盲盒匹配)
- 匹配中动画
- 匹配成功页
- 对方资料查看

#### 4. 店铺选择 (iPhone 281-285)
- 店铺列表
- 店铺搜索
- 店铺详情
- 地图定位

#### 5. 个人中心 (iPhone 286-300)
- 个人资料展示
- 编辑资料
- 我的余额
- 充值页面
- 交易明细
- 订单列表
- 订单详情
- 退款申请
- 设置页面
- 关于我们

#### 6. 订单查看 (iPhone 317-332)
- 订单列表 (待确认、进行中、已完成)
- 订单筛选
- 订单详情
- 评价页面

## 实现优先级

### Phase 1: 核心功能 (2-3天)
1. ✅ 项目基础设置
   - [x] 请求工具类
   - [x] API 接口定义
   - [x] 类型定义
   - [x] 全局样式
   - [x] 公共组件 (NavBar, TagSelector, LoadingOverlay)

2. 🔄 认证流程
   - [ ] 登录页 (login.vue)
   - [ ] 手机登录 (phoneLogin.vue)
   - [ ] 个人信息设置 (setup.vue)

3. 🔄 Tab Bar 主页
   - [ ] 匹配首页 (match.vue)
   - [ ] 查看页 (view.vue)
   - [ ] 我的页面 (me.vue)

### Phase 2: 匹配功能 (2-3天)
4. [ ] 匹配流程
   - [ ] 发布需求 (postRequirement.vue)
   - [ ] 店铺选择 (storeSelection.vue)
   - [ ] 匹配中 (matching.vue)
   - [ ] 匹配成功 (matchSuccess.vue)
   - [ ] 资料查看 (profileView.vue)

### Phase 3: 个人中心 (1-2天)
5. [ ] 个人中心模块
   - [ ] 编辑资料 (editProfile.vue)
   - [ ] 充值 (recharge.vue)
   - [ ] 交易明细 (transactionHistory.vue)
   - [ ] 设置 (settings.vue)
   - [ ] 关于我们 (about.vue)

### Phase 4: 订单管理 (1-2天)
6. [ ] 订单模块
   - [ ] 订单列表 (orderList.vue)
   - [ ] 订单详情 (orderDetail.vue)
   - [ ] 退款 (refund.vue)

### Phase 5: 优化与测试 (1-2天)
7. [ ] UI 细节优化
8. [ ] 动画效果
9. [ ] 性能优化
10. [ ] 测试与修复

## 开发建议

### 1. 逐页对照实现
- 打开对应的 UI 设计图
- 分析布局和交互
- 实现页面结构
- 添加样式和动画
- 对接 API

### 2. 复用组件
已创建的公共组件:
- `NavBar.vue` - 导航栏
- `TagSelector.vue` - 标签选择器
- `LoadingOverlay.vue` - 加载遮罩

建议再创建:
- `UserCard.vue` - 用户卡片
- `StoreCard.vue` - 店铺卡片
- `OrderCard.vue` - 订单卡片
- `EmptyState.vue` - 空状态
- `BottomSheet.vue` - 底部弹窗

### 3. 样式规范
- 使用 SCSS 变量保持一致性
- 遵循设计稿的间距和圆角
- 适配安全区域
- 响应式布局

### 4. 数据管理
- 使用现有的 `store.ts` 管理全局状态
- 合理使用 `uni.setStorageSync` 缓存
- API 调用统一错误处理

## 下一步行动

1. **立即开始**: 重新实现登录页面
2. **参考 UI 图**: `iPhone 225.png - iPhone 231.png`
3. **测试运行**: `npm run dev:mp-weixin`

## 注意事项

1. **UI 图查看**: 逐一打开 hotpot_ui 文件夹中的图片对照实现
2. **微信小程序限制**: 注意包大小、组件限制
3. **性能优化**: 图片懒加载、分包加载
4. **用户体验**: 加载状态、错误提示、空状态处理

---

**当前状态**: Phase 1 部分完成，等待继续实现各页面
**下一步**: 实现登录流程页面
