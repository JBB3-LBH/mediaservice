import logg from "../Logs/Customlog";
import { Video } from "../models";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { custom } from "../services/custom";
import { RefType, RefType2, VideoList2 } from "../types/main";

export const changeFormatFromRef = (Arr: VideoList2[]): RefType2[] | RefType[] => {
  const newVideoArr: RefType2[] = [];

  for (let i = 0; i < Arr.length; i++) {
    const Ele = Arr[i];
    if(Ele.Ref?.published){
        const newChannelPic =Ele.Ref.channelId?.channelPic ?  getSignedUrl({
          url: `https://d27i2oedcihbcx.cloudfront.net/${Ele.Ref.channelId!.channelPic}`,
          keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
          privateKey: custom!,
          dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
        }) : "";
        const newCoverPhoto =Ele.Ref.coverPhoto ?  getSignedUrl({
          url: `https://d27i2oedcihbcx.cloudfront.net/${Ele.Ref.coverPhoto}`,
          keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
          privateKey: custom!,
          dateLessThan: `${new Date(Date.now() + 60 * 60 * 24)}`,
        }) : "";
        const {
          _id,
          Views,
          releaseDate,
          channelId: { username, _id: id, channelName },
        } = Ele.Ref;
        const channel = { username, _id: id, channelName, channelPic: newChannelPic };
        const finalObj = {
          _id,
          Views,
          releaseDate,
          coverPhoto: newCoverPhoto,
          channel
        };
        newVideoArr.push(finalObj);
    }
  }
  return newVideoArr;
};

export const toISOStringWithTimezone = (date_main: Date | string) => {
  const date = new Date(date_main);
  const tzOffset = -date.getTimezoneOffset();
  const diff = tzOffset >= 0 ? "+" : "-";
  const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds()) +
    diff +
    pad(tzOffset / 60) +
    ":" +
    pad(tzOffset % 60)
  );
};

export const doesVideoExist = async (_id: string): Promise<boolean> => {
  try {
    const doesExist = await Video.findOne({ _id });
    if (doesExist) {
      //if the result is not null
      return true;
    } //if its null
    return false;
  } catch (e: any) {
    logg.warn("there was a problem while checking for video");
    console.log(e.message);
    throw new Error(e.message);
  }
};
