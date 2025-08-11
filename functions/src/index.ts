// firebase/functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const firestore = admin.firestore();

exports.joinGroup = functions.https.onCall(async (data:any, context:any) => {
  const userId = context.auth?.uid;
  const { groupId } = data;

  // 1. Check for authentication and required data
  if (!userId) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to join a group.'
    );
  }

  if (!groupId || typeof groupId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with a valid groupId.'
    );
  }

  const groupRef = firestore.collection('groups').doc(groupId);
  const userRef = firestore.collection('users').doc(userId);

  try {
    await firestore.runTransaction(async (transaction) => {
      // 2. Read the current state of the documents
      const groupDoc = await transaction.get(groupRef);
      const userDoc = await transaction.get(userRef);

      if (!groupDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Group not found.');
      }
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
      }

      const groupData = groupDoc.data();

      // 3. Check if the user is already a member
      if (groupData?.memberCount && groupData.memberCount.includes(userId)) {
        throw new functions.https.HttpsError(
          'already-exists',
          'User is already a member of this group.'
        );
      }

      // 4. Update the documents using the transaction
      const updatedGroupData = {
        memberCount: admin.firestore.FieldValue.arrayUnion(userId),
        memberCountValue: admin.firestore.FieldValue.increment(1),
      };
      const updatedUserData = {
        groups: admin.firestore.FieldValue.arrayUnion(groupId),
      };

      transaction.update(groupRef, updatedGroupData);
      transaction.update(userRef, updatedUserData);
    });

    return { success: true };
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Transaction failed.', error);
  }
});