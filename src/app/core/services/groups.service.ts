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
import {  firstValueFrom, from, map, Observable, take } from 'rxjs';
import { FunctionResponse, Group } from '../../model';
import { groupConverter } from './firestoreConverter.service';
import { Functions, httpsCallableData } from '@angular/fire/functions';

 interface CreateGroupData {
  name: string;
  description: string;
  tags: string;
  logoImgUrl?: string;
  bannerImgUrl?: string;
  rules?: string;
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
    })
  }

  getGroupsByUser(userId: string): Observable<Group[]> {
    const filterd = query(this.groupsCollection, where('userId', '==', userId));
    return collectionData(filterd, { idField: 'id' })
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
      map((groups) => (groups.length ? groups[0] : undefined)))
  }

  async createGroup(data: CreateGroupData): Promise<FunctionResponse> {
    const callable = httpsCallableData<CreateGroupData, FunctionResponse>(this.functions, 'createGroup');
    const result = await firstValueFrom(callable(data));
    return result;
  }

  async joinGroup(groupId:string):Promise<FunctionResponse>{
    const callable=httpsCallableData<{groupId:string}, FunctionResponse>(this.functions, 'joinGroup');
    const result=await firstValueFrom(callable({groupId}))
    return result
  }

  async leaveGroup(groupId: string): Promise<FunctionResponse> {
    const callable = httpsCallableData<{ groupId: string }, FunctionResponse>(this.functions, 'leaveGroup');
    const result = await firstValueFrom(callable({ groupId }));
    return result;
  }

  async deleteGroup(groupId: string): Promise<FunctionResponse> {
    const callable = httpsCallableData<any, FunctionResponse>(this.functions, 'deleteGroup');
    const result = await firstValueFrom(callable({ groupId }));
    return result;
  }

   async editGroup(data:EditGroupData): Promise<FunctionResponse> {
    const callable = httpsCallableData<EditGroupData, FunctionResponse>(this.functions, 'editGroup');
    const result = await firstValueFrom(callable(data));
    return result;
  }
}
