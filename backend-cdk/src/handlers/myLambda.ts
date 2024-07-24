import { Client } from 'pg';

export const handler = async (event: any = {}): Promise<any> => {
  const client = new Client({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB_NAME,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    await client.end();
    return {
      statusCode: 200,
      body: JSON.stringify(res.rows),
    };
  } catch (err) {
    console.error('Error connecting to the database', err);

    let errorMessage = 'Error connecting to the database';
    if (err instanceof Error) {
      errorMessage = err.message;
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: errorMessage,
        error: err,
      }),
    };
  }
};
