import { MessageThreadDetail } from "../../../../src/messaging/message-thread-detail";

export default async function ThreadPage({
  params
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  return <MessageThreadDetail threadId={threadId} />;
}
