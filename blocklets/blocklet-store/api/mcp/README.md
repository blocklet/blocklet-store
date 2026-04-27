# Blocklet Store MCP Server

This is an object-oriented implementation of MCP (Model Context Protocol) that provides streamable HTTP MCP services for Blocklet Store.

## Repository Policy

This documentation is published as part of a public source repository for transparency, self-hosting, auditing, and reference use. Public Issues, Pull Requests, and Discussions are not accepted.

## Features

- **Search Blocklets**: Search Blocklets using multiple criteria including keywords, categories, price, etc.
- **Object-Oriented Design**: Modular handler architecture for easy extension and maintenance
- **HTTP Interface**: Provides RESTful API interfaces, supporting JSON-RPC 2.0 protocol
- **Parameter Validation**: Complete parameter validation and error handling mechanism
- **Logging**: Detailed debug logs for troubleshooting

## Directory Structure

```
api/mcp/
├── index.js              # MCP server main entry
├── server.js             # Handler manager
├── handlers/             # Handlers directory
│   ├── base.js          # Base handler abstract class
│   ├── search-blocklets.js  # Search Blocklets handler
│   └── index.js         # Handler export file
└── README.md            # Documentation
```

## API Endpoints

### Health Check
```bash
GET /mcp/blocklets/health
```

### MCP Request
```bash
POST /mcp/blocklets
```

## Supported Tools

### search_blocklets

Search Blocklets with the following parameters:

- `keyword` (string): Search keyword
- `sortBy` (string): Sort field, possible values: `stats.downloads`, `lastPublishedAt`, `title`
- `sortDirection` (string): Sort direction, possible values: `asc`, `desc`
- `page` (number): Page number, defaults to 1
- `pageSize` (number): Items per page, defaults to 20, maximum 100
- `category` (string): Category filter
- `price` (string): Price filter, possible values: `free`, `payment`
- `owner` (string): Owner DID filter
- `isOfficial` (boolean): Whether it's an official Blocklet
- `showResources` (boolean): Whether to show resource Blocklets
- `versionCount` (boolean): Whether to include version count information

## Usage Examples

### Get Tool List
```bash
curl -X POST http://localhost:3000/mcp/blocklets \
  -H "Content-Type: application/json" \
  -H "x-blocklet-server-version: 1.0.0" \
  -H "x-blocklet-store-version: 1.0.0" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

### Search Blocklets
```bash
curl -X POST http://localhost:3000/mcp/blocklets \
  -H "Content-Type: application/json" \
  -H "x-blocklet-server-version: 1.0.0" \
  -H "x-blocklet-store-version: 1.0.0" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "search_blocklets",
      "arguments": {
        "keyword": "wallet",
        "sortBy": "stats.downloads",
        "sortDirection": "desc",
        "page": 1,
        "pageSize": 10
      }
    },
    "id": 1
  }'
```

### Health Check
```bash
curl -X GET http://localhost:3000/mcp/blocklets/health
```

## Extending New Features

1. Create a new handler class in the `handlers/` directory, extending `BaseHandler`
2. Register the new handler in `MCPHandlerManager` in `server.js`
3. Add the new tool's schema in the tool definitions in `index.js`

## Error Handling

All errors follow the JSON-RPC 2.0 error format:

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32603,
    "message": "Internal server error"
  },
  "id": null
}
```

## Logging

Use the `debug` function to record detailed debug information:

- `mcp.blocklet-request`: Request information
- `mcp.blocklet-tool-call`: Tool call information
- `mcp.blocklet-tool-result`: Tool execution results
- `mcp.blocklet-handler.*`: Detailed logs for each handler

## Important Notes

1. **Content-Type**: Requests must set `Content-Type: application/json`
2. **Version Headers**: It's recommended to set `x-blocklet-server-version` and `x-blocklet-store-version` headers for compatibility
3. **Error Handling**: All errors follow the JSON-RPC 2.0 specification
4. **Parameter Validation**: Tool parameters undergo strict validation to ensure correct data types
5. **Pagination Limit**: Maximum 100 results per page
6. **Performance Considerations**: Version count feature (`versionCount`) increases response time, use as needed

## Compatibility

- Compatible with existing `/api/v2/blocklets.json` interface
- Supports automatic switching between MeiliSearch and database queries
- Supports version filtering and compatibility checking
