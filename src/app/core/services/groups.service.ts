import { inject, Injectable } from "@angular/core";
import { collection, collectionData, CollectionReference, doc, docData, DocumentReference, Firestore, query, where } from "@angular/fire/firestore";
import { map, Observable, take } from "rxjs";
import { Group } from "../../model";

@Injectable({
  providedIn: 'root'
})
export class GroupsService{
  private firestore = inject(Firestore)
  private groupsCollection: CollectionReference

  constructor(){
    this.groupsCollection=collection(this.firestore,'groups')
  }

  getGroups():Observable<Group[]>{
    return collectionData<Group>(this.groupsCollection as CollectionReference<Group>, {idField: 'id'}).pipe(
      take(1)
    );
  }

  getGroupsByUser(userId: string):Observable<Group[]>{
    const filterd=query(this.groupsCollection, where('userId', '==', userId));
    return collectionData(filterd, {idField: 'id'}) as Observable<Group[]>
  }

  getGroupById(groupId:string):Observable<Group>{
    const groupDocRef:DocumentReference<Group> = doc(this.firestore, 'groups', groupId) as DocumentReference<Group>;

    return docData(groupDocRef).pipe(
      map(groupData=>{
        return {
          id: groupDocRef.id,
          ...groupData
        } as Group;
      })
    ) as Observable<Group>
  }
}