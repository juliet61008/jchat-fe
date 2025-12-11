import Login from "@/components/mem/Login";
import { getUser } from "@/utils/mem/userUtil";

const Page = async () => {
  const res = await getUser();

  console.log(res);

  return (
    <div className="flex items-center justify-center p-4">
      <Login />
    </div>
  );
};

export default Page;
