import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server instance
const server = new McpServer({
	name: "mcp-server-template",
	version: "0.0.1",
});

// Enhanced sample tool with multiple input types
server.tool(
	"text-processor",
	"A versatile text processing tool that can transform text in various ways",
	{
		text: z.string().describe("The text to process"),
		operation: z
			.enum(["uppercase", "lowercase", "reverse", "word-count", "char-count"])
			.describe("The operation to perform on the text"),
		prefix: z
			.string()
			.optional()
			.describe("Optional prefix to add to the result"),
	},
	async ({ text, operation, prefix }) => {
		let result: string;

		switch (operation) {
			case "uppercase":
				result = text.toUpperCase();
				break;
			case "lowercase":
				result = text.toLowerCase();
				break;
			case "reverse":
				result = text.split("").reverse().join("");
				break;
			case "word-count":
				result = `Word count: ${text.trim().split(/\s+/).length}`;
				break;
			case "char-count":
				result = `Character count: ${text.length}`;
				break;
			default:
				result = text;
		}

		const finalResult = prefix ? `${prefix}${result}` : result;

		return {
			content: [
				{
					type: "text",
					text: finalResult,
				},
			],
		};
	}
);

// Sample tool for generating data
server.tool(
	"data-generator",
	"Generate sample data for testing purposes",
	{
		type: z
			.enum(["uuid", "timestamp", "random-number", "lorem"])
			.describe("Type of data to generate"),
		count: z
			.number()
			.min(1)
			.max(10)
			.default(1)
			.describe("Number of items to generate (1-10)"),
	},
	async ({ type, count }) => {
		const items: string[] = [];

		const generateItem = (): string => {
			switch (type) {
				case "uuid":
					return crypto.randomUUID();
				case "timestamp":
					return new Date().toISOString();
				case "random-number":
					return Math.floor(Math.random() * 1000000).toString();
				case "lorem":
					const words = [
						"lorem",
						"ipsum",
						"dolor",
						"sit",
						"amet",
						"consectetur",
						"adipiscing",
						"elit",
					];
					return words
						.sort(() => Math.random() - 0.5)
						.slice(0, 5)
						.join(" ");
				default:
					return "unknown";
			}
		};

		for (let i = 0; i < count; i++) {
			items.push(generateItem());
		}

		return {
			content: [
				{
					type: "text",
					text: items.join("\n"),
				},
			],
		};
	}
);

// Sample tool for JSON operations
server.tool(
	"json-formatter",
	"Format and validate JSON data",
	{
		json: z.string().describe("JSON string to format"),
		indent: z
			.number()
			.min(0)
			.max(8)
			.default(2)
			.describe("Number of spaces for indentation"),
	},
	async ({ json, indent }) => {
		try {
			const parsed = JSON.parse(json);
			const formatted = JSON.stringify(parsed, null, indent);

			return {
				content: [
					{
						type: "text",
						text: `✅ Valid JSON:\n\n${formatted}`,
					},
				],
			};
		} catch (error) {
			return {
				content: [
					{
						type: "text",
						text: `❌ Invalid JSON: ${
							error instanceof Error ? error.message : "Unknown error"
						}`,
					},
				],
			};
		}
	}
);

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.log("MCP Server running on stdio");
}

main().catch(error => {
	console.error("Fatal error in main():", error);
	process.exit(1);
});
