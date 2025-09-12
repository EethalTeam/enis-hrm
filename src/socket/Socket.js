import { io } from "socket.io-client";
import { config } from '@/components/CustomComponents/config';
console.log(config.Api,"api")
const socket = io(config.Api, {
  transports: ["websocket"],
});

export default socket;