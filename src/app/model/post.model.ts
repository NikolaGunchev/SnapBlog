export interface Post{
  id:string,
  title:string,
  userId:string,
  groupId:string,
  likesCount:number,
  content:string,
  created_at:Date
  images:string[]
  commentsCount:number
  creatorName:string
}