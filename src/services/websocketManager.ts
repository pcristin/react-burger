// WebSocket manager для глобального управления соединениями
import { store } from './store';
import { startFeedConnection, closeFeedConnection } from './feedSlice';
import { startUserOrdersConnection, closeUserOrdersConnection } from './userOrdersSlice';

type ConnectionName = 'feed' | 'userOrders';

// Глобальный объект для отслеживания активных соединений
const connections: Record<ConnectionName, boolean> = {
  feed: false,
  userOrders: false
};

// Таймеры для предотвращения быстрого переподключения
const connectionTimers: Record<ConnectionName, NodeJS.Timeout | null> = {
  feed: null,
  userOrders: null
};

// Таймеры для задержки отключения
const disconnectionTimers: Record<ConnectionName, NodeJS.Timeout | null> = {
  feed: null,
  userOrders: null
};

// Интервал для таймера предотвращения "дребезга" (debounce)
const DEBOUNCE_INTERVAL = 300;

// Интервал задержки для отключения
const DISCONNECT_DELAY = 500;

/**
 * Очистить все таймеры для соединения
 */
const clearAllTimers = (name: ConnectionName) => {
  if (connectionTimers[name]) {
    clearTimeout(connectionTimers[name]!);
    connectionTimers[name] = null;
  }
  
  if (disconnectionTimers[name]) {
    clearTimeout(disconnectionTimers[name]!);
    disconnectionTimers[name] = null;
  }
};

/**
 * Открыть WebSocket соединение
 */
export const connect = (name: ConnectionName): void => {
  console.log(`WebSocket Manager: Connecting to ${name}...`);
  
  // Очищаем все таймеры перед новым действием
  clearAllTimers(name);
  
  // Если соединение уже установлено, сначала отключаемся
  if (connections[name]) {
    console.log(`WebSocket Manager: ${name} connection already active, disconnecting first`);
    // Установим флаг, что соединение неактивно, чтобы включить его снова после таймера
    connections[name] = false;
    
    // Отправляем действие отключения
    if (name === 'feed') {
      store.dispatch(closeFeedConnection());
    } else if (name === 'userOrders') {
      store.dispatch(closeUserOrdersConnection());
    }
    
    // Устанавливаем таймер для переподключения после задержки
    disconnectionTimers[name] = setTimeout(() => {
      disconnectionTimers[name] = null;
      console.log(`WebSocket Manager: Reconnecting to ${name} after disconnection`);
      connect(name); // Рекурсивный вызов для повторного подключения
    }, DISCONNECT_DELAY);
    
    return;
  }
  
  // Устанавливаем таймер для предотвращения быстрых повторных подключений
  connectionTimers[name] = setTimeout(() => {
    connections[name] = true;
    
    // Отправка соответствующего действия в Redux
    if (name === 'feed') {
      console.log('WebSocket Manager: Dispatching startFeedConnection action');
      store.dispatch(startFeedConnection());
    } else if (name === 'userOrders') {
      console.log('WebSocket Manager: Dispatching startUserOrdersConnection action');
      store.dispatch(startUserOrdersConnection());
    }
    
    connectionTimers[name] = null;
  }, DEBOUNCE_INTERVAL);
};

/**
 * Закрыть WebSocket соединение
 */
export const disconnect = (name: ConnectionName): void => {
  console.log(`WebSocket Manager: Disconnecting from ${name}...`);
  
  // Очищаем все таймеры перед новым действием
  clearAllTimers(name);
  
  // Если соединение неактивно, ничего не делаем
  if (!connections[name]) {
    console.log(`WebSocket Manager: ${name} connection already inactive`);
    return;
  }
  
  // Immediately mark the connection as inactive to prevent reconnection attempts
  connections[name] = false;
  
  // Dispatch disconnect action immediately for cleaner state transitions
  if (name === 'feed') {
    console.log('WebSocket Manager: Dispatching closeFeedConnection action');
    store.dispatch(closeFeedConnection());
  } else if (name === 'userOrders') {
    console.log('WebSocket Manager: Dispatching closeUserOrdersConnection action');
    store.dispatch(closeUserOrdersConnection());
  }
};

/**
 * Отключить все активные соединения
 */
export const disconnectAll = (): void => {
  console.log('WebSocket Manager: Disconnecting all connections');
  
  Object.keys(connections).forEach((name) => {
    if (connections[name as ConnectionName]) {
      disconnect(name as ConnectionName);
    }
  });
};

// При закрытии страницы закрываем все соединения
window.addEventListener('beforeunload', () => {
  disconnectAll();
});

// При отключении сети закрываем все соединения
window.addEventListener('offline', () => {
  console.log('Network offline, closing all WebSocket connections');
  disconnectAll();
});

// При возвращении сети, попробуем переподключиться
window.addEventListener('online', () => {
  console.log('Network back online, reconnecting active WebSockets');
  // Переподключаем только те, которые были активны
  Object.keys(connections).forEach((name) => {
    if (connections[name as ConnectionName]) {
      connect(name as ConnectionName);
    }
  });
}); 