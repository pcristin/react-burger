import { Middleware, MiddlewareAPI } from 'redux';
import { AppDispatch, RootState } from '../store';

// WebSocket events and actions
export const WS_CONNECTION_START = 'WS_CONNECTION_START';
export const WS_CONNECTION_SUCCESS = 'WS_CONNECTION_SUCCESS';
export const WS_CONNECTION_ERROR = 'WS_CONNECTION_ERROR';
export const WS_CONNECTION_CLOSED = 'WS_CONNECTION_CLOSED';
export const WS_GET_MESSAGE = 'WS_GET_MESSAGE';
export const WS_SEND_MESSAGE = 'WS_SEND_MESSAGE';

// Intervals for reconnection and timeout
export const CONNECTION_TIMEOUT = 5000;
export const RECONNECT_DELAY = 3000;
export const CONNECTION_DELAY = 100; // Small delay for closing previous connections

// Интерфейс для действий middleware
export interface IWSActions {
  wsConnect: string;
  wsConnected: string;
  wsError: string;
  wsDisconnect: string;
  wsMessage: string;
  wsSend?: string;
}

interface IWSAction {
  type: string;
  payload?: any;
}

// Updated to also accept an optional reducers map
export const socketMiddleware = (
  wsActions: IWSActions,
  wsReducers?: Record<string, any>
): Middleware => {
  return ((store: MiddlewareAPI<AppDispatch, RootState>) => {
    let socket: WebSocket | null = null;
    let url: string = '';
    let isClosing = false;
    let connectRequested = false;
    let connectionTimer: NodeJS.Timeout | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    
    return next => (action: IWSAction) => {
      const { dispatch } = store;
      const { type, payload } = action;

      if (type === wsActions.wsConnect) {
        // Сохраняем URL для потенциальных переподключений
        url = payload;
        
        // Устанавливаем флаг, что запрошено соединение
        connectRequested = true;
        
        // Сбрасываем флаг закрытия
        isClosing = false;
        
        // Закрываем предыдущее соединение, если оно существует
        if (socket) {
          console.log('Closing previous WebSocket connection');
          
          try {
            // Только закрываем соединение, если оно в состоянии, когда это возможно
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
              socket.close();
            }
          } catch (e) {
            console.error('Error closing socket:', e);
          }
          
          socket = null;
          
          // Очищаем существующий таймер соединения
          if (connectionTimer) {
            clearTimeout(connectionTimer);
            connectionTimer = null;
          }
          
          // Добавляем задержку перед созданием нового соединения
          setTimeout(() => {
            if (!isClosing && connectRequested) {
              createWebSocketConnection(url);
            }
          }, CONNECTION_DELAY);
        } else {
          // Создаем соединение немедленно, если предыдущего не было
          createWebSocketConnection(url);
        }
      }

      // Функция для создания WebSocket соединения с обработкой ошибок
      function createWebSocketConnection(wsUrl: string) {
        try {
          if (isClosing) return; // Не создаем новое соединение если закрываемся
          
          console.log('Connecting to WebSocket:', wsUrl);
          
          // Создаем новое WebSocket соединение
          socket = new WebSocket(wsUrl);

          // Устанавливаем таймаут для установления соединения
          connectionTimer = setTimeout(() => {
            if (socket && socket.readyState !== WebSocket.OPEN) {
              console.error('WebSocket connection timeout');
              
              try {
                if (socket) {
                  socket.close();
                  socket = null;
                }
              } catch (e) {
                console.error('Error closing socket on timeout:', e);
              }
              
              if (!isClosing && connectRequested) {
                dispatch({ 
                  type: wsActions.wsError, 
                  payload: 'Connection timeout' 
                });
                
                // Also dispatch to the reducer if available
                if (wsReducers && wsReducers[WS_CONNECTION_ERROR]) {
                  dispatch(wsReducers[WS_CONNECTION_ERROR]('Connection timeout'));
                }
                
                // Попытка переподключения через задержку
                reconnectTimer = setTimeout(() => {
                  if (!isClosing && connectRequested) {
                    console.log('Retrying connection after timeout...');
                    dispatch({ type: wsActions.wsConnect, payload: url });
                  }
                }, RECONNECT_DELAY);
              }
            }
          }, CONNECTION_TIMEOUT);

          // Настройка обработчиков событий
          socket.onopen = () => {
            if (connectionTimer) {
              clearTimeout(connectionTimer);
              connectionTimer = null;
            }
            console.log('WebSocket connection established');
            if (!isClosing) {
              dispatch({ type: wsActions.wsConnected });
              
              // Also dispatch to the reducer if available
              if (wsReducers && wsReducers[WS_CONNECTION_SUCCESS]) {
                dispatch(wsReducers[WS_CONNECTION_SUCCESS]());
              }
            }
          };

          socket.onerror = (event) => {
            console.error('WebSocket error:', event);
            if (!isClosing) {
              dispatch({ 
                type: wsActions.wsError, 
                payload: 'Connection error occurred' 
              });
              
              // Also dispatch to the reducer if available
              if (wsReducers && wsReducers[WS_CONNECTION_ERROR]) {
                dispatch(wsReducers[WS_CONNECTION_ERROR]('Connection error occurred'));
              }
            }
          };

          // Отслеживаем последнее сообщение для предотвращения дубликатов
          let lastMessage = '';

          socket.onmessage = (event) => {
            if (isClosing) return; // Пропускаем обработку сообщений при закрытии
            
            try {
              // Пропускаем, если это дубликат последнего сообщения
              if (event.data === lastMessage) {
                console.log('Skipping duplicate WebSocket message');
                return;
              }
              
              lastMessage = event.data;
              
              try {
                const data = JSON.parse(event.data);
                
                // Check if this is a user orders WebSocket and log additional information
                if (url.includes('/orders?token=')) {
                  console.log('Processing user orders WebSocket response:', {
                    success: data.success,
                    orderCount: data.orders?.length || 0,
                    url: url.substring(0, url.indexOf('?')) + '?token=***'
                  });
                }
                
                // Check for authentication or access errors
                if (data.message === 'Invalid or missing token') {
                  console.error('WebSocket authentication failed:', data.message);
                  dispatch({ type: wsActions.wsError, payload: 'Authentication failed' });
                  
                  // Also dispatch to the reducer if available
                  if (wsReducers && wsReducers[WS_CONNECTION_ERROR]) {
                    dispatch(wsReducers[WS_CONNECTION_ERROR]('Authentication failed'));
                  }
                  
                  if (socket) {
                    socket.close();
                    socket = null;
                  }
                  return;
                }
                
                // Handle success responses even if they're empty
                if (data.success === false) {
                  console.error('WebSocket error response:', data);
                  dispatch({ type: wsActions.wsError, payload: data.message || 'Server error' });
                  
                  // Also dispatch to the reducer if available
                  if (wsReducers && wsReducers[WS_CONNECTION_ERROR]) {
                    dispatch(wsReducers[WS_CONNECTION_ERROR](data.message || 'Server error'));
                  }
                  return;
                }
                
                console.log('WebSocket message received:', data);
                
                // Dispatch raw message data to middleware
                dispatch({ type: wsActions.wsMessage, payload: data });
                
                // Also dispatch to the reducer if available
                if (wsReducers && wsReducers[WS_GET_MESSAGE]) {
                  dispatch(wsReducers[WS_GET_MESSAGE](data));
                }
                
                // Log the data being sent to the reducer
                console.log('Dispatching WebSocket data to store:', data);
              } catch (parseError) {
                console.error('Error parsing WebSocket message:', parseError);
                throw parseError;
              }
            } catch (error) {
              console.error('Error handling WebSocket message:', error);
              if (!isClosing) {
                dispatch({ 
                  type: wsActions.wsError, 
                  payload: 'Failed to parse message' 
                });
                
                // Also dispatch to the reducer if available
                if (wsReducers && wsReducers[WS_CONNECTION_ERROR]) {
                  dispatch(wsReducers[WS_CONNECTION_ERROR]('Failed to parse message'));
                }
              }
            }
          };

          socket.onclose = (event) => {
            console.log('WebSocket connection closed', event.wasClean ? 'cleanly' : 'with error');
            
            // Очищаем таймер соединения при закрытии
            if (connectionTimer) {
              clearTimeout(connectionTimer);
              connectionTimer = null;
            }
            
            if (!isClosing && connectRequested) {
              dispatch({ type: wsActions.wsDisconnect });
              
              // Also dispatch to the reducer if available
              if (wsReducers && wsReducers[WS_CONNECTION_CLOSED]) {
                dispatch(wsReducers[WS_CONNECTION_CLOSED]());
              }
              
              // Пытаемся переподключиться, если соединение было закрыто не нормально
              if (!event.wasClean) {
                console.log(`Attempting to reconnect in ${RECONNECT_DELAY}ms...`);
                
                // Очищаем существующий таймер, если он есть
                if (reconnectTimer) {
                  clearTimeout(reconnectTimer);
                }
                
                reconnectTimer = setTimeout(() => {
                  if (!isClosing && connectRequested) {
                    console.log('Reconnecting after abnormal close...');
                    dispatch({ type: wsActions.wsConnect, payload: url });
                  }
                }, RECONNECT_DELAY);
              }
            }
          };
        } catch (error) {
          console.error('Error creating WebSocket:', error);
          if (!isClosing) {
            dispatch({ 
              type: wsActions.wsError, 
              payload: String(error) 
            });
          }
        }
      }

      // Обработка отправки сообщений, если настроено
      if (socket && type === wsActions.wsSend) {
        try {
          socket.send(JSON.stringify(payload));
        } catch (error) {
          console.error('Error sending message to WebSocket:', error);
          if (!isClosing) {
            dispatch({ type: wsActions.wsError, payload: 'Failed to send message' });
          }
        }
      }

      // Обработка ручного отключения
      if (type === wsActions.wsDisconnect) {
        console.log('Manually closing WebSocket connection');
        
        // Устанавливаем флаг, чтобы предотвратить dispatch во время очистки
        isClosing = true;
        connectRequested = false;
        
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
        
        if (connectionTimer) {
          clearTimeout(connectionTimer);
          connectionTimer = null;
        }
        
        if (socket) {
          try {
            // Проверяем состояние сокета перед закрытием
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
              socket.close();
            }
          } catch (e) {
            console.error('Error during manual socket close:', e);
          }
          socket = null;
        }
      }

      next(action);
    };
  }) as Middleware;
}; 