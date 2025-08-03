export interface Group {
  id: string;
  name: string;
  creatorId: string;
  description: string;
  memberCount: string[];
  rules: string[];
  tags: string[];
  created_at: Date;
  bannerImgUrl:string,
  groupImgUrl:string
}
