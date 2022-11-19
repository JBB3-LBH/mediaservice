import { Request, Response } from "express";
import { signedUrl_forOne, signedUrl_forOneScene, signedUrl_forScenes } from "../services/Signed";


export const signOne = async (req: Request, res: Response) => {
    const path = req.query.path as string;
try{
    if(!path){
        return res.status(404).send('provide the proper query for path')
    }
    if(path.includes('http')){
        return res.sendStatus(404)
    }
    const newUrl = await signedUrl_forOne(path)
    return res.status(200).send(newUrl)
    }catch(e:any){
        return res.sendStatus(404)
    }
}

export const signOneScene = async (req: Request, res: Response)=>{
    const videoId = req.query.path as string
    const _id = req.query.sceneId as string;
    try{
    if(!videoId || !_id){
        return res.status(404).send('provide the proper value for path and sceneId')
    }
    if(videoId.includes('http')){
        return res.sendStatus(404)
    }

    const newData = await signedUrl_forOneScene({videoId, _id})
    return res.status(200).json(newData)
    }catch(e:any){
        return res.sendStatus(404)
    }
}


export const signAllScene = async (req: Request, res: Response)=>{
    const scenesArr = req.body.scenesArr;
if(!scenesArr){
    return res.status(404).send('provide the proper value for scenesArr')
}   
    try{
    const newData = await signedUrl_forScenes(scenesArr)
    return res.status(200).json(newData)
    }catch(e:any){
        return res.sendStatus(404)
    }

}

