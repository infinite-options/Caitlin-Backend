import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const firebase_tools = require('firebase-tools');
const serviceAccount = require('../ServiceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

export const AddGoalOrRoutine = functions.https.onRequest((request, response) => {
    const userId = request.get('userId')?.toString()
    const routineId = request.get('routineId')?.toString()
    const routineTitle = request.get('routineTitle')?.toString()
    const is_persistent = (request.get('routineTitle')?.toString() === 'true'
    || request.get('routineTitle')?.toString() === 'True') ? true : false
    const photo = request.get('photo')?.toString()
    const notes = request.get('notes')?.toString()
    const necessaryToComplete = request.get('necessaryToComplete')?.toString()
    const isAvailable = (request.get('isAvailable')?.toString() === 'true')
    const availableStartTime = request.get('availableStartTime')?.toString()
    const availableEndTime = request.get('availableEndTime')?.toString()

    if (userId && routineId && routineTitle && photo && notes && is_persistent && isAvailable && availableStartTime && availableEndTime) {
        const userDoc = db.collection('users').doc(userId)
        userDoc.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                const goalsAndRoutines = doc.data();
                const item =
                {
                    'id':  routineId,
                    'title':  routineTitle,
                    'audio': '',
                    'available_end_time': availableEndTime,
                    'available_start_time': availableStartTime,
                    'datetime_completed': '2020/02/03T08:32:42',
                    'datetime_started': '2020/02/03T07:16:32',
                    'is_available': isAvailable,
                    'is_complete': false,
                    'is_persistent': is_persistent,
                    'is_timed': true,
                    'necessary_to_complete': necessaryToComplete,
                    'notes': notes,
                    'notifies_ta': true,
                    'photo': photo,
                    'remind_types': ['push', 'text'],
                    'reminds_user': true,
                    'ta_notification_reasons': ['overtime','start','end'],
                    'tags': ['morning', 'preparation']
                }

                if (goalsAndRoutines) {
                    // check if the goals&routines array exists
                    if(!goalsAndRoutines['goals&routines']) {
                        goalsAndRoutines.push({'goals&routines': []})
                    }
                    goalsAndRoutines['goals&routines'].push(item)
                    userDoc.set(goalsAndRoutines).then().catch()
                }
            }
            return doc.data();
        })
        .catch(err => {
            console.log('Error getting document', err);
        })
        response.redirect(303, "success");
    } else {
        response.redirect(400, "Bad Request: Missing request headers.");
    }
});

export const AddActionOrTask = functions.https.onRequest((request, response) => {
    const userId = request.get('userId')?.toString()
    const routineId = request.get('routineId')?.toString()
    const taskId = request.get('taskId')?.toString()
    const taskTitle = request.get('taskTitle')?.toString()
    const photo = request.get('photo')?.toString()
    const notes = request.get('notes')?.toString()
    const isAvailable = (request.get('isAvailable')?.toString() === 'true')
    const availableStartTime = request.get('availableStartTime')?.toString()
    const availableEndTime = request.get('availableEndTime')?.toString()

    if (userId && routineId && taskId && taskTitle && photo && notes && isAvailable && availableStartTime && availableEndTime) {
        const routineDoc = db.collection('users').doc(userId).collection('goals&routines').doc(routineId)
        routineDoc.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                const actionsAndtasks = doc.data();
                const item =
                {
                    'id':  taskId,
                    'title':  taskTitle,
                    'audio': '',
                    'available_end_time': availableEndTime,
                    'available_start_time': availableStartTime,
                    'datetime_completed': '2020/02/03T08:32:42',
                    'datetime_started': '2020/02/03T07:16:32',
                    'is_available': isAvailable,
                    'is_complete': false,
                    'is_timed': true,
                    'notes': notes,
                    'notifies_ta': true,
                    'photo': photo,
                    'remind_types': ['push', 'text'],
                    'reminds_user': true,
                    'ta_notification_reasons': ['overtime','start','end'],
                    'tags': ['morning', 'preparation']
                }

                if (actionsAndtasks) {
                    // check if the goals&routines array exists
                    if(!actionsAndtasks['actions&tasks']) {
                        actionsAndtasks.push({'actions&tasks': []})
                    }
                    actionsAndtasks['actions&tasks'].push(item)
                    routineDoc.set(actionsAndtasks).then().catch()
                }
            }
            return doc.data();
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
    }
    response.redirect(303, "success");
});

