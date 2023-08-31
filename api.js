import ck from "./ck.js?v=1";
const config = {
  apiKey: "AIzaSyCSvEKkCHzclAOZY8xJB12eqEFcEexfHYg",
  authDomain: "vickyjay.firebaseapp.com",
  databaseURL: "https://vickyjay-default-rtdb.firebaseio.com",
  projectId: "vickyjay",
  storageBucket: "vickyjay.appspot.com",
  messagingSenderId: "587289416599",
  appId: "1:587289416599:web:39febd588afe384c36aad2",
  measurementId: "G-5YZJHG9TNZ",
};
const app = (
  await import("https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js")
).initializeApp(config);
const analytics = (
  await import(
    "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js"
  )
).getAnalytics(app);
const storage = await import(
  "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js"
);
const database = await import(
  "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"
);
const db = database.getDatabase(app);
const storageRef = storage.getStorage(app);

const ft = (x) => document.getElementById(x) || document.createElement("div");
const signbtn = ft("sgn");
const err = ft("err");
const form = ft("form");
const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
signbtn.onclick = async () => {
  if (!regex.test(form.email.value)) {
    err.innerText = "Invalid Email";
    form.email.onclick = () => (err.innerText = "");
    return;
  }
  const xl = (await database.get(database.ref(db, "/uid/"))).val() || {};
  const xm = Object.values(xl).map((a) => a.email);
  if (xm.some((a) => a.toLowerCase() == form.email.value.toLowerCase())) {
    err.innerHTML =
      'Email already exists <br> <a style="color:white" href="login.html">Sign In?</a>';
    form.email.onclick = () => (err.innerHTML = "");
    return;
  }
  const uid = Object.keys(xl);
  function generateId() {
    let id = "";
    let char = Array(10)
      .fill(0)
      .map((a, b) => a + b);
    while (id.length < 6) {
      let index = Math.round(Math.random() * (char.length - 1));
      if (char[index] == 0 && id.length == 0) continue;
      id += char[index];
    }
    return Number(id);
  }
  let userId = generateId();
  while (uid.includes(userId)) {
    userId = generateId();
  }
  await database.set(database.ref(db, `/uid/${userId}`), {
    userId,
    email: form.email.value,
    pwd: form.pwd.value,
  });
  ck.set("uid", userId);
  ck.set("email", form.email.value);
  location.href = "/";
};

const loginbtn = ft("lgn");
loginbtn.onclick = async () => {
  if (!regex.test(form.email.value)) {
    err.innerText = "Invalid Email";
    form.email.onclick = () => (err.innerText = "");
    return;
  }
  const uid = (await database.get(database.ref(db, "/uid/"))).val() || {};
  let userId;
  for (const id in uid) {
    const data = uid[id];
    if (
      data.email.toLowerCase() == form.email.value.toLowerCase() &&
      data.pwd.toLowerCase() == form.pwd.value.toLowerCase()
    ) {
      userId = data.userId;
      ck.set("email", data.email);
      break;
    }
  }
  if (userId) {
    ck.set("uid", userId);
    location.href = "/";
  } else {
    err.innerText = "Account not found";
    form.email.onclick = () => (err.innerText = "");
    form.pwd.onclick = () => (err.innerText = "");
    return;
  }
};

const uploadbtn = ft("upbtn");
uploadbtn.onclick = async () => {
  const description = ft("description").value;
  const uploads = Array.from(document.querySelectorAll("[type=file")).map(
    (a) => a.files[0]
  );
  const day = document.getElementById("day").value;
  const progress = document.querySelectorAll("progress");
  const span = document.getElementsByClassName("percent");
  const temp = ck.get("uid");
  const userId =
    ck.get("email") ||
    ck.set(
      "email",
      (await database.get(database.ref(db, `/uid/${temp}/email`))).val()
    );
  if (description) {
    const file = new Blob([description], { type: "text/plain" });
    await new Promise((res, _) => {
      const uploadTask = storage.uploadBytesResumable(
        storage.ref(storageRef, `${userId}/day-${day}/desc`),
        file,
        { type: file.type }
      );
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const status = Math.floor(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          ft("description").value = "Uploading description " + status + "%";
        },
        (error) => {
          throw error;
        },
        res
      );
    });
  }
  for (const file of uploads) {
    const index = uploads.indexOf(file);
    await new Promise((res, _) => {
      const uploadTask = storage.uploadBytesResumable(
        storage.ref(storageRef, `${userId}/day-${day}/${file.name}`),
        file,
        { type: file.type }
      );
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const status = Math.floor(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          progress[index].value = status;
          span[index].innerText = status + "% done";
        },
        (error) => {
          throw error;
        },
        res
      );
    });
  }
};
