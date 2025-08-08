export interface Group {
  id: string;
  name: string;
  creatorId: string;
  description: string;
  members: string[];
  memberCount: number
  rules: string[];
  tags: string[];
  created_at: Date;
  bannerImgUrl:string,
  groupImgUrl:string
}
