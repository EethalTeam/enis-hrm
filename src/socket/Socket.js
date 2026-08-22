import { io } from "socket.io-client";
import { config } from "@/components/CustomComponents/config";
const socket = io("https://enis-hrm-node.eniscloud.in", {
  transports: ["websocket"],
});

export default socket;
