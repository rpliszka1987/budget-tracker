// setting up indexedDB
// Variable holding db connection
let db;

// establish a connection to indexedDB
const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("budget", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  //   checks if application is online. if it sends all data to api
  if (navigator.onLine) {
    uploadTransaction();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["budget"], "readwrite");
  const store = transaction.objectStore("budget");
  store.add(record);
}

function uploadTransaction() {
  const transaction = db.transaction(["budget"], "readwrite");
  const store = transaction.objectStore("budget");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(["budget"], "readwrite");
          const store = transaction.objectStore("budget");
          // clear all items in your store
          store.clear();
        })
        .catch((err) => {
          // set reference to redirect back here
          console.log(err);
        });
    }
  };
}

window.addEventListiner("online", uploadTransaction);