export const AddInstructionOrStep = functions.https.onRequest((request, response) => {
    const userId = request.get('userId')?.toString()
    const routineId = request.get('routineId')?.toString()
    const taskId = request.get('taskId')?.toString()
    const stepTitle = request.get('stepTitle')?.toString()
    const photo = request.get('photo')?.toString()
    const notes = request.get('notes')?.toString()
    const notifiesTa = (request.get('notifiesTa')?.toString() === 'true')
    const isAvailable = (request.get('isAvailable')?.toString() === 'true')
    const availableStartTime = request.get('availableStartTime')?.toString()
    const availableEndTime = request.get('availableEndTime')?.toString()

    const taNotificationReasons = notifiesTa ? ['overtime','start','end'] : []
    const remindsUser = (request.get('remindsUser')?.toString() === 'true')
    const remindTypes = remindsUser ? ['push', 'text'] : []

    if (userId && routineId && taskId && stepTitle && photo && notes && notifiesTa && isAvailable && availableStartTime && availableEndTime) {
        const taskDoc = db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks').doc(taskId)
        taskDoc.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                const instructionsAndSteps = doc.data();
                const item =
                {
                    'title':  stepTitle,
                    'audio': '',
                    'available_end_time': availableEndTime,
                    'available_start_time': availableStartTime,
                    'datetime_completed': '2020/02/03T08:32:42',
                    'datetime_started': '2020/02/03T07:16:32',
                    'is_available': isAvailable,
                    'is_complete': false,
                    'is_timed': true,
                    'notes': notes,
                    'notifies_ta': notifiesTa,
                    'photo': photo,
                    'remind_types': remindTypes,
                    'reminds_user': remindsUser,
                    'status': 'Planned',
                    'ta_notification_reasons': taNotificationReasons,
                    'tags': ['morning', 'preparation']
                }

                if (instructionsAndSteps) {
                    // check if the goals&routines array exists
                    if(!instructionsAndSteps['instructions&steps']) {
                        instructionsAndSteps['instructions&steps'] = []
                    }
                    instructionsAndSteps['instructions&steps'].push(item)
                    taskDoc.set(instructionsAndSteps).then().catch()
                }
            }
            return doc.data();
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
    }
    response.redirect(303, "success");
});

export const StartTaskStep = functions.https.onRequest((request, response) => {
    // Grab the text parameter.
    const userId = request.get('userId')?.toString()
    const routineId = request.get('routineId')?.toString()
    const taskId = request.get('taskId')?.toString()
    const stepNumberReq = request.get('stepNumber')?.toString()
    let stepNumber: number

    if (userId && routineId && taskId && stepNumberReq) {
        const task = db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks').doc(taskId);
        task.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                stepNumber = parseInt(stepNumberReq)
                const steps = doc.data()!;
                steps['instructions&steps'][stepNumber].datetime_started = getCurrentDateTimeUTC()
                task.set(steps).then().catch();
            }
            return routineId;
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
    }
    response.redirect(303, "success");
});

export const CompleteInstructionOrStep = functions.https.onRequest((request, response) => {
    // Grab the text parameter.
    const userId = request.get('userId')?.toString()
    const routineId = request.get('routineId')?.toString()
    const taskId = request.get('taskId')?.toString()
    const stepNumberReq = request.get('stepNumber')?.toString()
    let stepNumber: number

    if (userId && routineId && taskId && stepNumberReq) {
        const task = db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks').doc(taskId);
        task.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                stepNumber = parseInt(stepNumberReq)
                const steps = doc.data()!;
                // console.log('Document data:', doc.data());

                steps['instructions&steps'][stepNumber].is_complete = true;
                steps['instructions&steps'][stepNumber].datetime_completed = getCurrentDateTimeUTC()

                task.set(steps).then().catch();
            }
            return routineId;
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
    }
    response.redirect(303, "success");
});

