/**
 * 基础处理器抽象类
 * 提供统一的处理接口和错误处理机制
 */
class BaseHandler {
  /**
   * 处理器基类的抽象方法
   * 子类需要实现这个方法
   */
  // eslint-disable-next-line no-unused-vars
  handle(_args, _req, _res) {
    throw new Error('Handle method must be implemented by subclass');
  }

  /**
   * 创建成功响应
   * @param {any} data 响应数据
   * @param {string} message 响应消息
   * @returns {ToolResponse} 工具响应
   */
  createSuccessResponse(data, message = 'Success') {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
      statusCode: 200,
      statusMessage: message,
      data,
    };
  }

  /**
   * 创建错误响应
   * @param {string} message 错误消息
   * @param {number} statusCode 状态码
   * @param {any} error 错误对象
   * @returns {ToolResponse} 工具响应
   */
  createErrorResponse(message, statusCode = 500, error = null) {
    const errorData = {
      error: message,
      statusCode,
      timestamp: new Date().toISOString(),
    };

    if (error) {
      errorData.details = error.message || error;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(errorData, null, 2),
        },
      ],
      statusCode,
      statusMessage: message,
      data: errorData,
    };
  }

  /**
   * 验证参数
   * @param {any} args 参数对象
   * @param {string[]} requiredFields 必需字段列表
   * @throws {Error} 当必需字段缺失时抛出错误
   */
  validateArgs(args, requiredFields = []) {
    for (const field of requiredFields) {
      if (args[field] === undefined || args[field] === null) {
        throw new Error(`Missing required parameter: ${field}`);
      }
    }
  }
}

module.exports = { BaseHandler };
