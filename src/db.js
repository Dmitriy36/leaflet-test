const sql = require("mssql");
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

const secret_name = "rds!db-e4e848c6-84d5-4726-8407-9422f7c501b2";

async function getSecret() {
  const client = new SecretsManagerClient({
    region: "us-east-2",
  });

  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT",
      })
    );

    // Parse the JSON secret
    const secret = JSON.parse(response.SecretString);
    return secret;
  } catch (error) {
    console.error("Error fetching secret:", error);
    throw error;
  }
}

async function createPool() {
  const secret = await getSecret();

  const config = {
    user: secret.username,
    password: secret.password,
    server: "integrated-apar-apat.c1vwa9fou9fe.us-east-2.rds.amazonaws.com",
    database: "Integrated_APAR",
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
    pool: {
      max: 25,
      min: 5,
      idleTimeoutMillis: 30000,
    },
  };

  console.log("Using user:", config.user);
  console.log("Password loaded from AWS Secrets Manager");

  return sql.connect(config);
}

const poolPromise = createPool();
module.exports = { poolPromise };
