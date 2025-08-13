// firebase/functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const firestore = admin.firestore();

interface CreateGroupData {
  name: string;
  description: string;
  logoImgUrl?: string; 
  bannerImgUrl?: string; 
  tags: string; 
  rules?: string; 
}

interface CreateGroupResponse {
  success: boolean;
  groupId?: string;
  error?: string;
}

interface CreatePostData {
  groupId: string;
  title: string;
  content: string;
  imageUrl?: string;
}

interface CreatePostResponse {
  success: boolean;
  postId?: string;
  error?: string;
}

interface PostCommentData {
  postId: string;
  text: string;
}

interface PostCommentResponse {
  success: boolean;
  commentId?: string;
  error?: string;
}


exports.joinGroup = functions.https.onCall( async (request: functions.https.CallableRequest<{ groupId: string }>) => {
    const userId = request.auth?.uid;
    const { groupId } = request.data; 

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

exports.createGroup = functions.https.onCall(
 async (request: functions.https.CallableRequest<CreateGroupData>): Promise<CreateGroupResponse> => {
    const { name, description, tags, logoImgUrl, bannerImgUrl, rules } = request.data;

    const userId = request.auth?.uid;

    if (!userId) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to create a group.'
      );
    }

    if (!name || typeof name !== 'string' || name.length < 4) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Group name is required and must be at least 4 characters.'
      );
    }
    if (!description || typeof description !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Group description is required.'
      );
    }
    if (!tags || typeof tags !== 'string') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Tags are required.'
        );
      }
    
    const processedTags = tags.split(' ')
                      .map(tag => tag.trim())
                      .filter(tag => tag.length > 0);

    if (processedTags.length < 3) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Please provide at least 3 tags.'
        );
    }


    const newGroupData: any = {
      name,
      description,
      creatorId: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      memberCount: [userId], 
      memberCountValue: 1,
      tags: processedTags,
    };

    if (logoImgUrl) {
      newGroupData.logoImgUrl = logoImgUrl;
    }
    if (bannerImgUrl) {
      newGroupData.bannerImgUrl = bannerImgUrl;
    }
    if (rules) {
      const processedRules=rules.split('\n')
      .map(rule=> rule.trim())
      
      newGroupData.rules = processedRules;
    }

    try {
      const groupRef = await firestore.collection('groups').add(newGroupData);

      const userRef = firestore.collection('users').doc(userId);
      await userRef.update({
        groups: admin.firestore.FieldValue.arrayUnion(groupRef.id)
      });

      return { success: true, groupId: groupRef.id };
    } catch (error: any) {
      console.error('Error creating group:', error);
      if (error instanceof functions.https.HttpsError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Failed to create group. Internal server error.' };
    }
  }
);

exports.createPost = functions.https.onCall(
  async (request: functions.https.CallableRequest<CreatePostData>): Promise<CreatePostResponse> => {
    const userId = request.auth?.uid;
    const { groupId, title, content, imageUrl } = request.data;

    if (!userId) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create a post.');
    }
    if (!groupId || typeof groupId !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'A valid groupId is required.');
    }
    if (!title || typeof title !== 'string' || title.length < 5) {
      throw new functions.https.HttpsError('invalid-argument', 'Post title is required and must be at least 5 characters.');
    }

    if (!imageUrl && !content) {
      throw new functions.https.HttpsError('invalid-argument', 'Either an image or content must be provided for a post.');
    }

    try {
      const newPostData = {
        groupId,
        title,
        content: content || null,
        imageUrl: imageUrl || null,
        creatorId: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const postRef = await admin.firestore().collection('posts').add(newPostData);

      return { success: true, postId: postRef.id };
    } catch (error) {
      console.error('Error creating post:', error);
      throw new functions.https.HttpsError('internal', 'Failed to create post.');
    }
  }
);

exports.postComment = functions.https.onCall(
  async (request: functions.https.CallableRequest<PostCommentData>): Promise<PostCommentResponse> => {
    const userId = request.auth?.uid;
    const { postId, text } = request.data;


    if (!userId) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to post a comment.');
    }

    if (!postId || typeof postId !== 'string' || postId.trim() === '') {
      throw new functions.https.HttpsError('invalid-argument', 'A valid postId is required.');
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Comment text cannot be empty.');
    }

    const postsCollectionRef = admin.firestore().collection('posts');
    const postRef = postsCollectionRef.doc(postId);

    try {
      const postDoc = await postRef.get();
      if (!postDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'The post you are trying to comment on does not exist.');
      }


      const newCommentData = {
        userId: userId,
        postId: postId,
        text: text.trim(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const commentRef = await postRef.collection('comments').add(newCommentData);

      return { success: true, commentId: commentRef.id };

    } catch (error: any) {
      console.error('Error posting comment:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError('internal', 'Failed to post comment.');
    }
  }
);

// ----------------------------------------------------

async function deleteCollection(collectionPath: string, batchSize: number): Promise<void> {
  const collectionRef = firestore.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteDocumentsByQuery(query: admin.firestore.Query, batchSize: number, subcollectionNames: string[] = []): Promise<void> {
  const snapshot = await query.get();
  if (snapshot.size === 0) {
    return;
  }

  const batch = firestore.batch();
  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);

    // Recursively delete subcollections
    for (const subColName of subcollectionNames) {
      await deleteCollectionRecursively(doc.ref.collection(subColName), batchSize);
    }
  }

  await batch.commit();

  // If there are more documents, process the next batch
  if (snapshot.size === batchSize) {
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const nextQuery = query.startAfter(lastDoc.data().createdAt || lastDoc); // Use a timestamp for ordered queries if possible
    await deleteDocumentsByQuery(nextQuery, batchSize, subcollectionNames);
  }
}

