/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
const { StreamableHTTPServerTransport } = require('@blocklet/mcp/server/streamableHttp.js');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { AsyncLocalStorage } = require('async_hooks');
const { MCPHandlerManager } = require('./server');
const { version } = require('../../package.json');
const ensureVersion = require('../middlewares/ensure-version');
const { paginate, queryOption } = require('../middlewares');

// 创建上下文存储来保存Express请求和响应对象
const requestContext = new AsyncLocalStorage();

/**
 * Blocklet Store HTTP MCP 服务器类
 */
class StreamableHTTPMCPServer {
  constructor() {
    this.manager = new MCPHandlerManager();
    this.started = false;

    this.transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // set to undefined for stateless servers
    });

    this.server = new Server(
      {
        name: 'blocklet-store-mcp-server',
        version,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * 设置处理器
   */
  setupHandlers() {
    // 设置工具列表处理器
    this.server.setRequestHandler(ListToolsRequestSchema, () => {
      return {
        tools: this.getToolDefinitions(),
      };
    });

    // 设置工具调用处理器
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // 从上下文存储中获取 Express 请求和响应对象
      const context = requestContext.getStore();

      if (!context) {
        throw new Error('Request context not found');
      }

      const { req, res } = context;

      if (!this.manager.has(name)) {
        throw new Error(`Unknown tool: ${name}`);
      }

      try {
        const result = await this.manager.call(name, args, req, res);

        return {
          content: result.content,
          isError: result.statusCode !== 200,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Tool execution failed: ${errorMessage}`);
      }
    });
  }

  /**
   * 获取工具定义
   */
  getToolDefinitions() {
    return [
      {
        name: 'search_blocklets',
        description: 'Search for Blocklets using various criteria like keywords, category, price, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            keyword: {
              type: 'string',
              description: 'Search keyword to match against Blocklet names and descriptions',
            },
            sortBy: {
              type: 'string',
              description: 'Field to sort results by (stats.downloads, lastPublishedAt, title)',
              enum: ['stats.downloads', 'lastPublishedAt', 'title'],
              default: 'lastPublishedAt',
            },
            sortDirection: {
              type: 'string',
              enum: ['asc', 'desc'],
              description: 'Sort direction',
              default: 'desc',
            },
            page: {
              type: 'number',
              description: 'Page number for pagination',
              default: 1,
              minimum: 1,
            },
            pageSize: {
              type: 'number',
              description: 'Number of items per page',
              default: 20,
              minimum: 1,
              maximum: 100,
            },
            category: {
              type: 'string',
              description: 'Filter by Blocklet category',
            },
            price: {
              type: 'string',
              enum: ['free', 'payment'],
              description: 'Filter by price type',
            },
            owner: {
              type: 'string',
              description: 'Filter by owner DID',
            },
            isOfficial: {
              type: 'boolean',
              description: 'Filter by official status',
            },
            showResources: {
              type: 'boolean',
              description: 'Whether to show resource blocklets',
            },
            versionCount: {
              type: 'boolean',
              description: 'Whether to include version count for each blocklet',
            },
          },
          required: [],
        },
      },
    ];
  }

  /**
   * 启动服务器
   */
  async start() {
    if (this.started) {
      return;
    }

    await this.server.connect(this.transport);
    this.started = true;
  }

  /**
   * 处理 HTTP 请求
   */
  async handleRequest(req, res) {
    try {
      // 在上下文存储中运行，保存 Express 请求和响应对象
      await requestContext.run({ req, res }, async () => {
        await this.transport.handleRequest(req, res, req.body);
      });
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: req.body?.id || null,
        });
      }
    }
  }
}

// 创建全局实例
const mcpServer = new StreamableHTTPMCPServer();

/**
 * 设置 MCP 路由
 */
function setupMcpRoutes(app) {
  // MCP 参数处理中间件 - 将 MCP 工具参数转换为查询参数
  const processMcpParams = (req, res, next) => {
    if (req.body && req.body.method === 'tools/call' && req.body.params) {
      const { arguments: args } = req.body.params;
      if (args && req.body.params.name === 'search_blocklets') {
        // 将 MCP 工具参数转换为查询参数，以便中间件能够处理
        req.query = {
          ...req.query,
          keyword: args.keyword,
          sortBy: args.sortBy,
          sortDirection: args.sortDirection,
          page: args.page,
          pageSize: args.pageSize,
          category: args.category,
          price: args.price,
          owner: args.owner,
          isOfficial: args.isOfficial,
          showResources: args.showResources,
          versionCount: args.versionCount,
        };
      }
    }
    return next();
  };

  // 设置 MCP 路由 - 使用标准的传输层处理
  app.post('/mcp', ensureVersion, processMcpParams, queryOption, paginate, async (req, res) => {
    await mcpServer.handleRequest(req, res);
  });

  // 对 GET 和 DELETE 请求返回 405 Method not allowed
  app.get('/mcp', (req, res) => {
    res.header('X-Accel-Buffering', 'no');
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Method not allowed.',
        },
        id: null,
      })
    );
  });

  app.delete('/mcp', (req, res) => {
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Method not allowed.',
        },
        id: null,
      })
    );
  });
}

// 导出服务器实例
module.exports = { setupMcpRoutes, mcpServer };
