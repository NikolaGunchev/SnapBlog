import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

admin.initializeApp();
const firestore = admin.firestore();
const storage = admin.storage();

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
  creatorName:string;
}

interface CreatePostResponse {
  success: boolean;
  postId?: string;
  error?: string;
}

interface PostCommentData {
  postId: string;
  text: string;
  creatorName:string
}

interface PostCommentResponse {
  success: boolean;
  commentId?: string;
  error?: string;
}

interface BasicResponse {
  success: boolean;
  error?: string;
}

interface EditGroupData {
  groupId: string;
  name?: string;
  description?: string;
  tags?: string; 
  rules?: string;
  newLogoImgUrl?: string | null;
  newBannerImgUrl?: string | null;
}

interface EditPostData {
  postId: string;
  title?: string;
  content?: string;
  newImageUrl?: string | null;
}

interface EditProfileData {
  username?: string;
  bio?: string;
}


exports.joinGroup = functions.https.onCall(
  {region: 'europe-west1'},
  async (request: functions.https.CallableRequest<{ groupId: string }>) => {
    const userId = request.auth?.uid;
    const { groupId } = request.data; 

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
        const groupDoc = await transaction.get(groupRef);
        const userDoc = await transaction.get(userRef);

        if (!groupDoc.exists) {
          throw new functions.https.HttpsError('not-found', 'Group not found.');
        }
        if (!userDoc.exists) {
          throw new functions.https.HttpsError('not-found', 'User profile not found.');
        }

        const groupData = groupDoc.data();


        if (groupData?.members && groupData.members.includes(userId)) {
          throw new functions.https.HttpsError(
            'already-exists',
            'User is already a member of this group.'
          );
        }

        const updatedGroupData = {
          members: admin.firestore.FieldValue.arrayUnion(userId),
          memberCount: admin.firestore.FieldValue.increment(1),
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
  }
);

exports.leaveGroup = functions.https.onCall(
  {region: 'europe-west1'},
  async (request: functions.https.CallableRequest<{ groupId: string }>) => {
    const userId = request.auth?.uid;
    const { groupId } = request.data; 

    if (!userId) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to leave a group.'
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
      // 3. Firestore Transaction for Atomicity
      await firestore.runTransaction(async (transaction) => {
        const groupDoc = await transaction.get(groupRef);
        const userDoc = await transaction.get(userRef);

        // Check if documents exist
        if (!groupDoc.exists) {
          throw new functions.https.HttpsError('not-found', 'Group not found.');
        }
        if (!userDoc.exists) {
          // This should ideally not happen if the user is authenticated,
          // but it's a good safety check.
          throw new functions.https.HttpsError('not-found', 'User profile not found.');
        }

        const groupData = groupDoc.data();

        // 4. Check if User is a Member
        // Ensure 'members' field exists and contains the userId
        if (!groupData?.members || !groupData.members.includes(userId)) {
          throw new functions.https.HttpsError(
            'failed-precondition', // Use failed-precondition as user is not a member
            'User is not a member of this group.'
          );
        }

        // 5. Update Group Document
        // Remove user from 'members' array and decrement 'memberCount'
        const updatedGroupData = {
          members: admin.firestore.FieldValue.arrayRemove(userId),
          memberCount: admin.firestore.FieldValue.increment(-1),
        };
        transaction.update(groupRef, updatedGroupData);

        // 6. Update User Document
        // Remove group ID from user's 'groups' array
        const updatedUserData = {
          groups: admin.firestore.FieldValue.arrayRemove(groupId),
        };
        transaction.update(userRef, updatedUserData);
      });

      // 7. Return Success
      return { success: true };
    } catch (error: any) {
      // 8. Error Handling
      console.error('Error leaving group:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      // Re-throw as a generic internal error if not already an HttpsError
      throw new functions.https.HttpsError('internal', 'Failed to leave group.');
    }
  }
);

exports.createGroup = functions.https.onCall(
  { region: 'europe-west1' },
  async (request: functions.https.CallableRequest<CreateGroupData>): Promise<CreateGroupResponse> => {
    
    const { name, description, tags, logoImgUrl, bannerImgUrl, rules } = request.data;
    const userId = request.auth?.uid;

    if (!userId) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create a group.');
    }

      if (!name || typeof name !== 'string' || name.length < 4) {
      throw new functions.https.HttpsError('invalid-argument', 'Group name is required and must be at least 4 characters.');
    }
    if (!description || typeof description !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Group description is required.');
    }
    if (!tags || typeof tags !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Tags are required.');
    }
    
    const processedTags = tags.split(' ')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (processedTags.length < 3) {
      throw new functions.https.HttpsError('invalid-argument', 'Please provide at least 3 tags.');
    }

    const newGroupData: any = {
      name,
      description,
      creatorId: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      members: [userId],
      memberCount: 1,
      tags: processedTags,
      rules:[]
    };
    
    if (logoImgUrl) {
      newGroupData.logoImgUrl = logoImgUrl;
    }
    if (bannerImgUrl) {
      newGroupData.bannerImgUrl = bannerImgUrl;
    }
    if (rules) {
      const processedRules = rules.split('\n')
        .map(rule => rule.trim());
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
      return { success: false, error: 'Failed to create group. Internal server error.' };
    }
  }
);

