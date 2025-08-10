import { inject, Injectable } from "@angular/core";
import { Firestore, CollectionReference, collection, collectionData } from "@angular/fire/firestore";
import { Observable, take } from "rxjs";
import { Comment } from "../../model";

@Injectable({
    providedIn: 'root'
})
export class CommentsService{
    private firestore = inject(Firestore)

    getCommentsByPostId(postId:string): Observable<Comment[]>{
        const trimmedPostId = postId.trim();

        const commentsSubCollRef=collection(
            this.firestore,
            `posts/${trimmedPostId}/comments`
        ) as CollectionReference<Comment>

        return collectionData<Comment>(commentsSubCollRef, {idField: 'id'}).pipe(take(1));
    }
}