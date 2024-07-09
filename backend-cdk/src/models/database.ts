import * as AWS from 'aws-sdk';

export async function getSecretValue(secretName: string) {
  const secretsManager = new AWS.SecretsManager();
  const response = await secretsManager.getSecretValue({ SecretId: secretName }).promise();

  if (!response.SecretString) {
    throw new Error('SecretString is undefined');
  }

  return JSON.parse(response.SecretString);
}
