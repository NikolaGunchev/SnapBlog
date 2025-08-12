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

      // Create the comment data
      const newCommentData = {
        userId: userId,
        postId: postId,
        text: text.trim(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        likes:0
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