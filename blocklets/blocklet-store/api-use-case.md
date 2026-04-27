#### API 公开api

- `/api/v2/blocklets.json`

  - **store-web**: 分类列表、首页搜索、探索页面、Profile Blocklet list
  - **blocklet-server**: 列表（实际使用的是 store-web-list）
  - **社区活动统计**: 已有新接口支持，兼容使用

- `/community/analytics`

  - **社区活动统计**

- `/api/blocklets/explore`

  - **store-web**: 探索页专用

- `/api/blocklets/categories`

  - **store-web**: 首页分类列表，分类管理页

- `/api/blocklets/[did]/versions`

  - **store-web**: 历史版本查询

- `/api/blocklets/[did]/[version?]/blocklet.json`

  - **store-web**: 详情页
  - **blocklet-server**: 升级
  - **launcher**: 查询信息、获取安装资源

- `/api/blocklets/[did]/[version?]/[tarball].tgz`

  - **launcher**: 获取安装资源
  - **blocklet-cli**: 获取资源

- `/api/blocklets/versions/batch`

  - **主站**: timeline 专用

- `/api/blocklets/:did/downloads`

  - ？

- `/api/blocklets/notify/purchase`

  - **store-web**: 自动发布、手动发布

- `/api/blocklets/:did/:version?/info`

  - **store-web**: 详情页专用

- `/api/blocklets/:did/logo`

  - **store-web**: 列表、详情页展示Icon
  - **blocklet-server**: 展示Icon

- `/api/blocklets/:did/readme`
  - **store-web**: 详情页展示 readme

#### API 需要登录

- `/api/blocklets/upload`

  - **store-web**: 页面上传按钮
  - **blocklet-cli**: 上传
  - **blocklet-studio**: 上传

- **我的Blocklets 页使用**

  - `/api/developer/blocklets`: 获取所有列表
  - `[post] blocklet studio 新建`
  - `/api/developer/blocklets/access-token/my`: access token 管理
  - `/api/developer/blocklets/access-token/id`: 删除 access token
  - `/api/developer/blocklets/access-token`: 新建token
  - `/isNameExist`: blocklet 名字是否重复查询
  - `/api/developer/blocklets、id`: blocklet 编辑
  - `/api/developer/blocklets/:did/request-review`: 发起审核
  - `/api/developer/blocklets/:did/cancel-review`: 取消审核
  - `/api/developer/blocklets/verify-nft-factory/:did`: 发布前验证使用
  - `/api/developer/blocklets/:id/delegation/:key`: 自动发布签名信息储存

- **管理Blocklets 页使用**
  - `/api/console/blocklets`: 获取所有内容列表
  - `/api/console/blocklets/:id/block`: 屏蔽Blocklet
  - `/api/console/blocklets/:did/review`: 审核Blocklet
  - `/api/console/blocklets/:id/unblock`: 解除屏蔽
  - `/api/console/blocklets/:id/category`: 分类管理
