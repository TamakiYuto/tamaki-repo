import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { Client } from 'pg';
import { getSecretValue } from '../models/database';

exports.handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const secretName = process.env.DB_SECRET_NAME;
  const secret = await getSecretValue(secretName || '');
  
  const client = new Client({
    host: secret.host,
    port: secret.port,
    user: secret.username,
    password: secret.password,
    database: secret.dbname,
  });

  await client.connect();

  // GETメソッドの処理例
  if (event.httpMethod === 'GET') {
    const result = await client.query('SELECT * FROM my_table');
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    });
  }

  await client.end();
};
