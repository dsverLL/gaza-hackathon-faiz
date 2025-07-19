import React, { useState } from 'react';
import { Button, FlatList, TextInput, View, Text, StyleSheet } from 'react-native';

import { useBluetooth } from '@/hooks/useBluetooth';

export default function BluetoothScreen() {
  const {
    devices,
    isScanning,
    connectedDevice,
    scanForDevices,
    connectToDevice,
    sendMessage,
  } = useBluetooth();

  const [message, setMessage] = useState('Hello');
  const [serviceUUID, setServiceUUID] = useState('');
  const [characteristicUUID, setCharacteristicUUID] = useState('');

  const renderItem = ({ item }: any) => (
    <View style={styles.deviceItem}>
      <Text>{item.name ?? 'Unnamed'} ({item.id})</Text>
      <Button title="Connect" onPress={() => connectToDevice(item)} />
    </View>
  );

  const handleSend = () => {
    if (!serviceUUID || !characteristicUUID) {
      console.warn('Service and characteristic UUIDs required');
      return;
    }
    sendMessage(serviceUUID, characteristicUUID, message);
  };

  return (
    <View style={styles.container}>
      <Button title={isScanning ? 'Scanning...' : 'Scan for Devices'} onPress={scanForDevices} disabled={isScanning} />
      <FlatList data={devices} keyExtractor={(item) => item.id} renderItem={renderItem} />
      {connectedDevice && (
        <View style={styles.messageContainer}>
          <Text>Connected to: {connectedDevice.name ?? connectedDevice.id}</Text>
          <TextInput
            style={styles.input}
            placeholder="Service UUID"
            value={serviceUUID}
            onChangeText={setServiceUUID}
          />
          <TextInput
            style={styles.input}
            placeholder="Characteristic UUID"
            value={characteristicUUID}
            onChangeText={setCharacteristicUUID}
          />
          <TextInput
            style={styles.input}
            placeholder="Message"
            value={message}
            onChangeText={setMessage}
          />
          <Button title="Send" onPress={handleSend} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  deviceItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  messageContainer: { marginTop: 16, gap: 8 },
  input: { borderWidth: 1, padding: 8, borderColor: '#ccc', borderRadius: 4 },
});
