import { Reply, Comment } from "../models";
import logg from "../Logs/Customlog";
import { ObjectId } from "mongodb";
import { ResultTypes } from "../types/main";

//types for the function to get all/some comments
export interface getCommentsTypes {
  videoRef: string;
  prevId: string;
}



const perPagination: number = 100;

//functions to get all comments
export const get_All_Comments = async ({ videoRef, prevId }: getCommentsTypes): Promise<ResultTypes> => {
  try {
    // if prev id was provided, then we paginate
    if (prevId) {
      const id = new ObjectId(prevId);
      const comments:any[] = await Comment.find({ videoRef, _id: { $gt: id } })
        .populate("user", { _id: 1, profilePic: 1, username: 1 }) // populate users if its a user who commented
        .populate("channel", { _id: 1, channelPic: 1, channelName: 1,username:1 }) //populate channel if its a channel who commented
        .populate("replies", "-__v") //exclude `__v` in populating replies
        .populate({
          path: "replies",
          populate: { path: "channel user", select: { _id: 1, channelPic: 1, channelName: 1, profilePic: 1, username: 1 } },
        }) // populate replies users if its a user who replied</ResultTypes>
        .sort("createdAt")
        .limit(perPagination);
if(comments.length < 1){
  return {
    success: false,
    message: "No comments found",
    data: null,
    code:200
}}

      return { success: true, code: 200, data:comments };
    }
    // else, return the initial
    const comments: any[]= await Comment.find({ videoRef })
      .populate("replies", "-__v") //exclude `__v` in populating replies
      .populate("user", { _id: 1, profilePic: 1, username: 1 }) // populate users if its a user who commented
      .populate("channel", { _id: 1, channelPic: 1, channelName: 1,username:1 }) //populate channel if its a channel who commented
      .populate({
        path: "replies",
        populate: { path: "channel user", select: { _id: 1, channelPic: 1, channelName: 1, profilePic: 1, username: 1 } },
      }) // populate replies users if its a user who replied
      .sort("createdAt")
      .limit(perPagination);
      if(comments.length < 1){
        return {
          success: true,
          message: "No comments found",
          data: [],
          code:200
      }}
      

    return { success: true, code: 200, data:comments };
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: false, code: 404, error: e.message };
  }
};


//function to count the amount of comments that exists for that video
export const findCommentAmount = async ({ videoRef }: { videoRef: string }): Promise<ResultTypes> => {
  try {
    const count = await Comment.aggregate([
      {
        $match: {
          videoRef: {
            $eq: new ObjectId(videoRef),
          },
        },
      },
      {
        $count: "amount",
      },
    ]);

    if (count) {
      //if everything went well
      return {
        success: true,
        code: 200,
        data: { amount: count[0] },
      };
    }
    //if videoref didnt exist didnt go well
    return { success: false, code: 404, error: "This video does not exist" };
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: false, code: 404, error: e.message };
  }
};