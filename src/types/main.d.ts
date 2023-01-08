import { ObjectId, Document } from "mongoose";

export interface commentsType extends Document {
  user: ObjectId;
  channel: ObjectId;
  videoRef: ObjectId;
  text: string;
  likes: number;
  dislikes: number;
  creatorLove: boolean;
  createdAt: Date;
  replies: ObjectId[] | undefined[];
}
export interface ResultTypes {
  success: boolean;
  data?: any;
  code: number;
  error?: string;
  message?: string;
}

export interface VideoList2 {
  _id: string;
  Ref: RefType;
  userId: string;
  __v: number;
  createdAt: Date;
  type: boolean;
  updatedAt: Date;
}

export interface RefType {
  _id: string;
  Views: number;
  published?: boolean;
  channelId: ChannelID;
  releaseDate: Date;
  coverPhoto: string;
  title?: string;
}
export interface RefType2 {
  _id: string;
  published?: boolean;
  Views: number;
  channel: ChannelID;
  releaseDate: Date;
  title?: string;
  coverPhoto: string;
}

export interface ChannelID {
  _id: string;
  username: string;
  channelName: string;
  channelPic: string;
}