export const CompleteActionOrTask = functions.https.onRequest((request, response) => {
    // Grab the text parameter.
    const userId = request.get('userId')?.toString()
    const routineId = request.get('routineId')?.toString()
    const taskId = request.get('taskId')?.toString()
    const taskNumberReq = request.get('taskNumber')?.toString()
    let taskNumber: number

    if (userId && routineId && taskId && taskNumberReq) {
        const routine = db.collection('users').doc(userId).collection('goals&routines').doc(routineId)
        routine.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                taskNumber = parseInt(taskNumberReq)
                const tasks = doc.data()!;
                // console.log('Document data:', doc.data());

                if (tasks['actions&tasks'][taskNumber].id === taskId) {
                    tasks['actions&tasks'][taskNumber].is_complete = true;
                    tasks['actions&tasks'][taskNumber].datetime_completed = getCurrentDateTimeUTC()
                    routine.set(tasks).then().catch();
                } else {
                    for (let i: number = 0; i < tasks['actions&tasks'].length; i++) {
                        if (tasks['actions&tasks'][i].id === taskId) {
                            tasks['actions&tasks'][i].is_complete = true;
                            tasks['actions&tasks'][i].datetime_completed = getCurrentDateTimeUTC()
                            routine.set(tasks).then().catch();
                        }
                    }
                }
            }
            return taskId;
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
    }
    response.redirect(303, "success");
});

export const CompleteGoalOrRoutine = functions.https.onRequest((request, response) => {
    // Grab the text parameter.
    const userId = request.get('userId')?.toString()
    const routineId = request.get('routineId')?.toString()
    const routineNumberReq = request.get('routineNumber')?.toString()
    let routineNumber: number

    if (userId && routineId && routineNumberReq) {
        const user = db.collection('users').doc(userId)
        user.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                routineNumber = parseInt(routineNumberReq)
                const routines = doc.data()!;
                // console.log('Document data:', doc.data());

                if (routines['goals&routines'][routineNumber].id === routineId) {
                    routines['goals&routines'][routineNumber].is_complete = true;
                    routines['goals&routines'][routineNumber].datetime_completed = getCurrentDateTimeUTC()
                    user.set(routines).then().catch();
                } else {
                    for (let i: number = 0; i < routines['goals&routines'].length; i++) {
                        if (routines['goals&routines'][i].id === routineId) {
                            routines['goals&routines'][i].is_complete = true;
                            routines['goals&routines'][i].datetime_completed = getCurrentDateTimeUTC()
                            user.set(routines).then().catch();
                        }
                    }
                }
            }
            return routineId;
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
    }
    response.redirect(303, "success");
});

export const GRUserNotificationSetToTrue = functions.https.onRequest((request, response) => {
    // Grab the text parameter.
    const userId = request.get('userId')?.toString()
    const routineId = request.get('routineId')?.toString()
    const routineNumberReq = request.get('routineNumber')?.toString()
    let routineNumber: number

    if (userId && routineId && routineNumberReq) {
        const user = db.collection('users').doc(userId)
        user.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                routineNumber = parseInt(routineNumberReq)
                const routines = doc.data()!;
                // console.log('Document data:', doc.data());

                if (routines['goals&routines'][routineNumber].id === routineId) {
                    routines['goals&routines'][routineNumber].user_notification_set = true;
                    user.set(routines).then().catch();
                } else {
                    for (let i: number = 0; i < routines['goals&routines'].length; i++) {
                        if (routines['goals&routines'][i].id === routineId) {
                            routines['goals&routines'][i].user_notification_set = true;
                            user.set(routines).then().catch();
                        }
                    }
                }
            }
            return routineId;
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
    }
    response.redirect(303, "success");
});

