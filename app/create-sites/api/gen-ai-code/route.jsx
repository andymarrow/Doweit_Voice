import { NextResponse } from "next/server";
import { GenAiCode } from "../../configs/AiModel";

export async function POST(req){
    const {prompt}=await req.json();
    try{
        const result=await GenAiCode.sendMessage(prompt);
        const resp=result.response.text();
        //now we want the result in json format so we need to parse it to see why its because its in object form 

        // return NextResponse.json(resp);
        return NextResponse.json(JSON.parse(resp));
    }catch(e)
    {
        console.error("Error:", e);  // Log the error for debugging
        return NextResponse.json({ error: e.message });  // Send the error message back in the response
    }
}