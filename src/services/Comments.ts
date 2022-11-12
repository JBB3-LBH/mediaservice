import { Reply, Comment } from "../models";
import logg from "../Logs/Customlog";
import { ObjectId } from "mongodb";
import { ResultTypes } from "../types/main";
import { custom } from "./custom";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import dotenv from "dotenv";
dotenv.config();

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

for(const comment of comments){
//loop through every comment 
//sign the images on both comment and replies.

/* <---for comments --> */
  if(comment.profilePic){
    comment.profilePic = getSignedUrl({
      url: `https://d27i2oedcihbcx.cloudfront.net/${comment.profilePic}`,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
      privateKey: custom,
      dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
    });
  }
  if(comment.channelPic){
    comment.channelPic = getSignedUrl({
      url: `https://d27i2oedcihbcx.cloudfront.net/${comment.channelPic}`,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
      privateKey: custom,
      dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
    });
  }
/* -------------------- */
    
/* <---for replies---> */
//loop through the replies and sign its pics too
    const replies = comment.replies
    for(const reply of replies){
      if(reply.profilePic){
        reply.profilePic = getSignedUrl({
          url: `https://d27i2oedcihbcx.cloudfront.net/${reply.profilePic}`,
          keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
          privateKey: custom,
          dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
        });
      }
      if(reply.channelPic){
        reply.channelPic = getSignedUrl({
          url: `https://d27i2oedcihbcx.cloudfront.net/${reply.channelPic}`,
          keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
          privateKey: custom,
          dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
        });
      }
    }
/* <------------------> */

}
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
      
      for(const comment of comments){
      //loop through every comment 
      //sign the images on both comment and replies.
      
      /* <---for comments --> */
        if(comment.user){
          comment.user.profilePic = getSignedUrl({
            url: `https://d27i2oedcihbcx.cloudfront.net/${comment.user.profilePic}`,
            keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
            privateKey: custom,
            dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
          });
        }
        if(comment.channel){
          comment.channel.channelPic = getSignedUrl({
            url: `https://d27i2oedcihbcx.cloudfront.net/${comment.channel.channelPic}`,
            keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
            privateKey: custom,
            dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
          });
        }
      /* -------------------- */
          
      /* <---for replies---> */
      //loop through the replies and sign its pics too
          const replies = comment.replies
          for(const reply of replies){
            if(reply.user){
              reply.user.profilePic = getSignedUrl({
                url: `https://d27i2oedcihbcx.cloudfront.net/${reply.user.profilePic}`,
                keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
                privateKey: custom,
                dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
              });
            }
            if(reply.channel){
              reply.channel.channelPic = getSignedUrl({
                url: `https://d27i2oedcihbcx.cloudfront.net/${reply.channel.channelPic}`,
                keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
                privateKey: custom,
                dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
              });
            }
          }
      /* <------------------> */
      
      }
    return { success: true, code: 200, data:comments };
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: false, code: 404, error: e.message };
  }
};