async function deleteCollectionRecursively(collectionRef: admin.firestore.CollectionReference, batchSize: number): Promise<void> {
  const query = collectionRef.orderBy('__name__').limit(batchSize); // Use __name__ for generic ordering
  return new Promise<void>((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query: admin.firestore.Query, resolve: () => void): Promise<void> {
  const snapshot = await query.get();
  if (snapshot.size === 0) {
    return resolve();
  }

  const batch = firestore.batch();
  snapshot.docs.forEach((doc: any) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  // Process next batch in next event loop tick
  if (snapshot.size === query.limit) { // Check if we processed a full batch
    process.nextTick(() => deleteQueryBatch(query, resolve));
  } else {
    resolve();
  }
}
// ----------------------------------------------------

exports.deleteGroup = functions.https.onCall(
  async (request: functions.https.CallableRequest<{ groupId: string }>) => {
  const userId = request.auth?.uid;
  const { groupId } = request.data;

  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const groupRef = firestore.collection('groups').doc(groupId);
  const creatorRef = firestore.collection('users').doc(userId);

  await firestore.runTransaction(async (transaction) => {
    const groupDoc = await transaction.get(groupRef);
    if (!groupDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Group not found.');
    }
    
    const groupData = groupDoc.data();
    if (groupData?.creatorId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Only the group creator can delete the group.');
    }

    transaction.delete(groupRef);

    transaction.update(creatorRef, {
      groups: admin.firestore.FieldValue.arrayRemove(groupId)
    });
  });

  await deleteCollection(`groups/${groupId}/posts`, 100);

  return { success: true };
});


exports.deletePost = functions.https.onCall(async (request: functions.https.CallableRequest<{ postId: string }>) => {
  const userId = request.auth?.uid;
  const { postId } = request.data;

  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const postRef = firestore.collection('posts').doc(postId);
  
  await firestore.runTransaction(async (transaction) => {
    const postDoc = await transaction.get(postRef);
    if (!postDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Post not found.');
    }
    
    const postData = postDoc.data();
    if (postData?.creatorId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Only the post creator can delete the post.');
    }

    transaction.delete(postRef);
    
    const userRef = firestore.collection('users').doc(userId);
    transaction.update(userRef, { posts: admin.firestore.FieldValue.arrayRemove(postId) });
  });

  await deleteCollection(`posts/${postId}/comments`, 100);

  return { success: true };
});


exports.deleteComment = functions.https.onCall(async (request: functions.https.CallableRequest<{ postId: string; commentId: string }>) => {
  const userId = request.auth?.uid;
  const { postId, commentId } = request.data;

  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to delete a comment.');
  }

  const commentRef = firestore.collection('posts').doc(postId).collection('comments').doc(commentId);
  
  const commentDoc = await commentRef.get();
  if (!commentDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Comment not found.');
  }
  
  const commentData = commentDoc.data();
  if (commentData?.userId !== userId) {
    throw new functions.https.HttpsError('permission-denied', 'Only the comment creator can delete the comment.');
  }

  await commentRef.delete();

  return { success: true };
});




// --- Main Delete User Account Function ---
exports.deleteUserAccount = functions.https.onCall(async (request: functions.https.CallableRequest<void>) => {
  const userId = request.auth?.uid;

  // 1. Authentication Check: Ensure user is logged in
  if (!userId) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to delete their account.'
    );
  }

  const BATCH_SIZE = 100; // Define a batch size for deletions

  try {
    // 2. Delete all comments created by the user
    console.log(`Deleting comments by user ${userId}...`);
    const userCommentsQuery = firestore.collectionGroup('comments').where('userId', '==', userId);
    await deleteDocumentsByQuery(userCommentsQuery, BATCH_SIZE); // No subcollections for comments

    // 3. Delete all posts created by the user (and their sub-comments)
    console.log(`Deleting posts by user ${userId}...`);
    const userPostsQuery = firestore.collection('posts').where('creatorId', '==', userId);
    await deleteDocumentsByQuery(userPostsQuery, BATCH_SIZE, ['comments']); // Posts have 'comments' subcollection

    // 4. Delete all groups created by the user (and their sub-posts and comments)
    console.log(`Deleting groups by user ${userId}...`);
    const userGroupsQuery = firestore.collection('groups').where('creatorId', '==', userId);
    await deleteDocumentsByQuery(userGroupsQuery, BATCH_SIZE, ['posts', 'comments']); // Groups might have 'posts' and 'comments' subcollections (adjust if your posts are directly under group or separate)

    // 5. Clean up user's ID from 'memberCount' arrays in groups they joined
    console.log(`Cleaning up user ${userId} from group memberships...`);
    const groupsUserIsMemberOfQuery = firestore.collection('groups').where('memberCount', 'array-contains', userId);
    const groupsSnapshot = await groupsUserIsMemberOfQuery.get();
    const cleanupBatch = firestore.batch();
    groupsSnapshot.docs.forEach(doc => {
        cleanupBatch.update(doc.ref, {
            memberCount: admin.firestore.FieldValue.arrayRemove(userId),
            memberCountValue: admin.firestore.FieldValue.increment(-1)
        });
    });
    await cleanupBatch.commit();


    // 6. Delete the Firestore User Document itself
    console.log(`Deleting user document for ${userId}...`);
    await firestore.collection('users').doc(userId).delete();

    // 7. Finally, delete the Firebase Authentication User Record
    console.log(`Deleting Firebase Auth user ${userId}...`);
    await admin.auth().deleteUser(userId);

    console.log(`User ${userId} and all associated data deleted successfully.`);
    return { success: true };

  } catch (error: any) {
    console.error('Error deleting user account and data:', error);
    // Be careful with exposing too much detail in production errors
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to delete user account and associated data.');
  }
});