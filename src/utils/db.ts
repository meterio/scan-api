import mongoose from 'mongoose';

const { MONGO_USER, MONGO_PWD, MONGO_PATH, MONGO_SSL_CA } = process.env;

export const connectDB = async () => {
  let url = `mongodb://${MONGO_USER}:${MONGO_PWD}@${MONGO_PATH}`;
  let options: mongoose.ConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  };
  let query: { [key: string]: string } = {};
  query['retryWrites'] = 'false';
  if (MONGO_SSL_CA != '') {
    const fs = require('fs');
    //Specify the Amazon DocumentDB cert
    var ca = [fs.readFileSync(MONGO_SSL_CA)];
    query['ssl'] = 'true';
    query['replicaSet'] = 'rs0';
    query['readPreference'] = 'secondaryPreferred';
    // url += '?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred';
    options = {
      ...options,
      sslValidate: true,
      sslCA: ca,
      useNewUrlParser: true,
    };
  }
  let queries = [];
  for (const key in query) {
    queries.push(`${key}=${query[key]}`);
  }
  let queryStr = queries.join('&');
  // mongoose.set("debug", true);
  await mongoose.connect(queryStr ? url + '?' + queryStr : url, options);
};
