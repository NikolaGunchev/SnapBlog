import { Timestamp } from "firebase/firestore";

export interface Comment{
  id:string,
  likes:number,
  text:string,
  creatorId:string,
  creatorName:string,
  created_at:Timestamp
}