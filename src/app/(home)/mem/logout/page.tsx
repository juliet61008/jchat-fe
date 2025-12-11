import Loading from "@/components/common/Loading";
import Logout from "@/components/mem/Logout";

const page = async () => {
  // redirect("/");

  return (
    <>
      <Logout />
      <Loading isLoading={true} />
    </>
  );
};

export default page;
