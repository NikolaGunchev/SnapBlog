import { Timestamp } from "firebase/firestore";

export interface User{
  id:string,
  email:string,
  username:string,
  created_at:Timestamp,
  groups:string[],
  posts:string[],
  comments:string[]
}