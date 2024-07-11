import { APIGatewayProxyHandler } from 'aws-lambda';
import { SecretsManager } from 'aws-sdk';
import { createConnection } from 'mysql2/promise';

const secretsManager = new SecretsManager();
const secretId = process.env.DATABASE_SECRET_ARN!;
const databaseName = process.env.DATABASE_NAME!;

interface DatabaseSecret {
  host: string;
  port: number;
  username: string;
  password: string;
}

export const handler: APIGatewayProxyHandler = async (event, context) => {
  let connection;
  try {
    const secretValue = await secretsManager.getSecretValue({ SecretId: secretId }).promise();
    if (!secretValue.SecretString) {
      throw new Error('SecretString is empty');
    }

    const secret: DatabaseSecret = JSON.parse(secretValue.SecretString);

    connection = await createConnection({
      host: secret.host,
      port: secret.port,
      user: secret.username,
      password: secret.password,
      database: databaseName,
    });

    const [rows] = await connection.execute('SELECT 1 + 1 AS result');

    return {
      statusCode: 200,
      body: JSON.stringify({ result: rows }),
    };
  } catch (err) {
    let errorMessage = 'An unknown error occurred';

    if (err instanceof Error) {
      errorMessage = err.message;
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
