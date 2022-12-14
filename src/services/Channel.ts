import logg from "../Logs/Customlog";
import { Video, Channel } from "../models";
import { ResultTypes } from "../types/main";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

//function to get channel main data like name and all
export const One_Channel_Info = async (channelId: string): Promise<ResultTypes> => {
  try {
    const channelData = await Channel.findOne({ _id: channelId });
    if (channelData) {
      //if the channel is in the db

      return { success: true, code: 200, data: channelData };
    }
    //if there is no channel
    return { success: false, data: "", code: 404, error: "No channel found" };
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: false, code: 404, error: "Something went wrong , try again later" };
  }
};

export const Find_One_Channel_By_Name = async (username: string): Promise<ResultTypes> => {

  try {
    const channelData = await Channel.findOne({ username });
    if (channelData) {
      //if the channel is in the db

      return { success: true, code: 200, data: channelData };
    }
    //if there is no channel
    return { success: false, data: "", code: 404, error: "No channel found" };
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: false, code: 404, error: "Something went wrong , try again later" };
  }
};
//find video from search
export const Find_Channels = async (searchParam: string, page: number) => {
  try {
    const Channels = await Channel.aggregate([
      {
        $search: {
          index: "channelSearch",
          text: {
            query: `${searchParam}`,
            path: "channelName",
          },
        },
      },
      { $limit: 30 },
      { $skip: (page - 1) * 30 },
      {
        $project: {
          _id: 1,
          username: 1,
          channelName: 1,
          channelPic: 1,
        },
      },
    ]);
    return { success: true, code: 200, data: Channels };
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: true, code: 404, data: "", error: e.message };
  }
};

//function to get channel data
export const get_Channel_Activity = async (channelId: string): Promise<ResultTypes> => {
  try {
    const dislikes_count = await Video.aggregate([
      { $match: { channelId: new ObjectId(channelId) } },
      { $group: { _id: null, dislikes: { $sum: "$likes" }, Views: { $sum: "$views" } } },
    ]); //get total likes

    if (dislikes_count.length > 0) {
      const { dislikes } = dislikes_count[0];
      return {
        success: true,
        code: 200,
        data: { dislikes },
      };
    }
    //if there was no data for subsribers, meaning there was no channel at all
    return {
      success: false,
      code: 404,
      error: `No channel found`,
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

export const get_Channel_Subscribers = async (channelId: string): Promise<ResultTypes> => {
  try {
    const Subscribers = await Channel.findById(channelId, "Subscribers"); //get amount of subscribers
    if (Subscribers) {
      //if the channel is in the db
      return { success: true, code: 200, data: Subscribers };
    }
    //if there is no channel
    return { success: false, data: "", code: 404, error: "No channel found" };
  } catch (e: any) {
    logg.fatal(e.message);
    return { success: false, code: 404, error: "Something went wrong , try again later" };
  }
};

export const get_All_Creation = async (channelId: string): Promise<ResultTypes> => {
  try {
    //findone
    const videoData = await Video.find({ channelId, published: true }, "title coverPhoto published");
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
