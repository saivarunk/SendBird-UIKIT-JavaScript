'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var LocalizationContext = require('./LocalizationContext-9665649b.js');
var React = require('react');
var React__default = _interopDefault(React);
var PropTypes = _interopDefault(require('prop-types'));
var index = require('./index-478b0dfc.js');
var utils = require('./utils-6aedec02.js');
var index$1 = require('./index-6bc291d5.js');
var format = _interopDefault(require('date-fns/format'));
var type = require('./type-c7a3bee7.js');
var utils$1 = require('./utils-a8277ca2.js');
require('react-dom');
var index$2 = require('./index-728837db.js');
var isSameDay = _interopDefault(require('date-fns/isSameDay'));
var utils$2 = require('./utils-c8e36c68.js');
var formatDistanceToNowStrict = _interopDefault(require('date-fns/formatDistanceToNowStrict'));

var RESET_MESSAGES = 'RESET_MESSAGES';
var RESET_STATE = 'RESET_STATE';
var CLEAR_SENT_MESSAGES = 'CLEAR_SENT_MESSAGES';
var GET_PREV_MESSAGES_START = 'GET_PREV_MESSAGES_START';
var GET_PREV_MESSAGES_SUCESS = 'GET_PREV_MESSAGES_SUCESS';
var SEND_MESSAGEGE_START = 'SEND_MESSAGEGE_START';
var SEND_MESSAGEGE_SUCESS = 'SEND_MESSAGEGE_SUCESS';
var SEND_MESSAGEGE_FAILURE = 'SEND_MESSAGEGE_FAILURE';
var RESEND_MESSAGEGE_START = 'RESEND_MESSAGEGE_START';
var ON_MESSAGE_RECEIVED = 'ON_MESSAGE_RECEIVED';
var ON_MESSAGE_UPDATED = 'ON_MESSAGE_UPDATED';
var ON_MESSAGE_DELETED = 'ON_MESSAGE_DELETED';
var ON_MESSAGE_DELETED_BY_REQ_ID = 'ON_MESSAGE_DELETED_BY_REQ_ID';
var SET_CURRENT_CHANNEL = 'SET_CURRENT_CHANNEL';
var SET_CHANNEL_INVALID = 'SET_CHANNEL_INVALID';
var MARK_AS_READ = 'MARK_AS_READ';
var ON_REACTION_UPDATED = 'ON_REACTION_UPDATED';
var SET_EMOJI_CONTAINER = 'SET_EMOJI_CONTAINER';
var SET_READ_STATUS = 'SET_READ_STATUS';

var MessageTypes = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  FILE: 'FILE',
  THUMBNAIL: 'THUMBNAIL',
  OG: 'OG'
};
var SendingMessageStatus = {
  NONE: 'none',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  PENDING: 'pending'
};
var getMessageType = function getMessageType(message) {
  if (message.isUserMessage && message.isUserMessage() || message.messageType === 'user') {
    return message.ogMetaData ? MessageTypes.OG : MessageTypes.USER;
  }

  if (message.isAdminMessage && message.isAdminMessage()) {
    return MessageTypes.ADMIN;
  }

  if (message.isFileMessage && message.isFileMessage() || message.messageType === 'file') {
    return index$2.isImage(message.type) || index$2.isVideo(message.type) ? MessageTypes.THUMBNAIL : MessageTypes.FILE;
  }

  return '';
};

var UNDEFINED = 'undefined';
var SUCCEEDED = SendingMessageStatus.SUCCEEDED,
    FAILED = SendingMessageStatus.FAILED,
    PENDING = SendingMessageStatus.PENDING;
var scrollIntoLast = function scrollIntoLast(selector) {
  var intialTry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var MAX_TRIES = 10;
  var currentTry = intialTry;

  if (currentTry > MAX_TRIES) {
    return;
  }

  try {
    var nodes = document.querySelectorAll(selector);
    var last = nodes[nodes.length - 1];
    last.scrollIntoView(false);
    /** alignToTop: false */
  } catch (error) {
    setTimeout(function () {
      scrollIntoLast(selector, currentTry + 1);
    }, 500 * currentTry);
  }
};
var pubSubHandleRemover = function pubSubHandleRemover(subscriber) {
  subscriber.forEach(function (s) {
    try {
      s.remove();
    } catch (_unused) {//
    }
  });
};
var pubSubHandler = function pubSubHandler(channelUrl, pubSub, dispatcher) {
  var subscriber = new Map();
  if (!pubSub || !pubSub.subscribe) return subscriber;
  subscriber.set(index.SEND_USER_MESSAGE, pubSub.subscribe(index.SEND_USER_MESSAGE, function (msg) {
    var channel = msg.channel,
        message = msg.message;
    scrollIntoLast('.sendbird-msg--scroll-ref');

    if (channel && channelUrl === channel.url) {
      dispatcher({
        type: SEND_MESSAGEGE_SUCESS,
        payload: message
      });
    }
  }));
  subscriber.set(index.SEND_MESSAGE_START, pubSub.subscribe(index.SEND_MESSAGE_START, function (msg) {
    var channel = msg.channel,
        message = msg.message;

    if (channel && channelUrl === channel.url) {
      dispatcher({
        type: SEND_MESSAGEGE_START,
        payload: message
      });
    }
  }));
  subscriber.set(index.SEND_FILE_MESSAGE, pubSub.subscribe(index.SEND_FILE_MESSAGE, function (msg) {
    var channel = msg.channel,
        message = msg.message;
    scrollIntoLast('.sendbird-msg--scroll-ref');

    if (channel && channelUrl === channel.url) {
      dispatcher({
        type: SEND_MESSAGEGE_SUCESS,
        payload: message
      });
    }
  }));
  subscriber.set(index.UPDATE_USER_MESSAGE, pubSub.subscribe(index.UPDATE_USER_MESSAGE, function (msg) {
    var channel = msg.channel,
        message = msg.message,
        fromSelector = msg.fromSelector;

    if (fromSelector && channel && channelUrl === channel.url) {
      dispatcher({
        type: ON_MESSAGE_UPDATED,
        payload: {
          channel: channel,
          message: message
        }
      });
    }
  }));
  subscriber.set(index.DELETE_MESSAGE, pubSub.subscribe(index.DELETE_MESSAGE, function (msg) {
    var channel = msg.channel,
        messageId = msg.messageId;

    if (channel && channelUrl === channel.url) {
      dispatcher({
        type: ON_MESSAGE_DELETED,
        payload: messageId
      });
    }
  }));
  return subscriber;
};
var getParsedStatus = function getParsedStatus(message, currentGroupChannel) {
  if (message.requestState === FAILED) {
    return type.MessageStatusType.FAILED;
  }

  if (message.requestState === PENDING) {
    return type.MessageStatusType.PENDING;
  }

  if (message.requestState === SUCCEEDED) {
    if (!currentGroupChannel) {
      return type.MessageStatusType.SENT;
    }

    var unreadCount = currentGroupChannel.getReadReceipt(message);

    if (unreadCount === 0) {
      return type.MessageStatusType.READ;
    }

    var isDelivered = currentGroupChannel.getDeliveryReceipt(message) === 0;

    if (isDelivered) {
      return type.MessageStatusType.DELIVERED;
    }

    return type.MessageStatusType.SENT;
  }

  return null;
};
var isOperator = function isOperator() {
  var groupChannel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var myRole = groupChannel.myRole;
  return myRole === 'operator';
};
var isDisabledBecauseFrozen = function isDisabledBecauseFrozen() {
  var groupChannel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var isFrozen = groupChannel.isFrozen;
  return isFrozen && !isOperator(groupChannel);
};
var isDisabledBecauseMuted = function isDisabledBecauseMuted() {
  var groupChannel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var myMutedState = groupChannel.myMutedState;
  return myMutedState === 'muted';
};
var getEmojiCategoriesFromEmojiContainer = function getEmojiCategoriesFromEmojiContainer() {
  var emojiContainer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return emojiContainer.emojiCategories ? emojiContainer.emojiCategories : [];
};
var getAllEmojisFromEmojiContainer = function getAllEmojisFromEmojiContainer() {
  var emojiContainer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _emojiContainer$emoji = emojiContainer.emojiCategories,
      emojiCategories = _emojiContainer$emoji === void 0 ? [] : _emojiContainer$emoji;
  var allEmojis = [];

  for (var categoryIndex = 0; categoryIndex < emojiCategories.length; categoryIndex += 1) {
    var emojis = emojiCategories[categoryIndex].emojis;

    for (var emojiIndex = 0; emojiIndex < emojis.length; emojiIndex += 1) {
      allEmojis.push(emojis[emojiIndex]);
    }
  }

  return allEmojis;
};
var getEmojisFromEmojiContainer = function getEmojisFromEmojiContainer() {
  var emojiContainer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var emojiCategoryId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  return emojiContainer.emojiCategories ? emojiContainer.emojiCategories.filter(function (emojiCategory) {
    return emojiCategory.id === emojiCategoryId;
  })[0].emojis : [];
};
var getAllEmojisMapFromEmojiContainer = function getAllEmojisMapFromEmojiContainer() {
  var emojiContainer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _emojiContainer$emoji2 = emojiContainer.emojiCategories,
      emojiCategories = _emojiContainer$emoji2 === void 0 ? [] : _emojiContainer$emoji2;
  var allEmojisMap = new Map();

  for (var categoryIndex = 0; categoryIndex < emojiCategories.length; categoryIndex += 1) {
    var emojis = emojiCategories[categoryIndex].emojis;

    for (var emojiIndex = 0; emojiIndex < emojis.length; emojiIndex += 1) {
      var _emojis$emojiIndex = emojis[emojiIndex],
          key = _emojis$emojiIndex.key,
          url = _emojis$emojiIndex.url;
      allEmojisMap.set(key, url);
    }
  }

  return allEmojisMap;
};
var getNicknamesMapFromMembers = function getNicknamesMapFromMembers() {
  var members = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var nicknamesMap = new Map();

  for (var memberIndex = 0; memberIndex < members.length; memberIndex += 1) {
    var _members$memberIndex = members[memberIndex],
        userId = _members$memberIndex.userId,
        nickname = _members$memberIndex.nickname;
    nicknamesMap.set(userId, nickname);
  }

  return nicknamesMap;
};
var getMessageCreatedAt = function getMessageCreatedAt(message) {
  return format(message.createdAt, 'p');
};
var isSameGroup = function isSameGroup(message, comparingMessage) {
  if (!message || !comparingMessage || !message.sender || !comparingMessage.sender || !message.createdAt || !comparingMessage.createdAt || !message.sender.userId || !comparingMessage.sender.userId) {
    return false;
  }

  return message.sendingStatus === comparingMessage.sendingStatus && message.sender.userId === comparingMessage.sender.userId && getMessageCreatedAt(message) === getMessageCreatedAt(comparingMessage);
};
var compareMessagesForGrouping = function compareMessagesForGrouping(prevMessage, currMessage, nextMessage) {
  return [isSameGroup(prevMessage, currMessage), isSameGroup(currMessage, nextMessage)];
};
var passUnsuccessfullMessages = function passUnsuccessfullMessages(allMessages, newMessage) {
  var _newMessage$sendingSt = newMessage.sendingStatus,
      sendingStatus = _newMessage$sendingSt === void 0 ? UNDEFINED : _newMessage$sendingSt;

  if (sendingStatus === SUCCEEDED || sendingStatus === PENDING) {
    var lastIndexOfSucceededMessage = allMessages.map(function (message) {
      return message.sendingStatus || (message.isAdminMessage && message.isAdminMessage() ? SUCCEEDED : UNDEFINED);
    }).lastIndexOf(SUCCEEDED);

    if (lastIndexOfSucceededMessage + 1 < allMessages.length) {
      var messages = LocalizationContext._toConsumableArray(allMessages);

      messages.splice(lastIndexOfSucceededMessage + 1, 0, newMessage);
      return messages;
    }
  }

  return [].concat(LocalizationContext._toConsumableArray(allMessages), [newMessage]);
};

var messagesInitialState = {
  initialized: false,
  loading: false,
  allMessages: [],
  currentGroupChannel: {
    members: []
  },
  hasMore: false,
  lastMessageTimeStamp: 0,
  emojiContainer: {},
  readStatus: {},
  unreadCount: 0,
  unreadSince: null,
  isInvalid: false
};

var SUCCEEDED$1 = SendingMessageStatus.SUCCEEDED,
    FAILED$1 = SendingMessageStatus.FAILED,
    PENDING$1 = SendingMessageStatus.PENDING;
function reducer(state, action) {
  switch (action.type) {
    case RESET_STATE:
      return messagesInitialState;

    case RESET_MESSAGES:
      return LocalizationContext._objectSpread2({}, state, {
        // when user switches channel, if the previous channel `hasMore`
        // the onScroll gets called twice, setting hasMore false prevents this
        hasMore: false,
        allMessages: []
      });

    case GET_PREV_MESSAGES_START:
      return LocalizationContext._objectSpread2({}, state, {
        loading: true
      });

    case CLEAR_SENT_MESSAGES:
      return LocalizationContext._objectSpread2({}, state, {
        allMessages: LocalizationContext._toConsumableArray(state.allMessages.filter(function (m) {
          return m.sendingStatus !== SUCCEEDED$1;
        }))
      });

    case GET_PREV_MESSAGES_SUCESS:
      {
        var receivedMessages = action.payload.messages || [];
        var _action$payload$curre = action.payload.currentGroupChannel,
            currentGroupChannel = _action$payload$curre === void 0 ? {} : _action$payload$curre;
        var stateChannel = state.currentGroupChannel || {};
        var stateChannelUrl = stateChannel.url;
        var actionChannelUrl = currentGroupChannel.url;

        if (actionChannelUrl !== stateChannelUrl) {
          return state;
        } // remove duplicate messages


        var filteredAllMessages = state.allMessages.filter(function (msg) {
          return !receivedMessages.find(function (_ref) {
            var messageId = _ref.messageId;
            return index$2.compareIds(messageId, msg.messageId);
          });
        });
        return LocalizationContext._objectSpread2({}, state, {
          loading: false,
          initialized: true,
          hasMore: action.payload.hasMore,
          lastMessageTimeStamp: action.payload.lastMessageTimeStamp,
          allMessages: [].concat(LocalizationContext._toConsumableArray(receivedMessages), LocalizationContext._toConsumableArray(filteredAllMessages))
        });
      }

    case SEND_MESSAGEGE_START:
      return LocalizationContext._objectSpread2({}, state, {
        allMessages: [].concat(LocalizationContext._toConsumableArray(state.allMessages), [LocalizationContext._objectSpread2({}, action.payload)])
      });

    case SEND_MESSAGEGE_SUCESS:
      {
        var newMessages = state.allMessages.map(function (m) {
          return index$2.compareIds(m.reqId, action.payload.reqId) ? action.payload : m;
        });

        LocalizationContext._toConsumableArray(newMessages).sort(function (a, b) {
          return a.sendingStatus && b.sendingStatus && a.sendingStatus === SUCCEEDED$1 && (b.sendingStatus === PENDING$1 || b.sendingStatus === FAILED$1) ? -1 : 1;
        });

        return LocalizationContext._objectSpread2({}, state, {
          allMessages: newMessages
        });
      }

    case SEND_MESSAGEGE_FAILURE:
      {
        // eslint-disable-next-line no-param-reassign
        action.payload.failed = true;
        return LocalizationContext._objectSpread2({}, state, {
          allMessages: state.allMessages.map(function (m) {
            return index$2.compareIds(m.reqId, action.payload.reqId) ? action.payload : m;
          })
        });
      }

    case SET_CURRENT_CHANNEL:
      {
        return LocalizationContext._objectSpread2({}, state, {
          currentGroupChannel: action.payload,
          isInvalid: false
        });
      }

    case SET_CHANNEL_INVALID:
      {
        return LocalizationContext._objectSpread2({}, state, {
          isInvalid: true
        });
      }

    case ON_MESSAGE_RECEIVED:
      {
        var _action$payload = action.payload,
            channel = _action$payload.channel,
            message = _action$payload.message;

        var _state$currentGroupCh = state.currentGroupChannel,
            _currentGroupChannel = _state$currentGroupCh === void 0 ? {} : _state$currentGroupCh,
            unreadCount = state.unreadCount,
            unreadSince = state.unreadSince;

        var currentGroupChannelUrl = _currentGroupChannel.url;

        if (!index$2.compareIds(channel.url, currentGroupChannelUrl)) {
          return state;
        } // Excluded overlapping messages


        if (!(state.allMessages.map(function (msg) {
          return msg.messageId;
        }).indexOf(message.messageId) < 0)) {
          return state;
        }

        if (message.isAdminMessage && message.isAdminMessage()) {
          return LocalizationContext._objectSpread2({}, state, {
            allMessages: passUnsuccessfullMessages(state.allMessages, message)
          });
        }

        return LocalizationContext._objectSpread2({}, state, {
          unreadCount: unreadCount + 1,
          unreadSince: unreadCount === 0 ? format(new Date(), 'p MMM dd') : unreadSince,
          allMessages: passUnsuccessfullMessages(state.allMessages, message)
        });
      }

    case ON_MESSAGE_UPDATED:
      return LocalizationContext._objectSpread2({}, state, {
        allMessages: state.allMessages.map(function (m) {
          return index$2.compareIds(m.messageId, action.payload.message.messageId) ? action.payload.message : m;
        })
      });

    case RESEND_MESSAGEGE_START:
      return LocalizationContext._objectSpread2({}, state, {
        allMessages: state.allMessages.map(function (m) {
          return index$2.compareIds(m.reqId, action.payload.reqId) ? action.payload : m;
        })
      });

    case MARK_AS_READ:
      return LocalizationContext._objectSpread2({}, state, {
        unreadCount: 0,
        unreadSince: null
      });

    case ON_MESSAGE_DELETED:
      return LocalizationContext._objectSpread2({}, state, {
        allMessages: state.allMessages.filter(function (m) {
          return !index$2.compareIds(m.messageId, action.payload);
        })
      });

    case ON_MESSAGE_DELETED_BY_REQ_ID:
      return LocalizationContext._objectSpread2({}, state, {
        allMessages: state.allMessages.filter(function (m) {
          return !index$2.compareIds(m.reqId, action.payload);
        })
      });

    case SET_EMOJI_CONTAINER:
      {
        return LocalizationContext._objectSpread2({}, state, {
          emojiContainer: action.payload
        });
      }

    case SET_READ_STATUS:
      {
        return LocalizationContext._objectSpread2({}, state, {
          readStatus: action.payload
        });
      }

    case ON_REACTION_UPDATED:
      {
        return LocalizationContext._objectSpread2({}, state, {
          allMessages: state.allMessages.map(function (m) {
            if (index$2.compareIds(m.messageId, action.payload.messageId)) {
              if (m.applyReactionEvent && typeof m.applyReactionEvent === 'function') {
                m.applyReactionEvent(action.payload);
              }

              return m;
            }

            return m;
          })
        });
      }

    default:
      return state;
  }
}

/**
 * Handles ChannelEvents and send values to dispatcher using messagesDispatcher
 * messagesDispatcher: Dispatcher
 * sdk: sdkInstance
 * logger: loggerInstance
 * channelUrl: string
 * sdkInit: bool
 */

function useHandleChannelEvents(_ref, _ref2) {
  var currentGroupChannel = _ref.currentGroupChannel,
      sdkInit = _ref.sdkInit;
  var messagesDispatcher = _ref2.messagesDispatcher,
      sdk = _ref2.sdk,
      logger = _ref2.logger;
  var channelUrl = currentGroupChannel && currentGroupChannel.url;
  React.useEffect(function () {
    var messageReceiverId = LocalizationContext.uuidv4$1();

    if (channelUrl && sdk && sdk.ChannelHandler) {
      var ChannelHandler = new sdk.ChannelHandler();
      logger.info('Channel | useHandleChannelEvents: Setup event handler', messageReceiverId);

      ChannelHandler.onMessageReceived = function (channel, message) {
        if (index$2.compareIds(channel.url, currentGroupChannel.url)) {
          logger.info('Channel | useHandleChannelEvents: onMessageReceived', message);
          messagesDispatcher({
            type: ON_MESSAGE_RECEIVED,
            payload: {
              channel: channel,
              message: message
            }
          });
        }
      };

      ChannelHandler.onMessageUpdated = function (channel, message) {
        logger.info('Channel | useHandleChannelEvents: onMessageUpdated', message);
        messagesDispatcher({
          type: ON_MESSAGE_UPDATED,
          payload: {
            channel: channel,
            message: message
          }
        });
      };

      ChannelHandler.onMessageDeleted = function (_, messageId) {
        logger.info('Channel | useHandleChannelEvents: onMessageDeleted', messageId);
        messagesDispatcher({
          type: ON_MESSAGE_DELETED,
          payload: messageId
        });
      };

      ChannelHandler.onReactionUpdated = function (_, reactionEvent) {
        logger.info('Channel | useHandleChannelEvents: onReactionUpdated', reactionEvent);
        messagesDispatcher({
          type: ON_REACTION_UPDATED,
          payload: reactionEvent
        });
      };

      ChannelHandler.onChannelChanged = function (groupChannel) {
        if (index$2.compareIds(groupChannel.url, currentGroupChannel.url)) {
          logger.info('Channel | useHandleChannelEvents: onChannelChanged', groupChannel);
          messagesDispatcher({
            type: SET_CURRENT_CHANNEL,
            payload: groupChannel
          });
        }
      };

      ChannelHandler.onChannelFrozen = function (groupChannel) {
        if (index$2.compareIds(groupChannel.url, currentGroupChannel.url)) {
          logger.info('Channel | useHandleChannelEvents: onChannelFrozen', groupChannel);
          messagesDispatcher({
            type: SET_CURRENT_CHANNEL,
            payload: groupChannel
          });
        }
      };

      ChannelHandler.onChannelUnfrozen = function (groupChannel) {
        if (index$2.compareIds(groupChannel.url, currentGroupChannel.url)) {
          logger.info('Channel | useHandleChannelEvents: onChannelUnFrozen', groupChannel);
          messagesDispatcher({
            type: SET_CURRENT_CHANNEL,
            payload: groupChannel
          });
        }
      };

      ChannelHandler.onUserMuted = function (groupChannel) {
        if (index$2.compareIds(groupChannel.url, currentGroupChannel.url)) {
          logger.info('Channel | useHandleChannelEvents: onUserMuted', groupChannel);
          messagesDispatcher({
            type: SET_CURRENT_CHANNEL,
            payload: groupChannel
          });
        }
      };

      ChannelHandler.onUserUnmuted = function (groupChannel) {
        if (index$2.compareIds(groupChannel.url, currentGroupChannel.url)) {
          logger.info('Channel | useHandleChannelEvents: onUserUnmuted', groupChannel);
          messagesDispatcher({
            type: SET_CURRENT_CHANNEL,
            payload: groupChannel
          });
        }
      };

      ChannelHandler.onUserBanned = function (groupChannel) {
        if (index$2.compareIds(groupChannel.url, currentGroupChannel.url)) {
          logger.info('Channel | useHandleChannelEvents: onUserBanned', groupChannel);
          messagesDispatcher({
            type: SET_CURRENT_CHANNEL,
            payload: groupChannel
          });
        }
      };

      ChannelHandler.onOperatorUpdated = function (groupChannel) {
        if (index$2.compareIds(groupChannel.url, currentGroupChannel.url)) {
          logger.info('Channel | useHandleChannelEvents: onOperatorUpdated', groupChannel);
          messagesDispatcher({
            type: SET_CURRENT_CHANNEL,
            payload: groupChannel
          });
        }
      }; // Add this channel event handler to the SendBird object.


      sdk.addChannelHandler(messageReceiverId, ChannelHandler);
    }

    return function () {
      if (sdk && sdk.removeChannelHandler) {
        logger.info('Channel | useHandleChannelEvents: Removing message reciver handler', messageReceiverId);
        sdk.removeChannelHandler(messageReceiverId);
      }
    };
  }, [channelUrl, sdkInit]);
}