export const AddNotificationField = functions.https.onRequest(async (request, response) => {

    let atCollections: string[] = []
    let isCollections: string[] = []

    await db.collection('users').get()
    .then(snapshot => {
        snapshot.forEach(doc => {
            const data = doc.data()
            for (const grItem of data['goals&routines']) {
                setNotificationData(grItem['ta_notifications'])
                setNotificationData(grItem['user_notifications'])
                atCollections.push(doc.ref.path + '/goals&routines')
                deleteFields(grItem)
            }

            db.doc(doc.ref.path).set(data).then().catch();
        });
    })
    .catch(err => {
        console.log('Error getting documents', err);
    });

    for (const collection of atCollections) {
        db.collection(collection).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const data = doc.data()
                    for (const grItem of data['actions&tasks']) {
                        setNotificationData(grItem['ta_notifications'])
                        setNotificationData(grItem['user_notifications'])
                        atCollections.push(doc.ref.path + '/actions&tasks')
                        deleteFields(grItem)
                    }
                    db.doc(doc.ref.path).set(data).then().catch();
                });
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
    }

    for (const collection of isCollections) {
        await db.collection(collection).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const data = doc.data()
                    for (const grItem of data['instructions&steps']) {
                        setNotificationData(grItem['ta_notifications'])
                        setNotificationData(grItem['user_notifications'])
                        atCollections.push(doc.ref.path + '/instructions&steps')
                        deleteFields(grItem)
                    }
                    db.doc(doc.ref.path).set(data).then().catch();
                });
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
    }
    response.redirect(303, "success");
});

export const AddCollectionField = functions.https.onRequest((request, response) => {
    // Grab the text parameter.
    const collection = request.get('collection')?.toString() // 'goals&routines'
    const field = request.get('field')?.toString() // 'expected_time'
    const valueType = request.get('valueType')?.toString() // string
    const valueReq = request.get('value')?.toString() // '00:10:00'
    const userId = request.get('userId')?.toString() // '7R6hAVmDrNutRkG3sVRy'
    const routineId = request.get('routineId')?.toString() // 'LALObb6XDRk5wr2E8w2C'

    if (collection && field && valueType && valueReq && userId && routineId) {
        let docsToAdd: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
        switch (collection) {
            case 'goals&routines':
                docsToAdd = db.collection('users')
                break;
            case 'actions&tasks':
                docsToAdd = db.collection('users').doc(userId).collection('goals&routines')
                break;
            case 'instructions&steps':
                docsToAdd = db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks')
                break;
            default:
                docsToAdd = db.collection('wrongCollection')
        }

        docsToAdd.get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const data = doc.data()
                for (let i: number = 0; i < data[collection].length; i++) {
                    data[collection][i][field] = parseValue(valueReq, valueType)
                }
                console.log('document data: ', data)
                db.doc(doc.ref.path).set(data).then().catch();
            });
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
        response.redirect(303, "success");
    } else {
        response.redirect(500, "Internal Server Error");
    }
});

export const CopyDocDataToChild = functions.https.onRequest((request, response) => {
    // Grab the text parameter.
    const collection = request.get('collection')?.toString()
    const userId = request.get('userId')?.toString()
    const routineId = request.get('routineId')?.toString()
    const taskId = request.get('taskId')?.toString()

    let docCopyData: FirebaseFirestore.DocumentData

    let docToCopy: FirebaseFirestore.DocumentReference
    let copyToDoc: FirebaseFirestore.DocumentReference

    if (collection && userId && routineId && taskId) {
        switch (collection) {
            case 'goals&routines':
            docToCopy = db.collection('users').doc(userId)
            copyToDoc = db.collection('users').doc(userId).collection('goals&routines').doc(routineId)
            break;
            case 'actions&tasks':
            docToCopy = db.collection('users').doc(userId).collection('goals&routines').doc(routineId)
            copyToDoc = db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks').doc(taskId)
            break;
            case 'instructions&steps':
            docToCopy = db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks').doc(taskId)
            copyToDoc= db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks').doc(taskId).collection('instructions&steps').doc(taskId)
            break;
            default:
            docToCopy = db.collection('users').doc('wrongCollection')
            copyToDoc = db.collection('users').doc('wrongCollection')

        }

        docToCopy.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                docCopyData = doc.data()![collection];
                console.log('Document data:', doc.data())
            }
            return routineId;
        })
        .catch(err => {
            console.log('Error getting document', err);
        });

        copyToDoc.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                const currentData = doc.data()!;
                console.log('Document data:', doc.data());

                currentData.push(docCopyData)

                copyToDoc.set(currentData).then().catch();
            }
            return routineId;
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
    }

    response.redirect(303, "success");
});