exports.createPost = functions.https.onCall(
  {region: 'europe-west1'},
  async (request: functions.https.CallableRequest<CreatePostData>): Promise<CreatePostResponse> => {
    const { groupId, title, content, imageUrl, creatorName } = request.data;
    const userId = request.auth?.uid;

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
        userId: userId,
        creatorName:creatorName,
        commentsCount:0,
        likesCount:0,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
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
  {region: 'europe-west1'},
  async (request: functions.https.CallableRequest<PostCommentData>): Promise<PostCommentResponse> => {
    const userId = request.auth?.uid;
    const { postId, text, creatorName } = request.data;


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
        creatorId: userId,
        postId: postId,
        text: text.trim(),
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        creatorName:creatorName
      };

      const commentRef = await postRef.collection('comments').add(newCommentData);

      await postRef.update({
          commentsCount: admin.firestore.FieldValue.increment(1)
      });

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

async function deleteQueryBatch(query: admin.firestore.Query, batchSize:number, resolve: () => void): Promise<void> {
  const snapshot = await query.get();
  if (snapshot.size === 0) {
    return resolve();
  }

  const batch = firestore.batch();
  snapshot.docs.forEach((doc: any) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  if (snapshot.size === batchSize) {
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const nextQuery = query.startAfter(lastDoc).limit(batchSize); 
    process.nextTick(() => deleteQueryBatch(nextQuery, batchSize, resolve));
  } else {
    resolve();
  }
}

async function deleteCollectionRecursively(collectionRef: admin.firestore.CollectionReference, batchSize: number): Promise<void> {
  const query = collectionRef.orderBy('__name__').limit(batchSize);
  return new Promise<void>((resolve, reject) => {
    deleteQueryBatch(query, batchSize, resolve).catch(reject);
  });
}

async function deleteDocumentsByQuery(query: admin.firestore.Query, batchSize: number, subcollectionNames: string[] = []): Promise<void> {
  let snapshot = await query.get();

  if (snapshot.size === 0) {
    return;
  }

  const batch = firestore.batch();
  const subcollectionDeletionPromises: Promise<void>[] = [];

  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);

    for (const subColName of subcollectionNames) {
      subcollectionDeletionPromises.push(
        deleteCollectionRecursively(doc.ref.collection(subColName), batchSize)
      );
    }
  }

  await batch.commit();

  await Promise.all(subcollectionDeletionPromises);

  if (snapshot.size === batchSize) {
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const nextQuery = query.startAfter(lastDoc); 
    await deleteDocumentsByQuery(nextQuery, batchSize, subcollectionNames);
  }
}

function getStoragePathFromUrl(url: string): string | null {
  try {
    const bucketAndPath = url.split('appspot.com/o/')[1];
    if (bucketAndPath) {
      // Decode the path and remove any query parameters/tokens
      const filePath = decodeURIComponent(bucketAndPath.split('?')[0]);
      return filePath;
    }
  } catch (e) {
    console.error("Failed to parse storage path from URL:", url, e);
  }
  return null;
}
// ----------------------------------------------------

exports.deleteGroup = functions.https.onCall(
  {region: 'europe-west1'},
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

  
  const postsRef = firestore.collection(`groups/${groupId}/posts`);
  await deleteCollectionRecursively(postsRef, 100);

  return { success: true };
});


exports.deletePost = functions.https.onCall(
  {region: 'europe-west1'},
  async (request: functions.https.CallableRequest<{ postId: string }>) => {
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
    if (postData?.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Only the post creator can delete the post.');
    }

    transaction.delete(postRef);
    
    const userRef = firestore.collection('users').doc(userId);
    transaction.update(userRef, { posts: admin.firestore.FieldValue.arrayRemove(postId) });
  });

  const commentsRef = firestore.collection(`posts/${postId}/comments`);
  await deleteCollectionRecursively(commentsRef, 100);
  
  return { success: true };
});


exports.deleteComment = functions.https.onCall(
  {region: 'europe-west1'},
  async (request: functions.https.CallableRequest<{ postId: string; commentId: string }>) => {
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
  if (commentData?.creatorId !== userId) {
    throw new functions.https.HttpsError('permission-denied', 'Only the comment creator can delete the comment.');
  }

  await commentRef.delete();

  const postRef = firestore.collection('posts').doc(postId);
  await postRef.update({commentsCount: admin.firestore.FieldValue.increment(-1)});

  return { success: true };
});

