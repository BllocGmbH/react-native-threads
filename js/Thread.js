import {
  NativeModules,
  DeviceEventEmitter,
  Platform,
} from 'react-native';

const { ThreadManager } = NativeModules;

export default class Thread {
  constructor(jsPath) {
    if (!jsPath || !jsPath.endsWith('.js')) {
      throw new Error('Invalid path for thread. Only js files are supported');
    }

    this.id = ThreadManager.startThread(jsPath.replace(".js", ""))
      .then(id => {
        DeviceEventEmitter.addListener(`Thread${id}`, (message) => {
          !!message && this.onmessage && this.onmessage(message);
        });
        return id;
      })
      .catch(err => { throw new Error(err) });
  }

  setShouldRunInBackground(boolean) {
    if (Platform.OS === 'ios') throw new Error('setShouldRunInBackground method only implemented for Android')
    ThreadManager.setShouldRunInBackground(boolean)
  }

  postMessage(message) {
    this.id.then(id => ThreadManager.postThreadMessage(id, message));
  }

  terminate() {
    this.id.then(ThreadManager.stopThread);
  }
}
