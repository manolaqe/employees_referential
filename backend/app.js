// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore/lite';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from 'morgan';
import Chance from "chance";

const expressApp = express();
const port = 3030;
const saltRounds = 10;
const serverSecret = 'mnzbjkdjblosjbldjbio';

expressApp.use(express.urlencoded({ extended: false }))
expressApp.use(express.json())
expressApp.use(cors())

expressApp.use(logger('dev'));

expressApp.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

function verifyToken(req, res, next) {
    let token = req.headers['authorization']
    if (token) {
        jwt.verify(token, serverSecret, (err, decoded) => {
            if (err) {
                if (err.expiredAt) {
                    console.log('tokenul tau a expirat')
                    res.status(403)
                    res.send('expiredToken')
                } else {
                    console.log('tokenul tau nu este bun')
                    res.status(403)
                    res.send('brokenToken')
                }
            } else {
                console.log(decoded)
                req.email = decoded.data
                next()
            }
        })

        next()
    } else {
        res.status(401)
    }
}

expressApp.post('/register', (req, res) => {

    console.log('vrei sa faci POST cu ', req.body)

    let userToAdd = req.body

    let response = {}

    if ((users.find((user) => user.emailAddress === userToAdd.emailAddress)) === undefined) {

        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(userToAdd.password, salt, function(err, hash) {
                userToAdd.password = hash
                users.push(userToAdd)
                console.log(userToAdd)
            });
        });

        response.success = true
    } else {
        response.success = false
        console.log('userul exista deja')
    }

    res.send(response)
})

expressApp.post("/login", (req, res) => {

    let loginData = req.body
    console.log('vrei sa te autentifici cu ', loginData)

    let response = {}
    response.success = false

    const user = (users.find((user) => user.emailAddress === loginData.emailAddress))

    if (user === undefined) {
        response.user = false
        res.status(403).send('utilizatorul nu exista')
    } else {
        bcrypt.compare(loginData.password, user.password, function(err, result) {
            if (result) {

                let token = jwt.sign({
                    data: user.emailAddress
                }, serverSecret, { expiresIn: '1h' })

                console.log('tokenul tau este: ', token)
                res.send({ token })
            } else console.log('parola este gresita')
        });
    }
})

//web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAfaA39AQXVphJCYfhOomk_HhScW9nZGa8",
    authDomain: "proiect-tic-8999d.firebaseapp.com",
    projectId: "proiect-tic-8999d",
    storageBucket: "proiect-tic-8999d.appspot.com",
    messagingSenderId: "230041026803",
    appId: "1:230041026803:web:bf085e26a927d4d2747786"
};

// Initialize Firebase
let users = [{ emailAddress: 'manolachemihaiandrei@gmail.com', password: '$2b$10$hhq8.J6.nNcFBDZYurSqJunKJx2zs0MoCCuTywabfhJBrsBXBiQEW' }]
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getJobs(db) {
    const jobsCol = collection(db, 'jobs');
    const jobsSnapshot = await getDocs(jobsCol);
    const jobsList = jobsSnapshot.docs.map(doc => doc.data());

    for (const jobElement of jobsList) {
        const employeesCol = collection(db, 'jobs/' + jobElement.id + '/employees');
        const employeesSnapshot = await getDocs(employeesCol);
        const employeesList = employeesSnapshot.docs.map(doc => doc.data());

        jobElement.employees = employeesList;
    }

    return jobsList;
}

async function deleteEmployee(db, jobId, employeeId) {

    try {
        const employeeDocRef = doc(db, 'jobs/' + jobId + '/employees', employeeId);

        await deleteDoc(employeeDocRef);

        console.log(`Document with ID ${employeeId} was successfully deleted.`);
    } catch (error) {
        console.error(`Error deleting document with ID ${id}: ${error}`);
    }
}

// delete an employee based on its id
expressApp.delete('/jobs/:jobId/employees/:employeeId', verifyToken, (req, res) => {
    const jobId = req.params.jobId;
    const employeeId = req.params.employeeId;

    deleteEmployee(db, jobId, employeeId);

    // return a success response
    res.json({ message: 'Employee successfully deleted' });
});

async function updateEmployee(db, jobId, employeeId, updatedEmployee) {

    const employeeDocRef = doc(db, 'jobs/' + jobId + '/employees', employeeId);

    await updateDoc(employeeDocRef, {
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        photoURL: updatedEmployee.photoURL
    });
}

// update an employee based on its id
expressApp.put('/jobs/:jobId/employees/:employeeId', verifyToken, (req, res) => {
    const jobId = req.params.jobId;
    const employeeId = req.params.employeeId;

    const updatedEmployee = req.body;

    updateEmployee(db, jobId, employeeId, updatedEmployee);

    // return a success response
    res.json({ message: 'Employee successfully updated' });
});

async function createEmployee(db, jobId, createdEmployee) {

    // Add a new document with a generated id
    const employeeDocRef = doc(collection(db, '/jobs/' + jobId + '/employees'));

    const id = employeeDocRef.id;

    await setDoc(employeeDocRef, {
        id: id,
        name: createdEmployee.name,
        email: createdEmployee.email,
        photoURL: createdEmployee.photoURL
    });
}

expressApp.post('/jobs/:jobId/employees', verifyToken, (req, res) => {

    const jobId = req.params.jobId;

    const createdEmployee = req.body;

    createEmployee(db, jobId, createdEmployee);

    // return a success response
    res.json({ message: 'Employee successfully created' });
});

expressApp.get('/jobs', async(req, res) => {

    const response = await getJobs(db);

    res.status(200);
    res.send(response);
});

const chance = Chance();

expressApp.post('/jobs/:jobId/employees/fake', verifyToken, (req, res) => {

    for (let index = 0; index < 5; index++) {

        const jobId = req.params.jobId;

        const createdEmployee = {
            name: chance.name(),
            email: chance.email(),
            photoURL: chance.url()
        }

        createEmployee(db, jobId, createdEmployee);

    }
    // return a success response
    res.json({ message: 'Employees successfully created' });

});