function useSetChannel(_ref, _ref2) {
  var channelUrl = _ref.channelUrl,
      sdkInit = _ref.sdkInit;
  var messagesDispatcher = _ref2.messagesDispatcher,
      sdk = _ref2.sdk,
      logger = _ref2.logger;
  React.useEffect(function () {
    if (channelUrl && sdkInit && sdk && sdk.GroupChannel) {
      logger.info('Channel | useSetChannel fetching channel', channelUrl);
      sdk.GroupChannel.getChannel(channelUrl).then(function (groupChannel) {
        logger.info('Channel | useSetChannel fetched channel', groupChannel);
        messagesDispatcher({
          type: SET_CURRENT_CHANNEL,
          payload: groupChannel
        });
        logger.info('Channel: Mark as read', groupChannel); // this order is important - this mark as read should update the event handler up above

        groupChannel.markAsRead();
      }).catch(function (e) {
        logger.warning('Channel | useSetChannel fetch channel failed', {
          channelUrl: channelUrl,
          e: e
        });
        messagesDispatcher({
          type: SET_CHANNEL_INVALID
        });
      });
      sdk.getAllEmoji(function (emojiContainer_, err) {
        if (err) {
          logger.error('Channel: Getting emojis failed', err);
          return;
        }

        logger.info('Channel: Getting emojis success', emojiContainer_);
        messagesDispatcher({
          type: SET_EMOJI_CONTAINER,
          payload: emojiContainer_
        });
      });
    }
  }, [channelUrl, sdkInit]);
}

function useInitialMessagesFetch(_ref, _ref2) {
  var currentGroupChannel = _ref.currentGroupChannel,
      userFilledMessageListQuery = _ref.userFilledMessageListQuery;
  var sdk = _ref2.sdk,
      logger = _ref2.logger,
      messagesDispatcher = _ref2.messagesDispatcher;
  var channelUrl = currentGroupChannel && currentGroupChannel.url;
  React.useEffect(function () {
    logger.info('Channel useInitialMessagesFetch: Setup started', currentGroupChannel);
    messagesDispatcher({
      type: RESET_MESSAGES
    });

    if (sdk && sdk.MessageListParams && currentGroupChannel && currentGroupChannel.getMessagesByMessageId) {
      var messageListParams = new sdk.MessageListParams();
      messageListParams.prevResultSize = 30;
      messageListParams.isInclusive = true;
      messageListParams.includeReplies = false;
      messageListParams.includeReaction = true;

      if (userFilledMessageListQuery) {
        Object.keys(userFilledMessageListQuery).forEach(function (key) {
          messageListParams[key] = userFilledMessageListQuery[key];
        });
      }

      logger.info('Channel: Fetching messages', {
        currentGroupChannel: currentGroupChannel,
        userFilledMessageListQuery: userFilledMessageListQuery
      });
      currentGroupChannel.getMessagesByTimestamp(new Date().getTime(), messageListParams).then(function (messages) {
        var hasMore = messages && messages.length > 0;
        var lastMessageTimeStamp = hasMore ? messages[0].createdAt : null;
        messagesDispatcher({
          type: GET_PREV_MESSAGES_SUCESS,
          payload: {
            messages: messages,
            hasMore: hasMore,
            lastMessageTimeStamp: lastMessageTimeStamp,
            currentGroupChannel: currentGroupChannel
          }
        });
      }).catch(function (error) {
        logger.error('Channel: Fetching messages failed', error);
        messagesDispatcher({
          type: GET_PREV_MESSAGES_SUCESS,
          payload: {
            messages: [],
            hasMore: false,
            lastMessageTimeStamp: 0,
            currentGroupChannel: currentGroupChannel
          }
        });
      }).finally(function () {
        currentGroupChannel.markAsRead();
        setTimeout(function () {
          return scrollIntoLast('.sendbird-msg--scroll-ref');
        });
      });
    }
  }, [channelUrl, userFilledMessageListQuery]);
}

function useHandleReconnect(_ref, _ref2) {
  var isOnline = _ref.isOnline;
  var logger = _ref2.logger,
      sdk = _ref2.sdk,
      currentGroupChannel = _ref2.currentGroupChannel,
      messagesDispatcher = _ref2.messagesDispatcher,
      userFilledMessageListQuery = _ref2.userFilledMessageListQuery;
  React.useEffect(function () {
    var wasOffline = !isOnline;
    return function () {
      // state changed from offline to online
      if (wasOffline) {
        logger.info('Refreshing conversation state');
        var _sdk$appInfo = sdk.appInfo,
            appInfo = _sdk$appInfo === void 0 ? {} : _sdk$appInfo;
        var useReaction = appInfo.isUsingReaction || false;
        var messageListParams = new sdk.MessageListParams();
        messageListParams.prevResultSize = 30;
        messageListParams.includeReplies = false;
        messageListParams.includeReaction = useReaction;

        if (userFilledMessageListQuery) {
          Object.keys(userFilledMessageListQuery).forEach(function (key) {
            messageListParams[key] = userFilledMessageListQuery[key];
          });
        }

        logger.info('Channel: Fetching messages', {
          currentGroupChannel: currentGroupChannel,
          userFilledMessageListQuery: userFilledMessageListQuery
        });
        messagesDispatcher({
          type: GET_PREV_MESSAGES_START
        });
        sdk.GroupChannel.getChannel(currentGroupChannel.url).then(function (groupChannel) {
          var lastMessageTime = new Date().getTime();
          groupChannel.getMessagesByTimestamp(lastMessageTime, messageListParams).then(function (messages) {
            messagesDispatcher({
              type: CLEAR_SENT_MESSAGES
            });
            var hasMore = messages && messages.length > 0;
            var lastMessageTimeStamp = hasMore ? messages[0].createdAt : null;
            messagesDispatcher({
              type: GET_PREV_MESSAGES_SUCESS,
              payload: {
                messages: messages,
                hasMore: hasMore,
                lastMessageTimeStamp: lastMessageTimeStamp,
                currentGroupChannel: currentGroupChannel
              }
            });
            setTimeout(function () {
              return scrollIntoLast('.sendbird-msg--scroll-ref');
            });
          }).catch(function (error) {
            logger.error('Channel: Fetching messages failed', error);
          }).finally(function () {
            currentGroupChannel.markAsRead();
          });
        });
      }
    };
  }, [isOnline]);
}

function useScrollCallback(_ref, _ref2) {
  var currentGroupChannel = _ref.currentGroupChannel,
      lastMessageTimeStamp = _ref.lastMessageTimeStamp,
      userFilledMessageListQuery = _ref.userFilledMessageListQuery;
  var hasMore = _ref2.hasMore,
      logger = _ref2.logger,
      messagesDispatcher = _ref2.messagesDispatcher,
      sdk = _ref2.sdk;
  return React.useCallback(function (cb) {
    if (!hasMore) {
      return;
    }

    var messageListParams = new sdk.MessageListParams();
    messageListParams.prevResultSize = 30;
    messageListParams.includeReplies = false;
    messageListParams.includeReaction = true;

    if (userFilledMessageListQuery) {
      Object.keys(userFilledMessageListQuery).forEach(function (key) {
        messageListParams[key] = userFilledMessageListQuery[key];
      });
    }

    logger.info('Channel: Fetching messages', {
      currentGroupChannel: currentGroupChannel,
      userFilledMessageListQuery: userFilledMessageListQuery
    });
    currentGroupChannel.getMessagesByTimestamp(lastMessageTimeStamp || new Date().getTime(), messageListParams).then(function (messages) {
      var hasMoreMessages = messages && messages.length > 0;
      var lastMessageTs = hasMoreMessages ? messages[0].createdAt : null;
      messagesDispatcher({
        type: GET_PREV_MESSAGES_SUCESS,
        payload: {
          messages: messages,
          hasMore: hasMoreMessages,
          lastMessageTimeStamp: lastMessageTs,
          currentGroupChannel: currentGroupChannel
        }
      });
      cb([messages, null]);
    }).catch(function (error) {
      logger.error('Channel: Fetching messages failed', error);
      messagesDispatcher({
        type: GET_PREV_MESSAGES_SUCESS,
        payload: {
          messages: [],
          hasMore: false,
          lastMessageTimeStamp: 0,
          currentGroupChannel: currentGroupChannel
        }
      });
      cb([null, error]);
    }).finally(function () {
      currentGroupChannel.markAsRead();
    });
  }, [currentGroupChannel, lastMessageTimeStamp]);
}

function useDeleteMessageCallback(_ref, _ref2) {
  var currentGroupChannel = _ref.currentGroupChannel,
      messagesDispatcher = _ref.messagesDispatcher;
  var logger = _ref2.logger;
  return React.useCallback(function (message, cb) {
    logger.info('Channel | useDeleteMessageCallback: Deleting message', message);
    var requestState = message.requestState;
    logger.info('Channel | useDeleteMessageCallback: Deleting message requestState:', requestState); // Message is only on local

    if (requestState === 'failed' || requestState === 'pending') {
      logger.info('Channel | useDeleteMessageCallback: Deleted message from local:', message);
      messagesDispatcher({
        type: ON_MESSAGE_DELETED_BY_REQ_ID,
        payload: message.reqId
      });

      if (cb) {
        cb();
      }

      return;
    } // Message is on server


    currentGroupChannel.deleteMessage(message, function (err) {
      logger.info('Channel | useDeleteMessageCallback: Deleting message from remote:', requestState);

      if (cb) {
        cb(err);
      }

      if (!err) {
        logger.info('Channel | useDeleteMessageCallback: Deleting message success!', message);
        messagesDispatcher({
          type: ON_MESSAGE_DELETED,
          payload: message.messageId
        });
      } else {
        logger.warning('Channel | useDeleteMessageCallback: Deleting message failed!', err);
      }
    });
  }, [currentGroupChannel, messagesDispatcher]);
}

function useUpdateMessageCallback(_ref, _ref2) {
  var currentGroupChannel = _ref.currentGroupChannel,
      messagesDispatcher = _ref.messagesDispatcher,
      onBeforeUpdateUserMessage = _ref.onBeforeUpdateUserMessage;
  var logger = _ref2.logger,
      pubSub = _ref2.pubSub,
      sdk = _ref2.sdk;
  return React.useCallback(function (messageId, text, cb) {
    var createParamsDefault = function createParamsDefault(txt) {
      var params = new sdk.UserMessageParams();
      params.message = txt;
      return params;
    };

    var createCustomPrams = onBeforeUpdateUserMessage && typeof onBeforeUpdateUserMessage === 'function';

    if (createCustomPrams) {
      logger.info('Channel: creating params using onBeforeUpdateUserMessage', onBeforeUpdateUserMessage);
    }

    var params = onBeforeUpdateUserMessage ? onBeforeUpdateUserMessage(text) : createParamsDefault(text);
    currentGroupChannel.updateUserMessage(messageId, params, function (r, e) {
      logger.info('Channel: Updating message!', params);
      var swapParams = sdk.getErrorFirstCallback();
      var message = r;
      var err = e;

      if (swapParams) {
        message = e;
        err = r;
      }

      if (cb) {
        cb(err, message);
      }

      if (!err) {
        logger.info('Channel: Updating message success!', message);
        messagesDispatcher({
          type: ON_MESSAGE_UPDATED,
          payload: {
            channel: currentGroupChannel,
            message: message
          }
        });
        pubSub.publish(index.UPDATE_USER_MESSAGE, {
          message: message,
          channel: currentGroupChannel
        });
      } else {
        logger.warning('Channel: Updating message failed!', err);
      }
    });
  }, [currentGroupChannel.url, messagesDispatcher, onBeforeUpdateUserMessage]);
}

function useResendMessageCallback(_ref, _ref2) {
  var currentGroupChannel = _ref.currentGroupChannel,
      messagesDispatcher = _ref.messagesDispatcher;
  var logger = _ref2.logger;
  return React.useCallback(function (failedMessage) {
    logger.info('Channel: Resending message has started', failedMessage);
    var messageType = failedMessage.messageType,
        file = failedMessage.file;

    if (failedMessage && typeof failedMessage.isResendable === 'function' && failedMessage.isResendable()) {
      // eslint-disable-next-line no-param-reassign
      failedMessage.requestState = 'pending';
      messagesDispatcher({
        type: RESEND_MESSAGEGE_START,
        payload: failedMessage
      }); // userMessage

      if (messageType === 'user') {
        currentGroupChannel.resendUserMessage(failedMessage).then(function (message) {
          logger.info('Channel: Resending message success!', {
            message: message
          });
          messagesDispatcher({
            type: SEND_MESSAGEGE_SUCESS,
            payload: message
          });
        }).catch(function (e) {
          logger.warning('Channel: Resending message failed!', {
            e: e
          }); // eslint-disable-next-line no-param-reassign

          failedMessage.requestState = 'failed';
          messagesDispatcher({
            type: SEND_MESSAGEGE_FAILURE,
            payload: failedMessage
          });
        }); // eslint-disable-next-line no-param-reassign

        failedMessage.requestState = 'pending';
        messagesDispatcher({
          type: RESEND_MESSAGEGE_START,
          payload: failedMessage
        });
        return;
      }

      if (messageType === 'file') {
        currentGroupChannel.resendFileMessage(failedMessage, file).then(function (message) {
          logger.info('Channel: Resending file message success!', {
            message: message
          });
          messagesDispatcher({
            type: SEND_MESSAGEGE_SUCESS,
            payload: message
          });
        }).catch(function (e) {
          logger.warning('Channel: Resending file message failed!', {
            e: e
          }); // eslint-disable-next-line no-param-reassign

          failedMessage.requestState = 'failed';
          messagesDispatcher({
            type: SEND_MESSAGEGE_FAILURE,
            payload: failedMessage
          });
        }); // eslint-disable-next-line no-param-reassign

        failedMessage.requestState = 'pending';
        messagesDispatcher({
          type: RESEND_MESSAGEGE_START,
          payload: failedMessage
        });
      }
    } else {
      // to alert user on console
      // eslint-disable-next-line no-console
      console.error('Message is not resendable');
      logger.warning('Message is not resendable', failedMessage);
    }
  }, [currentGroupChannel, messagesDispatcher]);
}

function useSendMessageCallback(_ref, _ref2) {
  var currentGroupChannel = _ref.currentGroupChannel,
      onBeforeSendUserMessage = _ref.onBeforeSendUserMessage;
  var sdk = _ref2.sdk,
      logger = _ref2.logger,
      pubSub = _ref2.pubSub,
      messagesDispatcher = _ref2.messagesDispatcher;
  var messageInputRef = React.useRef(null);
  var sendMessage = React.useCallback(function () {
    var text = messageInputRef.current.value;

    var createParamsDefault = function createParamsDefault(txt) {
      var message = typeof txt === 'string' ? txt.trim() : txt;
      var params = new sdk.UserMessageParams();
      params.message = message;
      return params;
    };

    var createCustomPrams = onBeforeSendUserMessage && typeof onBeforeSendUserMessage === 'function';

    if (createCustomPrams) {
      logger.info('Channel: creating params using onBeforeSendUserMessage', onBeforeSendUserMessage);
    }

    var params = onBeforeSendUserMessage ? onBeforeSendUserMessage(text) : createParamsDefault(text);
    logger.info('Channel: Sending message has started', params);
    var pendingMsg = currentGroupChannel.sendUserMessage(params, function (res, err) {
      var swapParams = sdk.getErrorFirstCallback();
      var message = res;
      var error = err;

      if (swapParams) {
        message = err;
        error = res;
      } // sending params instead of pending message
      // to make sure that we can resend the message once it fails


      if (error) {
        logger.warning('Channel: Sending message failed!', {
          message: message
        });
        messagesDispatcher({
          type: SEND_MESSAGEGE_FAILURE,
          payload: message
        });
        return;
      }

      logger.info('Channel: Sending message success!', message);
      messagesDispatcher({
        type: SEND_MESSAGEGE_SUCESS,
        payload: message
      });
    });
    pubSub.publish(index.SEND_MESSAGE_START, {
      /* pubSub is used instead of messagesDispatcher
        to avoid redundantly calling `messageActionTypes.SEND_MESSAGEGE_START` */
      message: pendingMsg,
      channel: currentGroupChannel
    });
    setTimeout(function () {
      return scrollIntoLast('.sendbird-msg--scroll-ref');
    });
  }, [currentGroupChannel, onBeforeSendUserMessage]);
  return [messageInputRef, sendMessage];
}

function useSendFileMessageCallback(_ref, _ref2) {
  var currentGroupChannel = _ref.currentGroupChannel,
      onBeforeSendFileMessage = _ref.onBeforeSendFileMessage;
  var sdk = _ref2.sdk,
      logger = _ref2.logger,
      pubSub = _ref2.pubSub,
      messagesDispatcher = _ref2.messagesDispatcher;
  var sendMessage = React.useCallback(function (file) {
    var createParamsDefault = function createParamsDefault(file_) {
      var params = new sdk.FileMessageParams();
      params.file = file_;
      return params;
    };

    var createCustomPrams = onBeforeSendFileMessage && typeof onBeforeSendFileMessage === 'function';

    if (createCustomPrams) {
      logger.info('Channel: creating params using onBeforeSendFileMessage', onBeforeSendFileMessage);
    }

    var params = onBeforeSendFileMessage ? onBeforeSendFileMessage(file) : createParamsDefault(file);
    logger.info('Channel: Uploading file message start!', params);
    var pendingMsg = currentGroupChannel.sendFileMessage(params, function (response, err) {
      var swapParams = sdk.getErrorFirstCallback();
      var message = response;
      var error = err;

      if (swapParams) {
        message = err;
        error = response;
      }

      if (error) {
        // sending params instead of pending message
        // to make sure that we can resend the message once it fails
        logger.error('Channel: Sending file message failed!', message);
        message.localUrl = URL.createObjectURL(file);
        message.file = file;
        messagesDispatcher({
          type: SEND_MESSAGEGE_FAILURE,
          payload: message
        });
        return;
      }

      logger.info('Channel: Sending message success!', message);
      messagesDispatcher({
        type: SEND_MESSAGEGE_SUCESS,
        payload: message
      });
    });
    pubSub.publish(index.SEND_MESSAGE_START, {
      /* pubSub is used instead of messagesDispatcher
        to avoid redundantly calling `messageActionTypes.SEND_MESSAGEGE_START` */
      message: LocalizationContext._objectSpread2({}, pendingMsg, {
        url: URL.createObjectURL(file),
        // pending thumbnail message seems to be failed
        requestState: 'pending'
      }),
      channel: currentGroupChannel
    });
    setTimeout(function () {
      return scrollIntoLast('.sendbird-msg--scroll-ref');
    }, 1000);
  }, [currentGroupChannel, onBeforeSendFileMessage]);
  return [sendMessage];
}

function useSetReadStatus(_ref, _ref2) {
  var allMessages = _ref.allMessages,
      currentGroupChannel = _ref.currentGroupChannel;
  var messagesDispatcher = _ref2.messagesDispatcher,
      sdk = _ref2.sdk,
      logger = _ref2.logger;
  React.useEffect(function () {
    if (!sdk.ChannelHandler || !currentGroupChannel.url) {
      return function () {};
    } // todo: move to reducer?


    var setReadStatus = function setReadStatus() {
      var allReadStatus = allMessages.reduce(function (accumulator, msg) {
        if (msg.messageId !== 0) {
          return LocalizationContext._objectSpread2({}, accumulator, LocalizationContext._defineProperty({}, msg.messageId, getParsedStatus(msg, currentGroupChannel)));
        }

        return accumulator;
      }, {});
      messagesDispatcher({
        type: SET_READ_STATUS,
        payload: allReadStatus
      });
    };

    if (allMessages.length > 0) {
      setReadStatus();
    }

    var channelUrl = currentGroupChannel.url;
    var handler = new sdk.ChannelHandler();

    var handleMessageStatus = function handleMessageStatus(c) {
      if (channelUrl === c.url) {
        setReadStatus();
      }
    };

    handler.onDeliveryReceiptUpdated = handleMessageStatus;
    handler.onReadReceiptUpdated = handleMessageStatus; // Add this channel event handler to the SendBird object.

    var handlerId = LocalizationContext.uuidv4$1();
    logger.info('Channel | useSetReadStatus: Removing message reciver handler', handlerId);
    sdk.addChannelHandler(handlerId, handler);
    return function () {
      if (sdk && sdk.removeChannelHandler) {
        logger.info('Channel | useSetReadStatus: Removing message reciver handler', handlerId);
        sdk.removeChannelHandler(handlerId);
      }
    };
  }, [allMessages, currentGroupChannel]);
}

var ReactionButton = React__default.forwardRef(function (props, ref) {
  var children = props.children,
      width = props.width,
      height = props.height,
      _onClick = props.onClick,
      selected = props.selected,
      className = props.className;
  var injectingClassName = Array.isArray(className) ? className : [className];
  return React__default.createElement("div", {
    ref: ref,
    className: "sendbird-reaction-button".concat(selected ? '--selected' : '', " ").concat(injectingClassName.join(' ')),
    style: {
      width: typeof width === 'string' ? "".concat(width.slice(0, -2) - 2, "px") : "".concat(width - 2, "px"),
      height: typeof height === 'string' ? "".concat(height.slice(0, -2) - 2, "px") : "".concat(height - 2, "px")
    },
    onClick: function onClick(e) {
      return _onClick(e);
    },
    role: "button",
    onKeyDown: function onKeyDown(e) {
      return _onClick(e);
    },
    tabIndex: 0
  }, React__default.createElement("div", {
    className: "sendbird-reaction-button__inner"
  }, children));
});
ReactionButton.propTypes = {
  children: PropTypes.element.isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
};
ReactionButton.defaultProps = {
  selected: false,
  width: '36px',
  height: '36px',
  onClick: function onClick() {},
  className: ''
};

function useMemoizedEmojiListItems(_ref, _ref2) {
  var emojiContainer = _ref.emojiContainer,
      toggleReaction = _ref.toggleReaction;
  var useReaction = _ref2.useReaction,
      logger = _ref2.logger,
      userId = _ref2.userId,
      emojiAllList = _ref2.emojiAllList;
  return React.useMemo(function () {
    return function (_ref3) {
      var parentRef = _ref3.parentRef,
          parentContainRef = _ref3.parentContainRef,
          message = _ref3.message,
          closeDropdown = _ref3.closeDropdown,
          _ref3$spaceFromTrigge = _ref3.spaceFromTrigger,
          spaceFromTrigger = _ref3$spaceFromTrigge === void 0 ? {} : _ref3$spaceFromTrigge;

      if (!useReaction || !(parentRef || parentContainRef || message || closeDropdown)) {
        logger.warning('Channel: Invalid Params in memoizedEmojiListItems');
        return null;
      }

      return React__default.createElement(index.EmojiListItems, {
        parentRef: parentRef,
        parentContainRef: parentContainRef,
        closeDropdown: closeDropdown,
        spaceFromTrigger: spaceFromTrigger
      }, emojiAllList.map(function (emoji) {
        var reactedReaction = message.reactions.filter(function (reaction) {
          return reaction.key === emoji.key;
        })[0];
        var isReacted = reactedReaction ? !(reactedReaction.userIds.indexOf(userId) < 0) : false;
        return React__default.createElement(ReactionButton, {
          key: emoji.key,
          width: "36px",
          height: "36px",
          selected: isReacted,
          onClick: function onClick() {
            closeDropdown();
            toggleReaction(message, emoji.key, isReacted);
          }
        }, React__default.createElement(index.ImageRenderer, {
          url: emoji.url,
          width: "28px",
          height: "28px",
          defaultComponent: React__default.createElement(index.Icon, {
            width: "28px",
            height: "28px",
            type: index.IconTypes.EMOJI_FAILED
          })
        }));
      }));
    };
  }, [emojiContainer, toggleReaction]);
}

function useToggleReactionCallback(_ref, _ref2) {
  var currentGroupChannel = _ref.currentGroupChannel;
  var logger = _ref2.logger;
  return React.useCallback(function (message, key, isReacted) {
    if (isReacted) {
      currentGroupChannel.deleteReaction(message, key).then(function (res) {
        logger.info('Delete reaction success', res);
      }).catch(function (err) {
        logger.warning('Delete reaction failed', err);
      });
      return;
    }

    currentGroupChannel.addReaction(message, key).then(function (res) {
      logger.info('Add reaction success', res);
    }).catch(function (err) {
      logger.warning('Add reaction failed', err);
    });
  }, [currentGroupChannel]);
}

