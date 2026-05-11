export const getNotifications = () => {
  const saved = localStorage.getItem("notifications");
  return saved ? JSON.parse(saved) : [];
};

export const saveNotifications = (notifications) => {
  localStorage.setItem("notifications", JSON.stringify(notifications));
};

export const addNotification = ({
  type,
  title,
  message,
  userEmail = "",
  groupId = null,
  groupTitle = "",
}) => {
  const currentNotifications = getNotifications();

  const newNotification = {
    id: Date.now(),
    type,
    title,
    message,
    userEmail,
    groupId,
    groupTitle,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  const updatedNotifications = [newNotification, ...currentNotifications];
  saveNotifications(updatedNotifications);
};

export const markNotificationAsRead = (notificationId) => {
  const currentNotifications = getNotifications();

  const updatedNotifications = currentNotifications.map((notification) =>
    notification.id === notificationId
      ? { ...notification, isRead: true }
      : notification
  );

  saveNotifications(updatedNotifications);
};

export const markAllNotificationsAsRead = (userEmail) => {
  const currentNotifications = getNotifications();

  const updatedNotifications = currentNotifications.map((notification) =>
    notification.userEmail === userEmail || !notification.userEmail
      ? { ...notification, isRead: true }
      : notification
  );

  saveNotifications(updatedNotifications);
};