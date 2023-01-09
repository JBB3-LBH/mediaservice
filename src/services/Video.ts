import logg from "../Logs/Customlog";
import { Like, User, WatchLater, Video, View, Channel } from "../models";
import { ResultTypes, VideoList2 } from "../types/main";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";
import { changeFormatFromRef, toISOStringWithTimezone } from "../utils";
dotenv.config();
const DOCUMENT_LIMIT: number = 30;
const DOCUMENT_LIMIT2: number = 50;

//<--------main video info ---------->

//function to get one video
export const get_One_Video = async (videoId: string) => {
  try {
    //findone
    const videoData = await Video.findOne({ _id: videoId, published: true }).populate("channelId", {
      _id: 1,
      channelPic: 1,
      channelName: 1,
      username: 1,
      Subscribers: 1,
    });
    if (videoData) {
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
          index: "autocomplete",
          autocomplete: {
            query: searchParam,
            path: "title",
            fuzzy: {
              maxEdits: 1,
              prefixLength: 1,
              maxExpansions: 100,
            },
          },
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 1,
          title: 1,
          score: { $meta: "searchScore" },
        },
      },
    ]);
    return result;
  } catch (e: any) {
    return null;
  }
};

//find video from search
export const Find_Videos = async (searchParam: string, next: number) => {
  try {
    const Videos = await Video.aggregate([
      {
        $search: {
          index: "autocomplete",
          autocomplete: {
            query: searchParam,
            path: "title",
            fuzzy: {
              maxEdits: 1,
              prefixLength: 1,
              maxExpansions: 100,
            },
          },
        },
      },
      {
        $match: { published: true },
      },
      {
        $skip: DOCUMENT_LIMIT * (next || 0),
      },
      {
        $limit: DOCUMENT_LIMIT,
      },
      {
        $lookup: {
          from: "channels",
          localField: "channelId",
          foreignField: "_id",
          as: "channel",
          pipeline: [
            {
              $project: { _id: 1, channelPic: 1, channelName: 1, username: 1 },
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
          score: { $meta: "searchScore" },
        },
      },
    ]);

    return { success: true, code: 200, data: Videos };
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: true, code: 404, data: "", error: e.message };
  }
};

//get videos based on highest views
export const Trending_Videos = async (next?: number): Promise<ResultTypes> => {
  try {
    const queryParams = {
      published: true,
    };
    const Videos = await Video.aggregate([
      {
        $match: queryParams,
      },
      {
        $sort: { Views: -1 },
      },
      {
        $skip: DOCUMENT_LIMIT * (next || 0),
      },
      {
        $limit: DOCUMENT_LIMIT,
      },
      {
        $lookup: {
          from: "channels",
          localField: "channelId",
          foreignField: "_id",
          as: "channel",
          pipeline: [
            {
              $project: { _id: 1, channelPic: 1, channelName: 1, username: 1 },
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

    return { success: true, code: 200, data: Videos };
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: true, code: 404, data: "", error: e.message };
  }
};

//get videos based on highest views
export const Genre_Based_Videos = async (Genre: number, next?: number): Promise<ResultTypes> => {
  try {
    const queryParams = {
      published: true,
      Genre,
    };
    const Videos = await Video.aggregate([
      {
        $match: queryParams,
      },
      {
        $sort: { Views: -1 },
      },
      {
        $skip: DOCUMENT_LIMIT * (next || 0),
      },
      {
        $limit: DOCUMENT_LIMIT,
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

    return { success: true, code: 200, data: Videos };
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: true, code: 404, data: "", error: e.message };
  }
};

/*<-------------subscription--------------> */
export const getAll_SubscriptionBased_Video = async (userId: string, next?: number): Promise<ResultTypes> => {
  try {
    const channelsList = await User.findById(userId, "Subscription");
    //if the user found
    if (channelsList) {
      const Videos = await Video.aggregate([
        {
          $match: {
            channelId: { $in: channelsList.Subscription },
            published: true,
          },
        },
        {
          $sort: { releaseDate: -1 },
        },
        {
          $skip: DOCUMENT_LIMIT * (next || 0),
        },
        {
          $limit: DOCUMENT_LIMIT,
        },
        {
          $lookup: {
            from: "channels",
            localField: "channelId",
            foreignField: "_id",
            as: "channel",
            pipeline: [
              {
                $project: { _id: 1, channelPic: 1, channelName: 1, username: 1 },
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
            description: 1,
          },
        },
      ]);

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
export const getAll_Videos_Viewed = async (userId: string, next?: number): Promise<ResultTypes> => {
  try {
    const Videos: VideoList2[] = await View.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
        },
      },
      {
        $skip: DOCUMENT_LIMIT * (next || 0),
      },
      {
        $limit: DOCUMENT_LIMIT,
      },
      {
        $lookup: {
          from: "videos",
          localField: "Ref",
          foreignField: "_id",
          pipeline: [
            {
              $project: { Views: 1, title: 1, key: 1, coverPhoto: 1, releaseDate: 1, publish: 1, channelId: 1, published: 1 },
            },
            {
              $lookup: {
                from: "channels",
                localField: "channelId",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: { _id: 1, channelPic: 1, channelName: 1, username: 1 },
                  },
                ],
                as: "channel",
              },
            },
            { $unwind: "$channel" },
          ],
          as: "video",
        },
      },
      { $unwind: "$video" },
      { $match: { "video.published": true } },
      { $replaceRoot: { newRoot: { $mergeObjects: ["$video", { historyId: "$_id" }] } } },
    ]);

    return { success: true, data: Videos, code: 200 };
    //if a user wasnt found
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: true, code: 404, data: "", error: e.message };
  }
};

export const getOne_Video_History = async (userId: string, videoRef: string): Promise<ResultTypes> => {
  try {
    const watchHistoryData = await View.findOne({
      userId,
      Ref: videoRef,
    });

    return { success: true, data: watchHistoryData, code: 200 };
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: true, code: 404, data: "", error: e.message };
  }
};
/*<-----------************------------> */

/*<----------watch later videos-----------------> */
export const getAll_WatchLater_video = async (userId: string, next?: number): Promise<ResultTypes> => {
  try {
    //rfind the liked videos
    const videos: VideoList2[] = await WatchLater.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
        },
      },
      {
        $skip: DOCUMENT_LIMIT * (next || 0),
      },
      {
        $limit: DOCUMENT_LIMIT,
      },
      {
        $lookup: {
          from: "videos",
          localField: "Ref",
          foreignField: "_id",
          pipeline: [
            {
              $project: { Views: 1, title: 1, key: 1, coverPhoto: 1, releaseDate: 1, publish: 1, channelId: 1, published: 1 },
            },
            {
              $lookup: {
                from: "channels",
                localField: "channelId",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: { _id: 1, channelPic: 1, channelName: 1, username: 1 },
                  },
                ],
                as: "channel",
              },
            },
            { $unwind: "$channel" },
          ],
          as: "video",
        },
      },
      { $unwind: "$video" },
      { $match: { "video.published": true } },

      { $replaceRoot: { newRoot: "$video" } },
    ]); // populate the like videos

    return { success: true, data: videos, code: 200 };
  } catch (e: any) {
    //if everything doesn't go well
    logg.fatal(e.message);
    return { success: false, code: 404, error: e.message };
  }
};
/*<-----------************------------> */

//<----------liked videos----------------->
export const getAll_Liked_video = async (userId: string, next?: number): Promise<ResultTypes> => {
  try {
    const videos: VideoList2[] = await Like.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
          type: true,
        },
      },
      {
        $skip: DOCUMENT_LIMIT * (next || 0),
      },
      {
        $limit: DOCUMENT_LIMIT,
      },
      {
        $lookup: {
          from: "videos",
          localField: "Ref",
          foreignField: "_id",
          pipeline: [
            {
              $project: { Views: 1, title: 1, key: 1, coverPhoto: 1, releaseDate: 1, publish: 1, channelId: 1, published: 1 },
            },
            {
              $lookup: {
                from: "channels",
                localField: "channelId",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: { _id: 1, channelPic: 1, channelName: 1, username: 1 },
                  },
                ],
                as: "channel",
              },
            },
            { $unwind: "$channel" },
          ],
          as: "video",
        },
      },
      { $unwind: "$video" },
      { $match: { "video.published": true } },

      { $replaceRoot: { newRoot: "$video" } },
    ]);

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