exports.deleteUserAccount = functions.https.onCall(
  {region: 'europe-west1'},
  async (request: functions.https.CallableRequest<void>) => {
    const userId = request.auth?.uid;

    if (!userId) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to delete their account.'
      );
    }

    const BATCH_SIZE = 100;

     try {
      console.log(`Starting to delete user data for ${userId}...`);

      console.log(`Step 1: Deleting comments by user ${userId}...`);
      const userCommentsQuery = firestore.collectionGroup('comments')
        .where('creatorId', '==', userId)
        .orderBy('__name__');
      await deleteDocumentsByQuery(userCommentsQuery, BATCH_SIZE); 
      console.log('Step 1 complete.');

      console.log(`Step 2: Deleting posts by user ${userId}...`);
      const userPostsQuery = firestore.collection('posts')
        .where('userId', '==', userId)
        .orderBy('__name__');
      await deleteDocumentsByQuery(userPostsQuery, BATCH_SIZE, ['comments']);
      console.log('Step 2 complete.');

      console.log(`Step 3: Deleting groups by user ${userId}...`);
      const userGroupsQuery = firestore.collection('groups')
        .where('creatorId', '==', userId)
        .orderBy('__name__');
      await deleteDocumentsByQuery(userGroupsQuery, BATCH_SIZE, ['posts']);
      console.log('Step 3 complete.');

      console.log(`Step 4: Cleaning up user from group memberships...`);
      const groupsUserIsMemberOfQuery = firestore.collection('groups').where('members', 'array-contains', userId);
      const groupsSnapshot = await groupsUserIsMemberOfQuery.get();
      const cleanupBatch = firestore.batch();
      groupsSnapshot.docs.forEach(doc => {
          cleanupBatch.update(doc.ref, {
              members: admin.firestore.FieldValue.arrayRemove(userId),
              memberCount: admin.firestore.FieldValue.increment(-1)
          });
      });
      await cleanupBatch.commit();
      console.log('Step 4 complete.');


      console.log(`Step 5: Deleting user document...`);
      await firestore.collection('users').doc(userId).delete();
      console.log('Step 5 complete.');


      console.log(`Step 6: Deleting Firebase Auth user...`);
      await admin.auth().deleteUser(userId);
      console.log('Step 6 complete. All data deleted successfully.');

      return { success: true };

    } catch (error: any) {
      console.error('Error deleting user account and data:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError('internal', 'Failed to delete user account and associated data.');
    }
});

