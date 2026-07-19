import { ipcMain } from 'electron';
import { bookings } from '../database/bookings';

export function registerBookingsIPC() {
  ipcMain.handle('bookings:getAll', async () => {
    try {
      return await bookings.getAll();
    } catch (error) {
      console.error('IPC bookings:getAll failed:', error);
      throw error;
    }
  });

  ipcMain.handle('bookings:getById', async (_event, id) => {
    try {
      return await bookings.getById(id);
    } catch (error) {
      console.error('IPC bookings:getById failed:', error);
      throw error;
    }
  });

  ipcMain.handle('bookings:create', async (_event, booking) => {
    try {
      return await bookings.create(booking);
    } catch (error) {
      console.error('IPC bookings:create failed:', error);
      throw error;
    }
  });

  ipcMain.handle('bookings:update', async (_event, id, booking) => {
    try {
      return await bookings.update(id, booking);
    } catch (error) {
      console.error('IPC bookings:update failed:', error);
      throw error;
    }
  });

  ipcMain.handle('bookings:delete', async (_event, id) => {
    try {
      return await bookings.delete(id);
    } catch (error) {
      console.error('IPC bookings:delete failed:', error);
      throw error;
    }
  });
}
