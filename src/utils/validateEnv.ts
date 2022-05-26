import { cleanEnv, num, port, str } from 'envalid';

function validateEnv() {
  cleanEnv(process.env, {
    // mongo
    MONGO_PATH: str(),
    MONGO_USER: str(),
    MONGO_PWD: str(),
    MONGO_SSL_CA: str(),

    NETWORK: str({
      choices: [
        'main',
        'test',
        'main-standby',
        'test-standby',
        'verse-test',
        'verse-main',
      ],
    }),
    PRIVATE_KEY: str(),
    // server
    PORT: port(),
  });
}

require('dotenv').config();
validateEnv();
