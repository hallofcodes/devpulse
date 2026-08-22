import { auth } from "@/app/lib/auth";
import { emitter } from "@/app/lib/emitter";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { conversationId } = await params;

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_user_id: { conversationId, user_id: session.user.id },
    },
  });

  if (!participant) {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
      };

      emitter.on(`chat:${conversationId}`, send);

      req.signal.addEventListener("abort", () => {
        emitter.off(`chat:${conversationId}`, send);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
