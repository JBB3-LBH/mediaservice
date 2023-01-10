import { Router } from "express";
import {Channel_Subscribers,get_AllVideos,Channel_Data,Channel_Activity,Find_ListOf_Channnel, findChannel_ByName} from '../controllers/ChannelController'
const r = Router();

r.get("/find", Find_ListOf_Channnel);
r.get("/find/:username", findChannel_ByName);
r.get("/:channelId",Channel_Data);
r.get("/:channelId/subscribers",Channel_Subscribers);
r.get("/:channelId/videos",get_AllVideos);
r.get("/:channelId/info",Channel_Activity);

export default r;
