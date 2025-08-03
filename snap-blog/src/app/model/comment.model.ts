import { User } from "./user.model";

export interface Comment{
  id:string,
  likes:number,
  text:string,
  userId:User,
  created_at:Date
}