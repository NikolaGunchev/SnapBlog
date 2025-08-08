export interface User{
  id:string,
  email:string,
  username:string,
  created_at:Date,
  groups:string[] | undefined,
  posts:string[] | undefined,
  comments:string[] | undefined
}