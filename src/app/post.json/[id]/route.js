import { NextResponse } from "next/server";
import ControllerApi from "@/controller/index"
import errorHandle from "@/middleware/errorHandle"
export async function GET(req, { params }) {
  const id = (await params).id

  try {
    const data = await ControllerApi.GetPostId(id)
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(errorHandle(error));
  }
}
