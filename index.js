import execDB from './lib/connDB';

const main = () => {
  const typeName = 'InventoryCountFrequency';
  const jsonData = {
    "id": "test-1",
    "store_key": "store_test",
    "name": "test-1",
    "unique_name": "test-1",
    "recurrence": true,
    "count_type": {
      "value": 1,
      "name": "Daily"
    },
    "repeat_on": ["Monday", "Tuesday"],
    "repeat_every": 12,
    "repeat_by": "",
    "time_range": [
      {
        "start_time": "08:50",
        "end_time": "09:50",
      }
    ],
    "count_rule": {
      "rule_type": "rule test",
      "max_items": 30,
      "high_oh_variance_cost": 30,
      "high_oh_variance_qty": 30,
      "select_random_items": 30
    },
    "last_generated_date": "2017-11-17T00:00:00Z",
    "items": ["2", "4"]
  };

  // execDB(option, typeName, jsonData, jsonUpdate, rowLimit)
  // params to run execDB function
  // option: select-Data, insert-One, delete-One, update-One
  // typeName: name of Type (Collection)
  // jsonData: Data with json format to insert / update / delete
  // jsonUpdate: Data need to update
  // rowLimit: number of rows to query

  // insert Data
  execDB('insert-One', typeName, jsonData, null, null);

  // select Data
  execDB('select-Data', typeName, {"id": "test-1"}, null, 100);

  // update Data
  execDB('update-One', typeName, {"id": "test-01"}, {
    "name": "test-03",
    "unique_name":"test-03"
  }, null);

  // delete Data
  execDB('delete-One', typeName, {"id": "test-1"}, null, null);

}

main();