export const SetUserGoogleAuthToken = functions.https.onRequest((request, response) => {
    // Grab the text parameter.
    const token = request.get('token')?.toString()
    const userId = request.get('userId')?.toString()


    if (token && userId) {

        const userDoc = db.collection('users').doc(userId)
        userDoc.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                const userFields = doc.data();

                if (userFields) {
                    userFields['google_auth_token'] = token
                    userDoc.set(userFields).then().catch();
                }
            }
            return userDoc;
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
    }
    response.redirect(303, "success");
});

export const SetUserGoogleRefreshToken = functions.https.onRequest((request, response) => {
    // Grab the text parameter.
    const token = request.get('token')?.toString()
    const userId = request.get('userId')?.toString()


    if (token && userId) {

        const userDoc = db.collection('users').doc(userId)
        userDoc.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                const userFields = doc.data();

                if (userFields) {
                    userFields['google_refresh_token'] = token
                    userDoc.set(userFields).then().catch();
                }
            }
            return userDoc;
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
    }
    response.redirect(303, "success");
});

/**
* Initiate a recursive delete of documents at a given path.
*
* The calling user must be authenticated and have the custom "admin" attribute
* set to true on the auth token.
*
* This delete is NOT an atomic operation and it's possible
* that it may fail after only deleting some documents.
*
* @param {string} data.path the document or collection path to delete.
*/
exports.RecursiveDelete = functions
.runWith({
    timeoutSeconds: 540,
    memory: '2GB'
})
.https.onCall((data, context) => {
    // Only allow admin users to execute this function.
    if (!(context.auth && context.auth.token && context.auth.token.admin)) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Must be an administrative user to initiate delete.'
        );
    }

    const path = data.path;
    console.log(
        `User ${context.auth.uid} has requested to delete path ${path}`
    );

    // Run a recursive delete on the given document or collection path.
    // The 'token' must be set in the functions config, and can be generated
    // at the command line by running 'firebase login:ci'.
    return firebase_tools.firestore
    .delete(path, {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        yes: true,
        token: functions.config().fb.token
    })
    .then(() => {
        return {
            path: path
        };
    });
});


function getCurrentDateTimeUTC() {
    const today = new Date()
    return today.toUTCString()
}

function parseValue(value: string, valueType: string): any {
    switch (valueType) {
        case 'boolean':
            switch (value.toLowerCase()) {
                case 'true':
                    return true
                    break;
                case 'false':
                    return false
                    break;
                default:
                    return false
                    break;
            }
            break;

        case 'integer':
            return Number(value)
            break;

        default:
            return value
            break;
    }
}

function setNotificationData(notificationData:any) {
    for (const time of ['before', 'during', 'after']) {
        if (!('time' in notificationData)) {
            notificationData[time]['time'] = '00:10:00'
        }
        if (!('message' in notificationData)) {
            notificationData[time]['message'] = ''
        }
        if (!('is_enabled' in notificationData)) {
            notificationData[time]['is_enabled'] = false
        }
        if (!('is_set' in notificationData)) {
            notificationData[time]['is_set'] = false
        }
    }
    delete notificationData['is_set']
    delete notificationData['message']
    delete notificationData['is_enabled']
    delete notificationData['time']
}

function deleteFields(data:any) {
    delete data['user_notification_set']
    delete data['ta_notification_reasons']
    delete data['remind_types']
    delete data['reminds_user']
    delete data['notifies_ta']
}
