// No importes dotenv, env-cmd ya hizo el trabajo por ti
export default {
  schema: "./prisma/schema", // Prueba pasarlo como string directo
  datasource: {
    url: process.env.DATABASE_URL,
  },
};