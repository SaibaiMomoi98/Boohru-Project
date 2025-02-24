import { NextResponse } from "next/server";
import ControllerApi from "@/controller/index"
import errorHandle from "@/middleware/errorHandle"
export async function GET(req) {
  const reqUrl = req.url;  
  try {
    const data = await ControllerApi.GetPost(reqUrl)
    return NextResponse.json(data.post, { status: 200 });
  } catch (error) {
    return NextResponse.json(errorHandle(error))
  }
}
