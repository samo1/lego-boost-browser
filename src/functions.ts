import { BoostConnector } from "./boostConnector";
import { Scanner } from "./scanner";
// import { Hub } from "./hub/hub";
import { HubAsync } from "./hub/hubAsync";
import { HubControl } from "./ai/hub-control";

let hub: HubAsync;
let color: string;
let hubControl: HubControl;

const deviceInfo = {
  ports: {
    A: { action: '', angle: 0 },
    B: { action: '', angle: 0 },
    AB: { action: '', angle: 0 },
    C: { action: '', angle: 0 },
    D: { action: '', angle: 0 },
    LED: { action: '', angle: 0 },
  },
  tilt: { roll: 0, pitch: 0 },
  distance: 0,
  rssi: 0,
  color: '',
  error: '',
  connected: false
};

const controlData = {
  input: null,
  speed: 0,
  turnAngle: 0,
  tilt: { roll: 0, pitch: 0 },
  forceState: null,
  updateInputMode: null
};

async function connect(): Promise<void> {
  try {
    const characteristic = await BoostConnector.connect();
    hub = new HubAsync(characteristic);

    hub.emitter.on("disconnect", async evt => {
      await BoostConnector.reconnect();
    });

    hub.emitter.on("distance", evt => {
      console.log(evt);
    });

    hub.emitter.on("connect", async evt => {
      await hub.ledAsync("purple");
    });
  } catch (e) {
    console.log("Error from connect: " + e);
  }
}

async function changeLed(): Promise<void> {
  if (!hub || hub.connected === false) return;
  color = color === 'pink' ? 'orange' : 'pink';
  await hub.ledAsync(color);
}

async function drive(): Promise<void> {
  if (!hub || hub.connected === false) return;
  await hub.motorTimeMultiAsync(2, 10, 10);
}

async function disconnect(): Promise<void> {
  if (!hub || hub.connected === false) return;
  hub.disconnect();
  await BoostConnector.disconnect();
}

async function ai(): Promise<void> {
  if (!hub || hub.connected === false) return;
  
  hubControl = new HubControl(deviceInfo, controlData);
  await hubControl.start(hub);
  setInterval(() => {
    hubControl.update();
  }, 100);
}

async function stop(): Promise<void> {

}

function scan(): void {
  try {
    Scanner.run();
  } catch (e) {
    console.log("Error from scan: " + e);
  }
}

export { connect, scan, changeLed, drive, disconnect, ai, stop };