exports.editGroup = functions.https.onCall(
  {region: 'europe-west1'},
  async (request: functions.https.CallableRequest<EditGroupData>): Promise<BasicResponse> => {
    const userId = request.auth?.uid;
    const { groupId, name, description, tags, rules, newLogoImgUrl, newBannerImgUrl } = request.data;

    if (!userId) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    if (!groupId) {
      throw new functions.https.HttpsError('invalid-argument', 'Group ID is required.');
    }

    const groupRef = firestore.collection('groups').doc(groupId);

    try {
      const groupDoc = await groupRef.get();
      if (!groupDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Group not found.');
      }

      const groupData = groupDoc.data();
      if (groupData?.creatorId !== userId) {
        throw new functions.https.HttpsError('permission-denied', 'Only the group creator can edit this group.');
      }

      const updatedFields: any = {};

      if (name !== undefined) {
        if (typeof name !== 'string' || name.length < 4) {
          throw new functions.https.HttpsError('invalid-argument', 'Group name must be at least 4 characters.');
        }
        updatedFields.name = name;
      }

      if (description !== undefined) {
        if (typeof description !== 'string') {
          throw new functions.https.HttpsError('invalid-argument', 'Description must be a string.');
        }
        updatedFields.description = description;
      }

      if (tags !== undefined) {
        if (typeof tags !== 'string') {
          throw new functions.https.HttpsError('invalid-argument', 'Tags must be a string.');
        }
        const processedTags = tags.trim().split(' ').filter(tag => tag.length > 0);
        if (processedTags.length < 3) {
          throw new functions.https.HttpsError('invalid-argument', 'Please provide at least 3 tags.');
        }
        updatedFields.tags = processedTags;
      }

      if (rules !== undefined) {
        if (typeof rules !== 'string') {
          throw new functions.https.HttpsError('invalid-argument', 'Rules must be a string.');
        } else{
          const processedRules = rules.split('\n')
            .map(rule => rule.trim());
            updatedFields.rules = processedRules;
        }
      }

      // Handle logo image update
      if (newLogoImgUrl !== undefined) { // Check if new URL was provided (even if null for removal)
        const oldLogoImgUrl = groupData?.logoImgUrl;
        if (oldLogoImgUrl && oldLogoImgUrl !== newLogoImgUrl) {
          const oldPath = getStoragePathFromUrl(oldLogoImgUrl);
          if (oldPath) {
            await storage.bucket().file(oldPath).delete()
              .catch(err => console.warn(`Could not delete old logo image at ${oldPath}:`, err));
          }
        }
        updatedFields.logoImgUrl = newLogoImgUrl; // Set new URL (could be null to remove)
      }

      // Handle banner image update
      if (newBannerImgUrl !== undefined) { // Check if new URL was provided (even if null for removal)
        const oldBannerImgUrl = groupData?.bannerImgUrl;
        if (oldBannerImgUrl && oldBannerImgUrl !== newBannerImgUrl) {
          const oldPath = getStoragePathFromUrl(oldBannerImgUrl);
          if (oldPath) {
            await storage.bucket().file(oldPath).delete()
              .catch(err => console.warn(`Could not delete old banner image at ${oldPath}:`, err));
          }
        }
        updatedFields.bannerImgUrl = newBannerImgUrl; // Set new URL (could be null to remove)
      }

      if (Object.keys(updatedFields).length === 0) {
        return { success: true, error: 'No fields to update.' };
      }

      await groupRef.update(updatedFields);
      return { success: true };

    } catch (error: any) {
      console.error('Error editing group:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError('internal', 'Failed to edit group.');
    }
  }
);


exports.editPost = functions.https.onCall(
  {region: 'europe-west1'},
  async (request: functions.https.CallableRequest<EditPostData>): Promise<BasicResponse> => {
    const userId = request.auth?.uid;
    const { postId, title, content, newImageUrl } = request.data;

    if (!userId) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    if (!postId) {
      throw new functions.https.HttpsError('invalid-argument', 'Post ID is required.');
    }

    const postRef = firestore.collection('posts').doc(postId);

    try {
      const postDoc = await postRef.get();
      if (!postDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Post not found.');
      }

      const postData = postDoc.data();
      if (postData?.userId !== userId) {
        throw new functions.https.HttpsError('permission-denied', 'Only the post creator can edit this post.');
      }

      const updatedFields: any = {};

      if (title !== undefined) {
        if (typeof title !== 'string' || title.length < 5) {
          throw new functions.https.HttpsError('invalid-argument', 'Post title must be at least 5 characters.');
        }
        updatedFields.title = title;
      }

      if (content !== undefined) {
        if (typeof content !== 'string') {
          throw new functions.https.HttpsError('invalid-argument', 'Content must be a string.');
        }
        updatedFields.content = content;
      }

      if (content !== undefined) {
        if (typeof content !== 'string') {
          throw new functions.https.HttpsError('invalid-argument', 'Content must be a string.');
        }
        if (content.trim().length === 0) {
          throw new functions.https.HttpsError('invalid-argument', 'Post must have content.');
        }
        updatedFields.content = content;
      } else {
        if (!postData?.content || postData.content.trim().length === 0) {
          throw new functions.https.HttpsError('invalid-argument', 'Post must have content.');
        }
      }

      if (newImageUrl !== undefined) {
        const oldImageUrl = postData?.imageUrl;
        if (oldImageUrl && oldImageUrl !== newImageUrl) {
          const oldPath = getStoragePathFromUrl(oldImageUrl);
          if (oldPath) {
            await storage.bucket().file(oldPath).delete()
              .catch(err => console.warn(`Could not delete old post image at ${oldPath}:`, err));
          }
        }
        updatedFields.imageUrl = newImageUrl;
      }
      
      if (Object.keys(updatedFields).length === 0) {
        return { success: true, error: 'No fields to update.' };
      }

      await postRef.update(updatedFields);
      return { success: true };

    } catch (error: any) {
      console.error('Error editing post:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError('internal', 'Failed to edit post.');
    }
  }
);

exports.editProfile = functions.https.onCall(
  {region: 'europe-west1'},
  async (request: functions.https.CallableRequest<EditProfileData>): Promise<BasicResponse> => {
    const userId = request.auth?.uid;
    const { username, bio } = request.data;

    if (!userId) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const userRef = firestore.collection('users').doc(userId);

    try {
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
      }

      const updatedFields: any = {};

      if (username !== undefined) {
        if (typeof username !== 'string' || username.length < 3) {
          throw new functions.https.HttpsError('invalid-argument', 'Username must be at least 3 characters.');
        }
        updatedFields.username = username;
      }

      if (bio !== undefined) {
        if (typeof bio !== 'string') {
          throw new functions.https.HttpsError('invalid-argument', 'Bio must be a string.');
        }
        updatedFields.bio = bio;
      }
      
      if (Object.keys(updatedFields).length === 0) {
        return { success: true, error: 'No fields to update.' };
      }

      await userRef.update(updatedFields);
      return { success: true };

    } catch (error: any) {
      console.error('Error editing profile:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError('internal', 'Failed to edit profile.');
    }
  }
);