function MessageStatus(_ref) {
  var message = _ref.message,
      status = _ref.status,
      className = _ref.className;
  var injectingClassName = Array.isArray(className) ? className : [className];

  var label = function label() {
    switch (status) {
      case type.MessageStatusType.FAILED:
      case type.MessageStatusType.PENDING:
        {
          return null;
        }

      case type.MessageStatusType.SENT:
      case type.MessageStatusType.DELIVERED:
      case type.MessageStatusType.READ:
        {
          return React__default.createElement(index.Label, {
            className: "sendbird-message-status__text",
            type: index.LabelTypography.CAPTION_3,
            color: index.LabelColors.ONBACKGROUND_2
          }, utils.getMessageCreatedAt(message));
        }

      default:
        return null;
    }
  };

  var icon = {
    PENDING: React__default.createElement(index.Loader, {
      className: "sendbird-message-status__icon",
      width: "16px",
      height: "16px"
    }, React__default.createElement(index.Icon, {
      type: index.IconTypes.SPINNER,
      width: "16px",
      height: "16px"
    })),
    SENT: React__default.createElement(index.Icon, {
      className: "sendbird-message-status__icon",
      width: "16px",
      height: "16px",
      type: index.IconTypes.SENT,
      fillColor: index.IconColors.SENT
    }),
    DELIVERED: React__default.createElement(index.Icon, {
      className: "sendbird-message-status__icon",
      width: "16px",
      height: "16px",
      type: index.IconTypes.DELIVERED,
      fillColor: index.IconColors.SENT
    }),
    READ: React__default.createElement(index.Icon, {
      className: "sendbird-message-status__icon",
      width: "16px",
      height: "16px",
      type: index.IconTypes.READ,
      fillColor: index.IconColors.READ
    }),
    FAILED: React__default.createElement(index.Icon, {
      className: "sendbird-message-status__icon",
      width: "16px",
      height: "16px",
      type: index.IconTypes.ERROR
    })
  };
  return React__default.createElement("div", {
    className: [].concat(LocalizationContext._toConsumableArray(injectingClassName), ['sendbird-message-status']).join(' ')
  }, icon[status], React__default.createElement("br", null), label());
}
MessageStatus.propTypes = {
  message: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.array, PropTypes.object])),
  status: PropTypes.string,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
};
MessageStatus.defaultProps = {
  message: null,
  status: '',
  className: ''
};

var ReactionBadge = React__default.forwardRef(function (props, ref) {
  var className = props.className,
      children = props.children,
      count = props.count,
      selected = props.selected,
      isAdd = props.isAdd,
      onClick = props.onClick;
  var injectingClassName = Array.isArray(className) ? className : [className];

  if (selected && !isAdd) {
    injectingClassName.unshift('sendbird-reaction-badge--selected');
  } else if (isAdd) {
    injectingClassName.push('sendbird-reaction-badge--is-add');
  } else {
    injectingClassName.unshift('sendbird-reaction-badge');
  }

  return React__default.createElement("div", {
    ref: ref,
    tabIndex: 0,
    role: "button",
    className: injectingClassName.join(' '),
    onClick: onClick,
    onKeyDown: onClick
  }, React__default.createElement("div", {
    className: "sendbird-reaction-badge__inner"
  }, React__default.createElement("div", {
    className: "sendbird-reaction-badge__inner__icon"
  }, children), React__default.createElement(index.Label, {
    className: children && count ? 'sendbird-reaction-badge__inner__count' : '',
    type: index.LabelTypography.CAPTION_3,
    color: index.LabelColors.ONBACKGROUND_1
  }, count)));
});
ReactionBadge.propTypes = {
  children: PropTypes.element.isRequired,
  count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  selected: PropTypes.bool,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  isAdd: PropTypes.bool,
  onClick: PropTypes.func
};
ReactionBadge.defaultProps = {
  className: '',
  count: '',
  selected: false,
  isAdd: false,
  onClick: function onClick() {}
};

var CLASS_NAME = 'sendbird-tooltip';
function Tooltip(_ref) {
  var className = _ref.className,
      children = _ref.children;
  var injectingClassName = Array.isArray(className) ? className : [className];
  injectingClassName.unshift(CLASS_NAME);
  return React__default.createElement("div", {
    className: injectingClassName.join(' ')
  }, React__default.createElement(index.Label, {
    className: "".concat(CLASS_NAME, "__text")
  }, children));
}
Tooltip.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.string), PropTypes.string])
};
Tooltip.defaultProps = {
  className: '',
  children: ''
};

var CLASS_NAME$1 = 'sendbird-tooltip-wrapper';
var SPACE_FROM_TRIGGER = 8;
function TooltipWrapper(_ref) {
  var className = _ref.className,
      children = _ref.children,
      hoverTooltip = _ref.hoverTooltip;
  var injectingClassName = Array.isArray(className) ? [CLASS_NAME$1].concat(LocalizationContext._toConsumableArray(className)) : [CLASS_NAME$1, className];

  var _useState = React.useState(false),
      _useState2 = LocalizationContext._slicedToArray(_useState, 2),
      showHoverTooltip = _useState2[0],
      setShowHoverTooltip = _useState2[1];

  var childrenRef = React.useRef(null);
  return React__default.createElement("div", {
    className: injectingClassName.join(' '),
    onMouseOver: function onMouseOver() {
      setShowHoverTooltip(true);
    },
    onFocus: function onFocus() {
      setShowHoverTooltip(true);
    },
    onMouseOut: function onMouseOut() {
      setShowHoverTooltip(false);
    },
    onBlur: function onBlur() {
      setShowHoverTooltip(false);
    }
  }, React__default.createElement("div", {
    className: "".concat(CLASS_NAME$1, "__children"),
    ref: childrenRef
  }, children), showHoverTooltip && React__default.createElement("div", {
    className: "".concat(CLASS_NAME$1, "__hover-tooltip"),
    style: {
      bottom: "calc(100% + ".concat(SPACE_FROM_TRIGGER, "px)")
    }
  }, React__default.createElement("div", {
    className: "".concat(CLASS_NAME$1, "__hover-tooltip__inner")
  }, React__default.createElement("div", {
    className: "".concat(CLASS_NAME$1, "__hover-tooltip__inner__tooltip-container"),
    style: {
      left: childrenRef.current && "calc(".concat(childrenRef.current.offsetWidth / 2, "px - 50%)")
    }
  }, hoverTooltip))));
}
TooltipWrapper.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  children: PropTypes.element.isRequired,
  hoverTooltip: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired
};
TooltipWrapper.defaultProps = {
  className: ''
};

function EmojiReactions(_ref) {
  var className = _ref.className,
      userId = _ref.userId,
      message = _ref.message,
      emojiAllMap = _ref.emojiAllMap,
      membersMap = _ref.membersMap,
      toggleReaction = _ref.toggleReaction,
      memoizedEmojiListItems = _ref.memoizedEmojiListItems;
  var injectingClassName = Array.isArray(className) ? className : [className];
  injectingClassName.unshift('sendbird-emoji-reactions');
  var MemoizedEmojiListItems = memoizedEmojiListItems;
  var imageWidth = '20px';
  var imageHeight = '20px';
  var emojiReactionAddRef = React.useRef(null);
  var _message$reactions = message.reactions,
      reactions = _message$reactions === void 0 ? [] : _message$reactions;
  var messageReactions = reactions;

  var _useContext = React.useContext(LocalizationContext.LocalizationContext),
      stringSet = _useContext.stringSet;

  return React__default.createElement("div", {
    className: injectingClassName.join(' ')
  }, React__default.createElement("div", {
    className: "sendbird-emoji-reactions--inner"
  }, messageReactions && messageReactions.map(function (reaction) {
    var _reaction$userIds = reaction.userIds,
        userIds = _reaction$userIds === void 0 ? [] : _reaction$userIds;
    var emojiUrl = emojiAllMap.get(reaction.key) || '';
    var reactedUserCount = userIds.length;
    var reactedByMe = !(userIds.indexOf(userId) < 0);
    var nicknames = userIds.filter(function (currentUserId) {
      return currentUserId !== userId;
    }).map(function (currentUserId) {
      return membersMap.get(currentUserId) || stringSet.TOOLTIP__UNKOWN_USER;
    });
    var stringSetForMe = nicknames.length > 0 ? stringSet.TOOLTIP__AND_YOU : stringSet.TOOLTIP__YOU;
    return React__default.createElement(TooltipWrapper, {
      className: "sendbird-emoji-reactions__emoji-reaction",
      key: reaction.key,
      hoverTooltip: userIds.length > 0 && React__default.createElement(Tooltip, null, React__default.createElement(React__default.Fragment, null, "".concat(nicknames.join(', ')).concat(reactedByMe ? stringSetForMe : '')))
    }, React__default.createElement(ReactionBadge, {
      count: reactedUserCount,
      selected: reactedByMe,
      onClick: function onClick() {
        return toggleReaction(message, reaction.key, reactedByMe);
      }
    }, React__default.createElement(index.ImageRenderer, {
      circle: true,
      url: emojiUrl,
      width: imageWidth,
      height: imageHeight,
      defaultComponent: React__default.createElement(index.Icon, {
        width: imageWidth,
        height: imageHeight,
        type: index.IconTypes.EMOJI_FAILED
      })
    })));
  }), messageReactions.length < emojiAllMap.size && React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(ReactionBadge, {
        isAdd: true,
        onClick: toggleDropdown,
        className: "sendbird-emoji-reactions__emoji-reaction-add",
        ref: emojiReactionAddRef
      }, React__default.createElement(index.Icon, {
        width: imageWidth,
        height: imageHeight,
        fillColor: index.IconColors.ON_BACKGROUND_3,
        type: index.IconTypes.EMOJI_REACTIONS_ADD
      }));
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(MemoizedEmojiListItems, {
        message: message,
        parentRef: emojiReactionAddRef,
        parentContainRef: emojiReactionAddRef,
        closeDropdown: closeDropdown,
        spaceFromTrigger: {
          y: 4
        }
      });
    }
  })));
}
EmojiReactions.propTypes = {
  userId: PropTypes.string,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  message: PropTypes.shape({
    reactions: PropTypes.arrayOf(PropTypes.shape({}))
  }).isRequired,
  emojiAllMap: PropTypes.instanceOf(Map).isRequired,
  membersMap: PropTypes.instanceOf(Map),
  toggleReaction: PropTypes.func,
  memoizedEmojiListItems: PropTypes.func
};
EmojiReactions.defaultProps = {
  className: '',
  membersMap: new Map(),
  userId: '',
  toggleReaction: function toggleReaction() {},
  memoizedEmojiListItems: function memoizedEmojiListItems() {
    return '';
  }
};

var WORD_TYPOGRAPHY = index.LabelTypography.BODY_1;
var EDITED_COLOR = index.LabelColors.ONBACKGROUND_2;
function useMemoizedMessageText(_ref) {
  var message = _ref.message,
      updatedAt = _ref.updatedAt,
      className = _ref.className;

  var _useContext = React.useContext(LocalizationContext.LocalizationContext),
      stringSet = _useContext.stringSet;

  return React.useMemo(function () {
    return function () {
      var splitMessage = message.split(/\r/);
      var matchedMessage = splitMessage.map(function (word) {
        return word !== '' ? word : React__default.createElement("br", null);
      });

      if (updatedAt > 0) {
        matchedMessage.push(React__default.createElement(index.Label, {
          key: LocalizationContext.uuidv4$1(),
          className: className,
          type: WORD_TYPOGRAPHY,
          color: EDITED_COLOR
        }, " ".concat(stringSet.MESSAGE_EDITED, " ")));
      }

      return matchedMessage;
    };
  }, [message, updatedAt, className]);
}

var MOUSE_ENTER = 'mouseenter';
var MOUSE_LEAVE = 'mouseleave';

var useMouseHover = function useMouseHover(_ref) {
  var ref = _ref.ref,
      setHover = _ref.setHover;

  var handleMouseOver = function handleMouseOver() {
    if (ref.current) {
      setHover(true);
    }
  };

  var handleMouseOut = function handleMouseOut() {
    if (ref.current) {
      setHover(false);
    }
  };

  React.useEffect(function () {
    var current = ref.current;
    current.addEventListener(MOUSE_ENTER, handleMouseOver);
    current.addEventListener(MOUSE_LEAVE, handleMouseOut);
    return function () {
      current.removeEventListener(MOUSE_ENTER, handleMouseOver);
      current.removeEventListener(MOUSE_LEAVE, handleMouseOut);
    };
  });
};

var noop = function noop() {};

var GROUPING_PADDING = '1px';
var NORMAL_PADDING = '8px';
function Message(props) {
  var isByMe = props.isByMe,
      userId = props.userId,
      message = props.message,
      className = props.className,
      resendMessage = props.resendMessage,
      disabled = props.disabled,
      showEdit = props.showEdit,
      showRemove = props.showRemove,
      status = props.status,
      useReaction = props.useReaction,
      emojiAllMap = props.emojiAllMap,
      membersMap = props.membersMap,
      toggleReaction = props.toggleReaction,
      memoizedEmojiListItems = props.memoizedEmojiListItems,
      chainTop = props.chainTop,
      chainBottom = props.chainBottom;
  if (!message) return null;
  var injectingClassName = Array.isArray(className) ? className : [className];
  injectingClassName.push("sendbird-message".concat(isByMe ? '--outgoing' : '--incoming'));
  var memoizedMessageText = useMemoizedMessageText({
    message: message.message,
    updatedAt: message.updatedAt,
    className: 'sendbird-user-message-word'
  });
  return React__default.createElement("div", {
    className: [].concat(LocalizationContext._toConsumableArray(injectingClassName), ['sendbird-message']).join(' ')
  }, isByMe ? React__default.createElement(OutgoingUserMessage, {
    userId: userId,
    message: message,
    resendMessage: resendMessage,
    disabled: disabled,
    showEdit: showEdit,
    showRemove: showRemove,
    status: status,
    useReaction: useReaction,
    emojiAllMap: emojiAllMap,
    membersMap: membersMap,
    toggleReaction: toggleReaction,
    memoizedMessageText: memoizedMessageText,
    memoizedEmojiListItems: memoizedEmojiListItems,
    chainTop: chainTop,
    chainBottom: chainBottom
  }) : React__default.createElement(IncomingUserMessage, {
    userId: userId,
    message: message,
    useReaction: useReaction,
    emojiAllMap: emojiAllMap,
    membersMap: membersMap,
    toggleReaction: toggleReaction,
    memoizedMessageText: memoizedMessageText,
    memoizedEmojiListItems: memoizedEmojiListItems,
    chainTop: chainTop,
    chainBottom: chainBottom
  }));
}
Message.propTypes = {
  isByMe: PropTypes.bool,
  disabled: PropTypes.bool,
  userId: PropTypes.string,
  message: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.array, PropTypes.object])).isRequired,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  showEdit: PropTypes.func,
  status: PropTypes.string,
  showRemove: PropTypes.func,
  resendMessage: PropTypes.func,
  useReaction: PropTypes.bool.isRequired,
  emojiAllMap: PropTypes.instanceOf(Map),
  membersMap: PropTypes.instanceOf(Map),
  toggleReaction: PropTypes.func,
  memoizedEmojiListItems: PropTypes.func,
  chainTop: PropTypes.bool,
  chainBottom: PropTypes.bool
};
Message.defaultProps = {
  isByMe: false,
  disabled: false,
  userId: '',
  resendMessage: noop,
  className: '',
  showEdit: noop,
  showRemove: noop,
  status: '',
  emojiAllMap: new Map(),
  membersMap: new Map(),
  toggleReaction: noop,
  memoizedEmojiListItems: function memoizedEmojiListItems() {
    return '';
  },
  chainTop: false,
  chainBottom: false
};

function OutgoingUserMessage(_ref) {
  var userId = _ref.userId,
      message = _ref.message,
      showEdit = _ref.showEdit,
      disabled = _ref.disabled,
      showRemove = _ref.showRemove,
      status = _ref.status,
      resendMessage = _ref.resendMessage,
      useReaction = _ref.useReaction,
      emojiAllMap = _ref.emojiAllMap,
      membersMap = _ref.membersMap,
      toggleReaction = _ref.toggleReaction,
      memoizedMessageText = _ref.memoizedMessageText,
      memoizedEmojiListItems = _ref.memoizedEmojiListItems,
      chainTop = _ref.chainTop,
      chainBottom = _ref.chainBottom;
  var MemoizedMessageText = memoizedMessageText;
  var MemoizedEmojiListItems = memoizedEmojiListItems; // TODO: when message.requestState is succeeded, consider if it's SENT or DELIVERED

  var messageRef = React.useRef(null);
  var parentRefReactions = React.useRef(null);
  var parentRefMenus = React.useRef(null);
  var parentContainRef = React.useRef(null);
  var isMessageSent = utils$2.getIsSentFromStatus(status);

  var _useState = React.useState(false),
      _useState2 = LocalizationContext._slicedToArray(_useState, 2),
      mousehover = _useState2[0],
      setMousehover = _useState2[1];

  var _useState3 = React.useState(false),
      _useState4 = LocalizationContext._slicedToArray(_useState3, 2),
      moreActive = _useState4[0],
      setMoreActive = _useState4[1];

  var handleMoreIconClick = function handleMoreIconClick() {
    setMoreActive(true);
  };

  var handleMoreIconBlur = function handleMoreIconBlur() {
    setMoreActive(false);
  };

  useMouseHover({
    ref: messageRef,
    setHover: setMousehover
  });
  return React__default.createElement("div", {
    className: "sendbird-user-message--outgoing",
    ref: messageRef,
    style: {
      paddingTop: chainTop ? GROUPING_PADDING : NORMAL_PADDING,
      paddingBottom: chainBottom ? GROUPING_PADDING : NORMAL_PADDING
    }
  }, React__default.createElement("div", {
    className: "sendbird-user-message--inner"
  }, React__default.createElement("div", {
    className: "sendbird-user-message__left-padding"
  }, React__default.createElement("div", {
    className: "sendbird-user-message__more",
    ref: parentContainRef
  }, React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.IconButton, {
        className: "sendbird-user-message__more__menu",
        ref: parentRefMenus,
        width: "32px",
        height: "32px",
        onClick: function onClick() {
          toggleDropdown();
          handleMoreIconClick();
        },
        onBlur: function onBlur() {
          handleMoreIconBlur();
        }
      }, React__default.createElement(index.Icon, {
        width: "24px",
        height: "24px",
        type: index.IconTypes.MORE,
        fillColor: index.IconColors.CONTENT_INVERSE
      }));
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(index.MenuItems, {
        parentRef: parentRefMenus // for catching location(x, y) of MenuItems
        ,
        parentContainRef: parentContainRef // for toggling more options(menus & reactions)
        ,
        closeDropdown: closeDropdown,
        openLeft: true
      }, isMessageSent && React__default.createElement(index.MenuItem, {
        className: "sendbird-user-message--copy",
        onClick: function onClick() {
          utils$2.copyToClipboard(message.message);
          closeDropdown();
        }
      }, "Copy"), isMessageSent && React__default.createElement(index.MenuItem, {
        onClick: function onClick() {
          if (disabled) {
            return;
          }

          showEdit(true);
          closeDropdown();
        }
      }, "Edit"), message && message.isResendable && message.isResendable() && React__default.createElement(index.MenuItem, {
        onClick: function onClick() {
          resendMessage(message);
          closeDropdown();
        }
      }, "Resend"), React__default.createElement(index.MenuItem, {
        onClick: function onClick() {
          if (disabled) {
            return;
          }

          showRemove(true);
          closeDropdown();
        }
      }, "Delete"));
    }
  }), isMessageSent && useReaction && emojiAllMap.size > 0 && React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.IconButton, {
        className: "sendbird-user-message__more__add-reaction",
        ref: parentRefReactions,
        width: "32px",
        height: "32px",
        onClick: function onClick() {
          toggleDropdown();
          handleMoreIconClick();
        },
        onBlur: function onBlur() {
          handleMoreIconBlur();
        }
      }, React__default.createElement(index.Icon, {
        width: "24px",
        height: "24px",
        type: index.IconTypes.EMOJI_REACTIONS_ADD,
        fillColor: index.IconColors.CONTENT_INVERSE
      }));
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(MemoizedEmojiListItems, {
        message: message,
        parentRef: parentRefReactions,
        parentContainRef: parentContainRef,
        closeDropdown: closeDropdown,
        spaceFromTrigger: {
          y: 2
        }
      });
    }
  })), !chainBottom && !(mousehover || moreActive) && React__default.createElement("div", {
    className: "sendbird-user-message__status"
  }, React__default.createElement(MessageStatus, {
    message: message,
    status: status // onDelete={() => { showRemove(true); }}
    // onResend={() => resendMessage(message)}
    // duplicated and should replace to more

  }))), React__default.createElement("div", {
    className: "sendbird-user-message__text-balloon"
  }, React__default.createElement("div", {
    className: "sendbird-user-message__text-balloon__inner"
  }, React__default.createElement("div", {
    className: "sendbird-user-message__text-balloon__inner__text-place"
  }, React__default.createElement(index.Label, {
    className: "sendbird-user-message__text-balloon__inner__text-place__text",
    type: index.LabelTypography.BODY_1,
    color: index.LabelColors.ONBACKGROUND_1
  }, React__default.createElement(MemoizedMessageText, null))), useReaction && message.reactions && message.reactions.length > 0 && React__default.createElement(EmojiReactions, {
    className: "sendbird-user-message__text-balloon__inner__emoji-reactions",
    userId: userId,
    message: message,
    emojiAllMap: emojiAllMap,
    membersMap: membersMap,
    toggleReaction: toggleReaction,
    memoizedEmojiListItems: memoizedEmojiListItems
  })))));
}

function IncomingUserMessage(_ref2) {
  var userId = _ref2.userId,
      message = _ref2.message,
      useReaction = _ref2.useReaction,
      emojiAllMap = _ref2.emojiAllMap,
      membersMap = _ref2.membersMap,
      toggleReaction = _ref2.toggleReaction,
      memoizedMessageText = _ref2.memoizedMessageText,
      memoizedEmojiListItems = _ref2.memoizedEmojiListItems,
      chainTop = _ref2.chainTop,
      chainBottom = _ref2.chainBottom;
  var MemoizedMessageText = memoizedMessageText;
  var MemoizedEmojiListItems = memoizedEmojiListItems;
  var messageRef = React.useRef(null);
  var parentRefReactions = React.useRef(null);
  var parentRefMenus = React.useRef(null);
  var parentContainRef = React.useRef(null);
  var avatarRef = React.useRef(null);

  var _React$useContext = React__default.useContext(index.UserProfileContext),
      disableUserProfile = _React$useContext.disableUserProfile,
      renderUserProfile = _React$useContext.renderUserProfile;

  var _useState5 = React.useState(false),
      _useState6 = LocalizationContext._slicedToArray(_useState5, 2),
      mousehover = _useState6[0],
      setMousehover = _useState6[1];

  var _useState7 = React.useState(false),
      _useState8 = LocalizationContext._slicedToArray(_useState7, 2),
      moreActive = _useState8[0],
      setMoreActive = _useState8[1];

  var showReactionAddButton = useReaction && emojiAllMap && emojiAllMap.size > 0;
  var showEmojiReactions = useReaction && message.reactions && message.reactions.length > 0;

  var handleMoreIconClick = function handleMoreIconClick() {
    setMoreActive(true);
  };

  var handleMoreIconBlur = function handleMoreIconBlur() {
    setMoreActive(false);
  };

  useMouseHover({
    ref: messageRef,
    setHover: setMousehover
  });
  return React__default.createElement("div", {
    ref: messageRef,
    className: "sendbird-user-message--incoming",
    style: {
      paddingTop: chainTop ? GROUPING_PADDING : NORMAL_PADDING,
      paddingBottom: chainBottom ? GROUPING_PADDING : NORMAL_PADDING
    }
  }, React__default.createElement("div", {
    className: "sendbird-user-message--inner"
  }, React__default.createElement("div", {
    className: "sendbird-user-message--body"
  }, !chainBottom && React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.Avatar, {
        ref: avatarRef,
        onClick: function onClick() {
          if (!disableUserProfile) {
            toggleDropdown();
          }
        },
        className: "sendbird-user-message__avatar",
        src: utils$2.getSenderProfileUrl(message),
        width: "28px",
        height: "28px"
      });
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(index.MenuItems, {
        parentRef: avatarRef // for catching location(x, y) of MenuItems
        ,
        parentContainRef: avatarRef // for toggling more options(menus & reactions)
        ,
        closeDropdown: closeDropdown,
        style: {
          paddingTop: 0,
          paddingBottom: 0
        }
      }, renderUserProfile ? renderUserProfile({
        user: message.sender,
        close: closeDropdown
      }) : React__default.createElement(index.UserProfile, {
        user: message.sender,
        onSuccess: closeDropdown
      }));
    }
  }), !chainTop && React__default.createElement(index.Label, {
    className: "sendbird-user-message__sender-name",
    type: index.LabelTypography.CAPTION_2,
    color: index.LabelColors.ONBACKGROUND_2
  }, utils$2.getSenderName(message)), React__default.createElement("div", {
    className: "sendbird-user-message__text-balloon"
  }, React__default.createElement("div", {
    className: "sendbird-user-message__text-balloon__inner"
  }, React__default.createElement("div", {
    className: "sendbird-user-message__text-balloon__inner__text-place"
  }, React__default.createElement(index.Label, {
    className: "sendbird-user-message__text-balloon__inner__text-place__text",
    type: index.LabelTypography.BODY_1,
    color: index.LabelColors.ONBACKGROUND_1
  }, React__default.createElement(MemoizedMessageText, null))), showEmojiReactions && React__default.createElement(EmojiReactions, {
    className: "sendbird-user-message__text-balloon__inner__emoji-reactions",
    userId: userId,
    message: message,
    emojiAllMap: emojiAllMap,
    membersMap: membersMap,
    toggleReaction: toggleReaction,
    memoizedEmojiListItems: memoizedEmojiListItems
  })))), React__default.createElement("div", {
    className: "sendbird-user-message__right-padding"
  }, React__default.createElement("div", {
    className: "sendbird-user-message__more",
    ref: parentContainRef
  }, showReactionAddButton && React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.IconButton, {
        ref: parentRefReactions,
        width: "32px",
        height: "32px",
        onClick: function onClick() {
          toggleDropdown();
          handleMoreIconClick();
        },
        onBlur: function onBlur() {
          handleMoreIconBlur();
        }
      }, React__default.createElement(index.Icon, {
        width: "24px",
        height: "24px",
        type: index.IconTypes.EMOJI_REACTIONS_ADD,
        fillColor: index.IconColors.CONTENT_INVERSE
      }));
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(MemoizedEmojiListItems, {
        parentRef: parentRefReactions,
        parentContainRef: parentContainRef,
        closeDropdown: closeDropdown,
        message: message,
        spaceFromTrigger: {
          y: 2
        }
      });
    }
  }), React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.IconButton, {
        ref: parentRefMenus,
        width: "32px",
        height: "32px",
        onClick: function onClick() {
          toggleDropdown();
          handleMoreIconClick();
        },
        onBlur: function onBlur() {
          handleMoreIconBlur();
        }
      }, React__default.createElement(index.Icon, {
        width: "24px",
        height: "24px",
        type: index.IconTypes.MORE,
        fillColor: index.IconColors.CONTENT_INVERSE
      }));
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(index.MenuItems, {
        parentRef: parentRefMenus,
        parentContainRef: parentContainRef,
        closeDropdown: closeDropdown
      }, React__default.createElement(index.MenuItem, {
        className: "sendbird-user-message--copy",
        onClick: function onClick() {
          utils$2.copyToClipboard(message.message);
          closeDropdown();
        }
      }, "Copy"));
    }
  })), !chainBottom && !(mousehover || moreActive) && React__default.createElement(index.Label, {
    className: "sendbird-user-message__sent-at",
    type: index.LabelTypography.CAPTION_3,
    color: index.LabelColors.ONBACKGROUND_2
  }, utils$2.getMessageCreatedAt(message)))));
}

