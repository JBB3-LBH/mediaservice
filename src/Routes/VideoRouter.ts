import { Router } from "express";
import {
  getLikedVideos,
  getVideosFromSubscriptionList,
  getWatchLaterVideos,
  getWatchHistoryVideos,
  autoComplete,
  video_From_Search,
  trending,
  ByGenre,
  Views_oneVideo,
  All_Activity_oneVideo,
  Likes_nd_Dislikes_oneVideo,
  oneVideo,
  getOneWatchHistoryVideos,
} from "../controllers/VideoController";

const r = Router();

r.get("/:videoId", oneVideo); //get one video
r.get("/:videoId/allActivity", All_Activity_oneVideo); //get one video activity
r.get("/:videoId/likes_N_Dislikes", Likes_nd_Dislikes_oneVideo); //get one video likes and dislikes
r.get("/:videoId/views", Views_oneVideo); //get one video views

r.get("/search/autofill", autoComplete);
r.get("/trending", trending);
r.get("/genre", ByGenre);
r.get("/:userId/history", getWatchHistoryVideos); //watch history
r.get("/:userId/history/one", getOneWatchHistoryVideos); 


r.get("/:userId/watchLater", getWatchLaterVideos); //watch later
r.get("/:userId/watchLater/:prevId", getWatchLaterVideos); //watch later paginated
r.get("/:userId/liked", getLikedVideos); //liked videos
r.get("/:userId/liked/:prevId", getLikedVideos); // liked videos with pagination
r.get("/:userId/subscriptions/", getVideosFromSubscriptionList); //
r.get("/search/all", video_From_Search);
export default r;
