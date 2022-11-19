import logg from "../Logs/Customlog";
import { Like, User, WatchLater, Video, View, Channel } from "../models";
import { ResultTypes, VideoList2 } from "../types/main";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";
import { custom } from "./custom";
import { changeFormatFromRef, toISOStringWithTimezone } from "../utils";
dotenv.config();
const DOCUMENT_LIMIT: number = 30;
const DOCUMENT_LIMIT2: number = 50;

//<--------main video info ---------->

//function to get one video
export const get_One_Video = async (videoId: string) => {
  try {
    //findone
    const videoData = await Video.findOne({ _id: videoId, published: true });
    if (videoData) {
      videoData.coverPhoto = getSignedUrl({
        url: `https://d27i2oedcihbcx.cloudfront.net/${videoData.coverPhoto}`,
        keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
        privateKey: custom!,
        dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
      });
      //if the video data is there
      return { success: true, code: 200, data: videoData };
    }
    //if there is no channel
    return { success: false, data: "", code: 404, error: "No Video found" };
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: false, code: 404, error: "Something went wrong , try again later" };
  }
};

//get all likes for the video
export const likes_N_dislike_for_One_Video = async (videoId: string): Promise<ResultTypes> => {
  try {
    const data = await Video.findOne({ _id: videoId }, "likes dislikes"); //get total likes

    if (data) {
      return {
        success: true,
        code: 200,
        data,
      };
    }
    //if there was no data found
    return {
      success: false,
      code: 404,
      error: `No video found`,
      data: "",
    };
  } catch (e: any) {
    logg.fatal(e.message);
    return {
      success: false,
      code: 404,
      error: e.message,
      data: "",
    };
  }
};

//get all views for the video
export const views_for_One_Video = async (videoId: string): Promise<ResultTypes> => {
  try {
    const data = await Video.findOne({ _id: videoId }, "Views"); //get total views

    if (data) {
      return {
        success: true,
        code: 200,
        data,
      };
    }
    //if there was no data found
    return {
      success: false,
      code: 404,
      error: `No video found`,
      data: "",
    };
  } catch (e: any) {
    logg.fatal(e.message);
    return {
      success: false,
      code: 404,
      error: e.message,
      data: "",
    };
  }
};

//get all views for the video
export const allActivity_for_One_Video = async (videoId: string): Promise<ResultTypes> => {
  try {
    const data = await Video.findOne({ _id: videoId }, "Views likes dislikes"); //get total views

    if (data) {
      return {
        success: true,
        code: 200,
        data,
      };
    }
    //if there was no data found
    return {
      success: false,
      code: 404,
      error: `No video found`,
      data: "",
    };
  } catch (e: any) {
    logg.fatal(e.message);
    return {
      success: false,
      code: 404,
      error: e.message,
      data: "",
    };
  }
};

/*<-----------------------------> */

// //auto completefor search queries
export const Search_Autocomplete = async (searchParam: string) => {
  try {
    const result = await Video.aggregate([
      {
        $search: {
          autocomplete: {
            query: `${searchParam}`,
            path: "title",
            fuzzy: { maxEdits: 2 },
          },
        },
      },
      { $limit: 10 },
      {
        $project: {
          title: 1,
        },
      },
    ]);
    return result;
  } catch (e: any) {
    return null;
  }
};

//find video from search
export const Find_Videos = async (searchParam: string, page: number) => {
  try {
    const Videos = await Video.aggregate([
      {
        $match: { published: true },
      },
      {
        $search: {
          index: "fullsearch",
          text: {
            query: `${searchParam}`,
            path: "title",
          },
        },
      },
      { $limit: DOCUMENT_LIMIT },
      { $skip: (page - 1) * DOCUMENT_LIMIT },
      {
        $project: {
          channel: "$channel",
          _id: 1,
          title: 1,
          published: 1,
          Views: 1,
          releaseDate: 1,
          coverPhoto: 1,
        },
      },
    ]);
    for (const video of Videos) {
      if (video.coverPhoto) {
        video.coverPhoto = getSignedUrl({
          url: `https://d27i2oedcihbcx.cloudfront.net/${video.coverPhoto}`,
          keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
          privateKey: custom!,
          dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
        });
      }
      if (video.channel.channelPic) {
        video.channel.channelPic = getSignedUrl({
          url: `https://d27i2oedcihbcx.cloudfront.net/${video.channel.channelPic}`,
          keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
          privateKey: custom!,
          dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
        });
      }
    }
    return { success: true, code: 200, data: Videos };
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: true, code: 404, data: "", error: e.message };
  }
};