IncomingUserMessage.propTypes = {
  userId: PropTypes.string.isRequired,
  message: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.array, PropTypes.object])),
  useReaction: PropTypes.bool.isRequired,
  emojiAllMap: PropTypes.instanceOf(Map),
  membersMap: PropTypes.instanceOf(Map),
  toggleReaction: PropTypes.func,
  memoizedMessageText: PropTypes.func.isRequired,
  memoizedEmojiListItems: PropTypes.func,
  chainTop: PropTypes.bool.isRequired,
  chainBottom: PropTypes.bool.isRequired
};
IncomingUserMessage.defaultProps = {
  message: {},
  emojiAllMap: new Map(),
  membersMap: new Map(),
  toggleReaction: noop,
  memoizedEmojiListItems: function memoizedEmojiListItems() {
    return '';
  }
};
OutgoingUserMessage.propTypes = {
  userId: PropTypes.string.isRequired,
  message: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.array, PropTypes.object])),
  showEdit: PropTypes.func,
  showRemove: PropTypes.func,
  disabled: PropTypes.bool,
  resendMessage: PropTypes.func,
  status: PropTypes.string.isRequired,
  useReaction: PropTypes.bool.isRequired,
  emojiAllMap: PropTypes.instanceOf(Map),
  membersMap: PropTypes.instanceOf(Map),
  toggleReaction: PropTypes.func,
  memoizedMessageText: PropTypes.func.isRequired,
  memoizedEmojiListItems: PropTypes.func,
  chainTop: PropTypes.bool.isRequired,
  chainBottom: PropTypes.bool.isRequired
};
OutgoingUserMessage.defaultProps = {
  message: {},
  resendMessage: noop,
  showEdit: noop,
  showRemove: noop,
  disabled: false,
  emojiAllMap: new Map(),
  membersMap: new Map(),
  toggleReaction: noop,
  memoizedEmojiListItems: function memoizedEmojiListItems() {
    return '';
  }
};

function AdminMessage(_ref) {
  var className = _ref.className,
      message = _ref.message;

  if (!message.messageType || message.messageType !== 'admin') {
    // change to use message.isAdminMessage()
    return null;
  }

  var injectingClassName = Array.isArray(className) ? className : [className];
  return React__default.createElement("div", {
    className: [].concat(LocalizationContext._toConsumableArray(injectingClassName), ['sendbird-admin-message']).join(' ')
  }, React__default.createElement(index.Label, {
    className: "sendbird-admin-message__text",
    type: index.LabelTypography.CAPTION_2,
    color: index.LabelColors.ONBACKGROUND_2
  }, message.message));
}
AdminMessage.propTypes = {
  message: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.array, PropTypes.object])),
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
};
AdminMessage.defaultProps = {
  message: {},
  className: ''
};

var getMessageCreatedAt$1 = function getMessageCreatedAt(message) {
  return format(message.createdAt, 'p');
};
var getIsSentFromStatus = function getIsSentFromStatus(status) {
  return status === type.MessageStatusType.SENT || status === type.MessageStatusType.DELIVERED || status === type.MessageStatusType.READ;
};

var noop$1 = function noop() {};

var OUTGOING_THUMBNAIL_MESSAGE = 'sendbird-outgoing-thumbnail-message';
var INCOMING_THUMBNAIL_MESSAGE = 'sendbird-incoming-thumbnail-message';
var GROUPING_PADDING$1 = '1px';
var NORMAL_PADDING$1 = '8px';
function ThumbnailMessage(_ref) {
  var _ref$message = _ref.message,
      message = _ref$message === void 0 ? {} : _ref$message,
      userId = _ref.userId,
      disabled = _ref.disabled,
      isByMe = _ref.isByMe,
      onClick = _ref.onClick,
      showRemove = _ref.showRemove,
      status = _ref.status,
      resendMessage = _ref.resendMessage,
      useReaction = _ref.useReaction,
      emojiAllMap = _ref.emojiAllMap,
      membersMap = _ref.membersMap,
      toggleReaction = _ref.toggleReaction,
      memoizedEmojiListItems = _ref.memoizedEmojiListItems,
      chainTop = _ref.chainTop,
      chainBottom = _ref.chainBottom;
  return isByMe ? React__default.createElement(OutgoingThumbnailMessage, {
    userId: userId,
    status: status,
    message: message,
    onClick: onClick,
    disabled: disabled,
    chainTop: chainTop,
    showRemove: showRemove,
    membersMap: membersMap,
    chainBottom: chainBottom,
    useReaction: useReaction,
    emojiAllMap: emojiAllMap,
    resendMessage: resendMessage,
    toggleReaction: toggleReaction,
    memoizedEmojiListItems: memoizedEmojiListItems
  }) : React__default.createElement(IncomingThumbnailMessage, {
    userId: userId,
    status: status,
    message: message,
    onClick: onClick,
    chainTop: chainTop,
    membersMap: membersMap,
    chainBottom: chainBottom,
    useReaction: useReaction,
    emojiAllMap: emojiAllMap,
    toggleReaction: toggleReaction,
    memoizedEmojiListItems: memoizedEmojiListItems
  });
}
function OutgoingThumbnailMessage(_ref2) {
  var _ref2$message = _ref2.message,
      message = _ref2$message === void 0 ? {} : _ref2$message,
      userId = _ref2.userId,
      disabled = _ref2.disabled,
      onClick = _ref2.onClick,
      showRemove = _ref2.showRemove,
      status = _ref2.status,
      resendMessage = _ref2.resendMessage,
      useReaction = _ref2.useReaction,
      emojiAllMap = _ref2.emojiAllMap,
      membersMap = _ref2.membersMap,
      toggleReaction = _ref2.toggleReaction,
      memoizedEmojiListItems = _ref2.memoizedEmojiListItems,
      chainTop = _ref2.chainTop,
      chainBottom = _ref2.chainBottom;
  var type = message.type,
      url = message.url,
      localUrl = message.localUrl;

  var _useContext = React.useContext(LocalizationContext.LocalizationContext),
      stringSet = _useContext.stringSet;

  var messageRef = React.useRef(null);
  var parentContainRef = React.useRef(null);
  var menuRef = React.useRef(null);
  var reactionAddRef = React.useRef(null);

  var _useState = React.useState(false),
      _useState2 = LocalizationContext._slicedToArray(_useState, 2),
      mousehover = _useState2[0],
      setMousehover = _useState2[1];

  var _useState3 = React.useState(false),
      _useState4 = LocalizationContext._slicedToArray(_useState3, 2),
      moreActive = _useState4[0],
      setMoreActive = _useState4[1];

  var showReactionAddButton = useReaction && emojiAllMap && emojiAllMap.size > 0;
  var MemoizedEmojiListItems = memoizedEmojiListItems;
  var isMessageSent = getIsSentFromStatus(status);

  var handleMoreIconClick = function handleMoreIconClick() {
    setMoreActive(true);
  };

  var handleMoreIconBlur = function handleMoreIconBlur() {
    setMoreActive(false);
  };

  useMouseHover({
    ref: messageRef,
    setHover: setMousehover
  });
  return React__default.createElement("div", {
    className: OUTGOING_THUMBNAIL_MESSAGE,
    ref: messageRef,
    style: {
      paddingTop: chainTop ? GROUPING_PADDING$1 : NORMAL_PADDING$1,
      paddingBottom: chainBottom ? GROUPING_PADDING$1 : NORMAL_PADDING$1
    }
  }, React__default.createElement("div", {
    className: "".concat(OUTGOING_THUMBNAIL_MESSAGE, "--inner")
  }, React__default.createElement("div", {
    className: "".concat(OUTGOING_THUMBNAIL_MESSAGE, "__left-padding")
  }, React__default.createElement("div", {
    className: "".concat(OUTGOING_THUMBNAIL_MESSAGE, "-left-padding__more"),
    ref: parentContainRef
  }, React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.IconButton, {
        ref: menuRef,
        width: "32px",
        height: "32px",
        onClick: function onClick() {
          toggleDropdown();
          handleMoreIconClick();
        },
        onBlur: function onBlur() {
          handleMoreIconBlur();
        }
      }, React__default.createElement(index.Icon, {
        width: "24px",
        height: "24px",
        type: index.IconTypes.MORE,
        color: index.IconColors.CONTENT_INVERSE
      }));
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(index.MenuItems, {
        parentRef: menuRef,
        parentContainRef: parentContainRef,
        closeDropdown: closeDropdown,
        openLeft: true
      }, message && message.isResendable && message.isResendable() && React__default.createElement(index.MenuItem, {
        onClick: function onClick() {
          resendMessage(message);
          closeDropdown();
        }
      }, stringSet.CONTEXT_MENU_DROPDOWN__RESEND), React__default.createElement(index.MenuItem, {
        onClick: function onClick() {
          if (disabled) {
            return;
          }

          showRemove(true);
          closeDropdown();
        }
      }, stringSet.CONTEXT_MENU_DROPDOWN__DELETE));
    }
  }), isMessageSent && showReactionAddButton && React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.IconButton, {
        ref: reactionAddRef,
        width: "32px",
        height: "32px",
        onClick: function onClick() {
          toggleDropdown();
          handleMoreIconClick();
        },
        onBlur: function onBlur() {
          handleMoreIconBlur();
        }
      }, React__default.createElement(index.Icon, {
        width: "24px",
        height: "24px",
        type: index.IconTypes.EMOJI_REACTIONS_ADD,
        color: index.IconColors.CONTENT_INVERSE
      }));
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(MemoizedEmojiListItems, {
        message: message,
        parentRef: reactionAddRef,
        parentContainRef: parentContainRef,
        closeDropdown: closeDropdown,
        spaceFromTrigger: {
          y: 2
        }
      });
    }
  })), !chainBottom && !(mousehover || moreActive) && React__default.createElement(MessageStatus, {
    message: message,
    status: status,
    className: "".concat(OUTGOING_THUMBNAIL_MESSAGE, "-left-padding__status")
  })), React__default.createElement("div", {
    className: "".concat(OUTGOING_THUMBNAIL_MESSAGE, "__body")
  }, React__default.createElement("div", {
    className: "".concat(OUTGOING_THUMBNAIL_MESSAGE, "-body__wrap")
  }, React__default.createElement("div", {
    className: "".concat(OUTGOING_THUMBNAIL_MESSAGE, "-body__wrap--inner"),
    onClick: isMessageSent ? function () {
      return onClick(true);
    } : function () {},
    onKeyDown: isMessageSent ? function () {
      return onClick(true);
    } : function () {},
    tabIndex: 0,
    role: "button"
  }, index$2.isVideo(type) && React__default.createElement(React__default.Fragment, null, React__default.createElement("video", {
    className: "".concat(OUTGOING_THUMBNAIL_MESSAGE, "-body__video")
  }, React__default.createElement("source", {
    src: url || localUrl,
    type: type
  })), React__default.createElement(index.Icon, {
    className: "".concat(OUTGOING_THUMBNAIL_MESSAGE, "-body__video-icon"),
    width: "56px",
    height: "56px",
    type: index.IconTypes.PLAY
  })), index$2.isImage(type) && React__default.createElement("div", {
    className: "".concat(OUTGOING_THUMBNAIL_MESSAGE, "-body__img"),
    style: {
      backgroundImage: "url(".concat(url || localUrl, ")"),
      height: '280px',
      width: '404px',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center'
    }
  }), index$2.unSupported(type) && React__default.createElement("div", {
    className: "".concat(OUTGOING_THUMBNAIL_MESSAGE, "-body__other")
  }, stringSet.UNKNOWN__UNKNOWN_MESSAGE_TYPE), React__default.createElement("div", {
    className: "".concat(OUTGOING_THUMBNAIL_MESSAGE, "-body__wrap__overlay")
  })), useReaction && message.reactions && message.reactions.length > 0 && React__default.createElement(EmojiReactions, {
    className: "".concat(OUTGOING_THUMBNAIL_MESSAGE, "-body__wrap__emoji-reactions"),
    userId: userId,
    message: message,
    emojiAllMap: emojiAllMap,
    membersMap: membersMap,
    toggleReaction: toggleReaction,
    memoizedEmojiListItems: memoizedEmojiListItems
  })))));
}
function IncomingThumbnailMessage(_ref3) {
  var _ref3$message = _ref3.message,
      message = _ref3$message === void 0 ? {} : _ref3$message,
      userId = _ref3.userId,
      onClick = _ref3.onClick,
      status = _ref3.status,
      useReaction = _ref3.useReaction,
      emojiAllMap = _ref3.emojiAllMap,
      membersMap = _ref3.membersMap,
      toggleReaction = _ref3.toggleReaction,
      memoizedEmojiListItems = _ref3.memoizedEmojiListItems,
      chainTop = _ref3.chainTop,
      chainBottom = _ref3.chainBottom;
  var type = message.type,
      url = message.url,
      localUrl = message.localUrl;

  var _React$useContext = React__default.useContext(index.UserProfileContext),
      disableUserProfile = _React$useContext.disableUserProfile,
      renderUserProfile = _React$useContext.renderUserProfile;

  var _useContext2 = React.useContext(LocalizationContext.LocalizationContext),
      stringSet = _useContext2.stringSet;

  var messageRef = React.useRef(null);
  var parentContainRef = React.useRef(null);
  var reactionAddRef = React.useRef(null);
  var avatarRef = React.useRef(null);

  var _useState5 = React.useState(false),
      _useState6 = LocalizationContext._slicedToArray(_useState5, 2),
      mousehover = _useState6[0],
      setMousehover = _useState6[1];

  var _useState7 = React.useState(false),
      _useState8 = LocalizationContext._slicedToArray(_useState7, 2),
      moreActive = _useState8[0],
      setMoreActive = _useState8[1];

  var showReactionAddButton = useReaction && emojiAllMap && emojiAllMap.size > 0;
  var MemoizedEmojiListItems = memoizedEmojiListItems;
  var isMessageSent = getIsSentFromStatus(status);

  var handleMoreIconClick = function handleMoreIconClick() {
    setMoreActive(true);
  };

  var handleMoreIconBlur = function handleMoreIconBlur() {
    setMoreActive(false);
  };

  useMouseHover({
    ref: messageRef,
    setHover: setMousehover
  });
  return React__default.createElement("div", {
    className: INCOMING_THUMBNAIL_MESSAGE,
    ref: messageRef,
    style: {
      paddingTop: chainTop ? GROUPING_PADDING$1 : NORMAL_PADDING$1,
      paddingBottom: chainBottom ? GROUPING_PADDING$1 : NORMAL_PADDING$1
    }
  }, !chainTop && React__default.createElement(index.Label, {
    className: "".concat(INCOMING_THUMBNAIL_MESSAGE, "__sender-name"),
    type: index.LabelTypography.CAPTION_2,
    color: index.LabelColors.ONBACKGROUND_2
  }, utils.getSenderName(message) || ''), React__default.createElement("div", {
    className: "".concat(INCOMING_THUMBNAIL_MESSAGE, "--inner")
  }, React__default.createElement("div", {
    className: "".concat(INCOMING_THUMBNAIL_MESSAGE, "__body")
  }, React__default.createElement("div", {
    className: "".concat(INCOMING_THUMBNAIL_MESSAGE, "-body__wrap")
  }, !chainBottom && React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.Avatar, {
        onClick: function onClick() {
          if (!disableUserProfile) {
            toggleDropdown();
          }
        },
        className: "".concat(INCOMING_THUMBNAIL_MESSAGE, "__avatar"),
        src: utils.getSenderProfileUrl(message),
        width: "28px",
        height: "28px"
      });
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(index.MenuItems, {
        parentRef: avatarRef // for catching location(x, y) of MenuItems
        ,
        parentContainRef: avatarRef // for toggling more options(menus & reactions)
        ,
        closeDropdown: closeDropdown,
        style: {
          paddingTop: 0,
          paddingBottom: 0
        }
      }, renderUserProfile ? renderUserProfile({
        user: message.sender,
        close: closeDropdown
      }) : React__default.createElement(index.UserProfile, {
        user: message.sender,
        onSuccess: closeDropdown
      }));
    }
  }), React__default.createElement("div", {
    className: "".concat(INCOMING_THUMBNAIL_MESSAGE, "-body__wrap--inner"),
    role: "button",
    tabIndex: 0,
    onClick: isMessageSent ? function () {
      return onClick(true);
    } : function () {},
    onKeyDown: isMessageSent ? function () {
      return onClick(true);
    } : function () {}
  }, index$2.isVideo(type) && React__default.createElement(React__default.Fragment, null, React__default.createElement("video", {
    className: "".concat(INCOMING_THUMBNAIL_MESSAGE, "__video")
  }, React__default.createElement("source", {
    src: url || localUrl,
    type: type
  })), React__default.createElement(index.Icon, {
    className: "".concat(INCOMING_THUMBNAIL_MESSAGE, "__video-icon"),
    width: "56px",
    height: "56px",
    type: index.IconTypes.PLAY
  })), index$2.isImage(type) && React__default.createElement("div", {
    className: "".concat(INCOMING_THUMBNAIL_MESSAGE, "__img"),
    style: {
      backgroundImage: "url(".concat(url || localUrl, ")"),
      height: '280px',
      width: '404px',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center'
    }
  }), index$2.unSupported(type) && React__default.createElement("div", {
    className: "".concat(INCOMING_THUMBNAIL_MESSAGE, "__other")
  }, stringSet.UNKNOWN__UNKNOWN_MESSAGE_TYPE), React__default.createElement("div", {
    className: "".concat(INCOMING_THUMBNAIL_MESSAGE, "-body__wrap-overlay")
  })), useReaction && message.reactions && message.reactions.length > 0 && React__default.createElement(EmojiReactions, {
    className: "".concat(INCOMING_THUMBNAIL_MESSAGE, "__wrap__emoji-reactions"),
    userId: userId,
    message: message,
    emojiAllMap: emojiAllMap,
    membersMap: membersMap,
    toggleReaction: toggleReaction,
    memoizedEmojiListItems: memoizedEmojiListItems
  }))), React__default.createElement("div", {
    className: "".concat(INCOMING_THUMBNAIL_MESSAGE, "__right-padding")
  }, !chainBottom && !(mousehover || moreActive) && React__default.createElement(index.Label, {
    className: "".concat(INCOMING_THUMBNAIL_MESSAGE, "__sent-at"),
    type: index.LabelTypography.CAPTION_3,
    color: index.LabelColors.ONBACKGROUND_2
  }, getMessageCreatedAt$1(message)), React__default.createElement("div", {
    className: "".concat(INCOMING_THUMBNAIL_MESSAGE, "__more"),
    ref: parentContainRef
  }, showReactionAddButton && React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.IconButton, {
        ref: reactionAddRef,
        width: "32px",
        height: "32px",
        onClick: function onClick() {
          toggleDropdown();
          handleMoreIconClick();
        },
        onBlur: function onBlur() {
          handleMoreIconBlur();
        }
      }, React__default.createElement(index.Icon, {
        width: "24px",
        height: "24px",
        type: index.IconTypes.EMOJI_REACTIONS_ADD,
        color: index.IconColors.CONTENT_INVERSE
      }));
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(MemoizedEmojiListItems, {
        message: message,
        parentRef: reactionAddRef,
        parentContainRef: parentContainRef,
        closeDropdown: closeDropdown,
        spaceFromTrigger: {
          y: 2
        }
      });
    }
  })))));
}
ThumbnailMessage.propTypes = {
  message: PropTypes.shape({
    type: PropTypes.string,
    url: PropTypes.string,
    localUrl: PropTypes.string
  }).isRequired,
  userId: PropTypes.string,
  resendMessage: PropTypes.func,
  status: PropTypes.string,
  isByMe: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  showRemove: PropTypes.func,
  useReaction: PropTypes.bool.isRequired,
  emojiAllMap: PropTypes.instanceOf(Map),
  membersMap: PropTypes.instanceOf(Map),
  toggleReaction: PropTypes.func,
  memoizedEmojiListItems: PropTypes.func,
  chainTop: PropTypes.bool,
  chainBottom: PropTypes.bool
};
ThumbnailMessage.defaultProps = {
  isByMe: false,
  disabled: false,
  resendMessage: noop$1,
  onClick: noop$1,
  showRemove: noop$1,
  status: '',
  userId: '',
  emojiAllMap: new Map(),
  membersMap: new Map(),
  toggleReaction: noop$1,
  memoizedEmojiListItems: function memoizedEmojiListItems() {
    return '';
  },
  chainTop: false,
  chainBottom: false
};
OutgoingThumbnailMessage.propTypes = {
  message: PropTypes.shape({
    type: PropTypes.string,
    url: PropTypes.string,
    localUrl: PropTypes.string
  }).isRequired,
  userId: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  resendMessage: PropTypes.func.isRequired,
  status: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  showRemove: PropTypes.func.isRequired,
  useReaction: PropTypes.bool.isRequired,
  emojiAllMap: PropTypes.instanceOf(Map).isRequired,
  membersMap: PropTypes.instanceOf(Map).isRequired,
  toggleReaction: PropTypes.func.isRequired,
  memoizedEmojiListItems: PropTypes.func.isRequired,
  chainTop: PropTypes.bool.isRequired,
  chainBottom: PropTypes.bool.isRequired
};
OutgoingThumbnailMessage.defaultProps = {
  status: ''
};
IncomingThumbnailMessage.propTypes = {
  message: PropTypes.shape({
    type: PropTypes.string,
    url: PropTypes.string,
    localUrl: PropTypes.string
  }).isRequired,
  userId: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  status: PropTypes.string,
  useReaction: PropTypes.bool.isRequired,
  emojiAllMap: PropTypes.instanceOf(Map).isRequired,
  membersMap: PropTypes.instanceOf(Map).isRequired,
  toggleReaction: PropTypes.func.isRequired,
  memoizedEmojiListItems: PropTypes.func.isRequired,
  chainTop: PropTypes.bool.isRequired,
  chainBottom: PropTypes.bool.isRequired
};
IncomingThumbnailMessage.defaultProps = {
  status: ''
};

