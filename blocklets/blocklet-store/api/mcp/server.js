const { SearchBlockletsHandler } = require('./handlers');

/**
 * MCP 处理器管理器
 * 负责注册和调用各种 MCP 工具处理器
 */
class MCPHandlerManager {
  constructor() {
    this.handlers = new Map();
    this.registerHandlers();
  }

  /**
   * 注册所有处理器
   */
  registerHandlers() {
    this.handlers.set('search_blocklets', new SearchBlockletsHandler());
  }

  /**
   * 检查是否有指定的工具处理器
   */
  has(name) {
    return this.handlers.has(name);
  }

  /**
   * 调用指定的工具处理器
   */
  async call(name, args, req, res) {
    const handler = this.handlers.get(name);

    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      const result = await handler.handle(args || {}, req, res);

      // 验证处理器返回的结果格式
      if (!result || typeof result !== 'object' || !result.content) {
        throw new Error('Invalid handler response - missing content');
      }

      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * 获取所有注册的工具名称
   */
  getToolNames() {
    return Array.from(this.handlers.keys());
  }
}

module.exports = { MCPHandlerManager };
