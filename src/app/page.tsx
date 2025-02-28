import Image from "next/image";
import SearchBar from "@/components/SearchBar";

export default function Home() {


  return (
    <div className="flex flex-row items-center h-[100vh] justify-center w-full">
      <div className="flex flex-col flex-wrap items-center justify-center w-full ">
          <div>
        Boohru-Chan!
          </div>
          <div>
        Your Best Waifu Search Engine!
          </div>
          <div className="w-full ">
              <SearchBar/>
          </div>
      </div>
    </div>
  );
}
