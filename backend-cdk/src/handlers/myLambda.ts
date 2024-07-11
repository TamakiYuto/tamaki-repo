import { APIGatewayProxyHandler } from 'aws-lambda';
import { SecretsManager } from 'aws-sdk';
import { Client } from 'pg'; // `pg`はPostgreSQL用ですが、MariaDBにも使用可能です

const secretsManager = new SecretsManager();
const secretArn = process.env.DATABASE_SECRET_ARN!;
const databaseName = process.env.DATABASE_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const secretValue = await secretsManager.getSecretValue({ SecretId: secretArn }).promise();
    const secret = JSON.parse(secretValue.SecretString!);

    const client = new Client({
      host: secret.host,
      port: secret.port,
      user: secret.username,
      password: secret.password,
      database: databaseName,
    });

    await client.connect();

    // クエリを実行
    const res = await client.query('SELECT NOW()');

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Connected to the database successfully!',
        time: res.rows[0],
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to connect to the database.',
        error: err.message,
      }),
    };
  }
};
