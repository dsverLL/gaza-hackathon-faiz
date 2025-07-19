import { useEffect, useRef, useState } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

export function useBluetooth() {
  const managerRef = useRef<BleManager>();
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    managerRef.current = new BleManager();
    return () => {
      managerRef.current?.destroy();
    };
  }, []);

  const scanForDevices = () => {
    if (isScanning) return;
    setIsScanning(true);
    managerRef.current?.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.warn('Scan error', error);
        setIsScanning(false);
        return;
      }
      if (device && device.name) {
        setDevices((prev) => {
          if (prev.find((d) => d.id === device.id)) return prev;
          return [...prev, device];
        });
      }
    });
    // stop scan after 5 seconds
    setTimeout(() => {
      managerRef.current?.stopDeviceScan();
      setIsScanning(false);
    }, 5000);
  };

  const connectToDevice = async (device: Device) => {
    try {
      const connected = await managerRef.current?.connectToDevice(device.id);
      if (!connected) return;
      await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connected);
    } catch (e) {
      console.warn('Connection error', e);
    }
  };

  const sendMessage = async (
    serviceUUID: string,
    characteristicUUID: string,
    message: string,
  ) => {
    if (!connectedDevice) return;
    const data = Buffer.from(message, 'utf-8').toString('base64');
    try {
      await connectedDevice.writeCharacteristicWithResponseForService(
        serviceUUID,
        characteristicUUID,
        data,
      );
    } catch (e) {
      console.warn('Send error', e);
    }
  };

  return {
    devices,
    isScanning,
    connectedDevice,
    scanForDevices,
    connectToDevice,
    sendMessage,
  };
}
