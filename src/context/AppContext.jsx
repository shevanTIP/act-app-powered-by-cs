import { createContext, useContext, useEffect, useReducer, useCallback, useRef } from "react";
import { defaultVoiceGuide, mockPosts } from "../lib/mockData";

const STORAGE_KEY = "act_app_state";

const defaultState = {
  voiceGuide: defaultVoiceGuide,
  posts: mockPosts,
  approvedPosts: [],
  discardedPosts: [],
  weeklyUpdate: "",
  weeklyEvents: [],        // [{ id, title, date, note }]
  generationsUsed: 3,
  generationsLimit: 20,
  ghlConfig: {
    connected: false,
    locationId: "",
    apiKey: "",
    calendarId: "",
  },
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState, ...JSON.parse(raw) };
  } catch {}
  return defaultState;
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_VOICE_GUIDE":
      return { ...state, voiceGuide: action.payload };

    case "SET_WEEKLY_UPDATE":
      return { ...state, weeklyUpdate: action.payload };

    // --- Weekly events ---
    case "ADD_EVENT":
      return { ...state, weeklyEvents: [...state.weeklyEvents, action.payload] };

    case "UPDATE_EVENT":
      return {
        ...state,
        weeklyEvents: state.weeklyEvents.map(e =>
          e.id === action.payload.id ? { ...e, ...action.payload } : e
        ),
      };

    case "REMOVE_EVENT":
      return { ...state, weeklyEvents: state.weeklyEvents.filter(e => e.id !== action.payload) };

    case "CLEAR_EVENTS":
      return { ...state, weeklyEvents: [] };

    // --- Posts ---
    case "ADD_POSTS":
      return {
        ...state,
        posts: [...state.posts, ...action.payload],
        generationsUsed: state.generationsUsed + action.payload.length,
      };

    case "APPROVE_POST": {
      const post = state.posts.find(p => p.id === action.payload);
      if (!post) return state;
      return {
        ...state,
        posts: state.posts.filter(p => p.id !== action.payload),
        approvedPosts: [...state.approvedPosts, { ...post, status: "approved", approvedAt: Date.now() }],
      };
    }

    case "DISCARD_POST": {
      const post = state.posts.find(p => p.id === action.payload);
      if (!post) return state;
      return {
        ...state,
        posts: state.posts.filter(p => p.id !== action.payload),
        discardedPosts: [
          ...state.discardedPosts,
          { ...post, status: "discarded", discardedAt: Date.now() },
        ],
      };
    }

    case "RESTORE_POST": {
      const post = state.discardedPosts.find(p => p.id === action.payload);
      if (!post) return state;
      return {
        ...state,
        discardedPosts: state.discardedPosts.filter(p => p.id !== action.payload),
        posts: [...state.posts, { ...post, status: "pending", discardedAt: undefined }],
      };
    }

    case "DELETE_DISCARDED":
      return { ...state, discardedPosts: state.discardedPosts.filter(p => p.id !== action.payload) };

    case "CLEAR_DISCARDED":
      return { ...state, discardedPosts: [] };

    case "UPDATE_POST_CAPTION": {
      const updateInList = (list) =>
        list.map(p => p.id === action.payload.id ? { ...p, caption: action.payload.caption } : p);
      return {
        ...state,
        posts: updateInList(state.posts),
        approvedPosts: updateInList(state.approvedPosts),
      };
    }

    case "REPLACE_POST":
      return {
        ...state,
        posts: state.posts.map(p => p.id === action.payload.id ? action.payload : p),
        generationsUsed: state.generationsUsed + 1,
      };

    case "RESET_GENERATIONS":
      return { ...state, generationsUsed: 0 };

    case "SET_GHL_CONFIG":
      return { ...state, ghlConfig: { ...state.ghlConfig, ...action.payload } };

    case "MARK_SCHEDULED": {
      const updateInList = (list) =>
        list.map(p => p.id === action.payload ? { ...p, status: "scheduled" } : p);
      return { ...state, approvedPosts: updateInList(state.approvedPosts) };
    }

    default:
      return state;
  }
}

const AppContext = createContext(null);
const ToastContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const toastListeners = useRef([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const showToast = useCallback((message, type = "default") => {
    toastListeners.current.forEach(fn => fn(message, type));
  }, []);

  const addToastListener = useCallback((fn) => {
    toastListeners.current.push(fn);
    return () => { toastListeners.current = toastListeners.current.filter(f => f !== fn); };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, addToastListener }}>
      <AppContext.Provider value={{ state, dispatch }}>
        {children}
      </AppContext.Provider>
    </ToastContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside AppProvider");
  return ctx;
}
