import { inject, Injectable } from "@angular/core";
import { collection, collectionData, CollectionReference, Firestore, query, where,doc, docData  } from "@angular/fire/firestore";
import { firstValueFrom, map, Observable, take } from "rxjs";
import { FunctionResponse, Post } from "../../model";
import { postConverter } from "./firestoreConverter.service";
import { Functions, httpsCallableData } from "@angular/fire/functions";

interface CreatePostData {
  groupId: string;
  title: string;
  content: string;
  imageUrl?: string;
  creatorName:string | undefined;
}

interface EditPostData {
  postId: string;
  title?: string;
  content?: string;
  newImageUrl?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PostsService{
  private firestore = inject(Firestore)
  private postsCollection: CollectionReference
  private functions=inject(Functions)

  constructor(){
    this.postsCollection=collection(this.firestore,'posts')
  }

  getPosts():Observable<Post[]>{
    return collectionData<Post>(this.postsCollection as CollectionReference<Post>, {idField: 'id'})
  }

  getPostsByUser(userId: string):Observable<Post[]>{
    const filterd=query(this.postsCollection, where('userId', '==', userId));
    return collectionData(filterd, {idField: 'id'}) as Observable<Post[]>
  }

  getPostsByGroupId(groupId:string):Observable<Post[]>{
    const trimmedGroupId = groupId.trim();
    
    const filtered=query(this.postsCollection, where('groupId', '==', trimmedGroupId));
    return collectionData(filtered, {idField: 'id'}) as Observable<Post[]>
  }

  getPostById(postId: string): Observable<Post | undefined> {
  const trimmedPostId = postId.trim();
  
  const postDocRef = doc(this.firestore, 'posts', trimmedPostId).withConverter(postConverter);

  return docData(postDocRef).pipe(
    map(postData => {
      if (postData) {
        return postData;
      } else {
        return undefined;
      }
    })
  );
}

async createPost(data: CreatePostData): Promise<FunctionResponse> {
    const callable = httpsCallableData<CreatePostData, FunctionResponse>(this.functions, 'createPost');
    const result = await firstValueFrom(callable(data));
    return result;
  }

  async deletePost(postId: string): Promise<FunctionResponse> {
    const callable = httpsCallableData<any, FunctionResponse>(this.functions, 'deletePost');
    const result = await firstValueFrom(callable({ postId }));
    return result;
  }

  async editPost(data: EditPostData): Promise<FunctionResponse> {
  const callable = httpsCallableData<EditPostData, FunctionResponse>(this.functions, 'editPost');
  const result = await firstValueFrom(callable(data));
  return result;
}
}