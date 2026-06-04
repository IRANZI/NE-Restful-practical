import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { apiRequest } from '../lib/api';
import type {
  Extinguisher,
  ExtinguisherPayload,
  Inspection,
  MaintenanceLog,
  ReportSummary,
  User,
  UserRole
} from '../types';

interface OperationsState {
  extinguishers: Extinguisher[];
  inspections: Inspection[];
  maintenance: MaintenanceLog[];
  users: User[];
  summary: ReportSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: OperationsState = {
  extinguishers: [],
  inspections: [],
  maintenance: [],
  users: [],
  summary: null,
  loading: false,
  error: null
};

export const fetchUsers = createAsyncThunk('operations/fetchUsers', async () => {
  return apiRequest<User[]>('/users');
});

export const createUser = createAsyncThunk(
  'operations/createUser',
  async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    // Admin-created accounts go through the protected user-management service endpoint.
    return apiRequest<User>('/users', {
      method: 'POST',
      body: payload
    });
  }
);

export const fetchExtinguishers = createAsyncThunk(
  'operations/fetchExtinguishers',
  async (filters?: { status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);
    const query = params.toString();
    return apiRequest<Extinguisher[]>(`/extinguishers${query ? `?${query}` : ''}`);
  }
);

export const saveExtinguisher = createAsyncThunk(
  'operations/saveExtinguisher',
  async (payload: ExtinguisherPayload & { id?: string }) => {
    const { id, ...body } = payload;
    return apiRequest<Extinguisher>(id ? `/extinguishers/${id}` : '/extinguishers', {
      method: id ? 'PATCH' : 'POST',
      body
    });
  }
);

export const removeExtinguisher = createAsyncThunk(
  'operations/removeExtinguisher',
  async (id: string) => {
    await apiRequest<void>(`/extinguishers/${id}`, { method: 'DELETE' });
    return id;
  }
);

export const fetchInspections = createAsyncThunk('operations/fetchInspections', async () => {
  return apiRequest<Inspection[]>('/inspections');
});

export const scheduleInspection = createAsyncThunk(
  'operations/scheduleInspection',
  async (payload: {
    extinguisherId: string;
    inspectorId?: string | null;
    scheduledFor: string;
    notes?: string;
  }) => {
    return apiRequest<Inspection>('/inspections', {
      method: 'POST',
      body: payload
    });
  }
);

export const completeInspection = createAsyncThunk(
  'operations/completeInspection',
  async (payload: { id: string; result: string; notes?: string }) => {
    return apiRequest<Inspection>(`/inspections/${payload.id}/complete`, {
      method: 'POST',
      body: {
        result: payload.result,
        notes: payload.notes
      }
    });
  }
);

export const fetchMaintenance = createAsyncThunk('operations/fetchMaintenance', async () => {
  return apiRequest<MaintenanceLog[]>('/maintenance');
});

export const logMaintenance = createAsyncThunk(
  'operations/logMaintenance',
  async (payload: {
    extinguisherId: string;
    inspectorId?: string | null;
    actionTaken: string;
    issuesIdentified?: string;
    notes?: string;
    maintenanceDate: string;
  }) => {
    return apiRequest<MaintenanceLog>('/maintenance', {
      method: 'POST',
      body: payload
    });
  }
);

export const fetchSummary = createAsyncThunk('operations/fetchSummary', async () => {
  return apiRequest<ReportSummary>('/reports/summary');
});

const pendingActions = [
  fetchUsers.pending,
  createUser.pending,
  fetchExtinguishers.pending,
  saveExtinguisher.pending,
  removeExtinguisher.pending,
  fetchInspections.pending,
  scheduleInspection.pending,
  completeInspection.pending,
  fetchMaintenance.pending,
  logMaintenance.pending,
  fetchSummary.pending
];

const fulfilledActions = [
  fetchUsers.fulfilled,
  createUser.fulfilled,
  fetchExtinguishers.fulfilled,
  saveExtinguisher.fulfilled,
  removeExtinguisher.fulfilled,
  fetchInspections.fulfilled,
  scheduleInspection.fulfilled,
  completeInspection.fulfilled,
  fetchMaintenance.fulfilled,
  logMaintenance.fulfilled,
  fetchSummary.fulfilled
];

const rejectedActions = [
  fetchUsers.rejected,
  createUser.rejected,
  fetchExtinguishers.rejected,
  saveExtinguisher.rejected,
  removeExtinguisher.rejected,
  fetchInspections.rejected,
  scheduleInspection.rejected,
  completeInspection.rejected,
  fetchMaintenance.rejected,
  logMaintenance.rejected,
  fetchSummary.rejected
];

const operationsSlice = createSlice({
  name: 'operations',
  initialState,
  reducers: {
    clearOperationsError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
      })
      .addCase(fetchExtinguishers.fulfilled, (state, action) => {
        state.extinguishers = action.payload;
      })
      .addCase(saveExtinguisher.fulfilled, (state, action) => {
        const index = state.extinguishers.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) {
          state.extinguishers[index] = action.payload;
        } else {
          state.extinguishers.unshift(action.payload);
        }
      })
      .addCase(removeExtinguisher.fulfilled, (state, action) => {
        state.extinguishers = state.extinguishers.filter((item) => item.id !== action.payload);
      })
      .addCase(fetchInspections.fulfilled, (state, action) => {
        state.inspections = action.payload;
      })
      .addCase(scheduleInspection.fulfilled, (state, action) => {
        state.inspections.unshift(action.payload);
      })
      .addCase(completeInspection.fulfilled, (state, action) => {
        const index = state.inspections.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) {
          state.inspections[index] = action.payload;
        }
      })
      .addCase(fetchMaintenance.fulfilled, (state, action) => {
        state.maintenance = action.payload;
      })
      .addCase(logMaintenance.fulfilled, (state, action) => {
        state.maintenance.unshift(action.payload);
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addMatcher(isAnyOf(...pendingActions), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(isAnyOf(...fulfilledActions), (state) => {
        state.loading = false;
      })
      .addMatcher(isAnyOf(...rejectedActions), (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Request failed.';
      });
  }
});

export const { clearOperationsError } = operationsSlice.actions;
export default operationsSlice.reducer;
