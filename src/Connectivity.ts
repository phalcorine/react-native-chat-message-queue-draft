import * as Network from 'expo-network';
import { DeviceEventEmitter } from 'react-native';

const EVENT_INTERNET_CONNECTIVITY_CHANGED = 'event-internet-connectivity-changed';

export class ConnectivityManager {
    constructor() {
        console.log("ConnectivityManager has just been initialized!");
        this.init();
    }

    // public onInternetConnectivityChange = new DeviceEventEmitter.;

    private init() {
        setInterval(async () => {
            const networkState = await Network.getNetworkStateAsync();
            const isAirplaneMode = await Network.isAirplaneModeEnabledAsync();

            const isConnected = !isAirplaneMode && networkState.isInternetReachable;
            DeviceEventEmitter.emit(EVENT_INTERNET_CONNECTIVITY_CHANGED, isConnected);
        }, 50000);
    }

    subscribe(subscriber: (event: any) => void) {
        DeviceEventEmitter.addListener(EVENT_INTERNET_CONNECTIVITY_CHANGED, subscriber);
    }
}