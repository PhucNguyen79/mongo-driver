import fs from 'fs';
import { zipObject } from 'lodash';
import async from "async";
const MongoClient = require('mongodb').MongoClient;
const Validator = require('jsonschema').Validator;
const v = new Validator();

const execDB = (option, typeName, jsonData, jsonUpdate, rowLimit) => {
  // Connection URL
  const url = 'mongodb://localhost:27017';
  // Database Name
  const dbName = 'local';
  const dir = "schema/Types/";
  // Use connect method to connect to the Server
  MongoClient.connect(url, (err, client) => {
    console.log("Connected correctly to server");
    const db = client.db(dbName);
    switch (option){
      case 'create-DB':
        createDB(dir, db).then(() => {
          console.log('Collections created')
          client.close()
        }).catch((err) => {
          console.log(err)
          client.close()
        });
        break;
      case 'insert-One':
        insertOne(db, dir, typeName, jsonData).then(() => {
          console.log('Document created');
          client.close();
        }).catch((err) => {
          console.log(err);
          client.close();
        });
        break;
      case 'update-One':
        updateOne(db, typeName, jsonData, jsonUpdate).then(() => {
          console.log('Document updated');
          client.close();
        }).catch((err) => {
          console.log(err);
          client.close();
        });
        break;
      case 'delete-One':
        deleteOne(db, typeName, jsonData).then(() => {
          console.log('Document deleted');
          client.close();
        }).catch((err) => {
          console.log(err);
          client.close();
        });
        break;
      default:
        selectData(db, typeName, jsonData, rowLimit).then((docs) => {
          console.log(`${docs.length} Documents: ${JSON.stringify(docs)}`);
          client.close();
        }).catch((err) => {
          console.log(err);
          client.close();
        });
        break;
    }
  });
}

const createDB = (dir, db, client) => {
  return new Promise((resolve) => {
    const files = fs.readdirSync(dir);
    async.each(files, (fileType, callback) => {
      const typeName = fileType.slice(0, -5);
      const json = JSON.parse(fs.readFileSync(dir + fileType, 'utf8'));
      createCollection(db, typeName, json.indexes, callback);
    }, (err) => {
      if (err) {
        throw err;
      }  else {
        resolve();
      }
    });
  });
}

const createCollection =(db, typeName, typeIndexes, callback) => {
  db.createCollection(typeName,
    (err, results) => {
      if(err) callback(err);
      else {
        //create Indexes for Collection
        for (let i = 0; i < typeIndexes.length; i++) {
          const idx = typeIndexes[i];
          const setIdx = _.zipObject( idx.keys, [1,1,1,1,1]);
          if(idx.unique !== undefined && idx.unique) {
            db.collection(typeName).createIndex( setIdx, { unique: true } );
          } else {
            db.collection(typeName).createIndex(setIdx);
          }
        }
        callback();
      }
    }
  );
};

const insertOne = (db, dir, typeName, jsonData) => {
  return new Promise((resolve) => {
    const schema = JSON.parse(fs.readFileSync(`${dir + typeName}.json`,'utf8'));
    const embedded = schema.embedded;
    for (let i = 0; i < embedded.length; i++) {
      const schemaEmbbed = JSON.parse(fs.readFileSync(`schema/EmbeddedTypes/${embedded[i]}.json`,'utf8'));
      v.addSchema(schemaEmbbed, `/EmbeddedTypes/${embedded[i]}` );
    }
    const result = v.validate(jsonData, schema);
    if(result.valid) {
      db.collection(typeName).insertOne(jsonData, (err, r) => {
        if(err) {
          throw err;
        } else {
          resolve();
        }
      });
    } else {
      throw "Error: " + result.errors[0].stack;
    }
  });
};

const updateOne = (db, typeName, jsonData, jsonUpdate) => {
  return new Promise((resolve) => {
    db.collection(typeName).updateOne(jsonData, {$set: jsonUpdate },(err, r) => {
      if(err) {
        throw err;
      } else {
        resolve();
      }
    });
  });
};

const deleteOne = (db, typeName, jsonData) => {
  return new Promise((resolve) => {
    db.collection(typeName).deleteOne(jsonData,(err, r) => {
      if(err) {
        throw err;
      } else {
        resolve();
      }
    });
  });
};

const selectData = (db, typeName, jsonData, rowLimit) => {
  return new Promise((resolve) => {
    db.collection(typeName).find(jsonData).limit(rowLimit).toArray((err, docs) => {
      if(err) {
        throw err;
      } else {
        resolve(docs);
      }
    });
  });
};

export default execDB;
