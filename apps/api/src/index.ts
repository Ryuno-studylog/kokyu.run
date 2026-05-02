import Fastify from "fastify"
import cors from "@fastify/cors"
import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify"
import { appRouter, type AppRouter } from "@kokyu/api"
import { createContext } from "./context"

async function main() {
  const server = Fastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "warn" : "info",
    },
  })

  await server.register(cors, {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://kokyu.run", "https://www.kokyu.run"]
        : true,
  })

  await server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }) {
        if (error.code === "INTERNAL_SERVER_ERROR") {
          console.error(`tRPC error on ${path}:`, error)
        }
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
  })

  server.get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }))

  const port = parseInt(process.env.PORT ?? "3001")
  await server.listen({ port, host: "0.0.0.0" })
  console.log(`API server running on http://localhost:${port}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
