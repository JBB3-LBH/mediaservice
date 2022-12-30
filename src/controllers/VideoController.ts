import { Request, Response } from "express";
import {
  getAll_Liked_video,
  getAll_SubscriptionBased_Video,
  getAll_WatchLater_video,
  getAll_Videos_Viewed,
  Search_Autocomplete,
  Genre_Based_Videos,
  Trending_Videos,
  Find_Videos,
  allActivity_for_One_Video,
  get_One_Video,
  likes_N_dislike_for_One_Video,
  views_for_One_Video,
} from "../services/Video";

//get videos based on search parameters
export const video_From_Search = async (req: Request, res: Response) => {
  const searchParam = req.query.searchParam as string;
  const page = req.query.prevId as string;
  const tempPage = ~~page || 1;
  if (searchParam || ~~tempPage < 1) {
    return res.status(404).json({
      status: 404,
      error: `Provide the proper value for searchParam and page`,
    });
  }
  try {
    const { success, data, code, error } = await Find_Videos(searchParam, tempPage);
    if (success) {
      return res.status(code).json({ status: code, data });
    }
    return res.status(404).json({ error: "something went wrong, Try again", status: 404 });
  } catch (e: any) {
    return res.status(404).json({ error: "something went wrong, Try again", status: 404 });
  }
};

//autocomplete sugeestion
export const autoComplete = async (req: Request, res: Response) => {
  const param = req.query.param as string;
  try {
    const searchSuggestion = await Search_Autocomplete(param);
    return res.status(200).json({ data: searchSuggestion, status: 200 });
  } catch (e: any) {
    return res.status(200).json({ data: null, status: 200 });
  }
};

//trending videos
export const trending = async (req: Request, res: Response) => {
  const prevId = req.query.prevId as string;
  try {
    const { success, data, code, message, error } = await Trending_Videos(prevId);
    if (success) {
      return res.status(code).json({ status: code, data, message });
    }
    return res.status(code).json({ status: code, data: "", error, message });
  } catch (e: any) {
    return res.status(200).json({ data: null, status: 200 });
  }
};

//videos by genre
export const ByGenre = async (req: Request, res: Response) => {
  const Genre = req.query.Genre as string;
  const prevId = req.query.prevId as string;
  if (Genre) {
    return res.status(404).json({
      status: 404,
      error: `Provide the proper value for Genre`,
    });
  }
  try {
    const { success, data, code, message, error } = await Genre_Based_Videos(~~Genre, prevId);
    if (success) {
      return res.status(code).json({ status: code, data, message });
    }
    return res.status(code).json({ status: code, data: "", error, message });
  } catch (e: any) {
    return res.status(200).json({ data: null, status: 200 });
  }
};

export const getVideosFromSubscriptionList = async (req: Request<{ userId: string; prevId: string }>, res: Response) => {
  const { userId, prevId } = req.params;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  if (!userId || !endDate || !startDate) {
    return res.status(404).json({
      status: 404,
      error: `Provide the proper value for userId, startDate and tartDate`,
    });
  }

  try {
    const start = startDate || "0";
    const end = endDate || "0";
    const { success, data, code, message, error } = await getAll_SubscriptionBased_Video(userId, start, end, prevId);
    if (success) {
      return res.status(code).json({ status: code, data });
    }
    return res.status(code).json({ status: code, data: "", error });
  } catch (e: any) {
    return res.status(404).json({ error: 404, message: `Something went wrong, Try again!` });
  }
};
//get liked videos
export const getLikedVideos = async (req: Request<{ userId: string; prevId: string }>, res: Response) => {
  const { userId, prevId } = req.params;
  if (userId) {
    try {
      // if the last element to paginate with was provided
      const { success, code, data, error } = await getAll_Liked_video(userId, prevId);
      if (success) return res.status(code).json({ status: code, data });
      //if things didnt go so well
      return res.status(code).json({ status: code, data, error });
    } catch (e: any) {
      return res.status(404).json({ error: 404, message: `Something went wrong, Try again!` });
    }
  }
  //if the appropriate values were not provided
  return res.status(404).json({ status: 404, error: `Provide the proper value for the following: (${userId ? "" : "userId"})` });
};

