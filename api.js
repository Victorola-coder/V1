import ck from "./ck.js"
/* Communicate with firebase */
const config = { apiKey: "AIzaSyCSvEKkCHzclAOZY8xJB12eqEFcEexfHYg", authDomain: "vickyjay.firebaseapp.com", databaseURL: "https://vickyjay-default-rtdb.firebaseio.com", projectId: "vickyjay", storageBucket: "vickyjay.appspot.com", messagingSenderId: "587289416599", appId: "1:587289416599:web:39febd588afe384c36aad2", measurementId: "G-5YZJHG9TNZ" };
const app = (await import('https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js')).initializeApp(config) // initialize app
const analytics = (await import('https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js')).getAnalytics(app); //analytics
const storage = await import('https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js');
const database = await import('https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js');
const db = database.getDatabase(app); //Firebase Database reference
const storageRef = database.getStorage(app); //Firebase Storage Reference;

/* Create Account */
const signbtn = document.getElementById("sg-btn") //Sign up button;
const email = document.getElementById("email").value //Email from text input
const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
signbtn.onclick = async() => {
    //validate form
    if(!regex.test(email)){
        //indicate error
        return;
    
    }
    //generate userid
    const uid = Object.keys((await database.get(database.ref(db, '/uid/'))).val()) //get existing ID's from database
    function generateId() {
        let id = '';
        let char = Array(10).fill(0).map((a,b) => a+b);
        while(id.length < 6){
            let index = Math.round(Math.random() * (char.length - 1));
            if(char[index] == 0 && id.length == 0) continue;
            id += char[index];
        }
        return Number(id);
    }
    let userId = generateId();
    while(uid.includes(userId)){userId = generateId()};
    //create user
    await database.set(database.ref(db, `/uid/${userId}`), ({userId, email}));
    ck.set("uid", userId);
    //return to main page
    location.href = '/';
}

/* Login */
const loginbtn = document.getElementById("lg-btn") //Login button
loginbtn.onclick = async() => {
    if(!regex.test(email)){
        //indicate error
        return;
    }
    const uid = (await database.get(database.ref(db, '/uid/'))).val();
    let userId;
    for(const id of uid){
        const data = uid[id];
        if(data.email.toLowercase() == email.toLowercase()){
            userId = data.userId;
            break;
        }
    }
    if(userId){
        //return to homepage
        ck.set("uid", userId);
        location.href = '/';
    } else {
        //warn user
        return;
    }
}

/* Upload files */
const uploadbtn = document.getElementById("upload"); //upload button;
const description = document.getElementById("description").value //Description or links if any
uploadbtn.onclick = async() => {
    const uploads = Array.from(document.querySelectorAll("[type=file")).map(a => a.files) || Array.from(document.getElementById("file").files) //extract all uploads
    const day = document.getElementById("day").value;
    //get all progress bars
    const progress = document.querySelectorAll("progress"); //all progress elements to monitor uploads
    const span = document.getElementsByClassName("percent"); //elements to show percentage of upload progress;
    //upload each file accordingly
    const userId = ck.get("userId");
    for(const file of uploads){
        const index = uploads.indexOf(file);
        await new Promise((res,_) => {
            const uploadTask = storage.uploadBytesResumable(storage.ref(storageRef, `${userId}/day-${day}/${file.name}`), file, {type: file.type});
            uploadTask.on('state_changed', snapshot => {
                const status = Math.floor(snapshot.bytesTransferred / snapshot.totalBytes * 100); //calculate progress
                //display progress
                progress[index].value = status;
                span[index].value = status + '%/';
            }, error => {
                //indicate error;
                throw error;
            }, () => {
                //upload complete
                res(true);
            })
        })
        //promise can be removed to upload all items together instead of one by one;
    }
    if(description){
        const file = new Blob([description], {type: "text/plain"});
        await new Promise((res,_) => {
            const uploadTask = storage.uploadBytesResumable(storage.ref(storageRef, `${userId}/day-${day}/desc`), file, {type: file.type});
            uploadTask.on('state_changed', snapshot => {
                const status = Math.floor(snapshot.bytesTransferred / snapshot.totalBytes * 100); //calculate progress
                //display progress
                progress[index].value = status;
                span[index].value = status + '%/';
            }, error => {
                //indicate error;
                throw error;
            }, () => {
                //upload complete
                res(true);
            })
        })
    }
}