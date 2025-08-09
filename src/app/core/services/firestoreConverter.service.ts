import { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from '@angular/fire/firestore';
import { Group, User } from '../../model';

export const groupConverter: FirestoreDataConverter<Group> = {
  toFirestore: (group: Group) => {
    const { id, ...data } = group;
    return data;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return { id: snapshot.id, ...data } as Group;
  }
};

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore: (user: User) => {
    const { id, ...data } = user;
    return data;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return { id: snapshot.id, ...data } as User;
  }
};