//get watch later videos
export const getWatchLaterVideos = async (req: Request<{ userId: string; prevId: string }>, res: Response) => {
  const { userId, prevId } = req.params;
  if (userId) {
    try {
      // if the last element to paginate with was provided
      const { success, code, data, error } = await getAll_WatchLater_video(userId, prevId);
      if (success) return res.status(code).json({ status: code, data });
      //if things didnt go so well
      return res.status(code).json({ status: code, data, error });
    } catch (e: any) {
      return res.status(404).json({ error: 404, message: `Something went wrong, Try again!` });
    }
  }
  //if the appropriate values were not provided
  return res.status(404).json({ status: 404, error: `Provide the proper value for the following: (${userId ? "" : "userId"})` });
};

//get seen videos
export const getWatchHistoryVideos = async (req: Request<{ userId: string; prevId: string }>, res: Response) => {
  const { userId, prevId } = req.params;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  if (!userId || !endDate || !startDate) {
    return res.status(404).json({
      status: 404,
      error: `Provide the proper value for userId, startDate and tartDate`,
    });
  }

  try {
    // if the last element to paginate with was provided
    const start = startDate || "0";
    const end = endDate || "0";
    const { success, code, data, error } = await getAll_Videos_Viewed(userId, start, end, prevId);
    if (success) return res.status(code).json({ status: code, data });
    //if things didnt go so well
    return res.status(code).json({ status: code, data, error });
  } catch (e: any) {
    return res.status(404).json({ error: 404, message: `Something went wrong, Try again!` });
  }
};

//one video
export const oneVideo = async (req: Request<{ videoId: string }>, res: Response) => {
  const { videoId } = req.params;
  if (!videoId) {
    return res.status(404).json({
      status: 404,
      error: `Provide the proper value for videoId`,
    });
  }
  try {
    const { success, data, code, error } = await get_One_Video(videoId);
  if (success) return res.status(code).json({ status: code, data });
    //if things didnt go so well
    return res.status(code).json({ status: code, data, error });
  } catch (e: any) {
    return res.status(404).json({ error: 404, message: `Something went wrong, Try again!` });
  }
};

//one video
export const Likes_nd_Dislikes_oneVideo = async (req: Request<{ videoId: string }>, res: Response) => {
  const { videoId } = req.params;
  if (!videoId) {
    return res.status(404).json({
      status: 404,
      error: `Provide the proper value for videoId`,
    });
  }
  try {
    const { success, data, code, error } = await likes_N_dislike_for_One_Video(videoId);
  if (success) return res.status(code).json({ status: code, data });
    //if things didnt go so well
    return res.status(code).json({ status: code, data, error });
  } catch (e: any) {
    return res.status(404).json({ error: 404, message: `Something went wrong, Try again!` });
  }
};

//one video
export const Views_oneVideo = async (req: Request<{ videoId: string }>, res: Response) => {
  const { videoId } = req.params;
  if (!videoId) {
    return res.status(404).json({
      status: 404,
      error: `Provide the proper value for videoId`,
    });
  }
  try {
    const { success, data, code, error } = await views_for_One_Video(videoId);
  if (success) return res.status(code).json({ status: code, data });
    //if things didnt go so well
    return res.status(code).json({ status: code, data, error });
  } catch (e: any) {
    return res.status(404).json({ error: 404, message: `Something went wrong, Try again!` });
  }
};

//one video
export const All_Activity_oneVideo = async (req: Request<{ videoId: string }>, res: Response) => {
  const { videoId } = req.params;
  if (!videoId) {
    return res.status(404).json({
      status: 404,
      error: `Provide the proper value for videoId`,
    });
  }
  try {
    const { success, data, code, error } = await allActivity_for_One_Video(videoId);
  if (success) return res.status(code).json({ status: code, data });
    //if things didnt go so well
    return res.status(code).json({ status: code, data, error });
  } catch (e: any) {
    return res.status(404).json({ error: 404, message: `Something went wrong, Try again!` });
  }
};
