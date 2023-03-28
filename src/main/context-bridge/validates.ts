import { ipcRenderer } from 'electron';
import { events } from '../events/constants';

const validates = {
  isAdmin: () => {
    ipcRenderer.send(events.validates.isAdmin);
  },
};

export default validates;
