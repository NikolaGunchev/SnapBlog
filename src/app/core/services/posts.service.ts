import { inject, Injectable, signal } from "@angular/core";
import { collection, collectionData, CollectionReference, Firestore, query, where,doc, docData  } from "@angular/fire/firestore";
import { map, Observable, take } from "rxjs";
import { Post } from "../../model";
import { postConverter } from "./firestoreConverter.service";

@Injectable({
  providedIn: 'root'
})
export class PostsService{
  private firestore = inject(Firestore)
  private postsCollection: CollectionReference

  public postGroups=signal(false)

  constructor(){
    this.postsCollection=collection(this.firestore,'posts')
  }

  getPosts():Observable<Post[]>{
    return collectionData<Post>(this.postsCollection as CollectionReference<Post>, {idField: 'id'}).pipe(
      take(1)
    );
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
}