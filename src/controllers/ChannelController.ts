import { Request, Response } from "express";
import {get_All_Creation,get_Channel_Subscribers,get_Channel_Activity,Find_Channels,One_Channel_Info } from '../services/Channel'

export const get_AllVideos = async (req: Request, res: Response) => {
    const { channelId }: { channelId: string } = req.body;
  
    if (channelId) {
      try {
        const { success, message, data, error, code } = await get_All_Creation (channelId);
        if (success) {
          //if everything went well
          return res.status(code).json({ status: code, message, data });
        }
        // if things went wrong
        return res.status(code).json({ status: code, error, data });
      } catch (e: any) {
        return res.status(404).json({ status: 404, error: "Something went wrong" });
      }
    }
    //if thingds went wrong
    return res.status(404).json({
      status: 404,
      error: `Provide the proper value for the following: (${channelId ? "" : "channelId"})`,
    });
  };


  //get channel Subscribers
export const Channel_Subscribers = async (req: Request, res: Response) => {
    const channelId: string = req.params.channelId;
    if (!channelId) {
      //if things went wrong
      return res.status(404).json({
        status: 404,
        error: `Provide the proper value for channelId`,
      });
    }
    try {
      const { success, code, message, data, error } = await get_Channel_Subscribers(channelId);
      if (success) {
        //if everything went well
        return res.status(code).json({ status: code, message, data });
      }
      // if things went wrong
      return res.status(code).json({ status: code, error, data });
    } catch (e: any) {
      return res.status(404).json({ status: 404, error: "Something went wrong" });
    }
  };



  //get channel data
export const Channel_Data = async (req: Request, res: Response) => {
    const channelId: string = req.params.channelId;
    if (!channelId) {
      //if things went wrong
      return res.status(404).json({
        status: 404,
        error: `Provide the proper value for channelId`,
      });
    }
    try {
      const { success, code, message, data, error } = await One_Channel_Info(channelId);
      if (success) {
        //if everything went well
        return res.status(code).json({ status: code, message, data });
      }
      // if things went wrong
      return res.status(code).json({ status: code, error, data });
    } catch (e: any) {
      return res.status(404).json({ status: 404, error: "Something went wrong" });
    }
  };
  
export const Channel_Activity = async (req: Request, res: Response) => {
    const channelId: string = req.params.channelId;
    if (!channelId) {
      //if things went wrong
      return res.status(404).json({
        status: 404,
        error: `Provide the proper value for channelId`,
      });
    }
    try {
      const { success, code, message, data, error } = await get_Channel_Activity(channelId);
      if (success) {
        //if everything went well
        return res.status(code).json({ status: code, message, data });
      }
      // if things went wrong
      return res.status(code).json({ status: code, error, data });
    } catch (e: any) {
      return res.status(404).json({ status: 404, error: "Something went wrong" });
    }
  };
  
export const Find_ListOf_Channnel = async (req: Request, res: Response) => {
    const channelId: string = req.params.channelId;
    const page= req.query.page as string;
    const finalPage = ~~page || 1;
    if (!channelId || finalPage < 1) {
      //if things went wrong
      return res.status(404).json({
        status: 404,
        error: `Provide the proper value for channelId and page`,
      });
    }
    try {
      const { success, code,data, error } = await Find_Channels(channelId,finalPage);
      if (success) {
        //if everything went well
        return res.status(code).json({ status: code, data });
      }
      // if things went wrong
      return res.status(code).json({ status: code, error, data });
    } catch (e: any) {
      return res.status(404).json({ status: 404, error: "Something went wrong" });
    }
  };
  