const functions = require('firebase-functions');

export const loadGoalsAndRoutines = functions.https.onRequest((request, response) => {
  const userId: string = req.get('userId').toString()
  const routineId: string = req.get('routineId').toString()
  const routineTitle: string = req.get('routineTitle').toString()
  const category: string = req.get('category').toString()
  var is_persistent: boolean = (category === 'Routine') ? true : false
  const photo: string = req.get('photo').toString()


  let userDoc = db.collection('users').doc(userId)
  let getUserDoc = userDoc.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        var goalsAndRoutines = doc.data();
        let item =
        {
          'id':  routineId,
          'title':  routineTitle,
          'audio': '',
          'available_end_time': '23:59:59',
          'available_start_time': '00:00:00',
          'category': category,
          'datetime_completed': '2020/02/03T08:32:42',
          'datetime_started': '2020/02/03T07:16:32',
          'is_available': true,
          'is_complete': false,
          'is_persistent': is_persistent,
          'is_timed': true,
          'notifies_ta': true,
          'photo': photo,
          'remind_types': ['push', 'text'],
          'reminds_user': true,
          'ta_notification_reasons': ['overtime','start','end'],
          'tags': ['morning', 'preparation']
        }

        goalsAndRoutines['goals&routines'].push(item)
        userDoc.set(goalsAndRoutines)

      }
      return doc.data();
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
    response.redirect(303, "success");
});

exports.loadGoalsAndRoutines = functions.https.onRequest(async (req, res) => {
  const userId: string = req.get('userId').toString()
  const routineId: string = req.get('routineId').toString()
  const routineTitle: string = req.get('routineTitle').toString()
  const category: string = req.get('category').toString()
  var is_persistent: boolean = (category === 'Routine') ? true : false
  const photo: string = req.get('photo').toString()


  let userDoc = db.collection('users').doc(userId)
  let getUserDoc = userDoc.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        var goalsAndRoutines = doc.data();
        let item =
        {
          'id':  routineId,
          'title':  routineTitle,
          'audio': '',
          'available_end_time': '23:59:59',
          'available_start_time': '00:00:00',
          'category': category,
          'datetime_completed': '2020/02/03T08:32:42',
          'datetime_started': '2020/02/03T07:16:32',
          'is_available': true,
          'is_complete': false,
          'is_persistent': is_persistent,
          'is_timed': true,
          'notifies_ta': true,
          'photo': photo,
          'remind_types': ['push', 'text'],
          'reminds_user': true,
          'ta_notification_reasons': ['overtime','start','end'],
          'tags': ['morning', 'preparation']
        }

        goalsAndRoutines['goals&routines'].push(item)
        userDoc.set(goalsAndRoutines)

      }
      return doc.data();
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
    response.redirect(303, "success");
});

exports.copyRoutineDoc = functions.https.onRequest(async (req, res) => {
  const userId = req.get('userId').toString()
  const routineId1 = req.get('routineId1').toString()
  const routineId2 = req.get('routineId2').toString()

  var docData

  let doc1 = db.collection('users').doc(userId).collection('routines').doc(routineId1)
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

  let doc2 = db.collection('users').doc(userId).collection('goals&routines').doc(routineId2)
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
