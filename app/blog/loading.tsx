import { HashLoader } from "react-spinners";

export default function BlogLoading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <HashLoader color="#eef0f7" size={80} />
    </div>
  );
}
