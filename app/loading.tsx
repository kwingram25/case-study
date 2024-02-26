import { Ring } from "react-css-spinners";

export default function Loading() {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <Ring className="stroke-purple-500" />
    </div>
  );
}