var MAX_TRUNCATE_LENGTH = 40;
var GROUPAING_PADDING = '1px';
var NORMAL_PADDING$2 = '8px';

var noop$2 = function noop() {};

function checkFileType(fileUrl) {
  var result = null;
  var imageFile = /(\.gif|\.jpg|\.jpeg|\.txt|\.pdf)$/i;
  var audioFile = /(\.mp3)$/i;

  if (imageFile.test(fileUrl)) {
    result = index.IconTypes.FILE_DOCUMENT;
  } else if (audioFile.test(fileUrl)) {
    result = index.IconTypes.FILE_AUDIO;
  }

  return result;
}

function OutgoingFileMessage(_ref) {
  var message = _ref.message,
      userId = _ref.userId,
      status = _ref.status,
      showRemove = _ref.showRemove,
      disabled = _ref.disabled,
      resendMessage = _ref.resendMessage,
      useReaction = _ref.useReaction,
      emojiAllMap = _ref.emojiAllMap,
      membersMap = _ref.membersMap,
      toggleReaction = _ref.toggleReaction,
      memoizedEmojiListItems = _ref.memoizedEmojiListItems,
      chainTop = _ref.chainTop,
      chainBottom = _ref.chainBottom;
  var url = message.url;

  var openFileUrl = function openFileUrl() {
    window.open(url);
  };

  var messageRef = React.useRef(null);
  var parentContainRef = React.useRef(null);
  var menuRef = React.useRef(null);
  var reactionAddButtonRef = React.useRef(null);

  var _useState = React.useState(false),
      _useState2 = LocalizationContext._slicedToArray(_useState, 2),
      mousehover = _useState2[0],
      setMousehover = _useState2[1];

  var _useState3 = React.useState(false),
      _useState4 = LocalizationContext._slicedToArray(_useState3, 2),
      moreActive = _useState4[0],
      setMoreActive = _useState4[1];

  var showReactionAddButton = useReaction && emojiAllMap && emojiAllMap.size > 0;
  var MemoizedEmojiListItems = memoizedEmojiListItems;
  var isMessageSent = utils$1.getIsSentFromStatus(status);
  var showEmojiReactions = isMessageSent && useReaction && message.reactions && message.reactions.length > 0;

  var handleMoreIconClick = function handleMoreIconClick() {
    setMoreActive(true);
  };

  var handleMoreIconBlur = function handleMoreIconBlur() {
    setMoreActive(false);
  };

  useMouseHover({
    ref: messageRef,
    setHover: setMousehover
  });
  return React__default.createElement("div", {
    className: "sendbird-file-message__outgoing",
    ref: messageRef,
    style: {
      paddingTop: chainTop ? GROUPAING_PADDING : NORMAL_PADDING$2,
      paddingBottom: chainBottom ? GROUPAING_PADDING : NORMAL_PADDING$2
    }
  }, React__default.createElement("div", {
    className: "sendbird-file-message--inner"
  }, React__default.createElement("div", {
    className: "sendbird-file-message__left-padding"
  }, React__default.createElement("div", {
    className: "sendbird-file-message__more",
    ref: parentContainRef
  }, React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.IconButton, {
        ref: menuRef,
        width: "32px",
        height: "32px",
        onClick: function onClick() {
          toggleDropdown();
          handleMoreIconClick();
        },
        onBlur: function onBlur() {
          handleMoreIconBlur();
        }
      }, React__default.createElement(index.Icon, {
        width: "24px",
        height: "24px",
        type: index.IconTypes.MORE
      }));
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(index.MenuItems, {
        parentRef: menuRef,
        parentContainRef: parentContainRef,
        closeDropdown: closeDropdown,
        openLeft: true
      }, message && message.isResendable && message.isResendable() && React__default.createElement(index.MenuItem, {
        onClick: function onClick() {
          resendMessage(message);
          closeDropdown();
        }
      }, "Resend"), React__default.createElement(index.MenuItem, {
        onClick: function onClick() {
          if (disabled) {
            return;
          }

          showRemove(true);
          closeDropdown();
        }
      }, "Delete"));
    }
  }), showReactionAddButton && React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.IconButton, {
        ref: reactionAddButtonRef,
        width: "32px",
        height: "32px",
        onClick: function onClick() {
          toggleDropdown();
          handleMoreIconClick();
        },
        onBlur: function onBlur() {
          handleMoreIconBlur();
        }
      }, React__default.createElement(index.Icon, {
        width: "24px",
        height: "24px",
        type: index.IconTypes.EMOJI_REACTIONS_ADD,
        fillColor: index.IconColors.CONTENT_INVERSE
      }));
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(MemoizedEmojiListItems, {
        message: message,
        parentRef: reactionAddButtonRef,
        parentContainRef: parentContainRef,
        closeDropdown: closeDropdown,
        spaceFromTrigger: {
          y: 2
        }
      });
    }
  })), !chainBottom && !(mousehover || moreActive) && React__default.createElement("div", {
    className: "sendbird-file-message__status"
  }, React__default.createElement(MessageStatus, {
    message: message,
    status: status
  }))), React__default.createElement("div", {
    className: "sendbird-file-message__tooltip"
  }, React__default.createElement("div", {
    className: "sendbird-file-message__tooltip__inner"
  }, checkFileType(url) ? React__default.createElement(index.Icon, {
    className: "sendbird-file-message__tooltip__icon",
    width: "28px",
    height: "28px",
    type: checkFileType(url)
  }) : null, React__default.createElement(index.TextButton, {
    className: "sendbird-file-message__tooltip__text",
    onClick: openFileUrl
  }, React__default.createElement(index.Label, {
    type: index.LabelTypography.BODY_1,
    color: index.LabelColors.ONBACKGROUND_1
  }, utils$1.truncate(message.url, MAX_TRUNCATE_LENGTH)))), showEmojiReactions && React__default.createElement(EmojiReactions, {
    className: "sendbird-file-message__tooltip__emoji-reactions",
    userId: userId,
    message: message,
    emojiAllMap: emojiAllMap,
    membersMap: membersMap,
    toggleReaction: toggleReaction,
    memoizedEmojiListItems: memoizedEmojiListItems
  }))));
}
function IncomingFileMessage(_ref2) {
  var message = _ref2.message,
      userId = _ref2.userId,
      useReaction = _ref2.useReaction,
      emojiAllMap = _ref2.emojiAllMap,
      membersMap = _ref2.membersMap,
      toggleReaction = _ref2.toggleReaction,
      memoizedEmojiListItems = _ref2.memoizedEmojiListItems,
      chainTop = _ref2.chainTop,
      chainBottom = _ref2.chainBottom;

  var openFileUrl = function openFileUrl() {
    window.open(message.url);
  };

  var messageRef = React.useRef(null);

  var _React$useContext = React__default.useContext(index.UserProfileContext),
      disableUserProfile = _React$useContext.disableUserProfile,
      renderUserProfile = _React$useContext.renderUserProfile;

  var parentContainRef = React.useRef(null);
  var avatarRef = React.useRef(null);
  var reactionAddButtonRef = React.useRef(null);

  var _useState5 = React.useState(false),
      _useState6 = LocalizationContext._slicedToArray(_useState5, 2),
      mousehover = _useState6[0],
      setMousehover = _useState6[1];

  var _useState7 = React.useState(false),
      _useState8 = LocalizationContext._slicedToArray(_useState7, 2),
      moreActive = _useState8[0],
      setMoreActive = _useState8[1];

  var showReactionAddButton = useReaction && emojiAllMap && emojiAllMap.size > 0;
  var MemoizedEmojiListItems = memoizedEmojiListItems;

  var handleMoreIconClick = function handleMoreIconClick() {
    setMoreActive(true);
  };

  var handleMoreIconBlur = function handleMoreIconBlur() {
    setMoreActive(false);
  };

  useMouseHover({
    ref: messageRef,
    setHover: setMousehover
  });
  return React__default.createElement("div", {
    className: "sendbird-file-message__incoming",
    ref: messageRef,
    style: {
      paddingTop: chainTop ? GROUPAING_PADDING : NORMAL_PADDING$2,
      paddingBottom: chainBottom ? GROUPAING_PADDING : NORMAL_PADDING$2
    }
  }, React__default.createElement("div", {
    className: "sendbird-file-message--inner"
  }, React__default.createElement("div", {
    className: "sendbird-file-message__body"
  }, !chainBottom && React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.Avatar, {
        ref: avatarRef,
        onClick: function onClick() {
          if (!disableUserProfile) {
            toggleDropdown();
          }
        },
        className: "sendbird-file-message__avatar",
        src: utils.getSenderProfileUrl(message),
        width: "28px",
        height: "28px"
      });
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(index.MenuItems, {
        parentRef: avatarRef // for catching location(x, y) of MenuItems
        ,
        parentContainRef: avatarRef // for toggling more options(menus & reactions)
        ,
        closeDropdown: closeDropdown,
        style: {
          paddingTop: 0,
          paddingBottom: 0
        }
      }, renderUserProfile ? renderUserProfile({
        user: message.sender,
        close: closeDropdown
      }) : React__default.createElement(index.UserProfile, {
        user: message.sender,
        onSuccess: closeDropdown
      }));
    }
  }), !chainTop && React__default.createElement(index.Label, {
    className: "sendbird-file-message__sender-name",
    type: index.LabelTypography.CAPTION_2,
    color: index.LabelColors.ONBACKGROUND_2
  }, utils.getSenderName(message)), React__default.createElement("div", {
    className: "sendbird-file-message__tooltip"
  }, React__default.createElement("div", {
    className: "sendbird-file-message__tooltip__inner"
  }, checkFileType(message.url) ? React__default.createElement(index.Icon, {
    className: "sendbird-file-message__tooltip__icon",
    width: "28px",
    height: "28px",
    type: checkFileType(message.url)
  }) : null, React__default.createElement(index.TextButton, {
    className: "sendbird-file-message__tooltip__text",
    onClick: openFileUrl
  }, React__default.createElement(index.Label, {
    type: index.LabelTypography.BODY_1,
    color: index.LabelColors.ONBACKGROUND_1
  }, utils$1.truncate(message.url, MAX_TRUNCATE_LENGTH)))), useReaction && message.reactions && message.reactions.length > 0 && React__default.createElement(EmojiReactions, {
    className: "sendbird-file-message__tooltip__emoji-reactions",
    userId: userId,
    message: message,
    emojiAllMap: emojiAllMap,
    membersMap: membersMap,
    toggleReaction: toggleReaction,
    memoizedEmojiListItems: memoizedEmojiListItems
  }))), React__default.createElement("div", {
    className: "sendbird-file-message__right-padding"
  }, React__default.createElement("div", {
    className: "sendbird-file-message__more",
    ref: parentContainRef
  }, showReactionAddButton && React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.IconButton, {
        ref: reactionAddButtonRef,
        width: "32px",
        height: "32px",
        onClick: function onClick() {
          toggleDropdown();
          handleMoreIconClick();
        },
        onBlur: function onBlur() {
          handleMoreIconBlur();
        }
      }, React__default.createElement(index.Icon, {
        width: "24px",
        height: "24px",
        type: index.IconTypes.EMOJI_REACTIONS_ADD,
        fillColor: index.IconColors.CONTENT_INVERSE
      }));
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(MemoizedEmojiListItems, {
        message: message,
        parentRef: reactionAddButtonRef,
        parentContainRef: parentContainRef,
        closeDropdown: closeDropdown,
        spaceFromTrigger: {
          y: 2
        }
      });
    }
  })), !chainBottom && !(mousehover || moreActive) && React__default.createElement(index.Label, {
    className: "sendbird-file-message__sent-at",
    type: index.LabelTypography.CAPTION_3,
    color: index.LabelColors.ONBACKGROUND_2
  }, utils.getMessageCreatedAt(message)))));
}
OutgoingFileMessage.propTypes = {
  message: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.array, PropTypes.object])),
  userId: PropTypes.string,
  status: PropTypes.string,
  showRemove: PropTypes.func,
  resendMessage: PropTypes.func,
  useReaction: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  emojiAllMap: PropTypes.instanceOf(Map),
  membersMap: PropTypes.instanceOf(Map),
  toggleReaction: PropTypes.func,
  memoizedEmojiListItems: PropTypes.func,
  chainTop: PropTypes.bool.isRequired,
  chainBottom: PropTypes.bool.isRequired
};
OutgoingFileMessage.defaultProps = {
  status: '',
  showRemove: noop$2,
  resendMessage: noop$2,
  message: {},
  userId: '',
  disabled: false,
  emojiAllMap: new Map(),
  membersMap: new Map(),
  toggleReaction: noop$2,
  memoizedEmojiListItems: function memoizedEmojiListItems() {
    return '';
  }
};
IncomingFileMessage.propTypes = {
  message: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.array, PropTypes.object])),
  userId: PropTypes.string,
  useReaction: PropTypes.bool.isRequired,
  emojiAllMap: PropTypes.instanceOf(Map),
  membersMap: PropTypes.instanceOf(Map),
  toggleReaction: PropTypes.func,
  memoizedEmojiListItems: PropTypes.func,
  chainTop: PropTypes.bool.isRequired,
  chainBottom: PropTypes.bool.isRequired
};
IncomingFileMessage.defaultProps = {
  message: {},
  userId: '',
  emojiAllMap: new Map(),
  membersMap: new Map(),
  toggleReaction: noop$2,
  memoizedEmojiListItems: function memoizedEmojiListItems() {
    return '';
  }
};

var MessageSwitch = function MessageSwitch(_ref3) {
  var message = _ref3.message,
      userId = _ref3.userId,
      disabled = _ref3.disabled,
      isByMe = _ref3.isByMe,
      showRemove = _ref3.showRemove,
      status = _ref3.status,
      resendMessage = _ref3.resendMessage,
      useReaction = _ref3.useReaction,
      emojiAllMap = _ref3.emojiAllMap,
      membersMap = _ref3.membersMap,
      toggleReaction = _ref3.toggleReaction,
      memoizedEmojiListItems = _ref3.memoizedEmojiListItems,
      chainTop = _ref3.chainTop,
      chainBottom = _ref3.chainBottom;
  return React__default.createElement("div", {
    className: "sendbird-file-message".concat(isByMe ? '--outgoing' : '--incoming')
  }, isByMe ? React__default.createElement(OutgoingFileMessage, {
    message: message,
    userId: userId,
    disabled: disabled,
    showRemove: showRemove,
    status: status,
    resendMessage: resendMessage,
    useReaction: useReaction,
    emojiAllMap: emojiAllMap,
    membersMap: membersMap,
    toggleReaction: toggleReaction,
    memoizedEmojiListItems: memoizedEmojiListItems,
    chainTop: chainTop,
    chainBottom: chainBottom
  }) : React__default.createElement(IncomingFileMessage, {
    userId: userId,
    message: message,
    useReaction: useReaction,
    emojiAllMap: emojiAllMap,
    membersMap: membersMap,
    toggleReaction: toggleReaction,
    memoizedEmojiListItems: memoizedEmojiListItems,
    chainTop: chainTop,
    chainBottom: chainBottom
  }));
};

MessageSwitch.propTypes = {
  message: PropTypes.shape({}),
  userId: PropTypes.string,
  isByMe: PropTypes.bool,
  disabled: PropTypes.bool,
  showRemove: PropTypes.func,
  resendMessage: PropTypes.func,
  status: PropTypes.string.isRequired,
  useReaction: PropTypes.bool.isRequired,
  emojiAllMap: PropTypes.instanceOf(Map),
  membersMap: PropTypes.instanceOf(Map),
  toggleReaction: PropTypes.func,
  memoizedEmojiListItems: PropTypes.func,
  chainTop: PropTypes.bool,
  chainBottom: PropTypes.bool
};
MessageSwitch.defaultProps = {
  message: {},
  isByMe: false,
  disabled: false,
  showRemove: noop$2,
  resendMessage: noop$2,
  userId: '',
  emojiAllMap: new Map(),
  membersMap: new Map(),
  toggleReaction: noop$2,
  memoizedEmojiListItems: function memoizedEmojiListItems() {
    return '';
  },
  chainTop: false,
  chainBottom: false
};

var RemoveMessage = function RemoveMessage(props) {
  var onCloseModal = props.onCloseModal,
      onDeleteMessage = props.onDeleteMessage;

  var _useContext = React.useContext(LocalizationContext.LocalizationContext),
      stringSet = _useContext.stringSet;

  return React__default.createElement(index.Modal, {
    onCancel: onCloseModal,
    onSubmit: onDeleteMessage,
    submitText: "Delete",
    titleText: stringSet.MODAL__DELETE_MESSAGE__TITLE
  });
};

RemoveMessage.propTypes = {
  onCloseModal: PropTypes.func.isRequired,
  onDeleteMessage: PropTypes.func.isRequired
};

var getMessageCreatedAt$2 = function getMessageCreatedAt(message) {
  return format(message.createdAt, 'p');
};

var CLASS_NAME$2 = 'sendbird-unknown-message';
var GROUPING_PADDING$2 = '1px';
var NORMAL_PADDING$3 = '8px';
function UnknownMessage(_ref) {
  var message = _ref.message,
      isByMe = _ref.isByMe,
      status = _ref.status,
      className = _ref.className,
      showRemove = _ref.showRemove,
      chainTop = _ref.chainTop,
      chainBottom = _ref.chainBottom;
  var injectingClassName = Array.isArray(className) ? className : [className];
  injectingClassName.unshift(CLASS_NAME$2);
  injectingClassName.push("".concat(CLASS_NAME$2).concat(isByMe ? '--outgoing' : '--incoming'));
  return React__default.createElement("div", {
    className: injectingClassName.join(' ')
  }, isByMe ? React__default.createElement(OutgoingUnknownMessage, {
    status: status,
    message: message,
    chainTop: chainTop,
    showRemove: showRemove,
    chainBottom: chainBottom
  }) : React__default.createElement(IncomingUnknownMessage, {
    message: message,
    chainTop: chainTop,
    chainBottom: chainBottom
  }));
}
UnknownMessage.propTypes = {
  message: PropTypes.shape({}).isRequired,
  isByMe: PropTypes.bool,
  status: PropTypes.string,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  showRemove: PropTypes.func,
  chainTop: PropTypes.bool,
  chainBottom: PropTypes.bool
};
UnknownMessage.defaultProps = {
  isByMe: false,
  status: '',
  className: '',
  showRemove: function showRemove() {},
  chainTop: false,
  chainBottom: false
};

function OutgoingUnknownMessage(_ref2) {
  var message = _ref2.message,
      status = _ref2.status,
      showRemove = _ref2.showRemove,
      chainTop = _ref2.chainTop,
      chainBottom = _ref2.chainBottom;
  var className = 'sendbird-outgoing-unknown-message';
  var messageRef = React.useRef(null);
  var parentContainRef = React.useRef(null);
  var menuRef = React.useRef(null);

  var _useState = React.useState(false),
      _useState2 = LocalizationContext._slicedToArray(_useState, 2),
      mousehover = _useState2[0],
      setMousehover = _useState2[1];

  var _useState3 = React.useState(false),
      _useState4 = LocalizationContext._slicedToArray(_useState3, 2),
      moreActive = _useState4[0],
      setMoreActive = _useState4[1];

  var _useContext = React.useContext(LocalizationContext.LocalizationContext),
      stringSet = _useContext.stringSet;

  var handleMoreIconClick = function handleMoreIconClick() {
    setMoreActive(true);
  };

  var handleMoreIconBlur = function handleMoreIconBlur() {
    setMoreActive(false);
  };

  useMouseHover({
    ref: messageRef,
    setHover: setMousehover
  });
  return React__default.createElement("div", {
    ref: messageRef,
    className: className,
    style: {
      paddingTop: chainTop ? GROUPING_PADDING$2 : NORMAL_PADDING$3,
      paddingBottom: chainBottom ? GROUPING_PADDING$2 : NORMAL_PADDING$3
    }
  }, React__default.createElement("div", {
    className: "".concat(className, "--inner")
  }, React__default.createElement("div", {
    className: "".concat(className, "--left-padding")
  }, React__default.createElement("div", {
    className: "".concat(className, "__more"),
    ref: parentContainRef
  }, React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.IconButton, {
        className: "".concat(className, "__more__menu"),
        ref: menuRef,
        width: "32px",
        height: "32px",
        onClick: function onClick() {
          toggleDropdown();
          handleMoreIconClick();
        },
        onBlur: function onBlur() {
          handleMoreIconBlur();
        }
      }, React__default.createElement(index.Icon, {
        width: "24px",
        height: "24px",
        type: index.IconTypes.MORE,
        fillColor: index.IconColors.CONTENT_INVERSE
      }));
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(index.MenuItems, {
        parentRef: menuRef // for catching location(x, y) of MenuItems
        ,
        parentContainRef: parentContainRef // for toggling more options(menus & reactions)
        ,
        closeDropdown: closeDropdown,
        openLeft: true
      }, React__default.createElement(index.MenuItem, {
        onClick: function onClick() {
          showRemove(true);
          closeDropdown();
        }
      }, "Delete"));
    }
  })), !chainBottom && !(mousehover || moreActive) && React__default.createElement("div", {
    className: "".concat(className, "__message-status")
  }, React__default.createElement(MessageStatus, {
    message: message,
    status: status
  }))), React__default.createElement("div", {
    className: "".concat(className, "__body")
  }, React__default.createElement("div", {
    className: "".concat(className, "__body__text-balloon")
  }, React__default.createElement(index.Label, {
    className: "".concat(className, "__body__text-balloon__header"),
    type: index.LabelTypography.BODY_1,
    color: index.LabelColors.ONBACKGROUND_1
  }, stringSet.UNKNOWN__UNKNOWN_MESSAGE_TYPE), React__default.createElement(index.Label, {
    className: "".concat(className, "__body__text-balloon__description"),
    type: index.LabelTypography.BODY_1,
    color: index.LabelColors.ONBACKGROUND_2
  }, stringSet.UNKNOWN__CANNOT_READ_MESSAGE)))));
}

function IncomingUnknownMessage(_ref3) {
  var message = _ref3.message,
      chainTop = _ref3.chainTop,
      chainBottom = _ref3.chainBottom;
  var className = 'sendbird-incoming-unknown-message';
  var sender = message.sender;
  var avatarRef = React.useRef(null);

  var _useContext2 = React.useContext(LocalizationContext.LocalizationContext),
      stringSet = _useContext2.stringSet;

  var _React$useContext = React__default.useContext(index.UserProfileContext),
      disableUserProfile = _React$useContext.disableUserProfile,
      renderUserProfile = _React$useContext.renderUserProfile;

  return React__default.createElement("div", {
    className: className,
    style: {
      paddingTop: chainTop ? GROUPING_PADDING$2 : NORMAL_PADDING$3,
      paddingBottom: chainBottom ? GROUPING_PADDING$2 : NORMAL_PADDING$3
    }
  }, React__default.createElement("div", {
    className: "".concat(className, "--inner")
  }, React__default.createElement("div", {
    className: "".concat(className, "__left")
  }, !chainBottom && React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.Avatar, {
        ref: avatarRef,
        onClick: function onClick() {
          if (!disableUserProfile) {
            toggleDropdown();
          }
        },
        className: "".concat(className, "__left__sender-profile-image"),
        src: sender.profileUrl,
        width: "28px",
        height: "28px",
        alt: "sender-profile-image"
      });
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(index.MenuItems, {
        parentRef: avatarRef // for catching location(x, y) of MenuItems
        ,
        parentContainRef: avatarRef // for toggling more options(menus & reactions)
        ,
        closeDropdown: closeDropdown,
        style: {
          paddingTop: 0,
          paddingBottom: 0
        }
      }, renderUserProfile ? renderUserProfile({
        user: message.sender,
        close: closeDropdown
      }) : React__default.createElement(index.UserProfile, {
        user: message.sender,
        onSuccess: closeDropdown
      }));
    }
  })), React__default.createElement("div", {
    className: "".concat(className, "__body")
  }, !chainTop && React__default.createElement(index.Label, {
    className: "".concat(className, "__body__sender-name"),
    type: index.LabelTypography.CAPTION_2,
    color: index.LabelColors.ONBACKGROUND_2
  }, sender.nickname || stringSet.NO_NAME), React__default.createElement("div", {
    className: "".concat(className, "__body__text-balloon")
  }, React__default.createElement(index.Label, {
    className: "".concat(className, "__body__text-balloon__header"),
    type: index.LabelTypography.BODY_1,
    color: index.LabelColors.ONBACKGROUND_1
  }, stringSet.UNKNOWN__UNKNOWN_MESSAGE_TYPE), React__default.createElement(index.Label, {
    className: "".concat(className, "__body__text-balloon__description"),
    type: index.LabelTypography.BODY_1,
    color: index.LabelColors.ONBACKGROUND_2
  }, stringSet.UNKNOWN__CANNOT_READ_MESSAGE))), React__default.createElement("div", {
    className: "".concat(className, "--right-padding")
  }, !chainBottom && React__default.createElement(index.Label, {
    className: "".concat(className, "__sent-at"),
    type: index.LabelTypography.CAPTION_3,
    color: index.LabelColors.ONBACKGROUND_2
  }, getMessageCreatedAt$2(message)))));
}

