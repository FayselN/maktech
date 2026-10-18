-- The Express app exposes clearAll() which wipes a device's notification
-- history (DeviceNotification.deleteMany). The device must be allowed to
-- delete its own device_notifications rows.
create policy "device owner delete notifications" on public.device_notifications
  for delete using (public.owns_device(device_id));
