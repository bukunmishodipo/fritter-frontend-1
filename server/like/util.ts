import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {FreetResponse} from '../freet/util';
import {constructFreetResponse} from '../freet/util';
import type {Like, PopulatedLike} from '../like/model';
import FreetModel from '../freet/model';
import CommentModel from '../comment/model';
import type {CommentResponse} from '../comment/util';
import {constructCommentResponse} from '../comment/util';
import { User } from '../user/model';

// Update this if you add a property to the Freet type!
type LikeResponse = {
  _id: string;
  user: string;
  reference_comment: CommentResponse | null;
  reference_freet: FreetResponse | null;
  dateLiked: string;
};

/**
 * Encode a date as an unambiguous string
 *
 * @param {Date} date - A date object
 * @returns {string} - formatted date as string
 */
const formatDate = (date: Date): string => moment(date).format('MMMM Do YYYY, h:mm:ss a');

const constructLikeResponse = async (like: HydratedDocument<Like>): Promise<LikeResponse> => {
  const likeCopy: PopulatedLike = {
    ...like.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {username} = likeCopy.userId;
  // const {content} = likeCopy.content;

  let reference_comment = null;
  let reference_freet = null;
  if(likeCopy.isComment == true){
    const comment = await CommentModel.findOne({_id: likeCopy.referenceId});
    reference_comment = await constructCommentResponse(comment)
  }
  else{
    console.log(likeCopy.referenceId);
    const freet = await FreetModel.findOne({_id: likeCopy.referenceId});
    console.log('freet:', freet);
    reference_freet = constructFreetResponse(freet); //inside constructFreetResponse we don't use await 
  }

  delete likeCopy.userId;
  
  return {
    ...likeCopy, // return all the fields of comment copt
    _id: likeCopy._id.toString(),
    user: username,
    // content: content,
    reference_comment: reference_comment,
    reference_freet: reference_freet,
    dateLiked: formatDate(like.dateLiked),
  };
};

export {
  constructLikeResponse,
  LikeResponse
};
