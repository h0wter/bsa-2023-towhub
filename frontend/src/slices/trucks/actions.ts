import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { getErrorMessage } from '~/libs/helpers/helpers.js';
import { type HttpError } from '~/libs/packages/http/http.js';
import { type AsyncThunkConfig } from '~/libs/types/types.js';
import { TruckNotificationMessage } from '~/packages/trucks/libs/enums/enums.js';
import {
  type TruckAddRequestDto,
  type TruckEntityT,
  type TruckGetAllResponseDto,
  type UsersTrucksEntityT,
} from '~/packages/trucks/libs/types/types.js';

import { jsonToLatLngLiteral } from '../orders/libs/helpers/json-to-lat-lng-literal.helper.js';
import { ActionName } from './enums/action-name.enum.js';
import { name as sliceName } from './trucks.slice.js';
import { type TruckArrivalTime } from './types/truck-arrival-time.type.js';
import {
  type CalculateArrivalTimeParameter,
  type TruckLocationPayload,
} from './types/types.js';

const addTruck = createAsyncThunk<
  TruckEntityT,
  TruckAddRequestDto & { queryString?: string },
  AsyncThunkConfig
>(
  `${sliceName}/add-truck`,
  async ({ queryString, ...payload }, { rejectWithValue, extra, dispatch }) => {
    const { businessApi, notification } = extra;

    try {
      const truck = await businessApi.addTruck(payload);

      await dispatch(findAllTrucksForBusiness(queryString));

      notification.success(TruckNotificationMessage.SUCCESS_ADD_NEW_TRUCK);

      return truck;
    } catch (error_: unknown) {
      const error = error_ as HttpError;

      notification.error(getErrorMessage(error.message));

      return rejectWithValue({ ...error, message: error.message });
    }
  },
);

const updateTruckLocationFromSocket = createAsyncThunk<
  TruckLocationPayload,
  TruckLocationPayload,
  AsyncThunkConfig
>(ActionName.SOCKET.UPDATE_TRUCK_LOCATION, (location) => {
  return location;
});

const subscribeTruckUpdates = createAction(
  ActionName.SOCKET.SUBSCRIBE_TRUCK_UPDATES,
  (truckId: number) => {
    return {
      payload: truckId,
    };
  },
);

const unsubscribeTruckUpdates = createAction(
  ActionName.SOCKET.UNSUBSCRIBE_TRUCK_UPDATES,
  (truckId: number) => {
    return {
      payload: truckId,
    };
  },
);

const calculateArrivalTime = createAsyncThunk<
  TruckArrivalTime,
  CalculateArrivalTimeParameter,
  AsyncThunkConfig
>(
  ActionName.CALCULATE_ARRIVAL_TIME,
  async ({ origin, destination }, { extra }) => {
    const { mapServiceFactory } = extra;
    const routeData = {
      origin: origin.latLng,
      destination: jsonToLatLngLiteral(destination),
    };

    const mapService = await mapServiceFactory({ mapElement: null });
    const distanceAndDuration = await mapService.calculateDistanceAndDuration(
      routeData.origin,
      routeData.destination,
    );

    return distanceAndDuration.duration;
  },
);

const getAllTrucksByUserId = createAsyncThunk<
  TruckEntityT[],
  Pick<UsersTrucksEntityT, 'userId'>,
  AsyncThunkConfig
>(`${sliceName}/get-all-trucks-by-user-id`, (payload, { extra }) => {
  const { truckApi } = extra;

  return truckApi.getAllTrucksByUserId(payload);
});

const findAllTrucksForBusiness = createAsyncThunk<
  TruckGetAllResponseDto,
  string | undefined,
  AsyncThunkConfig
>(
  `${sliceName}/find-all-trucks-for-business`,
  async (payload, { rejectWithValue, extra }) => {
    const { businessApi, notification } = extra;

    try {
      return await businessApi.findAllTrucksByBusinessId(payload);
    } catch (error_: unknown) {
      const error = error_ as HttpError;

      notification.error(getErrorMessage(error.message));

      return rejectWithValue({ ...error, message: error.message });
    }
  },
);

const setTrucks = createAsyncThunk<TruckEntityT[], TruckEntityT[]>(
  `${sliceName}/set-trucks`,
  (payload) => payload,
);

export {
  addTruck,
  calculateArrivalTime,
  findAllTrucksForBusiness,
  getAllTrucksByUserId,
  setTrucks,
  subscribeTruckUpdates,
  unsubscribeTruckUpdates,
  updateTruckLocationFromSocket,
};
