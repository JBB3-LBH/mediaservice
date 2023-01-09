import { model, Schema, ObjectId } from "mongoose";

//types for video schema
export interface VideoType {
  title: string;
  coverPhoto: string;
  description: string;
  published: boolean;
  releaseDate: Date;
  likes: number;
  dislikes: number;
  Views: number;
  Genre: number;
  channelId: ObjectId;
  Scenes: {
    videoId: string;
    title: string;
    name: string;
    Question: string;
    ArrangementNo: number;
    options: {
      Answer: string;
      SceneRef: ObjectId;
    }[];
  }[];
}

//video schema
const videoSchema = new Schema<VideoType>({
  title: { type: String },
  coverPhoto: { type: String },
  description: { type: String, default: "Add a description" },
  published: { type: Boolean, default: false },
  releaseDate: { type: Date, default: Date.now },
  dislikes: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  Views: { type: Number, default: 0 },
  Genre: { type: Number, default: 1 },
  channelId: { ref: "channel", type: Schema.Types.ObjectId, required: true },
  Scenes: [
    {
      videoId: { type: String },
      title: {
        type: String,
        maxlength: 50,
      },
      name: {
        type: String,
        maxlength: 30,
      },
      Question: {
        type: String,
        maxlength: 65,
      },
      ArrangementNo: {
        type: Number,
        required: true,
      },
      options: [
        {
          Answer: { type: String },
          SceneRef: { type: Schema.Types.ObjectId },
        },
        { _id: false },
      ],
    },
  ],
});

export default model<VideoType>("video", videoSchema);
