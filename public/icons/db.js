const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;
  
const db;
const request = window.indexedDB.open("budget", 1) 

request.onupgradeneeded = ({target}) => {
    db = target.result
    db.createObjectStore("BudgetNew", 
    {keypath: "listID", auto_increment:true});

};

request.onsuccess = (event) => {
db = event.target.result;
if (navigator.onLine) {
    checkDatabase();
    }
};

request.onerror = function (event) {
    console.log("You have an error", event);
};

const saveRecord = (record) => {
  console.log("is anything going through? ", record);
  const transaction = db.transaction(["BudgetNew"], "readwrite");
  const BudgetStore = transaction.objectStore("BudgetNew");
  console.log("is anything going through still? ", BudgetStore);
  BudgetStore.add(record).then( (data) => {
    console.log("DATA", data)
  }).catch((error) => {
    console.log("ERR", error)
  })
}

const checkDatabase = () => {
  const transaction = db.transaction(["BudgetNew"], "readwrite");
  const BudgetStore = transaction.objectStore("BudgetNew");
  const getAll = BudgetStore.getAll

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
        })
        .then((response) => response.json())
        .then(() => {
          // if successful, open a transaction on the pending db
          // access your pending object store
          // clear all items in your store
        store.clear();
        });
        }
    };
}

window.addEventListener('online', checkDatabase);