OutgoingUnknownMessage.propTypes = {
  message: PropTypes.shape({}).isRequired,
  status: PropTypes.string.isRequired,
  showRemove: PropTypes.func,
  chainTop: PropTypes.bool.isRequired,
  chainBottom: PropTypes.bool.isRequired
};
OutgoingUnknownMessage.defaultProps = {
  showRemove: function showRemove() {}
};
IncomingUnknownMessage.propTypes = {
  message: PropTypes.shape({
    sender: PropTypes.shape({
      nickname: PropTypes.string,
      profileUrl: PropTypes.string
    })
  }).isRequired,
  chainTop: PropTypes.bool.isRequired,
  chainBottom: PropTypes.bool.isRequired
};

var URL_REG = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
var OG_MESSAGE = 'sendbird-og-message';
var OUTGOING_OG_MESSAGE = 'sendbird-outgoing-og-message';
var INCOMING_OG_MESSAGE = 'sendbird-incoming-og-message';

var createUrlTester = function createUrlTester(regexp) {
  return function (text) {
    return regexp.test(text);
  };
};
var getIsSentFromStatus$1 = function getIsSentFromStatus(status) {
  return status === type.MessageStatusType.SENT || status === type.MessageStatusType.DELIVERED || status === type.MessageStatusType.READ;
};
var copyToClipboard = function copyToClipboard(text) {
  try {
    if (window.clipboardData && window.clipboardData.setData) {
      // Internet Explorer-specific code path
      // to prevent textarea being shown while dialog is visible.
      return window.clipboardData.setData('Text', text);
    }

    if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
      var textarea = document.createElement('textarea');
      textarea.textContent = text;
      textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in Microsoft Edge.

      document.body.appendChild(textarea);
      textarea.select();

      try {
        return document.execCommand('copy'); // Security exception may be thrown by some browsers.
      } catch (ex) {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }

    return false;
  } catch (err) {
    return err;
  }
};
var getSenderProfileUrl = function getSenderProfileUrl(message) {
  return message.sender && message.sender.profileUrl;
};
var getSenderName = function getSenderName(message) {
  return message.sender && (message.sender.friendName || message.sender.nickname || message.sender.userId);
};
var getMessageCreatedAt$3 = function getMessageCreatedAt(message) {
  return format(message.createdAt, 'p');
};
var checkOGIsEnalbed = function checkOGIsEnalbed(message) {
  var ogMetaData = message.ogMetaData;

  if (!ogMetaData) {
    return false;
  }

  var url = ogMetaData.url;

  if (!url) {
    return false;
  }

  return true;
};

var WORD_TYPOGRAPHY$1 = index.LabelTypography.BODY_1;
var WORD_COLOR = index.LabelColors.ONBACKGROUND_1;
var EDITED_COLOR$1 = index.LabelColors.ONBACKGROUND_2;
var isUrl = createUrlTester(URL_REG);
function useMemoizedMessageText$1(_ref) {
  var message = _ref.message,
      updatedAt = _ref.updatedAt,
      className = _ref.className;

  var _useContext = React.useContext(LocalizationContext.LocalizationContext),
      stringSet = _useContext.stringSet;

  return React.useMemo(function () {
    return function () {
      var splitMessage = message.split(' ');
      var matchedMessage = splitMessage.map(function (word) {
        return isUrl(word) ? React__default.createElement(index$2.LinkLabel, {
          key: LocalizationContext.uuidv4$1(),
          className: className,
          src: word,
          type: WORD_TYPOGRAPHY$1,
          color: WORD_COLOR
        }, word) : React__default.createElement(index.Label, {
          key: LocalizationContext.uuidv4$1(),
          className: className,
          type: WORD_TYPOGRAPHY$1,
          color: WORD_COLOR
        }, word);
      });

      if (updatedAt > 0) {
        matchedMessage.push(React__default.createElement(index.Label, {
          key: LocalizationContext.uuidv4$1(),
          className: className,
          type: WORD_TYPOGRAPHY$1,
          color: EDITED_COLOR$1
        }, stringSet.MESSAGE_EDITED));
      }

      return matchedMessage;
    };
  }, [message, updatedAt, className]);
}

var GROUPING_PADDING$3 = '1px';
var NORAML_PADDING = '8px';

var OGMessageSwitch = function OGMessageSwitch(_ref) {
  var isByMe = _ref.isByMe,
      userId = _ref.userId,
      status = _ref.status,
      message = _ref.message,
      disabled = _ref.disabled,
      showEdit = _ref.showEdit,
      chainTop = _ref.chainTop,
      className = _ref.className,
      membersMap = _ref.membersMap,
      showRemove = _ref.showRemove,
      useReaction = _ref.useReaction,
      emojiAllMap = _ref.emojiAllMap,
      chainBottom = _ref.chainBottom,
      resendMessage = _ref.resendMessage,
      toggleReaction = _ref.toggleReaction,
      memoizedEmojiListItems = _ref.memoizedEmojiListItems;
  var ogMetaData = message.ogMetaData;
  var injectingClassName = Array.isArray(className) ? className : [className];
  var memoizedMessageText = useMemoizedMessageText$1({
    message: message.message,
    updatedAt: message.updatedAt,
    className: 'sendbird-og-message-word'
  });

  var openLink = function openLink() {
    if (checkOGIsEnalbed(message)) {
      var url = ogMetaData.url;
      window.open(url);
    }
  };

  return React__default.createElement("div", {
    className: "".concat(OG_MESSAGE, " ").concat(OG_MESSAGE).concat(isByMe ? '--outgoing' : '--incoming', " ").concat(injectingClassName.join(' '))
  }, isByMe ? React__default.createElement(OutgoingOGMessage, {
    status: status,
    userId: userId,
    message: message,
    disabled: disabled,
    openLink: openLink,
    showEdit: showEdit,
    chainTop: chainTop,
    showRemove: showRemove,
    membersMap: membersMap,
    chainBottom: chainBottom,
    useReaction: useReaction,
    emojiAllMap: emojiAllMap,
    resendMessage: resendMessage,
    toggleReaction: toggleReaction,
    memoizedMessageText: memoizedMessageText,
    memoizedEmojiListItems: memoizedEmojiListItems
  }) : React__default.createElement(IncomingOGMessage, {
    userId: userId,
    message: message,
    openLink: openLink,
    chainTop: chainTop,
    membersMap: membersMap,
    chainBottom: chainBottom,
    useReaction: useReaction,
    emojiAllMap: emojiAllMap,
    toggleReaction: toggleReaction,
    memoizedMessageText: memoizedMessageText,
    memoizedEmojiListItems: memoizedEmojiListItems
  }));
};

function OutgoingOGMessage(props) {
  var status = props.status,
      userId = props.userId,
      message = props.message,
      disabled = props.disabled,
      openLink = props.openLink,
      showEdit = props.showEdit,
      chainTop = props.chainTop,
      showRemove = props.showRemove,
      membersMap = props.membersMap,
      chainBottom = props.chainBottom,
      emojiAllMap = props.emojiAllMap,
      useReaction = props.useReaction,
      resendMessage = props.resendMessage,
      toggleReaction = props.toggleReaction,
      memoizedMessageText = props.memoizedMessageText,
      memoizedEmojiListItems = props.memoizedEmojiListItems;
  var ogMetaData = message.ogMetaData;
  var defaultImage = ogMetaData.defaultImage;

  var _useContext = React.useContext(LocalizationContext.LocalizationContext),
      stringSet = _useContext.stringSet;

  var MemoizedMessageText = memoizedMessageText;
  var MemoizedEmojiListItems = memoizedEmojiListItems;
  var messageRef = React.useRef(null);
  var parentRefReactions = React.useRef(null);
  var parentRefMenus = React.useRef(null);
  var parentContainRef = React.useRef(null);
  var isMessageSent = getIsSentFromStatus$1(status);

  var _useState = React.useState(false),
      _useState2 = LocalizationContext._slicedToArray(_useState, 2),
      mousehover = _useState2[0],
      setMousehover = _useState2[1];

  var _useState3 = React.useState(false),
      _useState4 = LocalizationContext._slicedToArray(_useState3, 2),
      moreActive = _useState4[0],
      setMoreActive = _useState4[1];

  var showEmojiReactions = useReaction && message.reactions && message.reactions.length > 0;

  var handleMoreIconClick = function handleMoreIconClick() {
    setMoreActive(true);
  };

  var handleMoreIconBlur = function handleMoreIconBlur() {
    setMoreActive(false);
  };

  useMouseHover({
    ref: messageRef,
    setHover: setMousehover
  });
  return React__default.createElement("div", {
    ref: messageRef,
    className: OUTGOING_OG_MESSAGE,
    style: {
      paddingTop: chainTop ? GROUPING_PADDING$3 : NORAML_PADDING,
      paddingBottom: chainBottom ? GROUPING_PADDING$3 : NORAML_PADDING
    }
  }, React__default.createElement("div", {
    className: "".concat(OUTGOING_OG_MESSAGE, "--inner")
  }, React__default.createElement("div", {
    className: "".concat(OUTGOING_OG_MESSAGE, "--left-padding")
  }, React__default.createElement("div", {
    className: "".concat(OUTGOING_OG_MESSAGE, "__more"),
    ref: parentContainRef
  }, React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.IconButton, {
        className: "".concat(OUTGOING_OG_MESSAGE, "__more__menu"),
        ref: parentRefMenus,
        width: "32px",
        height: "32px",
        onClick: function onClick() {
          toggleDropdown();
          handleMoreIconClick();
        },
        onBlur: function onBlur() {
          handleMoreIconBlur();
        }
      }, React__default.createElement(index.Icon, {
        width: "24px",
        height: "24px",
        type: index.IconTypes.MORE,
        fillColor: index.IconColors.CONTENT_INVERSE
      }));
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(index.MenuItems, {
        parentRef: parentRefMenus // for catching location(x, y) of MenuItems
        ,
        parentContainRef: parentContainRef // for toggling more options(menus & reactions)
        ,
        closeDropdown: closeDropdown,
        openLeft: true
      }, isMessageSent && React__default.createElement(index.MenuItem, {
        className: "".concat(OUTGOING_OG_MESSAGE, "__more__menu__copy"),
        onClick: function onClick() {
          copyToClipboard(message.message);
          closeDropdown();
        }
      }, stringSet.CONTEXT_MENU_DROPDOWN__COPY), isMessageSent && React__default.createElement(index.MenuItem, {
        onClick: function onClick() {
          if (disabled) {
            return;
          }

          showEdit(true);
          closeDropdown();
        }
      }, stringSet.CONTEXT_MENU_DROPDOWN__EDIT), message && message.isResendable && message.isResendable() && React__default.createElement(index.MenuItem, {
        onClick: function onClick() {
          resendMessage(message);
          closeDropdown();
        }
      }, stringSet.CONTEXT_MENU_DROPDOWN__RESEND), React__default.createElement(index.MenuItem, {
        onClick: function onClick() {
          if (disabled) {
            return;
          }

          showRemove(true);
          closeDropdown();
        }
      }, stringSet.CONTEXT_MENU_DROPDOWN__DELETE));
    }
  }), isMessageSent && useReaction && emojiAllMap.size > 0 && React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.IconButton, {
        className: "".concat(OUTGOING_OG_MESSAGE, "__more__add-reaction"),
        ref: parentRefReactions,
        width: "32px",
        height: "32px",
        onClick: toggleDropdown
      }, React__default.createElement(index.Icon, {
        width: "24px",
        height: "24px",
        type: index.IconTypes.EMOJI_REACTIONS_ADD,
        fillColor: index.IconColors.CONTENT_INVERSE
      }));
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(MemoizedEmojiListItems, {
        message: message,
        parentRef: parentRefReactions,
        parentContainRef: parentContainRef,
        closeDropdown: closeDropdown,
        spaceFromTrigger: {
          y: 2
        }
      });
    }
  })), !chainBottom && !(mousehover || moreActive) && React__default.createElement("div", {
    className: "".concat(OUTGOING_OG_MESSAGE, "__message-status")
  }, React__default.createElement(MessageStatus, {
    message: message,
    status: status
  }))), React__default.createElement("div", {
    className: "".concat(OUTGOING_OG_MESSAGE, "--body")
  }, React__default.createElement("div", {
    className: "".concat(OUTGOING_OG_MESSAGE, "__text-balloon")
  }, React__default.createElement(MemoizedMessageText, null)), React__default.createElement("div", {
    className: "".concat(OUTGOING_OG_MESSAGE, "__thumbnail ").concat(checkOGIsEnalbed(message) ? '' : "".concat(OUTGOING_OG_MESSAGE, "__thumbnail--disabled")),
    onClick: openLink,
    onKeyDown: openLink,
    role: "button",
    tabIndex: 0
  }, defaultImage && React__default.createElement(index.ImageRenderer, {
    url: defaultImage.url || '',
    alt: defaultImage.alt,
    className: "".concat(OUTGOING_OG_MESSAGE, "__thumbnail__image"),
    width: "320px",
    height: "180px",
    defaultComponent: React__default.createElement("div", {
      className: "".concat(OUTGOING_OG_MESSAGE, "__thumbnail__image__placeholder")
    }, React__default.createElement(index.Icon, {
      width: "56px",
      height: "56px",
      type: index.IconTypes.NO_THUMBNAIL
    }))
  })), React__default.createElement("div", {
    className: "".concat(OUTGOING_OG_MESSAGE, "__og-tag ").concat(checkOGIsEnalbed(message) ? '' : "".concat(OUTGOING_OG_MESSAGE, "__og-tag--disabled")),
    onClick: openLink,
    onKeyDown: openLink,
    role: "button",
    tabIndex: 0
  }, ogMetaData.title && React__default.createElement("div", {
    className: "".concat(OUTGOING_OG_MESSAGE, "__og-tag__title")
  }, React__default.createElement(index.Label, {
    type: index.LabelTypography.SUBTITLE_2,
    color: index.LabelColors.ONBACKGROUND_1
  }, ogMetaData.title)), ogMetaData.description && React__default.createElement("div", {
    className: "".concat(OUTGOING_OG_MESSAGE, "__og-tag__description")
  }, React__default.createElement(index.Label, {
    type: index.LabelTypography.BODY_2,
    color: index.LabelColors.ONBACKGROUND_1,
    className: "".concat(OUTGOING_OG_MESSAGE, "__og-tag__description__label")
  }, ogMetaData.description)), ogMetaData.url && React__default.createElement(index.Label, {
    type: index.LabelTypography.CAPTION_3,
    color: index.LabelColors.ONBACKGROUND_2,
    className: "".concat(OUTGOING_OG_MESSAGE, "__og-tag__url")
  }, ogMetaData.url), showEmojiReactions && React__default.createElement("div", {
    className: "".concat(OUTGOING_OG_MESSAGE, "__og-tag__emoji-reactions--wrapper"),
    onClick: function onClick(event) {
      return event.stopPropagation();
    },
    onKeyDown: function onKeyDown(event) {
      return event.stopPropagation();
    },
    role: "button",
    tabIndex: 0
  }, React__default.createElement(EmojiReactions, {
    className: "".concat(OUTGOING_OG_MESSAGE, "__og-tag__emoji-reactions"),
    userId: userId,
    message: message,
    membersMap: membersMap,
    emojiAllMap: emojiAllMap,
    toggleReaction: toggleReaction,
    memoizedEmojiListItems: memoizedEmojiListItems
  }))))));
}

function IncomingOGMessage(props) {
  var userId = props.userId,
      message = props.message,
      openLink = props.openLink,
      chainTop = props.chainTop,
      membersMap = props.membersMap,
      chainBottom = props.chainBottom,
      useReaction = props.useReaction,
      emojiAllMap = props.emojiAllMap,
      toggleReaction = props.toggleReaction,
      memoizedMessageText = props.memoizedMessageText,
      memoizedEmojiListItems = props.memoizedEmojiListItems;
  var ogMetaData = message.ogMetaData;
  var defaultImage = ogMetaData.defaultImage;

  var _useContext2 = React.useContext(LocalizationContext.LocalizationContext),
      stringSet = _useContext2.stringSet;

  var MemoizedMessageText = memoizedMessageText;
  var MemoizedEmojiListItems = memoizedEmojiListItems;
  var messageRef = React.useRef(null);
  var avatarRef = React.useRef(null);
  var parentRefReactions = React.useRef(null);
  var parentRefMenus = React.useRef(null);
  var parentContainRef = React.useRef(null);

  var _React$useContext = React__default.useContext(index.UserProfileContext),
      disableUserProfile = _React$useContext.disableUserProfile,
      renderUserProfile = _React$useContext.renderUserProfile;

  var _useState5 = React.useState(false),
      _useState6 = LocalizationContext._slicedToArray(_useState5, 2),
      mousehover = _useState6[0],
      setMousehover = _useState6[1];

  var _useState7 = React.useState(false),
      _useState8 = LocalizationContext._slicedToArray(_useState7, 2),
      moreActive = _useState8[0],
      setMoreActive = _useState8[1];

  var showEmojiReactions = useReaction && message.reactions && message.reactions.length > 0;
  var showReactionAddButton = useReaction && emojiAllMap && emojiAllMap.size > 0;

  var handleMoreIconClick = function handleMoreIconClick() {
    setMoreActive(true);
  };

  var handleMoreIconBlur = function handleMoreIconBlur() {
    setMoreActive(false);
  };

  useMouseHover({
    ref: messageRef,
    setHover: setMousehover
  });
  return React__default.createElement("div", {
    ref: messageRef,
    className: INCOMING_OG_MESSAGE,
    style: {
      paddingTop: chainTop ? GROUPING_PADDING$3 : NORAML_PADDING,
      paddingBottom: chainBottom ? GROUPING_PADDING$3 : NORAML_PADDING
    }
  }, React__default.createElement("div", {
    className: "".concat(INCOMING_OG_MESSAGE, "--inner")
  }, React__default.createElement("div", {
    className: "".concat(INCOMING_OG_MESSAGE, "--body")
  }, !chainBottom && React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.Avatar, {
        ref: avatarRef,
        onClick: function onClick() {
          if (!disableUserProfile) {
            toggleDropdown();
          }
        },
        className: "".concat(INCOMING_OG_MESSAGE, "__avatar"),
        src: getSenderProfileUrl(message),
        width: "28px",
        height: "28px",
        alt: "sender-profile-image"
      });
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(index.MenuItems, {
        parentRef: avatarRef // for catching location(x, y) of MenuItems
        ,
        parentContainRef: avatarRef // for toggling more options(menus & reactions)
        ,
        closeDropdown: closeDropdown,
        style: {
          paddingTop: 0,
          paddingBottom: 0
        }
      }, renderUserProfile ? renderUserProfile({
        user: message.sender,
        close: closeDropdown
      }) : React__default.createElement(index.UserProfile, {
        user: message.sender,
        onSuccess: closeDropdown
      }));
    }
  }), !chainTop && React__default.createElement(index.Label, {
    className: "".concat(INCOMING_OG_MESSAGE, "__sender-name"),
    type: index.LabelTypography.CAPTION_2,
    color: index.LabelColors.ONBACKGROUND_2
  }, getSenderName(message)), React__default.createElement("div", {
    className: "".concat(INCOMING_OG_MESSAGE, "__text-balloon")
  }, React__default.createElement(MemoizedMessageText, null)), React__default.createElement("div", {
    className: "".concat(INCOMING_OG_MESSAGE, "__thumbnail ").concat(checkOGIsEnalbed(message) ? '' : "".concat(INCOMING_OG_MESSAGE, "__thumbnail--disabled")),
    onClick: openLink,
    onKeyDown: openLink,
    role: "button",
    tabIndex: 0
  }, defaultImage && React__default.createElement(index.ImageRenderer, {
    url: defaultImage.url || '',
    alt: defaultImage.alt || '',
    className: "".concat(INCOMING_OG_MESSAGE, "__thumbnail__image"),
    width: "320px",
    height: "180px",
    defaultComponent: React__default.createElement("div", {
      className: "".concat(INCOMING_OG_MESSAGE, "__thumbnail__image__placeholder")
    }, React__default.createElement(index.Icon, {
      width: "56px",
      height: "56px",
      type: index.IconTypes.NO_THUMBNAIL
    }))
  })), React__default.createElement("div", {
    className: "".concat(INCOMING_OG_MESSAGE, "__og-tag ").concat(checkOGIsEnalbed(message) ? '' : "".concat(INCOMING_OG_MESSAGE, "__og-tag--disabled")),
    onClick: openLink,
    onKeyDown: openLink,
    role: "button",
    tabIndex: 0
  }, ogMetaData.title && React__default.createElement("div", {
    className: "".concat(INCOMING_OG_MESSAGE, "__og-tag__title")
  }, React__default.createElement(index.Label, {
    type: index.LabelTypography.SUBTITLE_2,
    color: index.LabelColors.ONBACKGROUND_1
  }, ogMetaData.title)), ogMetaData.description && React__default.createElement("div", {
    className: "".concat(INCOMING_OG_MESSAGE, "__og-tag__description")
  }, React__default.createElement(index.Label, {
    type: index.LabelTypography.BODY_2,
    color: index.LabelColors.ONBACKGROUND_1,
    className: "".concat(INCOMING_OG_MESSAGE, "__og-tag__description__label")
  }, ogMetaData.description)), ogMetaData.url && React__default.createElement("div", {
    className: "".concat(INCOMING_OG_MESSAGE, "__og-tag__url")
  }, React__default.createElement(index.Label, {
    type: index.LabelTypography.CAPTION_3,
    color: index.LabelColors.ONBACKGROUND_2,
    className: "".concat(INCOMING_OG_MESSAGE, "__og-tag__url__label")
  }, ogMetaData.url)), showEmojiReactions && React__default.createElement("div", {
    className: "".concat(INCOMING_OG_MESSAGE, "__og-tag__emoji-reactions--wrapper"),
    onClick: function onClick(event) {
      return event.stopPropagation();
    },
    onKeyDown: function onKeyDown(event) {
      return event.stopPropagation();
    },
    role: "button",
    tabIndex: 0
  }, React__default.createElement(EmojiReactions, {
    className: "".concat(INCOMING_OG_MESSAGE, "__og-tag__emoji-reactions"),
    userId: userId,
    message: message,
    membersMap: membersMap,
    emojiAllMap: emojiAllMap,
    toggleReaction: toggleReaction,
    memoizedEmojiListItems: memoizedEmojiListItems
  })))), React__default.createElement("div", {
    className: "".concat(INCOMING_OG_MESSAGE, "--right-padding")
  }, !chainBottom && !(mousehover || moreActive) && React__default.createElement(index.Label, {
    className: "".concat(INCOMING_OG_MESSAGE, "__sent-at"),
    type: index.LabelTypography.CAPTION_3,
    color: index.LabelColors.ONBACKGROUND_2
  }, getMessageCreatedAt$3(message)), React__default.createElement("div", {
    className: "".concat(INCOMING_OG_MESSAGE, "__more"),
    ref: parentContainRef
  }, showReactionAddButton && React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.IconButton, {
        ref: parentRefReactions,
        width: "32px",
        height: "32px",
        onClick: function onClick() {
          toggleDropdown();
          handleMoreIconClick();
        },
        onBlur: function onBlur() {
          handleMoreIconBlur();
        }
      }, React__default.createElement(index.Icon, {
        width: "24px",
        height: "24px",
        type: index.IconTypes.EMOJI_REACTIONS_ADD,
        fillColor: index.IconColors.CONTENT_INVERSE
      }));
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(MemoizedEmojiListItems, {
        parentRef: parentRefReactions,
        parentContainRef: parentContainRef,
        closeDropdown: closeDropdown,
        message: message,
        spaceFromTrigger: {
          y: 2
        }
      });
    }
  }), React__default.createElement(index.ContextMenu, {
    menuTrigger: function menuTrigger(toggleDropdown) {
      return React__default.createElement(index.IconButton, {
        ref: parentRefMenus,
        width: "32px",
        height: "32px",
        onClick: function onClick() {
          toggleDropdown();
          handleMoreIconClick();
        },
        onBlur: function onBlur() {
          handleMoreIconBlur();
        }
      }, React__default.createElement(index.Icon, {
        width: "24px",
        height: "24px",
        type: index.IconTypes.MORE,
        fillColor: index.IconColors.CONTENT_INVERSE
      }));
    },
    menuItems: function menuItems(closeDropdown) {
      return React__default.createElement(index.MenuItems, {
        parentRef: parentRefMenus,
        parentContainRef: parentContainRef,
        closeDropdown: closeDropdown
      }, React__default.createElement(index.MenuItem, {
        className: "".concat(INCOMING_OG_MESSAGE, "__more__menu__copy"),
        onClick: function onClick() {
          copyToClipboard(message.message);
          closeDropdown();
        }
      }, stringSet.CONTEXT_MENU_DROPDOWN__COPY));
    }
  })))));
}

