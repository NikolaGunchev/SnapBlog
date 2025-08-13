import { Timestamp } from "firebase/firestore"

export interface Post{
  id:string,
  title:string,
  userId:string,
  groupId:string,
  likesCount:number,
  content:string,
  created_at:Timestamp
  imageUrl:string
  commentsCount:number
  creatorName:string
}