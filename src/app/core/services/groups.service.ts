import { inject, Injectable } from "@angular/core";
import { collection, collectionData, CollectionReference, doc, docData, Firestore, orderBy, query, where, limit } from "@angular/fire/firestore";
import {  catchError, from, map, Observable, take, throwError } from "rxjs";
import { Group } from "../../model";
import { groupConverter } from "./firestoreConverter.service";
import { HttpsCallable } from "firebase/functions";
import { getFunctions, httpsCallable } from "@angular/fire/functions";
import { AuthenticationService } from "./authentication.service";

@Injectable({
  providedIn: 'root'
})
export class GroupsService{
  private firestore = inject(Firestore)
  private groupsCollection: CollectionReference<Group>
  private functions=getFunctions();
  private joinGroupCallable: HttpsCallable<any,any>



  constructor(){
    this.groupsCollection=collection(this.firestore,'groups').withConverter(groupConverter) as CollectionReference<Group>;
    this.joinGroupCallable=httpsCallable(this.functions, 'joinGroup')
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

getGroupByName(name: string): Observable<Group | undefined> {
  const trimmedName = name.trim();

  const filtered = query(
    this.groupsCollection,
    where('name', '==', trimmedName),
    limit(1)
  );

  return collectionData<Group>(filtered as CollectionReference<Group>, { idField: 'id' }).pipe(
    map(groups => groups.length ? groups[0] : undefined),
    take(1)
  ) as Observable<Group | undefined>;
}

  joinGroup(groupId: string): Observable<void> {
    return from(this.joinGroupCallable({ groupId })).pipe(
      map(response => {
        // The actual response from the function is in the 'data' property
        const result = response.data as { success: boolean };
        if (!result || !result.success) {
          throw new Error('Cloud function call failed with no success.');
        }
      }),
      catchError(error => {
        console.error('Error joining group:', error.message);
        return throwError(() => error);
      })
    );
  }
}