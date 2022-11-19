import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import logg from "../Logs/Customlog";
import { custom } from "./custom";
interface oneSceneTypes {
  videoId: string;
  _id: string;
}
interface TypesforScene {
  videoId: string;
  _id: string;
}
//signed url for piece of data
export const signedUrl_forOne = async (s3Path: string): Promise<string> => {
  //sign with cloudfront

  try {
    const newUrl = getSignedUrl({
      url: `https://d27i2oedcihbcx.cloudfront.net/${s3Path}`,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
      privateKey: custom!,
      dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
    });

    return newUrl;
  } catch (e: any) {
    logg.warn(e.message)
    throw new Error(e.message);
  }
};

//signed url for one scene

export const signedUrl_forOneScene = async ({ videoId, _id }: TypesforScene): Promise<oneSceneTypes> => {
  //sign with cloudfront

 try {
  if (videoId.includes("http")) {
    return { videoId: "", _id };
  }
  const newUrl = getSignedUrl({
    url: `https://d27i2oedcihbcx.cloudfront.net/${videoId}`,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
    privateKey: custom!,
    dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
  });

  return { videoId: newUrl, _id };
  } catch (e: any) {
    logg.warn(e.message)
    throw new Error(e.message);
  }
};

//signed url for array of scenes
export const signedUrl_forScenes = async (ScenesList: TypesforScene[]): Promise<oneSceneTypes[]> => {
 try {
  const finalArr = [];
  for (let i = 0; i < ScenesList.length; i++) {
    const { videoId, _id } = ScenesList[i];
    if (!videoId || !_id) {
        finalArr.push({ videoId: "", _id });
      }
    else if (videoId.includes("http")) {
      finalArr.push({ videoId: "", _id });
    } else {
      //sign with cloudfront
      const newUrl = getSignedUrl({
        url: `https://d27i2oedcihbcx.cloudfront.net/${videoId}`,
        keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
        privateKey: custom!,
        dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
      });
      finalArr.push({ videoId: newUrl, _id });
    }
  }
  return finalArr;
  } catch (e: any) {
    logg.warn(e.message)
    throw new Error(e.message);
  }
};
