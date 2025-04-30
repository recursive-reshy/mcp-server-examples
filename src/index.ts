#!/usr/bin/env node

// TypeScript schema validation
import { z } from 'zod'

// MCP sever SDK
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

const main = async () => {
  // 1. Create a new MCP server instance
  const Server = new McpServer(
    // Server identification
    { name: 'GreetingServer', version: '0.1.0' },
    // Declare the server's supported capabilities
    { capabilities: {
        tools: { listChanged: false}, // We support tools, no dynamic changes
        // resources: {}, // Uncomment to support resources
        // prompts: {}, // Uncomment to support prompts
      }
    }
  )

  // 2. Add tool implementation
  Server.tool(
    'greet',
    { name: z // 3. Define the input schema for the tool
        .string()
        .min(1)
        .describe('The name of the person to greet')
    },
    async ( input ) => { // 4. Implement tool callback
      console.error( `Tool 'greet' called with name: ${input.name}` ) // Log to stderr
      return {
        content: [ { type: 'text', text: `Hello, ${input.name}! Welcome to MCP.`} ],
        // isError: false, // Default is false
      }
    },
  )

  try {
    // 5. Connect to server, using stdio transport
    await Server.connect( new StdioServerTransport() )
  } catch (error) {
    console.error( `Failed to connect to server: ${error}` )
    process.exit(1)
  }
}

const startServer = async () => {
  try {
    console.log('Starting server...');
    
    await main()
  } catch (error) {
    console.error( `Unhandled error during server startup: ${error}` )
    process.exit( 1 )
  }
}

await startServer()