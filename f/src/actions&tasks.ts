const functions = require('firebase-functions');

exports.loadActionsAndtasks = functions.https.onRequest(async (req, res) => {
  const userId = req.get('userId').toString()
  const routineId = req.get('routineId').toString()
  const taskId = req.get('taskId').toString()
  const taskTitle = req.get('taskTitle').toString()
  const photo = req.get('photo').toString()


  let routineDoc = db.collection('users').doc(userId).collection('goals&routines').doc(routineId)
  let getRoutineDoc = routineDoc.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        var actionsAndtasks = doc.data();
        let item =
        {
          'id':  taskId,
          'title':  taskTitle,
          'audio': '',
          'available_end_time': '23:59:59',
          'available_start_time': '00:00:00',
          'datetime_completed': '2020/02/03T08:32:42',
          'datetime_started': '2020/02/03T07:16:32',
          'is_available': true,
          'is_complete': false,
          'is_timed': true,
          'notifies_ta': true,
          'photo': photo,
          'remind_types': ['push', 'text'],
          'reminds_user': true,
          'ta_notification_reasons': ['overtime','start','end'],
          'tags': ['morning', 'preparation']
        }

        actionsAndtasks['actions&tasks'].push(item)
        routineDoc.set(actionsAndtasks)

      }
      return doc.data();
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
    res.redirect(303, "success");
});

exports.copyTaskDoc = functions.https.onRequest(async (req, res) => {
  const userId = req.get('userId').toString()
  const routineId1 = req.get('routineId1').toString()
  const routineId2 = req.get('routineId2').toString()
  const taskId1 = req.get('taskId1').toString()
  const taskId2 = req.get('taskId2').toString()

  var docData

  let doc1 = db.collection('users').doc(userId).collection('routines').doc(routineId1).collection('tasks').doc(taskId1)
  let getDoc1 = doc1.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        docData = doc.data()
        console.log('docData: ' + docData)
      }
      return docData;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });

  let doc2 = db.collection('users').doc(userId).collection('goals&routines').doc(routineId2).collection('actions&tasks').doc(taskId2)
  let getDoc2 = doc2.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        doc2.set(docData)
      }
      return docData;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
    res.redirect(303, "success");
});

exports.renameTasksArray = functions.https.onRequest(async (req, res) => {
  const userId = req.get('userId').toString()
  const routineId1 = req.get('routineId1').toString()

  let doc1 = db.collection('users').doc(userId).collection('goals&routines').doc(routineId1)
  let getDoc1 = doc1.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        var tasks = doc.data();
        let newNameData =
        {
          'actions&tasks': tasks.tasks
        }

        doc1.set(newNameData)

      }
      return doc.data();
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
    res.redirect(303, "success");
});
