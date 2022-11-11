import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {PromptResponse, PopulatedPromptResponse} from './model';


type PopulatedPromptResponseResponse = {
    _id: string;
    user: string;
    content: string;
    dateResponded: string;
    dateModified: string;
  };

type PromptResponseResponse = {
  _id: string;
  user: string;
  content: string;
  dateResponded: string;
  dateModified: string;
};

/**
 * Encode a date as an unambiguous string
 *
 * @param {Date} date - A date object
 * @returns {string} - formatted date as string
 */
const formatDate = (date: Date): string => moment(date).format('MMMM Do YYYY, h:mm:ss a');

const constructPromptResponseResponse = (response: HydratedDocument<PromptResponse>): PromptResponseResponse => {
  const responseCopy: PopulatedPromptResponse = {
    ...response.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {username} = responseCopy.userId;
  delete responseCopy.userId;
  return {
    ...responseCopy,
    _id: responseCopy._id.toString(),
    user: username,
    dateResponded: formatDate(response.dateResponded),
    dateModified: formatDate(response.dateModified)
  };
};

export {
  constructPromptResponseResponse,
  PromptResponseResponse
};