var noop$3 = function noop() {};

OGMessageSwitch.propTypes = {
  isByMe: PropTypes.bool.isRequired,
  userId: PropTypes.string.isRequired,
  message: PropTypes.shape({
    message: PropTypes.string,
    sender: PropTypes.shape({}),
    ogMetaData: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      url: PropTypes.string,
      defaultImage: PropTypes.shape({
        url: PropTypes.string,
        alt: PropTypes.string
      })
    }),
    reactions: PropTypes.array,
    updatedAt: PropTypes.number
  }).isRequired,
  useReaction: PropTypes.bool.isRequired,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  status: PropTypes.string,
  disabled: PropTypes.bool,
  showEdit: PropTypes.func,
  showRemove: PropTypes.func,
  resendMessage: PropTypes.func,
  toggleReaction: PropTypes.func,
  membersMap: PropTypes.instanceOf(Map),
  emojiAllMap: PropTypes.instanceOf(Map),
  memoizedEmojiListItems: PropTypes.func,
  chainTop: PropTypes.bool,
  chainBottom: PropTypes.bool
};
OGMessageSwitch.defaultProps = {
  className: '',
  status: '',
  disabled: false,
  showEdit: noop$3,
  showRemove: noop$3,
  resendMessage: noop$3,
  toggleReaction: noop$3,
  membersMap: new Map(),
  emojiAllMap: new Map(),
  memoizedEmojiListItems: noop$3,
  chainTop: false,
  chainBottom: false
};
OutgoingOGMessage.propTypes = {
  status: PropTypes.string,
  userId: PropTypes.string.isRequired,
  message: PropTypes.shape({
    message: PropTypes.string,
    ogMetaData: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      url: PropTypes.string,
      defaultImage: PropTypes.shape({
        url: PropTypes.string,
        alt: PropTypes.string
      })
    }),
    reactions: PropTypes.array,
    updatedAt: PropTypes.number,
    isResendable: PropTypes.func,
    errorCode: PropTypes.number
  }).isRequired,
  disabled: PropTypes.bool.isRequired,
  openLink: PropTypes.func.isRequired,
  showEdit: PropTypes.func.isRequired,
  showRemove: PropTypes.func.isRequired,
  membersMap: PropTypes.instanceOf(Map).isRequired,
  emojiAllMap: PropTypes.instanceOf(Map).isRequired,
  useReaction: PropTypes.bool.isRequired,
  resendMessage: PropTypes.func.isRequired,
  toggleReaction: PropTypes.func.isRequired,
  memoizedMessageText: PropTypes.func.isRequired,
  memoizedEmojiListItems: PropTypes.func.isRequired,
  chainTop: PropTypes.bool.isRequired,
  chainBottom: PropTypes.bool.isRequired
};
OutgoingOGMessage.defaultProps = {
  status: ''
};
IncomingOGMessage.propTypes = {
  userId: PropTypes.string.isRequired,
  message: PropTypes.shape({
    message: PropTypes.string,
    sender: PropTypes.shape({}),
    ogMetaData: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      url: PropTypes.string,
      defaultImage: PropTypes.shape({
        url: PropTypes.string,
        alt: PropTypes.string
      })
    }),
    reactions: PropTypes.array,
    updatedAt: PropTypes.number
  }).isRequired,
  openLink: PropTypes.func.isRequired,
  membersMap: PropTypes.instanceOf(Map).isRequired,
  emojiAllMap: PropTypes.instanceOf(Map).isRequired,
  useReaction: PropTypes.bool.isRequired,
  toggleReaction: PropTypes.func.isRequired,
  memoizedMessageText: PropTypes.func.isRequired,
  memoizedEmojiListItems: PropTypes.func.isRequired,
  chainTop: PropTypes.bool.isRequired,
  chainBottom: PropTypes.bool.isRequired
};

function MessageHoc(_ref) {
  var _MessageTypes$ADMIN$M;

  var message = _ref.message,
      userId = _ref.userId,
      disabled = _ref.disabled,
      editDisabled = _ref.editDisabled,
      hasSeperator = _ref.hasSeperator,
      deleteMessage = _ref.deleteMessage,
      updateMessage = _ref.updateMessage,
      status = _ref.status,
      resendMessage = _ref.resendMessage,
      useReaction = _ref.useReaction,
      chainTop = _ref.chainTop,
      chainBottom = _ref.chainBottom,
      emojiAllMap = _ref.emojiAllMap,
      membersMap = _ref.membersMap,
      toggleReaction = _ref.toggleReaction,
      memoizedEmojiListItems = _ref.memoizedEmojiListItems,
      renderCustomMessage = _ref.renderCustomMessage,
      currentGroupChannel = _ref.currentGroupChannel;
  var _message$sender = message.sender,
      sender = _message$sender === void 0 ? {} : _message$sender;

  var _useState = React.useState(false),
      _useState2 = LocalizationContext._slicedToArray(_useState, 2),
      showEdit = _useState2[0],
      setShowEdit = _useState2[1];

  var _useState3 = React.useState(false),
      _useState4 = LocalizationContext._slicedToArray(_useState3, 2),
      showRemove = _useState4[0],
      setShowRemove = _useState4[1];

  var _useState5 = React.useState(false),
      _useState6 = LocalizationContext._slicedToArray(_useState5, 2),
      showFileViewer = _useState6[0],
      setShowFileViewer = _useState6[1];

  var editMessageInputRef = React.useRef(null);
  var RenderedMessage = React.useMemo(function () {
    if (renderCustomMessage) {
      return renderCustomMessage(message, currentGroupChannel);
    }

    return null;
  }, [message, message.message, renderCustomMessage]);
  var isByMe = userId === sender.userId || message.requestState === 'pending' || message.requestState === 'failed';

  if (RenderedMessage) {
    return React__default.createElement("div", {
      className: "sendbird-msg-hoc sendbird-msg--scroll-ref"
    }, hasSeperator && React__default.createElement(index$2.DateSeparator, null, React__default.createElement(index.Label, {
      type: index.LabelTypography.CAPTION_2,
      color: index.LabelColors.ONBACKGROUND_2
    }, format(message.createdAt, 'MMMM dd, yyyy'))), React__default.createElement(RenderedMessage, {
      message: message
    }));
  }

  if (showEdit) {
    return React__default.createElement(index$2.MessageInput, {
      isEdit: true,
      disabled: editDisabled,
      ref: editMessageInputRef,
      name: message.messageId,
      onSendMessage: updateMessage,
      onCancelEdit: function onCancelEdit() {
        setShowEdit(false);
      },
      value: message.message
    });
  }

  return React__default.createElement("div", {
    className: "sendbird-msg-hoc sendbird-msg--scroll-ref"
  }, hasSeperator && React__default.createElement(index$2.DateSeparator, null, React__default.createElement(index.Label, {
    type: index.LabelTypography.CAPTION_2,
    color: index.LabelColors.ONBACKGROUND_2
  }, format(message.createdAt, 'MMMM dd, yyyy'))), (_MessageTypes$ADMIN$M = {}, LocalizationContext._defineProperty(_MessageTypes$ADMIN$M, MessageTypes.ADMIN, React__default.createElement(AdminMessage, {
    message: message
  })), LocalizationContext._defineProperty(_MessageTypes$ADMIN$M, MessageTypes.FILE, React__default.createElement(MessageSwitch, {
    message: message,
    userId: userId,
    disabled: disabled,
    isByMe: isByMe,
    showRemove: setShowRemove,
    resendMessage: resendMessage,
    status: status,
    useReaction: useReaction,
    emojiAllMap: emojiAllMap,
    membersMap: membersMap,
    toggleReaction: toggleReaction,
    memoizedEmojiListItems: memoizedEmojiListItems,
    chainTop: chainTop,
    chainBottom: chainBottom
  })), LocalizationContext._defineProperty(_MessageTypes$ADMIN$M, MessageTypes.OG, React__default.createElement(OGMessageSwitch, {
    message: message,
    status: status,
    isByMe: isByMe,
    userId: userId,
    showEdit: setShowEdit,
    disabled: disabled,
    showRemove: setShowRemove,
    resendMessage: resendMessage,
    useReaction: useReaction,
    emojiAllMap: emojiAllMap,
    membersMap: membersMap,
    toggleReaction: toggleReaction,
    memoizedEmojiListItems: memoizedEmojiListItems,
    chainTop: chainTop,
    chainBottom: chainBottom
  })), LocalizationContext._defineProperty(_MessageTypes$ADMIN$M, MessageTypes.THUMBNAIL, React__default.createElement(ThumbnailMessage, {
    disabled: disabled,
    message: message,
    userId: userId,
    isByMe: isByMe,
    showRemove: setShowRemove,
    resendMessage: resendMessage,
    onClick: setShowFileViewer,
    status: status,
    useReaction: useReaction,
    emojiAllMap: emojiAllMap,
    membersMap: membersMap,
    toggleReaction: toggleReaction,
    memoizedEmojiListItems: memoizedEmojiListItems,
    chainTop: chainTop,
    chainBottom: chainBottom
  })), LocalizationContext._defineProperty(_MessageTypes$ADMIN$M, MessageTypes.USER, React__default.createElement(Message, {
    message: message,
    disabled: disabled,
    isByMe: isByMe,
    userId: userId,
    showEdit: setShowEdit,
    showRemove: setShowRemove,
    resendMessage: resendMessage,
    status: status,
    useReaction: useReaction,
    emojiAllMap: emojiAllMap,
    membersMap: membersMap,
    toggleReaction: toggleReaction,
    memoizedEmojiListItems: memoizedEmojiListItems,
    chainTop: chainTop,
    chainBottom: chainBottom
  })), _MessageTypes$ADMIN$M)[getMessageType(message)], showRemove && React__default.createElement(RemoveMessage, {
    onCloseModal: function onCloseModal() {
      return setShowRemove(false);
    },
    onDeleteMessage: function onDeleteMessage() {
      deleteMessage(message);
    }
  }), showFileViewer && React__default.createElement(index$2.FileViewer, {
    onClose: function onClose() {
      return setShowFileViewer(false);
    },
    message: message,
    onDelete: function onDelete() {
      deleteMessage(message, function () {
        setShowFileViewer(false);
      });
    },
    isByMe: isByMe
  }), !(message.isFileMessage && message.isFileMessage() || message.messageType === 'file') && !(message.isAdminMessage && message.isAdminMessage()) && !(message.isUserMessage && message.isUserMessage() || message.messageType === 'user') && !showFileViewer && React__default.createElement(UnknownMessage, {
    message: message,
    status: status,
    isByMe: isByMe,
    showRemove: setShowRemove,
    chainTop: chainTop,
    chainBottom: chainBottom
  }));
}
MessageHoc.propTypes = {
  userId: PropTypes.string,
  message: PropTypes.shape({
    isFileMessage: PropTypes.func,
    isAdminMessage: PropTypes.func,
    isUserMessage: PropTypes.func,
    isDateSeperator: PropTypes.func,
    // should be a number, but there's a bug in SDK shich returns string
    messageId: PropTypes.number,
    type: PropTypes.string,
    createdAt: PropTypes.number,
    message: PropTypes.string,
    requestState: PropTypes.string,
    messageType: PropTypes.string,
    sender: PropTypes.shape({
      userId: PropTypes.string
    }),
    ogMetaData: PropTypes.shape({})
  }),
  renderCustomMessage: PropTypes.func,
  currentGroupChannel: PropTypes.shape,
  hasSeperator: PropTypes.bool,
  disabled: PropTypes.bool,
  editDisabled: PropTypes.bool,
  deleteMessage: PropTypes.func.isRequired,
  updateMessage: PropTypes.func.isRequired,
  resendMessage: PropTypes.func.isRequired,
  status: PropTypes.string,
  useReaction: PropTypes.bool.isRequired,
  chainTop: PropTypes.bool.isRequired,
  chainBottom: PropTypes.bool.isRequired,
  emojiAllMap: PropTypes.instanceOf(Map).isRequired,
  membersMap: PropTypes.instanceOf(Map).isRequired,
  toggleReaction: PropTypes.func,
  memoizedEmojiListItems: PropTypes.func
};
MessageHoc.defaultProps = {
  userId: '',
  editDisabled: false,
  renderCustomMessage: null,
  currentGroupChannel: {},
  message: {},
  hasSeperator: false,
  disabled: false,
  status: '',
  toggleReaction: function toggleReaction() {},
  memoizedEmojiListItems: function memoizedEmojiListItems() {
    return '';
  }
};

var ConversationScroll =
/*#__PURE__*/
function (_Component) {
  LocalizationContext._inherits(ConversationScroll, _Component);

  function ConversationScroll() {
    var _getPrototypeOf2;

    var _this;

    LocalizationContext._classCallCheck(this, ConversationScroll);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = LocalizationContext._possibleConstructorReturn(this, (_getPrototypeOf2 = LocalizationContext._getPrototypeOf(ConversationScroll)).call.apply(_getPrototypeOf2, [this].concat(args)));

    LocalizationContext._defineProperty(LocalizationContext._assertThisInitialized(_this), "onScroll", function (e) {
      var _this$props = _this.props,
          scrollRef = _this$props.scrollRef,
          hasMore = _this$props.hasMore,
          messagesDispatcher = _this$props.messagesDispatcher,
          onScroll = _this$props.onScroll,
          currentGroupChannel = _this$props.currentGroupChannel;
      var element = e.target;
      var scrollTop = element.scrollTop,
          clientHeight = element.clientHeight,
          scrollHeight = element.scrollHeight;

      if (scrollTop === 0) {
        if (!hasMore) {
          return;
        }

        var nodes = scrollRef.current.querySelectorAll('.sendbird-msg--scroll-ref');
        var first = nodes && nodes[0];
        onScroll(function (_ref) {
          var _ref2 = LocalizationContext._slicedToArray(_ref, 1),
              messages = _ref2[0];

          if (messages) {
            // https://github.com/scabbiaza/react-scroll-position-on-updating-dom
            try {
              first.scrollIntoView();
            } catch (error) {//
            }
          }
        });
      }

      setTimeout(function () {
        // mark as read if scroll is at end
        if (clientHeight + scrollTop === scrollHeight) {
          messagesDispatcher({
            type: MARK_AS_READ
          });
          currentGroupChannel.markAsRead();
        }
      }, 500);
    });

    return _this;
  }

  LocalizationContext._createClass(ConversationScroll, [{
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          userId = _this$props2.userId,
          disabled = _this$props2.disabled,
          scrollRef = _this$props2.scrollRef,
          readStatus = _this$props2.readStatus,
          membersMap = _this$props2.membersMap,
          initialized = _this$props2.initialized,
          allMessages = _this$props2.allMessages,
          useReaction = _this$props2.useReaction,
          emojiAllMap = _this$props2.emojiAllMap,
          editDisabled = _this$props2.editDisabled,
          deleteMessage = _this$props2.deleteMessage,
          updateMessage = _this$props2.updateMessage,
          resendMessage = _this$props2.resendMessage,
          renderCustomMessage = _this$props2.renderCustomMessage,
          renderChatItem = _this$props2.renderChatItem,
          emojiContainer = _this$props2.emojiContainer,
          toggleReaction = _this$props2.toggleReaction,
          useMessageGrouping = _this$props2.useMessageGrouping,
          currentGroupChannel = _this$props2.currentGroupChannel,
          memoizedEmojiListItems = _this$props2.memoizedEmojiListItems;
      return React__default.createElement("div", {
        className: "sendbird-conversation__messages"
      }, React__default.createElement("div", {
        ref: scrollRef,
        className: "sendbird-conversation__scroll-container",
        onScroll: this.onScroll
      }, React__default.createElement("div", {
        className: "sendbird-conversation__padding"
      }), React__default.createElement("div", {
        className: "sendbird-conversation__messages-padding"
      }, initialized && allMessages.map(function (m, idx) {
        var previousMessage = allMessages[idx - 1];
        var nextMessage = allMessages[idx + 1];

        var _ref3 = useMessageGrouping ? compareMessagesForGrouping(previousMessage, m, nextMessage) : [false, false],
            _ref4 = LocalizationContext._slicedToArray(_ref3, 2),
            chainTop = _ref4[0],
            chainBottom = _ref4[1];

        var previousMessageCreatedAt = previousMessage && previousMessage.createdAt;
        var currentCreatedAt = m.createdAt; // https://stackoverflow.com/a/41855608

        var hasSeperator = !(previousMessageCreatedAt && isSameDay(currentCreatedAt, previousMessageCreatedAt));

        if (renderChatItem) {
          return React__default.createElement("div", {
            key: m.messageId || m.reqId,
            className: "sendbird-msg--scroll-ref"
          }, renderChatItem({
            message: m,
            channel: currentGroupChannel,
            onDeleteMessage: deleteMessage,
            onUpdateMessage: updateMessage,
            onResendMessage: resendMessage,
            emojiContainer: emojiContainer
          }));
        }

        return React__default.createElement(MessageHoc, {
          renderCustomMessage: renderCustomMessage,
          key: m.messageId || m.reqId,
          userId: userId,
          status: readStatus[m.messageId] || getParsedStatus(m, currentGroupChannel) // show status for pending/failed messages
          ,
          message: m,
          currentGroupChannel: currentGroupChannel,
          disabled: disabled,
          membersMap: membersMap,
          chainTop: chainTop,
          useReaction: useReaction,
          emojiAllMap: emojiAllMap,
          editDisabled: editDisabled,
          hasSeperator: hasSeperator,
          chainBottom: chainBottom,
          updateMessage: updateMessage,
          deleteMessage: deleteMessage,
          resendMessage: resendMessage,
          toggleReaction: toggleReaction,
          memoizedEmojiListItems: memoizedEmojiListItems
        });
      }))));
    }
  }]);

  return ConversationScroll;
}(React.Component);
ConversationScroll.propTypes = {
  // https://stackoverflow.com/a/52646941
  scrollRef: PropTypes.shape({
    current: PropTypes.oneOfType([PropTypes.element, PropTypes.shape({})])
  }).isRequired,
  hasMore: PropTypes.bool,
  messagesDispatcher: PropTypes.func.isRequired,
  onScroll: PropTypes.func,
  initialized: PropTypes.bool,
  editDisabled: PropTypes.bool,
  disabled: PropTypes.bool,
  userId: PropTypes.string,
  allMessages: PropTypes.arrayOf(PropTypes.shape({
    createdAt: PropTypes.number
  })).isRequired,
  deleteMessage: PropTypes.func.isRequired,
  resendMessage: PropTypes.func.isRequired,
  updateMessage: PropTypes.func.isRequired,
  readStatus: PropTypes.shape({}).isRequired,
  currentGroupChannel: PropTypes.shape({
    markAsRead: PropTypes.func,
    members: PropTypes.arrayOf(PropTypes.shape({}))
  }).isRequired,
  renderChatItem: PropTypes.element,
  renderCustomMessage: PropTypes.func,
  useReaction: PropTypes.bool,
  emojiContainer: PropTypes.shape({}),
  emojiAllMap: PropTypes.instanceOf(Map),
  membersMap: PropTypes.instanceOf(Map),
  useMessageGrouping: PropTypes.bool,
  toggleReaction: PropTypes.func,
  memoizedEmojiListItems: PropTypes.func
};
ConversationScroll.defaultProps = {
  hasMore: false,
  editDisabled: false,
  disabled: false,
  initialized: false,
  userId: '',
  renderCustomMessage: null,
  renderChatItem: null,
  onScroll: null,
  useReaction: true,
  emojiContainer: {},
  emojiAllMap: new Map(),
  membersMap: new Map(),
  useMessageGrouping: true,
  toggleReaction: function toggleReaction() {},
  memoizedEmojiListItems: function memoizedEmojiListItems() {
    return '';
  }
};

function Notification(_ref) {
  var count = _ref.count,
      time = _ref.time,
      onClick = _ref.onClick;

  var _useContext = React.useContext(LocalizationContext.LocalizationContext),
      stringSet = _useContext.stringSet;

  var timeArray = time.split(' ');
  timeArray.splice(-2, 0, stringSet.CHANNEL__MESSAGE_LIST__NOTIFICATION__ON);
  return (// eslint-disable-next-line
    React__default.createElement("div", {
      className: "sendbird-notification",
      onClick: onClick
    }, React__default.createElement(index.Label, {
      className: "sendbird-notification__text",
      color: index.LabelColors.ONCONTENT_1,
      type: index.LabelTypography.CAPTION_2
    }, "".concat(count, " "), stringSet.CHANNEL__MESSAGE_LIST__NOTIFICATION__NEW_MESSAGE, " ".concat(timeArray.join(' '))), React__default.createElement(index.Icon, {
      width: "24px",
      height: "24px",
      type: index.IconTypes.SHEVRON_DOWN,
      fillColor: index.IconColors.CONTENT
    }))
  );
}
Notification.propTypes = {
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  time: PropTypes.string,
  onClick: PropTypes.func.isRequired
};
Notification.defaultProps = {
  count: 0,
  time: ''
};

var FrozenNotification = function FrozenNotification() {
  var stringSet = React.useContext(LocalizationContext.LocalizationContext).stringSet;
  return React__default.createElement("div", {
    className: "sendbird-notification sendbird-notification--frozen"
  }, React__default.createElement(index.Label, {
    className: "sendbird-notification__text",
    type: index.LabelTypography.CAPTION_2
  }, stringSet.CHANNEL_FROZEN));
};

var TypingIndicatorText = function TypingIndicatorText(_ref) {
  var members = _ref.members;

  var _useContext = React.useContext(LocalizationContext.LocalizationContext),
      stringSet = _useContext.stringSet;

  if (!members || members.length === 0) {
    return '';
  }

  if (members && members.length === 1) {
    return "".concat(members[0].nickname, " ").concat(stringSet.TYPING_INDICATOR__IS_TYPING);
  }

  if (members && members.length === 2) {
    return "".concat(members[0].nickname, " ").concat(stringSet.TYPING_INDICATOR__AND, " ").concat(members[1].nickname, " ").concat(stringSet.TYPING_INDICATOR__ARE_TYPING);
  }

  return stringSet.TYPING_INDICATOR__MULTIPLE_TYPING;
};

