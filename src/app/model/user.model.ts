import { Comment } from "./comment.model"
import { Group } from "./group.model"
import { Post } from "./post.model"

export interface User{
  id:string,
  email:string,
  username:string,
  created_at:Date
  groups:Group[]
  posts:Post[],
  comments:Comment[]
}