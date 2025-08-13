import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  CollectionReference,
  doc,
  docData,
  Firestore,
  orderBy,
  query,
  where,
  limit,
} from '@angular/fire/firestore';
import { catchError, firstValueFrom, from, map, Observable, take, throwError } from 'rxjs';
import { FunctionResponse, Group } from '../../model';
import { groupConverter } from './firestoreConverter.service';
import { Functions, httpsCallable, httpsCallableData } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private firestore = inject(Firestore);
  private functions = inject(Functions)
  private groupsCollection: CollectionReference<Group>;

  constructor() {
    this.groupsCollection = collection(this.firestore, 'groups').withConverter(
      groupConverter
    ) as CollectionReference<Group>;

  }

  getGroups(): Observable<Group[]> {
    return collectionData<Group>(
      this.groupsCollection as CollectionReference<Group>,
      { idField: 'id' }
    ).pipe(take(1));
  }

  getTopFiveGroups(): Observable<Group[]> {
    const filtered = query(
      this.groupsCollection,
      orderBy('memberCount', 'desc'),
      limit(5)
    );

    return collectionData<Group>(filtered as CollectionReference<Group>, {
      idField: 'id',
    }).pipe(take(1)) as Observable<Group[]>;
  }

  getGroupsByUser(userId: string): Observable<Group[]> {
    const filterd = query(this.groupsCollection, where('userId', '==', userId));
    return collectionData(filterd, { idField: 'id' }) as Observable<Group[]>;
  }

  getGroupById(groupId: string): Observable<Group | undefined> {
    const trimmedGroupId = groupId.trim();

    const groupDocRef = doc(
      this.firestore,
      'groups',
      trimmedGroupId
    ).withConverter(groupConverter);

    return docData(groupDocRef).pipe(
      map((groupData) => {
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

    return collectionData<Group>(filtered as CollectionReference<Group>, {
      idField: 'id',
    }).pipe(
      map((groups) => (groups.length ? groups[0] : undefined)),
      take(1)
    ) as Observable<Group | undefined>;
  }

  joinGroup(groupId: string): Observable<void> {
    const callable = httpsCallable(this.functions, 'joinGroup');
    return from(callable({ groupId })).pipe(
      map((response) => {
        const result = response.data as { success: boolean };
        if (!result || !result.success) {
          throw new Error('Cloud function call failed with no success.');
        }
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  async deleteGroup(groupId: string): Promise<FunctionResponse> {
    const callable = httpsCallableData<any, FunctionResponse>(this.functions, 'deleteGroup');
    const result = await firstValueFrom(callable({ groupId }));
    return result;
  }

   async editGroup(data:Group): Promise<FunctionResponse> {
    const callable = httpsCallableData<Group, FunctionResponse>(this.functions, 'editGroup');
    const result = await firstValueFrom(callable(data));
    return result;
  }
}