//get videos based on highest views
export const Trending_Videos = async (prevId?: string): Promise<ResultTypes> => {
  try {
    const queryParams = {
      published: true,
      ...(prevId && { _id: { $gt: new ObjectId(prevId) } }),
    };
    const Videos = await Video.aggregate([
      {
        $match: queryParams,
      },
      {
        $sort: { Views: -1 },
      },
      {
        $lookup: {
          from: "channels",
          localField: "channelId",
          foreignField: "_id",
          as: "channel",
          pipeline: [
            {
              $project: { _id: 1, channelPic: 1, channelName: 1 },
            },
          ],
        },
      },
      { $unwind: "$channel" },
      {
        $project: {
          channel: "$channel",
          _id: 1,
          title: 1,
          published: 1,
          Views: 1,
          releaseDate: 1,
          coverPhoto: 1,
        },
      },
      { $limit: DOCUMENT_LIMIT },
    ]);
    for (const video of Videos) {
      if (video.coverPhoto) {
        video.coverPhoto = getSignedUrl({
          url: `https://d27i2oedcihbcx.cloudfront.net/${video.coverPhoto}`,
          keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
          privateKey: custom!,
          dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
        });
      }
      if (video.channel.channelPic) {
        video.channel.channelPic = getSignedUrl({
          url: `https://d27i2oedcihbcx.cloudfront.net/${video.channel.channelPic}`,
          keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
          privateKey: custom!,
          dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
        });
      }
    }
    return { success: true, code: 200, data: Videos };
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: true, code: 404, data: "", error: e.message };
  }
};

//get videos based on highest views
export const Genre_Based_Videos = async (Genre: number, prevId?: string): Promise<ResultTypes> => {
  try {
    const queryParams = {
      published: true,
      Genre,
      ...(prevId && { _id: { $gt: new ObjectId(prevId) } }),
    };
    const Videos = await Video.aggregate([
      {
        $match: queryParams,
      },
      {
        $sort: { Views: -1 },
      },
      {
        $lookup: {
          from: "channels",
          localField: "channelId",
          foreignField: "_id",
          as: "channel",
          pipeline: [
            {
              $project: { _id: 1, channelPic: 1, channelName: 1 },
            },
          ],
        },
      },
      { $unwind: "$channel" },
      {
        $project: {
          channel: "$channel",
          _id: 1,
          title: 1,
          published: 1,
          Views: 1,
          releaseDate: 1,
          coverPhoto: 1,
        },
      },
      { $limit: DOCUMENT_LIMIT },
    ]);
    for (const video of Videos) {
      if (video.coverPhoto) {
        video.coverPhoto = getSignedUrl({
          url: `https://d27i2oedcihbcx.cloudfront.net/${video.coverPhoto}`,
          keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
          privateKey: custom!,
          dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
        });
      }
      if (video.channel.channelPic) {
        video.channel.channelPic = getSignedUrl({
          url: `https://d27i2oedcihbcx.cloudfront.net/${video.channel.channelPic}`,
          keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
          privateKey: custom!,
          dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
        });
      }
    }
    return { success: true, code: 200, data: Videos };
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: true, code: 404, data: "", error: e.message };
  }
};

/*<-------------subscription--------------> */
export const getAll_SubscriptionBased_Video = async (userId: string, start: string, end: string, prev?: string): Promise<ResultTypes> => {
  try {
    const channelsList = await User.findById(userId, "Subscription");
    //if the user found
    if (channelsList) {
      const endDate = end == "0" ? "0" : toISOStringWithTimezone(`${end}`).substring(0, 10);
      const startDate = end == "0" ? "0" : toISOStringWithTimezone(`${start}`).substring(0, 10);
      // const today = toISOStringWithTimezone(new Date(Date.now())).substring(0, 10);
      const Videos = await Video.aggregate([
        {
          $match: {
            channelId: { $in: channelsList.Subscription },
            releaseDate: {
              $gte: new Date(`${endDate}`),
              $lte: new Date(`${startDate}`),
            },
            type: true,
          },
        },
        {
          $sort: { releaseDate: -1 },
        },
        {
          $lookup: {
            from: "channels",
            localField: "channelId",
            foreignField: "_id",
            as: "channel",
            pipeline: [
              {
                $project: { _id: 1, channelPic: 1, channelName: 1 },
              },
            ],
          },
        },
        { $unwind: "$channel" },
        {
          $project: {
            channel: "$channel",
            _id: 1,
            title: 1,
            published: 1,
            Views: 1,
            releaseDate: 1,
            coverPhoto: 1,
          },
        },
      ]);
      for (const video of Videos) {
        if (video.coverPhoto) {
          video.coverPhoto = getSignedUrl({
            url: `https://d27i2oedcihbcx.cloudfront.net/${video.coverPhoto}`,
            keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
            privateKey: custom!,
            dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
          });
        }
        if (video.channel.channelPic) {
          video.channel.channelPic = getSignedUrl({
            url: `https://d27i2oedcihbcx.cloudfront.net/${video.channel.channelPic}`,
            keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
            privateKey: custom!,
            dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
          });
        }
      }
      return { success: true, code: 200, data: Videos };
    }
    //if a user wasnt found
    return { success: false, code: 403, data: "", error: "no user found" };
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: true, code: 404, data: "", error: e.message };
  }
};
/*<-----------************------------> */

