import { BookingRequestDetail } from "../../../../src/booking/booking-request-detail";

export default async function BookingRequestDetailPage({
  params
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;

  return <BookingRequestDetail requestId={requestId} />;
}
