import ViewingActivityAppDispatcher from '../dispatcher/viewing-activity-app-dispatcher';
import ActionTypes from '../constants/activity-constants';
import NetflixWebAPIUtils from '../utils/netflix-web-api-utils';

export default class ActivityActionCreators {
  static receiveActivities(activities) {
    console.log("Recieve activities done from netflix");
    ViewingActivityAppDispatcher.dispatch({
      type: ActionTypes.RECEIVE_ACTIVITIES,
      activities: activities.filter((activity) => !!activity)
    });
  }

  static receiveActivitiesFailed(status, response) {
    console.log("Recieve activities done from netflix failed oh oh" +status+response);
    ViewingActivityAppDispatcher.dispatch({
      type: ActionTypes.RECEIVE_ACTIVITIES_FAILED,
      status: status,
      response: response
    });
  }

  static toggleActivity(activity, value) {
    ViewingActivityAppDispatcher.dispatch({
      type: ActionTypes.TOGGLE_ACTIVITY,
      activity: activity,
      value: value
    });
  }

  static updateActivity(activity) {
    ViewingActivityAppDispatcher.dispatch({
      type: ActionTypes.UPDATE_ACTIVITY,
      activity: activity
    });
  }

  static syncSuccess(episodesCount, moviesCount) {
    ViewingActivityAppDispatcher.dispatch({
      type: ActionTypes.SYNC_SUCCESS,
      episodesCount: episodesCount,
      moviesCount: moviesCount
    });
  }

  static syncFailed(status, response) {
    ViewingActivityAppDispatcher.dispatch({
      type: ActionTypes.SYNC_FAILED,
      status: status,
      response: response
    });
  }
}
