import { inject, Injectable } from "@angular/core";
import { collection, collectionData, CollectionReference, doc, docData, Firestore, orderBy, query, where, limit } from "@angular/fire/firestore";
import { map, Observable, take } from "rxjs";
import { Group } from "../../model";
import { groupConverter } from "./firestoreConverter.service";

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

  getTopFiveGroups():Observable<Group[]>{
    const filtered=query(
      this.groupsCollection,
      orderBy('memberCount', 'desc'),
      limit(5)
    )

    return collectionData<Group>(filtered as CollectionReference<Group>, {idField: 'id'}).pipe(
      take(1)
    ) as Observable<Group[]>
  }

  getGroupsByUser(userId: string):Observable<Group[]>{
    const filterd=query(this.groupsCollection, where('userId', '==', userId));
    return collectionData(filterd, {idField: 'id'}) as Observable<Group[]>
  }

getGroupById(groupId: string): Observable<Group | undefined> {
  const trimmedGroupId = groupId.trim();
  
  const groupDocRef = doc(this.firestore, 'groups', trimmedGroupId).withConverter(groupConverter);

  return docData(groupDocRef).pipe(
    map(groupData => {
      if (groupData) {
        return groupData;
      } else {
        return undefined;
      }
    })
  );
}

  
}