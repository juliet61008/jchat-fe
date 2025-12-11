import ChatRoom from "@/components/chat/ChatRoom";
import { getUser } from "@/utils/mem/userUtil";

interface IProps {
  params: IParams;
}

interface IParams {
  roomId: string;
}

const page = async (params: IProps) => {
  const segument = await params.params;
  console.log("segument", segument);
  const roomId = segument.roomId;
  console.log(roomId);

  const user = await getUser();
  return <ChatRoom user={user} roomName="dd" participantCount={2} />;
};

export default page;
