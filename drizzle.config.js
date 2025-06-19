/** @type { import("drizzle-kit").Config } */

export default {
    schema: "./configs/schemaCourse.jsx",
    dialect: 'postgresql',
    dbCredentials: {
      url: "postgresql://Doweit-Database_owner:wcYSDEX91Bot@ep-spring-rice-a5vzqvbn.us-east-2.aws.neon.tech/Doweit-Database?sslmode=require",
    }
  };