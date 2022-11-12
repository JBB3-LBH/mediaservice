import { getCommentsTypes, get_All_Comments } from "../services/Comments";
import type { Request, Response } from "express";
import logg from "../Logs/Customlog";
//get comments in batch
export const AllComments = async (req: Request<getCommentsTypes>, res: Response) => {
    const { prevId, videoRef } = req?.params;
  
    //check if the videoRef is provided and if its a string
    if (videoRef) {
      try {
        //take in the previous/last element value and use it to paginate
        const { success, data, code, error,message } = await get_All_Comments({ videoRef, prevId });
        console.log(success)
        if (success) {
          //if everything goes softly
          return res.status(200).json({ status: code, data, message });
        }
        // else return an error and its message
        return res.status(code).json({ status: code, data: "", error });
      } catch (error) {
        // else return an error and its message
        logg.warn(`Error while getting comment`);
        return res.status(404).json({ status: 404, error: "Something went wrong, try again" });
      }
    }
    //if its not provided
    return res.status(404).json({ status: 404, error: "Provide the proper value for the property: ( videoRef )" });
  };