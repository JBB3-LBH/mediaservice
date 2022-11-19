import { Request, Response } from "express";
import { signedUrl_forOne, signedUrl_forOneScene, signedUrl_forScenes } from "../services/Signed";


export const signOne = async (req: Request, res: Response) => {
    const path = req.query.path as string;

    if(path.includes('http')){
        return res.send(404)
    }
    const newUrl = await signedUrl_forOne(path)
    return res.status(200).send(newUrl)
}

export const signOneScene = async (req: Request, res: Response)=>{
    const videoId = req.query.path as string
    const _id = req.query.sceneId as string;
    if(videoId.includes('http')){
        return res.send(404)
    }
    const newData = await signedUrl_forOneScene({videoId, _id})
    return res.status(200).json(newData)
}


export const signAllScene = async (req: Request, res: Response)=>{
    const scenesArr = req.body.scenesArr;
    const newData = await signedUrl_forScenes(scenesArr)
    return res.status(200).json(newData)
}

