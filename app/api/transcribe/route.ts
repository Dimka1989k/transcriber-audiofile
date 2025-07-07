import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided." },
        { status: 400 }
      );
    }

    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 25 MB limit." },
        { status: 413 }
      );
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], audioFile.name, { type: audioFile.type }),
      model: "gpt-4o-transcribe",
      response_format: "json",
    });

    await prisma.user.upsert({
      where: { clerkUserId: userId },
      update: {},
      create: { clerkUserId: userId },
    });

    const newTranscript = await prisma.transcription.create({
      data: {
        user: {
          connect: { clerkUserId: userId },
        },
        text: transcription.text,
      },
    });

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        transcriptionsCount: { increment: 1 },
      },
    });

    return NextResponse.json({
      id: newTranscript.id,
      text: newTranscript.text,
      createdAt: newTranscript.createdAt,
    });
  } catch (error) {
    console.error("Error during transcription:", error);
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: error.message, status: error.status },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
