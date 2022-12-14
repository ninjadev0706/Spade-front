import Tippy from "@tippyjs/react";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "../config";
import { socket } from "../socket";
import { currency } from "../utils/currency";
import Preloader from "../components/Preloader";

const Depository = () => {
  const [depositories, setDepositories] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [audits, setAudits] = useState<any[]>([]);
  const [reserve, setReserve] = useState<any>(null);
  const [buttonindex, setButtonIndex] = useState(0);

  const currentItems = useMemo(
    () => depositories.find((v) => v.name == active)?.items || [],
    [depositories, active],
  );

  const totalAssets = useMemo(() => {
    return audits.reduce((sum, v) => sum + v.value, 0);
  }, [audits]);

  useEffect(() => {
    socket.on("reserve", (data) => {
      setReserve(data);
    });

    socket.emit("reserve");

    loadDepositories();
    loadAudits();

    return () => {
      socket.off("reserve");
    };
  }, []);

  const loadDepositories = async () => {
    const { data } = await axios.get(API_URL + "/depositories");
    setActive(data[0].name);
    setDepositories(data);
  };

  const loadAudits = async () => {
    const { data } = await axios.get(API_URL + "/audits");
    setAudits(data);
  };

  const percentageTemplate = (total: number, value: number) => {
    const percent = (value / total) * 100;
    return (
      <>
        <div className={`w-full bg-[#b5b5b5] rounded h-1`}>
          <div
            className={`bg-[#292D3C] h-1 rounded`}
            style={{ width: `${percent > 100 ? 100 : percent}%` }}
          ></div>
        </div>
      </>
    );
  };

  const setButton = (name: any, index: number) => {
    setActive(name);
    setButtonIndex(index);
  }

  if (!depositories.length || !audits.length || !reserve) {
    return <Preloader />;
    // return <></>
  }

  return (
    <div className="bg-split-white-black px-4 md:p-12 lg:p-14 xl:px-24">
      <div className="md:flex items-center none">
        <div className="md:w-6/12 text-left text-white pt-10 md:pt-2 cursor-pointer relative">
          <span className="ml-2 text-xl md:text-2xl lg:text-4xl font-bold">
            Depository
          </span>
          <p className="ml-2 text-left text-white hidden md:block md:text-base text-xs mt-2">
            Last verified at 07/09/2022 02:05:45 PM UTC
          </p>
          <p className="ml-2 text-left text-white block md:hidden md:text-base text-xs mt-2">
            Last verified at 7th September 2022
          </p>
        </div>
        <div className="md:w-6/12 px-2 flex mt-6 xl:mt-0 md:justify-end pr-10">
          <div className="md:w-6/12">
            <p className="text-gray-400 text-md md:text-right">Total assets</p>
            <p className="text-gray-200 text-xl md:text-right">
              {currency(totalAssets)}
            </p>
          </div>
        </div>
      </div>
      <p className="mb-10 p-2"></p>
      <div className="rounded-md shadow-md bg-white">
        <ul className="nav nav-tabs nav-justified flex flex-col md:flex-row flex-wrap list-none pl-0 mb-4">
          {depositories.map((v, index) => (
            <>
              <li className="nav-item flex-grow text-center" key={index}>
                <span
                  onClick={() => setButton(v.name, index)}
                  className={`nav-link w-full block flex justify-center font-medium text-xs leading-tight border-x-0 border-t-0 border-b-2 px-6 py-3 my-2 hover:bg-gray-100 cursor-pointer ${
                    active == v.name ? "active" : ""
                  }`}
                >
                  {v.name}
                  <div className="hidden md:block">
                    <Tippy interactive content={v.tooltip}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-2 relative -top-[1px] inline cursor-pointer"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Tippy>
                  </div>
                </span>
              </li>
              <div className={`md:grid grid-cols-2 md:hidden block`}>
                {currentItems.map((v: any, i: number) => (
                  <div key={i} className={`px-6 pb-4 ${(buttonindex-index)? "hidden" : ""}`}>
                    <div className="border rounded-md px-1 py-1">
                      <div className="w-full pl-1">
                        <span className="text-xs ">{v.name}</span>
                      </div>
                      <div className="w-full bg-[#F9FCFE] py-1 px-1 flex items-center rounded-r-md">
                        {percentageTemplate(totalAssets, v.total)}
                      </div>
                    </div>
                    <div className="flex my-4 px-1">
                      <div className="w-1/2">
                        <p className="text-xs text-[#232323]">
                          Total Authorized Value
                        </p>
                      </div>
                      <div className="w-1/2">
                        <p className="text-xs text-[#586871] text-right">
                          {currency(v.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ))}
        </ul>

        <div className="md:grid grid-cols-2 md:block hidden">
          {currentItems.map((v: any, i: number) => (
            <div key={i} className="px-6 pb-4">
              <div className="border rounded-md px-1 py-1">
                <div className="w-full pl-1">
                  <span className="text-xs ">{v.name}</span>
                </div>
                <div className="w-full bg-[#F9FCFE] py-1 px-1 flex items-center rounded-r-md">
                  {percentageTemplate(totalAssets, v.total)}
                </div>
              </div>
              <div className="flex my-4 px-1">
                <div className="w-1/2">
                  <p className="text-xs text-[#232323]">
                    Total Authorized Value
                  </p>
                </div>
                <div className="w-1/2">
                  <p className="text-xs text-[#586871] text-right">
                    {currency(v.total)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Depository;
