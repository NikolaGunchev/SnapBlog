import { Group } from "./group.model"
import { User } from "./user.model"

export interface Post{
  id:string,
  title:string,
  userId:User,
  groupId:Group,
  likesCount:number,
  content:string,
  created_at:Date
  images:string[]
}