import { inject, Injectable } from "@angular/core";
import { collection, collectionData, CollectionReference, Firestore, query, where } from "@angular/fire/firestore";
import { Observable, take } from "rxjs";
import { Post } from "../../model";

@Injectable({
  providedIn: 'root'
})
export class PostsService{
  private firestore = inject(Firestore)
  private postsCollection: CollectionReference

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

  getPostsByGroup(groupId:string):Observable<Post[]>{
    const filtered=query(this.postsCollection, where('groupID','==',groupId));
    return collectionData(filtered, {idField: 'id'}) as Observable<Post[]>
  }
}