function TypingIndicator(_ref2) {
  var channelUrl = _ref2.channelUrl,
      sb = _ref2.sb,
      logger = _ref2.logger;

  var _useState = React.useState(LocalizationContext.uuidv4$1()),
      _useState2 = LocalizationContext._slicedToArray(_useState, 2),
      handlerId = _useState2[0],
      setHandlerId = _useState2[1];

  var _useState3 = React.useState([]),
      _useState4 = LocalizationContext._slicedToArray(_useState3, 2),
      typingMembers = _useState4[0],
      setTypingMembers = _useState4[1];

  React.useEffect(function () {
    if (sb && sb.ChannelHandler) {
      sb.removeChannelHandler(handlerId);
      var newHandlerId = LocalizationContext.uuidv4$1();
      var handler = new sb.ChannelHandler(); // there is a possible warning in here - setState called after unmount

      handler.onTypingStatusUpdated = function (groupChannel) {
        logger.info('Channel > Typing Indicator: onTypingStatusUpdated', groupChannel);
        var members = groupChannel.getTypingMembers();

        if (groupChannel.url === channelUrl) {
          setTypingMembers(members);
        }
      };

      sb.addChannelHandler(newHandlerId, handler);
      setHandlerId(newHandlerId);
    }

    return function () {
      setTypingMembers([]);

      if (sb && sb.removeChannelHandler) {
        sb.removeChannelHandler(handlerId);
      }
    };
  }, [channelUrl]);
  return React__default.createElement(index.Label, {
    type: index.LabelTypography.CAPTION_2,
    color: index.LabelColors.ONBACKGROUND_2
  }, React__default.createElement(TypingIndicatorText, {
    members: typingMembers
  }));
}

TypingIndicator.propTypes = {
  channelUrl: PropTypes.string.isRequired,
  sb: PropTypes.shape({
    ChannelHandler: PropTypes.func,
    removeChannelHandler: PropTypes.func,
    addChannelHandler: PropTypes.func
  }).isRequired,
  logger: PropTypes.shape({
    info: PropTypes.func
  }).isRequired
};

// Logic required to handle message input rendering

var MessageInputWrapper = function MessageInputWrapper(_a, ref) {
  var channel = _a.channel,
      user = _a.user,
      onSendMessage = _a.onSendMessage,
      onFileUpload = _a.onFileUpload,
      renderMessageInput = _a.renderMessageInput,
      isOnline = _a.isOnline,
      initialized = _a.initialized;
  var stringSet = React.useContext(LocalizationContext.LocalizationContext).stringSet;
  var disabled = !initialized || isDisabledBecauseFrozen(channel) || isDisabledBecauseMuted(channel) || !isOnline;
  var isOperator$1 = isOperator(channel);
  var isBroadcast = channel.isBroadcast; // custom message

  if (renderMessageInput) {
    return renderMessageInput({
      channel: channel,
      user: user,
      disabled: disabled
    });
  } // broadcast channel + not operator


  if (isBroadcast && !isOperator$1) {
    return null;
  } // other conditions


  return React__default.createElement(index$2.MessageInput, {
    placeholder: isDisabledBecauseFrozen(channel) && stringSet.CHANNEL__MESSAGE_INPUT__PLACE_HOLDER__DISABLED || isDisabledBecauseMuted(channel) && stringSet.CHANNEL__MESSAGE_INPUT__PLACE_HOLDER__MUTED,
    ref: ref,
    disabled: disabled,
    onStartTyping: function onStartTyping() {
      channel.startTyping();
    },
    onSendMessage: onSendMessage,
    onFileUpload: onFileUpload
  });
};

var MessageInputWrapper$1 = React__default.forwardRef(MessageInputWrapper);

function ConnectionStatus() {
  var _useContext = React.useContext(LocalizationContext.LocalizationContext),
      stringSet = _useContext.stringSet;

  return React__default.createElement("div", {
    className: "sendbird-conversation__connection-status"
  }, React__default.createElement(index.Label, {
    type: index.LabelTypography.BODY_2,
    color: index.LabelColors.ONBACKGROUND_2
  }, stringSet.TRYING_TO_CONNECT), React__default.createElement(index.Icon, {
    type: index.IconTypes.DISCONNECTED,
    fillColor: index.IconColors.SENT,
    height: "14px",
    width: "14px"
  }));
}

var prettyDate = function prettyDate(date) {
  return formatDistanceToNowStrict(date, {
    addSuffix: true
  });
};
var getOthersLastSeenAt = function getOthersLastSeenAt(channel) {
  if (!channel || !channel.getReadStatus || !channel.members || channel.members.length !== 2) {
    return '';
  }

  var lastSeenList = LocalizationContext._toConsumableArray(Object.values(channel.getReadStatus()));

  var lastSeenAt = lastSeenList.length > 0 ? lastSeenList[0].last_seen_at : 0;

  if (lastSeenAt === 0) {
    return '';
  }

  return prettyDate(lastSeenAt);
};
var getChannelTitle = function getChannelTitle() {
  var channel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var currentUserId = arguments.length > 1 ? arguments[1] : undefined;
  var stringSet = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : index.LabelStringSet;

  if (!channel || !channel.name && !channel.members) {
    return stringSet.NO_TITLE;
  }

  if (channel.name && channel.name !== 'Group Channel') {
    return channel.name;
  }

  if (channel.members.length === 1) {
    return stringSet.NO_MEMBERS;
  }

  return channel.members.filter(function (_ref) {
    var userId = _ref.userId;
    return userId !== currentUserId;
  }).map(function (_ref2) {
    var nickname = _ref2.nickname;
    return nickname || stringSet.NO_NAME;
  }).join(', ');
};

function AutoRefresh(_ref) {
  var repeatFunc = _ref.repeatFunc;

  var _useState = React.useState(repeatFunc()),
      _useState2 = LocalizationContext._slicedToArray(_useState, 2),
      label = _useState2[0],
      setLabel = _useState2[1];

  React.useEffect(function () {
    var interval = setInterval(function () {
      if (label !== repeatFunc()) {
        setLabel(repeatFunc());
      }
    }, 10000);
    return function () {
      clearInterval(interval);
    };
  }, []);
  return React__default.createElement("div", {
    className: "sendbird-repeat-text"
  }, label);
}
AutoRefresh.propTypes = {
  repeatFunc: PropTypes.func.isRequired
};

function ChatHeader(props) {
  var currentGroupChannel = props.currentGroupChannel,
      currentUser = props.currentUser,
      title = props.title,
      subTitle = props.subTitle,
      isActive = props.isActive,
      isMuted = props.isMuted,
      onActionClick = props.onActionClick,
      theme = props.theme;
  var userId = currentUser.userId;

  var _useContext = React.useContext(LocalizationContext.LocalizationContext),
      stringSet = _useContext.stringSet;

  return React__default.createElement("div", {
    className: "sendbird-chat-header"
  }, React__default.createElement("div", {
    className: "sendbird-chat-header__left"
  }, React__default.createElement(index$1.ChannelAvatar, {
    theme: theme,
    channel: currentGroupChannel,
    userId: userId,
    height: 32,
    width: 32
  }), React__default.createElement(index.Label, {
    className: "sendbird-chat-header__title",
    type: index.LabelTypography.H_2,
    color: index.LabelColors.ONBACKGROUND_1
  }, title || getChannelTitle(currentGroupChannel, userId, stringSet)), typeof isActive === 'string' && isActive === 'true' || typeof isActive === 'boolean' && isActive ? React__default.createElement("div", {
    className: "sendbird-chat-header__active"
  }) : null, React__default.createElement(index.Label, {
    className: "sendbird-chat-header__subtitle",
    type: index.LabelTypography.BODY_1,
    color: index.LabelColors.ONBACKGROUND_2
  }, subTitle || React__default.createElement(AutoRefresh, {
    repeatFunc: function repeatFunc() {
      return getOthersLastSeenAt(currentGroupChannel);
    }
  }))), React__default.createElement("div", {
    className: "sendbird-chat-header__right"
  }, typeof isMuted === 'string' && isMuted === 'true' || typeof isMuted === 'boolean' && isMuted ? React__default.createElement(index.Icon, {
    className: "sendbird-chat-header__mute",
    type: index.IconTypes.MUTE,
    width: "24px",
    height: "24px"
  }) : null, React__default.createElement(index.IconButton, {
    className: "sendbird-chat-header__info",
    width: "32px",
    height: "32px",
    onClick: onActionClick
  }, React__default.createElement(index.Icon, {
    type: index.IconTypes.INFO,
    fillColor: index.IconColors.PRIMARY,
    width: "24px",
    height: "24px"
  }))));
}
ChatHeader.propTypes = {
  currentGroupChannel: PropTypes.shape({
    members: PropTypes.arrayOf(PropTypes.shape({})),
    coverUrl: PropTypes.string
  }),
  theme: PropTypes.string,
  currentUser: PropTypes.shape({
    userId: PropTypes.string
  }),
  title: PropTypes.string,
  subTitle: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  isActive: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  isMuted: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  onActionClick: PropTypes.func
};
ChatHeader.defaultProps = {
  currentGroupChannel: {},
  title: '',
  theme: 'light',
  subTitle: '',
  isActive: false,
  isMuted: false,
  currentUser: {},
  onActionClick: function onActionClick() {}
};

var noop$4 = function noop() {};

var ConversationPanel = function ConversationPanel(props) {
  var channelUrl = props.channelUrl,
      _props$stores = props.stores,
      sdkStore = _props$stores.sdkStore,
      userStore = _props$stores.userStore,
      _props$config = props.config,
      userId = _props$config.userId,
      logger = _props$config.logger,
      pubSub = _props$config.pubSub,
      isOnline = _props$config.isOnline,
      theme = _props$config.theme,
      reconnect = props.dispatchers.reconnect,
      _props$queries = props.queries,
      queries = _props$queries === void 0 ? {} : _props$queries,
      useReaction = props.useReaction,
      renderChatItem = props.renderChatItem,
      renderChatHeader = props.renderChatHeader,
      renderCustomMessage = props.renderCustomMessage,
      renderUserProfile = props.renderUserProfile,
      disableUserProfile = props.disableUserProfile,
      renderMessageInput = props.renderMessageInput,
      useMessageGrouping = props.useMessageGrouping,
      onChatHeaderActionClick = props.onChatHeaderActionClick,
      onBeforeSendUserMessage = props.onBeforeSendUserMessage,
      onBeforeSendFileMessage = props.onBeforeSendFileMessage,
      onBeforeUpdateUserMessage = props.onBeforeUpdateUserMessage;
  var sdk = sdkStore.sdk;
  var config = props.config;
  var sdkError = sdkStore.error;
  var sdkInit = sdkStore.initialized;
  var user = userStore.user;

  if (queries.messageListQuery) {
    // eslint-disable-next-line no-console
    console.warn('messageListQuery will be deprecared in v1.3.0, please use messageListParams instead');
  }

  var userFilledMessageListQuery = queries.messageListParams || queries.messageListQuery;

  var _useReducer = React.useReducer(reducer, messagesInitialState),
      _useReducer2 = LocalizationContext._slicedToArray(_useReducer, 2),
      messagesStore = _useReducer2[0],
      messagesDispatcher = _useReducer2[1];

  var scrollRef = React.useRef(null);
  var allMessages = messagesStore.allMessages,
      loading = messagesStore.loading,
      hasMore = messagesStore.hasMore,
      initialized = messagesStore.initialized,
      unreadCount = messagesStore.unreadCount,
      unreadSince = messagesStore.unreadSince,
      isInvalid = messagesStore.isInvalid,
      _messagesStore$curren = messagesStore.currentGroupChannel,
      currentGroupChannel = _messagesStore$curren === void 0 ? {} : _messagesStore$curren,
      lastMessageTimeStamp = messagesStore.lastMessageTimeStamp,
      emojiContainer = messagesStore.emojiContainer,
      readStatus = messagesStore.readStatus;
  var isFrozen = currentGroupChannel.isFrozen,
      isBroadcast = currentGroupChannel.isBroadcast;
  var _sdk$appInfo = sdk.appInfo,
      appInfo = _sdk$appInfo === void 0 ? {} : _sdk$appInfo;
  var usingReaction = appInfo.isUsingReaction && !isBroadcast || useReaction || false;
  var userDefinedDisableUserProfile = disableUserProfile || config.disableUserProfile;
  var userDefinedRenderProfile = renderUserProfile || config.renderUserProfile;
  var emojiAllMap = React.useMemo(function () {
    return usingReaction ? getAllEmojisMapFromEmojiContainer(emojiContainer) : new Map();
  }, [emojiContainer]);
  var emojiAllList = React.useMemo(function () {
    return usingReaction ? getAllEmojisFromEmojiContainer(emojiContainer) : [];
  }, [emojiContainer]);
  var nicknamesMap = React.useMemo(function () {
    return usingReaction ? getNicknamesMapFromMembers(currentGroupChannel.members) : new Map();
  }, [currentGroupChannel.members]);
  var onScrollCallback = useScrollCallback({
    currentGroupChannel: currentGroupChannel,
    lastMessageTimeStamp: lastMessageTimeStamp,
    userFilledMessageListQuery: userFilledMessageListQuery
  }, {
    hasMore: hasMore,
    logger: logger,
    messagesDispatcher: messagesDispatcher,
    sdk: sdk
  });
  var toggleReaction = useToggleReactionCallback({
    currentGroupChannel: currentGroupChannel
  }, {
    logger: logger
  });
  var memoizedEmojiListItems = useMemoizedEmojiListItems({
    emojiContainer: emojiContainer,
    toggleReaction: toggleReaction
  }, {
    useReaction: usingReaction,
    logger: logger,
    userId: userId,
    emojiAllList: emojiAllList
  }); // to create message-datasource

  useSetChannel({
    channelUrl: channelUrl,
    sdkInit: sdkInit
  }, {
    messagesDispatcher: messagesDispatcher,
    sdk: sdk,
    logger: logger
  }); // Hook to handle ChannelEvents and send values to useReducer using messagesDispatcher

  useHandleChannelEvents({
    currentGroupChannel: currentGroupChannel,
    sdkInit: sdkInit,
    userId: userId
  }, {
    messagesDispatcher: messagesDispatcher,
    sdk: sdk,
    logger: logger
  });
  useInitialMessagesFetch({
    currentGroupChannel: currentGroupChannel,
    userFilledMessageListQuery: userFilledMessageListQuery
  }, {
    sdk: sdk,
    logger: logger,
    messagesDispatcher: messagesDispatcher
  }); // handles API calls from withSendbird

  React.useEffect(function () {
    var subScriber = pubSubHandler(channelUrl, pubSub, messagesDispatcher);
    return function () {
      pubSubHandleRemover(subScriber);
    };
  }, [channelUrl, sdkInit]); // to create initial read status

  useSetReadStatus({
    allMessages: allMessages,
    currentGroupChannel: currentGroupChannel
  }, {
    messagesDispatcher: messagesDispatcher,
    sdk: sdk,
    logger: logger
  }); // handling connection breaks

  useHandleReconnect({
    isOnline: isOnline
  }, {
    logger: logger,
    sdk: sdk,
    currentGroupChannel: currentGroupChannel,
    messagesDispatcher: messagesDispatcher,
    userFilledMessageListQuery: userFilledMessageListQuery
  });
  var deleteMessage = useDeleteMessageCallback({
    currentGroupChannel: currentGroupChannel,
    messagesDispatcher: messagesDispatcher
  }, {
    logger: logger
  });
  var updateMessage = useUpdateMessageCallback({
    currentGroupChannel: currentGroupChannel,
    messagesDispatcher: messagesDispatcher,
    onBeforeUpdateUserMessage: onBeforeUpdateUserMessage
  }, {
    logger: logger,
    sdk: sdk,
    pubSub: pubSub
  });
  var resendMessage = useResendMessageCallback({
    currentGroupChannel: currentGroupChannel,
    messagesDispatcher: messagesDispatcher
  }, {
    logger: logger
  });

  var _useSendMessageCallba = useSendMessageCallback({
    currentGroupChannel: currentGroupChannel,
    onBeforeSendUserMessage: onBeforeSendUserMessage
  }, {
    sdk: sdk,
    logger: logger,
    pubSub: pubSub,
    messagesDispatcher: messagesDispatcher
  }),
      _useSendMessageCallba2 = LocalizationContext._slicedToArray(_useSendMessageCallba, 2),
      messageInputRef = _useSendMessageCallba2[0],
      onSendMessage = _useSendMessageCallba2[1];

  var _useSendFileMessageCa = useSendFileMessageCallback({
    currentGroupChannel: currentGroupChannel,
    onBeforeSendFileMessage: onBeforeSendFileMessage
  }, {
    sdk: sdk,
    logger: logger,
    pubSub: pubSub,
    messagesDispatcher: messagesDispatcher
  }),
      _useSendFileMessageCa2 = LocalizationContext._slicedToArray(_useSendFileMessageCa, 1),
      onSendFileMessage = _useSendFileMessageCa2[0];

  if (sdkError) {
    return React__default.createElement("div", {
      className: "sendbird-conversation"
    }, React__default.createElement(index.PlaceHolder, {
      type: index.PlaceHolderTypes$1.WRONG,
      retryToConnect: function retryToConnect() {
        logger.info('Channel: reconnecting');
        reconnect();
      }
    }));
  }

  if (!channelUrl) {
    return React__default.createElement("div", {
      className: "sendbird-conversation"
    }, React__default.createElement(index.PlaceHolder, {
      type: index.PlaceHolderTypes$1.NO_CHANNELS
    }));
  }

  if (loading) {
    return React__default.createElement("div", {
      className: "sendbird-conversation"
    }, React__default.createElement(index.PlaceHolder, {
      type: index.PlaceHolderTypes$1.LOADING
    }));
  }

  if (isInvalid) {
    return React__default.createElement("div", {
      className: "sendbird-conversation"
    }, React__default.createElement(index.PlaceHolder, {
      type: index.PlaceHolderTypes$1.WRONG
    }));
  }

  return React__default.createElement(index.UserProfileProvider, {
    className: "sendbird-conversation",
    disableUserProfile: userDefinedDisableUserProfile,
    renderUserProfile: userDefinedRenderProfile
  }, renderChatHeader ? renderChatHeader({
    channel: currentGroupChannel,
    user: user
  }) : React__default.createElement(ChatHeader, {
    theme: theme,
    currentGroupChannel: currentGroupChannel,
    currentUser: user,
    onActionClick: onChatHeaderActionClick,
    subTitle: currentGroupChannel.members && currentGroupChannel.members.length !== 2,
    isActive: false,
    isMuted: false
  }), isFrozen && React__default.createElement(FrozenNotification, null), unreadCount > 0 && React__default.createElement(Notification, {
    count: unreadCount,
    onClick: function onClick() {
      scrollIntoLast('.sendbird-msg--scroll-ref'); // there is no scroll

      if (scrollRef.current.scrollTop === 0) {
        currentGroupChannel.markAsRead();
        messagesDispatcher({
          type: MARK_AS_READ
        });
      }
    },
    time: unreadSince
  }), React__default.createElement(ConversationScroll, {
    swapParams: sdk && sdk.getErrorFirstCallback && sdk.getErrorFirstCallback(),
    userId: userId,
    hasMore: hasMore,
    disabled: !isOnline,
    onScroll: onScrollCallback,
    scrollRef: scrollRef,
    readStatus: readStatus,
    initialized: initialized,
    useReaction: usingReaction,
    allMessages: allMessages,
    emojiAllMap: emojiAllMap,
    membersMap: nicknamesMap,
    editDisabled: isDisabledBecauseFrozen(currentGroupChannel),
    deleteMessage: deleteMessage,
    updateMessage: updateMessage,
    resendMessage: resendMessage,
    toggleReaction: toggleReaction,
    emojiContainer: emojiContainer,
    renderChatItem: renderChatItem,
    renderCustomMessage: renderCustomMessage,
    useMessageGrouping: useMessageGrouping,
    messagesDispatcher: messagesDispatcher,
    currentGroupChannel: currentGroupChannel,
    memoizedEmojiListItems: memoizedEmojiListItems
  }), React__default.createElement("div", {
    className: "sendbird-conversation__footer"
  }, React__default.createElement(MessageInputWrapper$1, {
    channel: currentGroupChannel,
    user: user,
    ref: messageInputRef,
    onSendMessage: onSendMessage,
    onFileUpload: onSendFileMessage,
    renderMessageInput: renderMessageInput,
    isOnline: isOnline,
    initialized: initialized
  }), React__default.createElement("div", {
    className: "sendbird-conversation__typing-indicator"
  }, React__default.createElement(TypingIndicator, {
    channelUrl: channelUrl,
    sb: sdk,
    logger: logger
  })), !isOnline && React__default.createElement(ConnectionStatus, {
    sdkInit: sdkInit,
    sb: sdk,
    logger: logger
  })));
};
ConversationPanel.propTypes = {
  channelUrl: PropTypes.string,
  stores: PropTypes.shape({
    sdkStore: PropTypes.shape({
      initialized: PropTypes.bool,
      sdk: PropTypes.shape({
        getErrorFirstCallback: PropTypes.func,
        removeChannelHandler: PropTypes.func,
        GroupChannel: PropTypes.any,
        ChannelHandler: PropTypes.any,
        addChannelHandler: PropTypes.func,
        UserMessageParams: PropTypes.any,
        FileMessageParams: PropTypes.any,
        getAllEmoji: PropTypes.func,
        appInfo: PropTypes.shape({})
      }),
      error: PropTypes.bool
    }),
    userStore: PropTypes.shape({
      user: PropTypes.shape({})
    })
  }).isRequired,
  dispatchers: PropTypes.shape({
    reconnect: PropTypes.func
  }).isRequired,
  config: PropTypes.shape({
    disableUserProfile: PropTypes.bool,
    renderUserProfile: PropTypes.func,
    userId: PropTypes.string.isRequired,
    isOnline: PropTypes.bool.isRequired,
    theme: PropTypes.string,
    logger: PropTypes.shape({
      info: PropTypes.func,
      error: PropTypes.func,
      warning: PropTypes.func
    }),
    pubSub: PropTypes.shape({
      subscribe: PropTypes.func,
      publish: PropTypes.func
    })
  }).isRequired,
  queries: PropTypes.shape({
    messageListParams: PropTypes.shape({
      includeMetaArray: PropTypes.bool,
      includeParentMessageText: PropTypes.bool,
      includeReaction: PropTypes.bool,
      includeReplies: PropTypes.bool,
      includeThreadInfo: PropTypes.bool,
      limit: PropTypes.number,
      reverse: PropTypes.bool,
      senderUserIdsFilter: PropTypes.arrayOf(PropTypes.string)
    }),
    // deprecate in v1.3
    messageListQuery: PropTypes.shape({
      includeMetaArray: PropTypes.bool,
      includeParentMessageText: PropTypes.bool,
      includeReaction: PropTypes.bool,
      includeReplies: PropTypes.bool,
      includeThreadInfo: PropTypes.bool,
      limit: PropTypes.number,
      reverse: PropTypes.bool,
      senderUserIdsFilter: PropTypes.arrayOf(PropTypes.string)
    })
  }),
  onBeforeSendUserMessage: PropTypes.func,
  // onBeforeSendUserMessage(text)
  onBeforeSendFileMessage: PropTypes.func,
  // onBeforeSendFileMessage(File)
  onBeforeUpdateUserMessage: PropTypes.func,
  renderChatItem: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  renderCustomMessage: PropTypes.func,
  renderMessageInput: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  renderChatHeader: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  onChatHeaderActionClick: PropTypes.func,
  useReaction: PropTypes.bool,
  disableUserProfile: PropTypes.bool,
  renderUserProfile: PropTypes.func,
  useMessageGrouping: PropTypes.bool
};
ConversationPanel.defaultProps = {
  channelUrl: null,
  queries: {},
  onBeforeSendUserMessage: null,
  onBeforeSendFileMessage: null,
  onBeforeUpdateUserMessage: null,
  renderChatItem: null,
  renderCustomMessage: null,
  renderMessageInput: null,
  renderChatHeader: null,
  useReaction: true,
  disableUserProfile: false,
  renderUserProfile: null,
  useMessageGrouping: true,
  onChatHeaderActionClick: noop$4
};
var getEmojiCategoriesFromEmojiContainer$1 = getEmojiCategoriesFromEmojiContainer,
    getAllEmojisFromEmojiContainer$1 = getAllEmojisFromEmojiContainer,
    getEmojisFromEmojiContainer$1 = getEmojisFromEmojiContainer;
var Conversation = LocalizationContext.withSendbirdContext(ConversationPanel);

exports.ConversationPanel = ConversationPanel;
exports.default = Conversation;
exports.getAllEmojisFromEmojiContainer = getAllEmojisFromEmojiContainer$1;
exports.getEmojiCategoriesFromEmojiContainer = getEmojiCategoriesFromEmojiContainer$1;
exports.getEmojisFromEmojiContainer = getEmojisFromEmojiContainer$1;
//# sourceMappingURL=Channel.js.map
