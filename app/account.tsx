"use client";

import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from "wagmi";
import { useIsConnected } from "./lib";
import makeBlockie from "ethereum-blockies-base64";
import { Ring } from "react-css-spinners";

export default function Account() {
  const isConnected = useIsConnected();
  const { address } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const name = useEnsName();
  const { data: avatar } = useEnsAvatar();
  const { disconnect } = useDisconnect();

  return (
    <div className="flex items-center space-x-4">
      {isConnected === null ? (
        <Ring color="white" size={24} thickness={3} />
      ) : isConnected && address ? (
        <div className="flex items-center space-x-2">
          <img src={makeBlockie(address!)} className="rounded-full w-8 h-8" />
          <div className="font-mono">
            {name.data ||
              (!!address
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : "Connected")}
          </div>
        </div>
      ) : null}
      <button
        className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-full"
        onClick={() =>
          isConnected ? disconnect() : connect({ connector: connectors[0] })
        }
      >
        {isConnected ? "Disconnect" : "Connect Wallet"}
      </button>
    </div>
  );
}