/*<-------------watch history--------------> */
export const getAll_Videos_Viewed = async (userId: string, start: string, end: string, prevId?: string): Promise<ResultTypes> => {
  try {
    const endDate = end == "0" ? "0" : toISOStringWithTimezone(`${end}`).substring(0, 10);
    const startDate = end == "0" ? "0" : toISOStringWithTimezone(`${start}`).substring(0, 10);

    const queryParams = {
      userId,
      releaseDate: {
        $gte: new Date(`${endDate}`),
        $lte: new Date(`${startDate}`),
      },
      ...(prevId && { _id: { $gt: new ObjectId(prevId) } }),
    };

    const videos: VideoList2[] = await View.find(queryParams)
      .select({ Ref: 1 })
      .limit(DOCUMENT_LIMIT)
      .sort("updatedAt")
      .populate({
        path: "Ref",
        model: Video,
        select: { Views: 1, Title: 1, key: 1, coverPhoto: 1, releaseDate: 1, publish: 1, channelId: 1 },
        populate: {
          path: "channelId",
          model: Channel,
          select: { userRef: 0, Subscribers: 0, RegDate: 0 },
        },
      }); // populate the like videos

    //if the videos is not found
    if (!videos) return { success: false, data: videos, code: 200 };

    const newVideoArr = changeFormatFromRef(videos);

    return { success: true, data: newVideoArr, code: 200 };
    //if a user wasnt found
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: true, code: 404, data: "", error: e.message };
  }
};
/*<-----------************------------> */

/*<----------watch later videos-----------------> */
export const getAll_WatchLater_video = async (userId: string, prevId?: string): Promise<ResultTypes> => {
  try {
    //rfind the liked videos
    const queryParams = { userId, type: true, ...(prevId && { Ref: { $gt: new ObjectId(prevId) } }) };
    const videos: VideoList2[] = await WatchLater.find(queryParams)
      .select({ Ref: 1 })
      .limit(DOCUMENT_LIMIT)
      .sort("updatedAt")
      .populate({
        path: "Ref",
        model: Video,
        select: { Views: 1, Title: 1, key: 1, coverPhoto: 1, releaseDate: 1, publish: 1, channelId: 1 },
        populate: {
          path: "channelId",
          model: Channel,
          select: { userRef: 0, Subscribers: 0, RegDate: 0 },
        },
      }); // populate the like videos

    //if the videos is not found
    if (!videos) return { success: false, data: videos, code: 200 };

    const newVideoArr = changeFormatFromRef(videos);

    return { success: true, data: newVideoArr, code: 200 };
  } catch (e: any) {
    //if everything doesn't go well
    logg.fatal(e.message);
    return { success: false, code: 404, error: e.message };
  }
};
/*<-----------************------------> */

//<----------liked videos----------------->
export const getAll_Liked_video = async (userId: string, prevId?: string): Promise<ResultTypes> => {
  try {
    const queryParams = { userId, type: true, ...(prevId && { Ref: { $gt: new ObjectId(prevId) } }) };
    const videos: VideoList2[] = await Like.find(queryParams)
      .select({ Ref: 1 })
      .limit(DOCUMENT_LIMIT)
      .sort("updatedAt")
      .populate({
        path: "Ref",
        select: { Views: 1, Title: 1, key: 1, coverPhoto: 1, releaseDate: 1, Publish: 1, channelId: 1 },
        populate: {
          path: "channelId",
          select: { _id: 1, mainPic: 1, channelName: 1, channelPic: 1, username: 1 },
        },
      }); // populate the like videos

    //if the videos is not found
    if (!videos) return { success: false, data: videos, code: 200 };

    const newVideoArr = changeFormatFromRef(videos);
    return { success: true, data: newVideoArr, code: 200 };
  } catch (e: any) {
    //if everything doesn't go well
    logg.fatal(e.message);
    return { success: false, code: 404, error: e.message };
  }
};
//<-----------************------------>
